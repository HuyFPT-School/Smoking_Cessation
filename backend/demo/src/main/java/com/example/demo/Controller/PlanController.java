package com.example.demo.Controller;

import com.example.demo.DTO.PlanDTO;
import com.example.demo.DTO.RewardItemDTO;
import com.example.demo.entity.Plan;
import com.example.demo.entity.RewardItem;
import com.example.demo.Repo.PlanRepo;
// import com.example.demo.Repo.UserRepo; // Assuming UserRepo exists for validation if needed
import com.example.demo.utils.DataUpdatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin // Modified this line
public class PlanController {

    @Autowired
    private PlanRepo planRepo;

    // Optional: Autowire UserRepo if you need to validate userId against existing users
    // @Autowired
    // private UserRepo userRepo;
    @Autowired
    private ApplicationEventPublisher eventPublisher;

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE; // YYYY-MM-DD

    // Helper to convert Plan Entity to PlanDTO
    private PlanDTO convertToDTO(Plan plan) {
        if (plan == null) return null;
        return new PlanDTO(
                plan.getId(),
                plan.getUserId(),
                plan.getQuitDate() != null ? plan.getQuitDate().format(dateFormatter) : null,
                plan.getQuitMethod(),
                plan.getCigarettesPerDay(),
                plan.getTriggers(),
                plan.getCopingStrategies(),
                plan.getSupportNetwork(),
                plan.getAdditionalNotes(),
                plan.getRewards() != null ? plan.getRewards().stream()
                        .map(r -> new RewardItemDTO(r.getMilestone(), r.getReward()))
                        .collect(Collectors.toList()) : null
        );
    }

    // Helper to convert PlanDTO to Plan Entity
    private Plan convertToEntity(PlanDTO planDTO, Plan existingPlan) {
        Plan plan = existingPlan != null ? existingPlan : new Plan();
        plan.setUserId(planDTO.getUserId());
        if (planDTO.getQuitDate() != null && !planDTO.getQuitDate().isEmpty()) {
            plan.setQuitDate(LocalDate.parse(planDTO.getQuitDate(), dateFormatter));
        }
        plan.setQuitMethod(planDTO.getQuitMethod());
        plan.setCigarettesPerDay(planDTO.getCigarettesPerDay());
        plan.setTriggers(planDTO.getTriggers());
        plan.setCopingStrategies(planDTO.getCopingStrategies());
        plan.setSupportNetwork(planDTO.getSupportNetwork());
        plan.setAdditionalNotes(planDTO.getAdditionalNotes());
        if (planDTO.getRewards() != null) {
            plan.setRewards(planDTO.getRewards().stream()
                    .map(rDTO -> new RewardItem(rDTO.getMilestone(), rDTO.getReward()))
                    .collect(Collectors.toList()));
        }
        return plan;
    }

    @PostMapping
    public ResponseEntity<PlanDTO> createPlan(@RequestBody PlanDTO planDTO) {
        // Optional: Validate if user exists
        // if (userRepo.findByUid(planDTO.getUserId()).isEmpty()) {
        //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Or a specific error DTO
        // }

        Optional<Plan> existingPlanOpt = planRepo.findByUserId(planDTO.getUserId());
        if (existingPlanOpt.isPresent()) {
            // If a plan already exists for this user, it might be better to use PUT for update
            // Or return a conflict error, depending on desired behavior.
            // This POST endpoint will strictly create. If you want upsert, use PUT /api/plans/user/{userId}
            return ResponseEntity.status(HttpStatus.CONFLICT).body(convertToDTO(existingPlanOpt.get())); // Indicate conflict
        }

        Plan plan = convertToEntity(planDTO, null);
        Plan savedPlan = planRepo.save(plan);
        eventPublisher.publishEvent(new DataUpdatedEvent(this, Integer.parseInt(planDTO.getUserId())));
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedPlan));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PlanDTO> getPlanByUserId(@PathVariable String userId) {
        Optional<Plan> plan = planRepo.findByUserId(userId);
        return plan.map(value -> ResponseEntity.ok(convertToDTO(value)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    // This endpoint is kept for direct updates by planId if needed,
    // but Plan.jsx uses the /user/{userId} endpoint for its create/update logic.
    @PutMapping("/{planId}")
    public ResponseEntity<PlanDTO> updatePlanById(@PathVariable Long planId, @RequestBody PlanDTO planDTO) {
        Optional<Plan> existingPlanOpt = planRepo.findById(planId);
        if (existingPlanOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        // Ensure the userId in the DTO matches the one in the existing plan
        // or handle if it's an attempt to change the owner, which might be disallowed.
        if (!existingPlanOpt.get().getUserId().equals(planDTO.getUserId())) {
            // Or, if userId in DTO is null, set it from existing plan
            // For now, returning bad request if userId in DTO doesn't match existing one.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Or a more specific error
        }

        Plan planToUpdate = convertToEntity(planDTO, existingPlanOpt.get());
        planToUpdate.setId(planId); // Ensure ID remains the same
        Plan updatedPlan = planRepo.save(planToUpdate);
        eventPublisher.publishEvent(new DataUpdatedEvent(this, Integer.parseInt(planDTO.getUserId())));
        return ResponseEntity.ok(convertToDTO(updatedPlan));
    }

    // This endpoint allows creating a new plan or updating an existing one based on userId.
    // This matches the logic in your Plan.jsx's handleComplete function more closely.
    @PutMapping("/user/{userId}")
    public ResponseEntity<PlanDTO> createOrUpdatePlanByUserId(@PathVariable String userId, @RequestBody PlanDTO planDTO) {
        // Ensure userId in path matches userId in body, and userId in body is present
        if (planDTO.getUserId() == null ) {
            planDTO.setUserId(userId);
        } else if (!userId.equals(planDTO.getUserId())) {
            // If userId in DTO is different from path, it's a bad request or needs clarification on which one to trust.
            // For now, let's consider it a bad request if they are different and both present.
            // Or, you could prioritize the path variable: planDTO.setUserId(userId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Or a specific error DTO
        }

        Optional<Plan> existingPlanOpt = planRepo.findByUserId(userId);
        Plan planToSave;
        boolean isCreating = false;

        if (existingPlanOpt.isPresent()) {
            // Update existing plan
            planToSave = convertToEntity(planDTO, existingPlanOpt.get());
            planToSave.setId(existingPlanOpt.get().getId()); // Keep existing ID
        } else {
            // Create new plan
            planToSave = convertToEntity(planDTO, null);
            isCreating = true;
        }

        Plan savedPlan = planRepo.save(planToSave);
        eventPublisher.publishEvent(new DataUpdatedEvent(this, Integer.parseInt(userId)));
        PlanDTO responseDTO = convertToDTO(savedPlan);

        if (isCreating) {
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO); // HTTP 201 for create
        } else {
            return ResponseEntity.ok(responseDTO); // HTTP 200 for update
        }
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long planId) {
        Optional<Plan> existingPlanOpt = planRepo.findById(planId);
        if (!planRepo.existsById(planId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        planRepo.deleteById(planId);
        eventPublisher.publishEvent(new DataUpdatedEvent(this, Integer.parseInt(existingPlanOpt.get().getUserId())));
        return ResponseEntity.noContent().build();
    }
}