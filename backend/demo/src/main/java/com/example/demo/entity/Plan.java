package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId; // To link with the User (e.g., Firebase UID)

    private LocalDate quitDate;
    private String quitMethod;
    private int cigarettesPerDay;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plan_triggers", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "trigger_item")
    private List<String> triggers;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plan_coping_strategies", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "coping_strategy_item")
    private List<String> copingStrategies;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plan_support_network", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "support_network_item")
    private List<String> supportNetwork;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String additionalNotes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plan_rewards", joinColumns = @JoinColumn(name = "plan_id"))
    private List<RewardItem> rewards;
}
