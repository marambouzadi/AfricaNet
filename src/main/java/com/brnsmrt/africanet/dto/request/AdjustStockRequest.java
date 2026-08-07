package com.brnsmrt.africanet.dto.request;

import com.brnsmrt.africanet.domain.enums.MovementType;
import com.brnsmrt.africanet.domain.enums.ReferenceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdjustStockRequest {

    @NotNull(message = "Le type de mouvement est obligatoire")
    private MovementType movementType; // IN, OUT, ADJUSTMENT, RESERVATION, RELEASE

    @NotNull(message = "La quantité est obligatoire")
    @Positive(message = "La quantité doit être positive")
    private Integer quantity;

    private ReferenceType referenceType; // ORDER, TRADE_IN, MANUAL
    private Long referenceId;

    @Size(max = 500, message = "Les notes ne doivent pas dépasser 500 caractères")
    private String notes;

    @Min(value = 0, message = "Le seuil minimum doit être supérieur ou égal à 0")
    private Integer minThreshold;

    @Size(max = 100, message = "La localisation ne doit pas dépasser 100 caractères")
    private String warehouseLocation;
}