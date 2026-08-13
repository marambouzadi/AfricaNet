package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.ai.RecommendationService;
import com.brnsmrt.africanet.domain.Category;
import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.OrderItem;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.dto.response.RecommendationResponse;
import com.brnsmrt.africanet.repository.AiRecommendationRepository;
import com.brnsmrt.africanet.repository.OrderItemRepository;
import com.brnsmrt.africanet.repository.OrderRepository;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.repository.ProductViewRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private AiRecommendationRepository aiRecommendationRepository;

    @Mock
    private ProductViewRepository productViewRepository;

    private RecommendationService service;

    private User testUser;
    private Category laptopCategory;
    private Product product1;
    private Product product2;

    @BeforeEach
    void setUp() {
        service = new RecommendationService(
                userRepository,
                orderRepository,
                orderItemRepository,
                productRepository,
                aiRecommendationRepository,
                productViewRepository
        );

        testUser = new User();
        testUser.setId(1L);
        testUser.setFirstName("Test User");

        laptopCategory = new Category();
        laptopCategory.setId(10L);
        laptopCategory.setName("Laptops");

        product1 = new Product();
        product1.setId(100L);
        product1.setName("Dell XPS 15");
        product1.setBasePrice(BigDecimal.valueOf(2600.0));
        product1.setCategory(laptopCategory);

        product2 = new Product();
        product2.setId(101L);
        product2.setName("HP Spectre x360");
        product2.setBasePrice(BigDecimal.valueOf(2400.0));
        product2.setCategory(laptopCategory);
    }

    @Test
    void testRecommend_noHistory_popularityFallback() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(orderRepository.findByUserId(1L)).thenReturn(Collections.emptyList());
        when(productViewRepository.countViewsPerCategoryByUser(1L)).thenReturn(Collections.emptyList());

        List<Object[]> mockCounts = new ArrayList<>();
        mockCounts.add(new Object[]{100L, 5L});
        when(orderItemRepository.countOrdersByProduct()).thenReturn(mockCounts);

        when(productRepository.findAllById(any())).thenReturn(List.of(product1));

        List<RecommendationResponse> recs = service.recommend(1L, 5);

        assertNotNull(recs);
        assertFalse(recs.isEmpty());
        assertEquals("Dell XPS 15", recs.get(0).getProductName());
        verify(aiRecommendationRepository).save(any());
    }

    @Test
    void testRecommend_withHistory_contentBased() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        Order order = new Order();
        order.setId(1L);
        order.setUserId(testUser.getId());

        OrderItem item = new OrderItem();
        item.setId(1L);
        item.setOrder(order);
        item.setProductId(product1.getId());
        order.setItems(List.of(item));

        when(orderRepository.findByUserId(1L)).thenReturn(List.of(order));
        when(productRepository.findByCategoryIdIn(any())).thenReturn(List.of(product1, product2));

        List<Object[]> mockCounts = new ArrayList<>();
        mockCounts.add(new Object[]{101L, 3L});
        when(orderItemRepository.countOrdersByProduct()).thenReturn(mockCounts);

        when(productRepository.findAllById(any())).thenReturn(List.of(product1, product2));

        List<RecommendationResponse> recs = service.recommend(1L, 5);

        assertNotNull(recs);
        assertFalse(recs.isEmpty());
        assertEquals("HP Spectre x360", recs.get(0).getProductName());
    }

    @Test
    void testMarkClicked_success() {
        com.brnsmrt.africanet.domain.AiRecommendation rec = new com.brnsmrt.africanet.domain.AiRecommendation();
        rec.setId(10L);

        when(aiRecommendationRepository.findById(10L)).thenReturn(Optional.of(rec));

        boolean result = service.markClicked(10L);

        assertTrue(result);
        assertNotNull(rec.getClickedAt());
        verify(aiRecommendationRepository).save(rec);
    }
}
