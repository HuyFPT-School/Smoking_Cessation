package com.example.demo.Controller;

import com.example.demo.entity.UserPayment;
import com.example.demo.service.UserPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/vnpay")
@CrossOrigin(origins = {"http://localhost:3000", "https://smoking-cessation-brown.vercel.app"})
public class VNPayController {

    @Autowired
    private UserPaymentService userPaymentService;

    @Value("${vnpay.tmn_code:PJ2YMMRM}")
    private String vnp_TmnCode;

    @Value("${vnpay.hash_secret:5KXMNNGR7YNVJSX3FFNO8K5THHXTVK3G}")
    private String vnp_HashSecret;

    @Value("${vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnp_PayUrl;

    @Value("${vnpay.return_url:http://localhost:3000/direct-chat}")
    private String vnp_ReturnUrl;

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody VNPayRequest request) {
        try {
            String vnp_TxnRef = generateTxnRef();
            String vnp_IpAddr = "127.0.0.1";
            String vnp_Amount = String.valueOf(request.getAmount() * 100); // VNPay yêu cầu nhân 100

            // Create payment record in database
            UserPayment payment = userPaymentService.createPayment(
                request.getUserId(), 
                request.getOrderType(), 
                request.getAmount(), 
                vnp_TxnRef
            );

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", vnp_Amount);
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", request.getOrderInfo());
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", request.getReturnUrl());
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }

            String queryUrl = query.toString();
            String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = vnp_PayUrl + "?" + queryUrl;

            VNPayResponse response = new VNPayResponse();
            response.setPaymentUrl(paymentUrl);
            response.setTxnRef(vnp_TxnRef);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/payment-status/{txnRef}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String txnRef) {
        // TODO: Implement kiểm tra trạng thái thanh toán từ database
        Map<String, Object> response = new HashMap<>();
        response.put("txnRef", txnRef);
        response.put("status", "PENDING"); // PENDING, SUCCESS, FAILED
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-payment-status/{userId}")
    public ResponseEntity<?> getUserPaymentStatus(@PathVariable Long userId) {
        // Check database for actual payment status
        boolean hasAccess = userPaymentService.hasDirectChatAccess(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("hasAccess", hasAccess);
        
        // Include payment info if available
        if (hasAccess) {
            Optional<UserPayment> latestPayment = userPaymentService.getLatestDirectChatPayment(userId);
            if (latestPayment.isPresent()) {
                UserPayment payment = latestPayment.get();
                response.put("paymentDate", payment.getPaymentDate());
                response.put("amount", payment.getAmount());
            }
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payment-history/{userId}")
    public ResponseEntity<?> getPaymentHistory(@PathVariable Long userId) {
        List<UserPayment> history = userPaymentService.getUserPaymentHistory(userId);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/payment-return")
    public ResponseEntity<?> paymentReturn(@RequestParam Map<String, String> params) {
        try {
            System.out.println("Received VNPay callback params: " + params);
            
            String vnp_SecureHash = params.get("vnp_SecureHash");
            if (vnp_SecureHash == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "ERROR");
                response.put("message", "Missing vnp_SecureHash parameter");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Remove secure hash for verification
            Map<String, String> verifyParams = new HashMap<>(params);
            verifyParams.remove("vnp_SecureHashType");
            verifyParams.remove("vnp_SecureHash");

            List<String> fieldNames = new ArrayList<>(verifyParams.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();

            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = verifyParams.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    try {
                        hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    } catch (UnsupportedEncodingException e) {
                        e.printStackTrace();
                    }
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }

            System.out.println("Hash data: " + hashData.toString());
            String signValue = hmacSHA512(vnp_HashSecret, hashData.toString());
            System.out.println("Computed signature: " + signValue);
            System.out.println("Received signature: " + vnp_SecureHash);
            if (signValue.equals(vnp_SecureHash)) {
                String vnp_TxnRef = params.get("vnp_TxnRef");
                String vnp_ResponseCode = params.get("vnp_ResponseCode");
                String vnp_TransactionNo = params.get("vnp_TransactionNo");
                
                // Update payment status in database
                String paymentStatus = "00".equals(vnp_ResponseCode) ? "SUCCESS" : "FAILED";
                UserPayment updatedPayment = userPaymentService.updatePaymentStatus(
                    vnp_TxnRef, paymentStatus, vnp_TransactionNo
                );
                
                if (updatedPayment != null) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("status", "SUCCESS");
                    response.put("message", "Payment processed successfully");
                    response.put("paymentStatus", paymentStatus);
                    response.put("vnp_TxnRef", vnp_TxnRef);
                    response.put("hasAccess", "SUCCESS".equals(paymentStatus));
                    return ResponseEntity.ok(response);
                } else {
                    Map<String, Object> response = new HashMap<>();
                    response.put("status", "ERROR");
                    response.put("message", "Payment record not found");
                    return ResponseEntity.badRequest().body(response);
                }
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "INVALID");
                response.put("message", "Invalid signature");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Simplified endpoint to update payment status (for testing)
    @PostMapping("/update-payment-status")
    public ResponseEntity<?> updatePaymentStatus(@RequestBody Map<String, String> request) {
        try {
            String vnp_TxnRef = request.get("vnp_TxnRef");
            String vnp_ResponseCode = request.get("vnp_ResponseCode");
            String vnp_TransactionNo = request.get("vnp_TransactionNo");
            
            System.out.println("Updating payment status for TxnRef: " + vnp_TxnRef + 
                             ", ResponseCode: " + vnp_ResponseCode);
            
            if (vnp_TxnRef == null || vnp_ResponseCode == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "ERROR");
                response.put("message", "Missing required parameters");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Update payment status in database
            String paymentStatus = "00".equals(vnp_ResponseCode) ? "SUCCESS" : "FAILED";
            UserPayment updatedPayment = userPaymentService.updatePaymentStatus(
                vnp_TxnRef, paymentStatus, vnp_TransactionNo
            );
            
            Map<String, Object> response = new HashMap<>();
            if (updatedPayment != null) {
                response.put("status", "SUCCESS");
                response.put("message", "Payment status updated successfully");
                response.put("paymentStatus", paymentStatus);
                response.put("vnp_TxnRef", vnp_TxnRef);
                response.put("hasAccess", "SUCCESS".equals(paymentStatus));
                System.out.println("Payment updated successfully: " + updatedPayment.getPaymentStatus());
            } else {
                response.put("status", "ERROR");
                response.put("message", "Payment record not found");
                System.out.println("Payment record not found for TxnRef: " + vnp_TxnRef);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error updating payment status: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "ERROR");
            response.put("message", "Error updating payment status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac sha512_HMAC = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            sha512_HMAC.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = sha512_HMAC.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (InvalidKeyException | NoSuchAlgorithmException ex) {
            return "";
        }
    }

    // Utility methods
    private String generateTxnRef() {
        return "TXN" + System.currentTimeMillis();
    }

    // Request/Response DTOs
    public static class VNPayRequest {
        private Long userId;
        private Integer amount;
        private String orderInfo;
        private String orderType;
        private String returnUrl;
        private String cancelUrl;

        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
        public String getOrderInfo() { return orderInfo; }
        public void setOrderInfo(String orderInfo) { this.orderInfo = orderInfo; }
        public String getOrderType() { return orderType; }
        public void setOrderType(String orderType) { this.orderType = orderType; }
        public String getReturnUrl() { return returnUrl; }
        public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
        public String getCancelUrl() { return cancelUrl; }
        public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }
    }

    public static class VNPayResponse {
        private String paymentUrl;
        private String txnRef;

        // Getters and setters
        public String getPaymentUrl() { return paymentUrl; }
        public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }
        public String getTxnRef() { return txnRef; }
        public void setTxnRef(String txnRef) { this.txnRef = txnRef; }
    }
}
