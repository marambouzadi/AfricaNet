package com.brnsmrt.africanet.dto.response;

import com.brnsmrt.africanet.domain.enums.MovementType;
import com.brnsmrt.africanet.domain.enums.ReferenceType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InventoryMovementResponse {
    private Long id;
    private Long productId;
    private String productName;
    private MovementType movementType;
    private Integer quantity;
    private Integer quantityAfter;
    private ReferenceType referenceType;
    private Long referenceId;
    private String notes;
    private String createdByEmail;
    private LocalDateTime createdAt;
}