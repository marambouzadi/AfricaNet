package com.brnsmrt.africanet.ai;

import com.brnsmrt.africanet.ai.dto.EvaluationResult;
import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.enums.OrderStatus;
import com.brnsmrt.africanet.domain.enums.PaymentStatus;
import com.brnsmrt.africanet.dto.response.RecommendationResponse;
import com.brnsmrt.africanet.repository.CategoryRepository;
import com.brnsmrt.africanet.repository.OrderRepository;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
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
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private TradeInEvaluationService tradeInEvaluationService;

    @Mock
    private RecommendationService recommendationService;

    private AssistantTools tools;

    @BeforeEach
    void setUp() {
        tools = new AssistantTools(userRepository, productRepository,
                categoryRepository, orderRepository,
                tradeInEvaluationService, recommendationService);
    }

    @Test
    void testEvaluateTradeIn_delegatesToService() {
        EvaluationResult mockResponse = EvaluationResult.builder()
                .tradeInId(1L)
                .deviceModel("MacBook Pro")
                .brand("Apple")
                .conditionScore(0.85)
                .estimatedValue(2200.0)
                .conditionSummary("Device: Apple MacBook Pro\nEstimated Trade-In Value: 2200.00 TND")
                .status("EVALUATED")
                .build();

        when(tradeInEvaluationService.evaluate(any())).thenReturn(mockResponse);

        String result = tools.evaluateTradeIn("MacBook Pro", "Apple", 2024,
                8, 8, 8, 8, 8, 1L);

        assertNotNull(result);
        assertTrue(result.contains("2200.00 TND"));
        verify(tradeInEvaluationService).evaluate(any());
    }

    @Test
    void testGetRecommendations_delegatesToService() {
        List<RecommendationResponse> mockRecs = List.of(
                RecommendationResponse.builder()
                        .userId(1L)
                        .productId(100L)
                        .productName("Dell XPS 15")
                        .price(2600.0)
                        .score(0.85)
                        .reason("Based on your purchase history in Laptops category")
                        .createdAt("2026-07-07T12:00:00")
                        .build()
        );

        when(recommendationService.recommend(eq(1L), eq(5))).thenReturn(mockRecs);

        String result = tools.getRecommendations(1L);

        assertNotNull(result);
        assertTrue(result.contains("Dell XPS 15"));
        assertTrue(result.contains("2600.00 TND"));
        verify(recommendationService).recommend(1L, 5);
    }

    @Test
    void testGetRecommendations_empty_returnsMessage() {
        when(recommendationService.recommend(eq(1L), eq(5))).thenReturn(Collections.emptyList());

        String result = tools.getRecommendations(1L);

        assertTrue(result.contains("No recommendations available"));
    }

    @Test
    void testSearchCatalog_byKeyword() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Dell XPS");
        when(productRepository.findByNameContainingIgnoreCase("Dell")).thenReturn(List.of(product));

        List<Product> results = tools.searchCatalog("Dell", null);

        assertEquals(1, results.size());
        assertEquals("Dell XPS", results.get(0).getName());
        verify(productRepository).findByNameContainingIgnoreCase("Dell");
    }

    @Test
    void testSearchCatalog_byMaxPrice() {
        Product product = new Product();
        product.setId(1L);
        product.setBasePrice(BigDecimal.valueOf(1000.0));
        when(productRepository.findByBasePriceLessThanEqual(BigDecimal.valueOf(1500.0))).thenReturn(List.of(product));

        List<Product> results = tools.searchCatalog(null, 1500.0);

        assertEquals(1, results.size());
        verify(productRepository).findByBasePriceLessThanEqual(BigDecimal.valueOf(1500.0));
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
