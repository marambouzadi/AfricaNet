package com.brnsmrt.africanet.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour l'évaluation AI d'un appareil (module Mohamed).
 * Scores de 1 à 10 pour chaque composant.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeInEvaluationRequest {
    private String deviceModel;
    private String brand;
    private Integer yearOfPurchase;
    private Integer screenScore;      // 1-10
    private Integer keyboardScore;    // 1-10
    private Integer batteryScore;     // 1-10
    private Integer chassisScore;     // 1-10
    private Integer performanceScore; // 1-10
    private String notes;             // notes libres (optionnel)
    private Long userId;
}
