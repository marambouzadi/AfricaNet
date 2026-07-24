package com.brnsmrt.africanet.dto.response;

import com.brnsmrt.africanet.domain.enums.ConditionOverall;
import com.brnsmrt.africanet.domain.enums.DeviceType;
import com.brnsmrt.africanet.domain.enums.TradeInStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class TradeInResponse {
    private Long id;
    private String referenceNumber;
    private DeviceType deviceType;
    private String brandName;
    private String model;
    private Short manufactureYear;
    private String serialNumber;
    private ConditionOverall conditionOverall;
    private Map<String, Object> conditionDetails;
    private BigDecimal estimatedValueAi;
    private BigDecimal finalValue;
    private BigDecimal counterOffer;
    private TradeInStatus status;
    private String reviewNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TradeInImageResponse> images;
}