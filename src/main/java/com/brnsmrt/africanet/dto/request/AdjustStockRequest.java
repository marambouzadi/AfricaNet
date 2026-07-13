package com.brnsmrt.africanet.dto.request;

import com.brnsmrt.africanet.domain.enums.MovementType;
import com.brnsmrt.africanet.domain.enums.ReferenceType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdjustStockRequest {

    @NotNull
    private MovementType movementType; // IN, OUT, ADJUSTMENT, RESERVATION, RELEASE

    @NotNull
    private Integer quantity; // quantité du mouvement (toujours positive ici, le sens dépend de movementType)

    private ReferenceType referenceType; // ORDER, TRADE_IN, MANUAL
    private Long referenceId;
    private String notes;

    // optionnel : permet de fixer min_threshold ou warehouseLocation en même temps
    private Integer minThreshold;
    private String warehouseLocation;
}