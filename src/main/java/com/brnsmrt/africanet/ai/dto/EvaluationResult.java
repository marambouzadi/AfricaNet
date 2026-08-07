package com.brnsmrt.africanet.ai.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResult {
    private Long tradeInId;
    private String deviceModel;
    private String brand;
    private double conditionScore;      // 0.0 to 1.0
    private double estimatedValue;      // in TND
    private String conditionSummary;    // human-readable breakdown
    private String status;              // EVALUATED or SUBMITTED
}
