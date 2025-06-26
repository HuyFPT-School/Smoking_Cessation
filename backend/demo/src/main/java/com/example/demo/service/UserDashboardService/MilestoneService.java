package com.example.demo.service.UserDashboardService;

import com.example.demo.entity.Plan;
import com.example.demo.service.UserDashboardService.model.MilestoneResult;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.Comparator;

@Service
@RequiredArgsConstructor

//xác định mốc phần thưởng tiếp theo cho người dùng đang bỏ thuốc lá
public class MilestoneService {
    private static final Logger logger = LoggerFactory.getLogger(MilestoneService.class);
    public MilestoneResult calculate(Plan plan, long daysSmokeFree) {

        // Class này tính toán và sẽ trả về 2 trường này
        String nextMilestone = "No rewards defined";
        long remainingDaysToMilestone = 0;


        //Check getRewards() có null hay empty không nếu có thì trả về gía trị gán ở dòng bên trên
        if (plan.getRewards() == null || plan.getRewards().isEmpty()) {
            return new MilestoneResult(nextMilestone, remainingDaysToMilestone);
        }

        //Nó tạo một biến mảng gồm 1 phần tử kiểu long, có giá trị ban đầu là 0.
        //Dòng final long[] remainingDaysHolder = {0}; là mẹo dùng mảng để truyền giá trị ra khỏi lambda, vì lambda không cho phép thay đổi biến bên ngoài trực tiếp.
        //Đây là cách xử lý hợp lý trong Java với các giới hạn của stream() và lambda.
        final long[] remainingDaysHolder = {0};

        //phải lọc nextMilestone vì lúc get có nhiều Milestone khác nhau
        nextMilestone = plan.getRewards().stream()
                .map(reward -> {
                    try {
                        //Nếu các milestone null thì trả về null luôn
                        if (reward.getMilestone() == null) return null;

                        //Parse milestone từ chuỗi như "7 days", "2 weeks", "1 month"....
                        //Chuyển đổi về số ngày tương đương
                        String[] parts = reward.getMilestone().toLowerCase().split(" ");

                        //Đây là câu lệnh kiểm tra độ dài của mảng parts, đảm bảo rằng chuỗi milestone được tách ra có ít nhất 2 phần tử
                        if (parts.length < 2) return null;

                        //num là phần tử đầu tiên(là số) có index là 0
                        //unit là phần tử thứ 2 (là chữ) có index là 1
                        int num = Integer.parseInt(parts[0]);
                        String unit = parts[1];

                        long calculatedDays;
                        String shortMilestone;


                        //Chuyển đổi chuỗi mốc thời gian như "3 weeks", "2 months"... thành số ngày tương ứng (dùng để so sánh với số ngày đã không hút thuốc daysSmokeFree).
                        if (unit.startsWith("day")) {
                            calculatedDays = num;
                            shortMilestone = num == 1 ? "1 day" : num + " days";
                        } else if (unit.startsWith("week")) {
                            calculatedDays = (long) num * 7;
                            shortMilestone = num == 1 ? "1 week" : num + " weeks";
                        } else if (unit.startsWith("month")) {
                            calculatedDays = (long) num * 30;
                            shortMilestone = num == 1 ? "1 month" : num + " months";
                        } else if (unit.startsWith("year")) {
                            calculatedDays = (long) num * 365;
                            shortMilestone = num == 1 ? "1 year" : num + " years";
                        } else {
                            return null;
                        }


                        //Tạo object ẩn danh (anonymous object) chứa hai trường milestone và milestoneDays.
                        //Cách này được dùng nhanh chóng để gom 2 giá trị lại mà không cần tạo 1 class riêng
                        return new Object() {
                            final String milestone = shortMilestone;
                            final long milestoneDays = calculatedDays;
                        };

                    } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
                        logger.warn("Malformed milestone: {}", reward.getMilestone());
                        return null;
                    }
                })
                //→ Lọc ra các mốc chưa đạt được (lớn hơn daysSmokeFree)
                //→ Nếu bạn đã được 10 ngày, thì milestone 7 ngày bị loại, chỉ còn lại các milestone từ 30 ngày trở lên.
                .filter(obj -> obj != null && obj.milestoneDays > daysSmokeFree)

                //→ Trong những milestone còn lại, tìm milestone gần nhất (ít ngày nhất)
                //→ Nếu còn lại 30 ngày và 90 ngày thì chọn 30.
                .min(Comparator.comparingLong(a -> a.milestoneDays))
                .map(obj -> {

                    //Tính toán số ngày còn lại để đạt milestone đó.
                    //Gán vào remainingDaysHolder[0] để trả ra ngoài .map().
                    remainingDaysHolder[0] = obj.milestoneDays - daysSmokeFree;
                    return obj.milestone;
                })
                //Nếu không có milestone nào còn lại → người dùng đã đạt hết mọi phần thưởng → trả về "Completed!"
                .orElse("Completed!");

        remainingDaysToMilestone = remainingDaysHolder[0];
        return new MilestoneResult(nextMilestone, remainingDaysToMilestone);
    }
}
