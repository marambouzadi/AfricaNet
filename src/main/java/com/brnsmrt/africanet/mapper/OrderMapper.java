package com.brnsmrt.africanet.mapper;

import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.OrderItem;
import com.brnsmrt.africanet.domain.OrderStatusHistory;
import com.brnsmrt.africanet.dto.response.OrderItemResponse;
import com.brnsmrt.africanet.dto.response.OrderResponse;
import com.brnsmrt.africanet.dto.response.OrderStatusHistoryResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Map;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    @Mapping(target = "shippingAddress", expression = "java(parseJson(order.getShippingAddress()))")
    @Mapping(target = "billingAddress",  expression = "java(parseJson(order.getBillingAddress()))")
    OrderResponse toResponse(Order order);

    @Mapping(target = "productSnapshot", expression = "java(parseJson(item.getProductSnapshot()))")
    OrderItemResponse toItemResponse(OrderItem item);

    OrderStatusHistoryResponse toHistoryResponse(OrderStatusHistory history);

    List<OrderItemResponse> toItemResponseList(List<OrderItem> items);
    List<OrderStatusHistoryResponse> toHistoryResponseList(List<OrderStatusHistory> history);

    /**
     * Converts a JSON string stored in the DB to a Map for the API response.
     * Returns null if the input is blank or unparseable.
     */
    default Map<String, Object> parseJson(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return new ObjectMapper().readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return null;
        }
    }
}