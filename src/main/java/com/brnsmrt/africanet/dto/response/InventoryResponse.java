package com.brnsmrt.africanet.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InventoryResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantity;
    private Integer reservedQuantity;
    private Integer quantityAvailable;
    private Integer minThreshold;
    private String warehouseLocation;
    private Boolean isLowStock;
    private LocalDateTime lastUpdated;
}