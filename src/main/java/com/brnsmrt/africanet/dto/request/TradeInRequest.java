package com.brnsmrt.africanet.dto.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeInRequest {
    private String deviceModel;
    private String brand;
    private Integer yearOfPurchase;
    private Integer screenCondition;      // 1 (poor) to 5 (excellent)
    private Integer batteryCondition;     // 1 (poor) to 5 (excellent)
    private Integer bodyCondition;        // 1 (poor) to 5 (excellent)
    private Integer functionalityCondition; // 1 (poor) to 5 (excellent)
    private String notes;
    private Long userId;
}
