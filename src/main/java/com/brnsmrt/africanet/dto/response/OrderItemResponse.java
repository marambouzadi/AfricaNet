package com.brnsmrt.africanet.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private Map<String, Object> productSnapshot;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}