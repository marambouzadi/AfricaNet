package com.brnsmrt.africanet.ai;

import com.brnsmrt.africanet.ai.dto.EvaluationResult;
import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.enums.OrderStatus;
import com.brnsmrt.africanet.domain.enums.PaymentStatus;
import com.brnsmrt.africanet.dto.response.RecommendationResponse;
import com.brnsmrt.africanet.repository.OrderRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.service.CatalogQueryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AssistantToolsTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private TradeInEvaluationService tradeInEvaluationService;

    @Mock
    private RecommendationService recommendationService;

    @Mock
    private CatalogQueryService catalogQueryService;

    private AssistantTools tools;

    @BeforeEach
    void setUp() {
        tools = new AssistantTools(userRepository, orderRepository,
                tradeInEvaluationService, recommendationService,
                catalogQueryService);
    }

    @Test
    void testSearchCatalog_byKeyword() {
        when(catalogQueryService.searchCatalog("Dell", null)).thenReturn(List.of(Map.of("name", "Dell XPS")));

        List<Map<String, Object>> results = tools.searchCatalog("Dell", null);

        assertEquals(1, results.size());
        assertEquals("Dell XPS", results.get(0).get("name"));
        verify(catalogQueryService).searchCatalog("Dell", null);
    }

    @Test
    void testSearchCatalog_byMaxPrice() {
        when(catalogQueryService.searchCatalog(null, 1500.0)).thenReturn(List.of(Map.of("name", "Budget PC")));

        List<Map<String, Object>> results = tools.searchCatalog(null, 1500.0);

        assertEquals(1, results.size());
        verify(catalogQueryService).searchCatalog(null, 1500.0);
    }

    @Test
    void testTrackOrderStatus_found() {
        Order order = new Order();
        order.setOrderNumber("ORD-2025-00001");
        order.setStatus(OrderStatus.SHIPPED);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setTotalAmount(BigDecimal.valueOf(2500.0));
        when(orderRepository.findByOrderNumber("ORD-2025-00001")).thenReturn(Optional.of(order));

        String result = tools.trackOrderStatus("ORD-2025-00001");

        assertTrue(result.contains("ORD-2025-00001"));
        assertTrue(result.contains("SHIPPED"));
        assertTrue(result.contains("PAID"));
    }

    @Test
    void testTrackOrderStatus_notFound() {
        when(orderRepository.findByOrderNumber("BAD-NUMBER")).thenReturn(Optional.empty());

        String result = tools.trackOrderStatus("BAD-NUMBER");

        assertTrue(result.contains("couldn't find"));
    }
}
