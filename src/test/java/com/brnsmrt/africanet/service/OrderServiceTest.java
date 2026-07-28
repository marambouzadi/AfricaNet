package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.enums.OrderStatus;
import com.brnsmrt.africanet.dto.request.UpdateOrderStatusRequest;
import com.brnsmrt.africanet.dto.response.OrderResponse;
import com.brnsmrt.africanet.mapper.OrderMapper;
import com.brnsmrt.africanet.repository.OrderRepository;
import com.brnsmrt.africanet.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private StockService stockService;
    @Mock
    private OrderNumberGenerator orderNumberGenerator;
    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderService orderService;

    private Order order;
    private OrderResponse orderResponse;

    @BeforeEach
    void setUp() {
        order = new Order();
        order.setId(100L);
        order.setOrderNumber("CMD-2026-001");
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(new BigDecimal("1850.00"));

        orderResponse = new OrderResponse();
        orderResponse.setId(100L);
        orderResponse.setOrderNumber("CMD-2026-001");
        orderResponse.setStatus(OrderStatus.PENDING);
        orderResponse.setTotalAmount(new BigDecimal("1850.00"));
    }

    @Test
    @DisplayName("getOrderByIdAdmin - récuperer une commande admin")
    void getOrderByIdAdmin_Success() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderMapper.toResponse(order)).thenReturn(orderResponse);

        OrderResponse res = orderService.getOrderByIdAdmin(100L);

        assertThat(res).isNotNull();
        assertThat(res.getOrderNumber()).isEqualTo("CMD-2026-001");
    }

    @Test
    @DisplayName("updateOrderStatus - mise à jour statut de la commande")
    void updateOrderStatus_Success() {
        UpdateOrderStatusRequest req = new UpdateOrderStatusRequest();
        req.setStatus(OrderStatus.CONFIRMED);
        req.setNotes("Commande validée par l'admin");

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderMapper.toResponse(order)).thenReturn(orderResponse);

        OrderResponse res = orderService.updateOrderStatus(100L, req, 1L);

        assertThat(res).isNotNull();
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(orderRepository).save(order);
    }

    @Test
    @DisplayName("getAllOrders - renvoie les commandes paginées")
    void getAllOrders_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        when(orderRepository.findAll(pageable)).thenReturn(new PageImpl<>(Collections.singletonList(order)));
        when(orderMapper.toResponse(order)).thenReturn(orderResponse);

        Page<OrderResponse> res = orderService.getAllOrders(null, pageable);

        assertThat(res).isNotNull();
        assertThat(res.getContent()).hasSize(1);
    }
}
