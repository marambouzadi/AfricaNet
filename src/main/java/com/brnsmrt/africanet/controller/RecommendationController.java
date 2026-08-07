package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.ai.RecommendationService;
import com.brnsmrt.africanet.dto.response.RecommendationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * Get personalized product recommendations for a customer.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "5") int limit) {
        List<RecommendationResponse> recommendations = recommendationService.recommend(userId, limit);
        return ResponseEntity.ok(recommendations);
    }

    /**
     * Track user clicking on a recommended product.
     */
    @PutMapping("/{id}/click")
    public ResponseEntity<Void> trackClick(@PathVariable Long id) {
        boolean updated = recommendationService.markClicked(id);
        if (updated) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Track user purchasing a recommended product.
     */
    @PutMapping("/{id}/purchase")
    public ResponseEntity<Void> trackPurchase(@PathVariable Long id) {
        boolean updated = recommendationService.markPurchased(id);
        if (updated) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
