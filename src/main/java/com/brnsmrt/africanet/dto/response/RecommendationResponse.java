package com.brnsmrt.africanet.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private Long userId;
    private Long productId;
    private String productName;
    private Double price;
    private double score;           // 0.0 to 1.0
    private String reason;          // why this product was recommended
    private String createdAt;       // ISO-8601 timestamp
}
