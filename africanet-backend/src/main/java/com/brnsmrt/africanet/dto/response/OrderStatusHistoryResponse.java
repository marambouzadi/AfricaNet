package com.brnsmrt.africanet.dto.response;

import com.brnsmrt.africanet.domain.enums.OrderStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OrderStatusHistoryResponse {
    private Long id;
    private OrderStatus status;
    private String notes;
    private Long changedBy;
    private LocalDateTime changedAt;
}