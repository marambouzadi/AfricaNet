package com.brnsmrt.africanet.mapper;

import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.OrderItem;
import com.brnsmrt.africanet.domain.OrderStatusHistory;
import com.brnsmrt.africanet.dto.response.OrderItemResponse;
import com.brnsmrt.africanet.dto.response.OrderResponse;
import com.brnsmrt.africanet.dto.response.OrderStatusHistoryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    OrderResponse toResponse(Order order);
    OrderItemResponse toItemResponse(OrderItem item);
    OrderStatusHistoryResponse toHistoryResponse(OrderStatusHistory history);

    List<OrderItemResponse> toItemResponseList(List<OrderItem> items);
    List<OrderStatusHistoryResponse> toHistoryResponseList(List<OrderStatusHistory> history);
}