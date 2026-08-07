package com.brnsmrt.africanet.dto.response;

import com.brnsmrt.africanet.domain.enums.OrderStatus;
import com.brnsmrt.africanet.domain.enums.PaymentMethod;
import com.brnsmrt.africanet.domain.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long userId;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private Map<String, Object> shippingAddress;
    private Map<String, Object> billingAddress;
    private String couponCode;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String customerNotes;
    private List<OrderItemResponse> items;
    private List<OrderStatusHistoryResponse> statusHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}