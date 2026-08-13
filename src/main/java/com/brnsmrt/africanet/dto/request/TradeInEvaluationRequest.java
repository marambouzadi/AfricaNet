package com.brnsmrt.africanet.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PastOrPresent;

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
    @PastOrPresent(message = "L'année doit être passée ou présente")
    private java.time.Year yearOfPurchase;
    
    @Min(1) @Max(10)
    private Integer screenScore;      // 1-10
    
    @Min(1) @Max(10)
    private Integer keyboardScore;    // 1-10
    
    @Min(1) @Max(10)
    private Integer batteryScore;     // 1-10
    
    @Min(1) @Max(10)
    private Integer chassisScore;     // 1-10
    
    @Min(1) @Max(10)
    private Integer performanceScore; // 1-10
    
    private String notes;             // notes libres (optionnel)
    private Long userId;

    // Caractéristiques techniques de l'appareil
    private String cpu;         // Ex: Intel Core i5-1135G7
    private String ram;         // Ex: 8 Go, 16 Go
    private String storage;     // Ex: 256 Go SSD, 512 Go HDD
    private Double screenSize;  // Ex: 14.0, 15.6
    private String deviceType;  // laptop / desktop / phone
    private java.util.List<String> imageUrls;
}

