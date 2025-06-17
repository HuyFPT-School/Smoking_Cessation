package com.example.demo.DTO;

import lombok.Data;
import java.util.Date;

@Data
public class AIResponseDTO {
    private String response;
    private Date timestamp;
    private String status;
    
    public AIResponseDTO() {
        this.timestamp = new Date();
        this.status = "success";
    }
    
    public AIResponseDTO(String response) {
        this.response = response;
        this.timestamp = new Date();
        this.status = "success";
    }
    
    public AIResponseDTO(String response, String status) {
        this.response = response;
        this.timestamp = new Date();
        this.status = status;
    }
}
