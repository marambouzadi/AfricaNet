package com.brnsmrt.africanet.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OrderItemRequest {
    @NotNull private Long productId;
    @NotNull @Min(1) private Integer quantity;
}