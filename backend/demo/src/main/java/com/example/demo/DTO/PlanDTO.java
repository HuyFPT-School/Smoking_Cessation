package com.example.demo.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlanDTO {
    private Long id; // For responses
    private String userId;
    private String quitDate; // Expecting YYYY-MM-DD string from frontend
    private String quitMethod;
    private int cigarettesPerDay;
    private List<String> triggers;
    private List<String> copingStrategies;
    private List<String> supportNetwork;
    private String additionalNotes;
    private List<RewardItemDTO> rewards;
}
