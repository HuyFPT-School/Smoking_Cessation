package com.example.demo.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TrackingDTO {
    private String date; // YYYY-MM-DD
    private String time; // hh:mm A
    private String location;
    private String trigger;
    private int satisfaction;
    private String type; // "smoking"
    private String notes;
    private Integer userId; // To link with the User
}
