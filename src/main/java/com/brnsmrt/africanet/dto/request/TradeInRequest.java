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
    private Integer screenScore;      // 1-10
    private Integer keyboardScore;    // 1-10
    private Integer batteryScore;     // 1-10
    private Integer chassisScore;     // 1-10
    private Integer performanceScore; // 1-10
    private String notes;             // optional generic notes
    private Long userId;
}