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
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Map;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    OrderResponse toResponse(Order order);
    OrderItemResponse toItemResponse(OrderItem item);
    OrderStatusHistoryResponse toHistoryResponse(OrderStatusHistory history);

    List<OrderItemResponse> toItemResponseList(List<OrderItem> items);
    List<OrderStatusHistoryResponse> toHistoryResponseList(List<OrderStatusHistory> history);

    // Custom method to map JSON string to Map
    default Map<String, Object> mapJsonStringToMap(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return null;
        }
    }
}