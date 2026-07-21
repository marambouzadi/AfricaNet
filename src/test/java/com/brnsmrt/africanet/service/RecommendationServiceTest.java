package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.Category;
import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.repository.OrderRepository;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.dto.response.RecommendationResponse;
import com.brnsmrt.africanet.ai.RecommendationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
    private ProductRepository productRepository;

    @Mock
    private com.brnsmrt.africanet.repository.AiRecommendationRepository aiRecommendationRepository;

    private RecommendationService service;

    // Reusable test data
    private User testUser;
    private Category laptopCategory;
    private Category accessoryCategory;
    private Product product1;
    private Product product2;
    private Product product3;

    @BeforeEach
    void setUp() {
        service = new RecommendationService(userRepository, orderRepository, productRepository, aiRecommendationRepository);

        testUser = new User();
        testUser.setId(1L);
        testUser.setFirstName("Test");

        laptopCategory = new Category();
        laptopCategory.setId(10L);
        laptopCategory.setName("Laptops");

        accessoryCategory = new Category();
        accessoryCategory.setId(20L);
        accessoryCategory.setName("Accessories");

        product1 = new Product();
        product1.setId(100L);
        product1.setName("Dell XPS 15");
        product1.setBasePrice(2600.0);
        product1.setCategory(laptopCategory);

        product2 = new Product();
        product2.setId(101L);
        product2.setName("HP Spectre x360");
        product2.setBasePrice(2400.0);
        product2.setCategory(laptopCategory);

        product3 = new Product();
        product3.setId(102L);
        product3.setName("USB-C Hub");
        product3.setBasePrice(150.0);
        product3.setCategory(accessoryCategory);
    }

    @Test
    void testRecommend_withHistory_returnsContentBased() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // User bought product1 (Laptop category)
        Order order1 = new Order();
        order1.setId(1L);
        order1.setProduct(product1);
        order1.setUser(testUser);
        when(orderRepository.findByUserId(1L)).thenReturn(List.of(order1));

        // product2 is in the same category and should be recommended
        when(productRepository.findByCategoryIdIn(any())).thenReturn(List.of(product1, product2));

        // For popularity blending and final lookup
        when(orderRepository.countOrdersByProduct()).thenReturn(List.<Object[]>of(new Object[]{100L, 1L}));
        when(productRepository.findAllById(any())).thenReturn(List.of(product2));

        List<RecommendationResponse> results = service.recommend(1L, 5);

        assertFalse(results.isEmpty());
        // product1 should be excluded (already purchased), product2 should appear
        assertTrue(results.stream().noneMatch(r -> r.getProductId().equals(100L)));
        assertTrue(results.stream().anyMatch(r -> r.getProductId().equals(101L)));
        // Scores should be positive
        results.forEach(r -> assertTrue(r.getScore() > 0.0));
    }

    @Test
    void testRecommend_noHistory_returnsPopularityBased() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(orderRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

        // Other users bought product2 and product3
        User otherUser = new User();
        otherUser.setId(2L);

        Order otherOrder1 = new Order();
        otherOrder1.setProduct(product2);
        otherOrder1.setUser(otherUser);

        Order otherOrder2 = new Order();
        otherOrder2.setProduct(product3);
        otherOrder2.setUser(otherUser);

        when(orderRepository.countOrdersByProduct()).thenReturn(List.<Object[]>of(
                new Object[]{101L, 1L},
                new Object[]{102L, 1L}
        ));
        when(productRepository.findAllById(any())).thenReturn(List.of(product2, product3));

        List<RecommendationResponse> results = service.recommend(1L, 5);

        assertFalse(results.isEmpty());
        // Should return popularity-based results
        results.forEach(r -> {
            assertTrue(r.getScore() > 0.0);
            assertTrue(r.getReason().contains("Popular"));
        });
    }

    @Test
    void testRecommend_excludesPurchased() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // User bought both product1 AND product2
        Order order1 = new Order();
        order1.setProduct(product1);
        Order order2 = new Order();
        order2.setProduct(product2);
        when(orderRepository.findByUserId(1L)).thenReturn(List.of(order1, order2));

        // Both returned from category search
        when(productRepository.findByCategoryIdIn(any())).thenReturn(List.of(product1, product2));
        lenient().when(orderRepository.countOrdersByProduct()).thenReturn(List.<Object[]>of(
                new Object[]{100L, 1L},
                new Object[]{101L, 1L}
        ));

        List<RecommendationResponse> results = service.recommend(1L, 5);

        // Both products are already purchased, so nothing should be recommended from content
        // (only popularity for non-purchased products might show up, but since all are purchased, empty)
        results.forEach(r -> {
            assertNotEquals(100L, r.getProductId().longValue());
            assertNotEquals(101L, r.getProductId().longValue());
        });
    }

    @Test
    void testRecommend_maxResults_respectsCap() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(orderRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

        // Create many popular products
        User otherUser = new User();
        otherUser.setId(2L);

        List<Order> manyOrders = new java.util.ArrayList<>();
        for (int i = 0; i < 20; i++) {
            Product p = new Product();
            p.setId((long) (200 + i));
            p.setName("Product " + i);
            p.setBasePrice(100.0 * i);
            p.setCategory(laptopCategory);

            Order o = new Order();
            o.setProduct(p);
            o.setUser(otherUser);
            manyOrders.add(o);
        }
        
        List<Object[]> orderCounts = new java.util.ArrayList<>();
        List<Product> products = new java.util.ArrayList<>();
        for (int i = 0; i < 20; i++) {
            Product p = new Product();
            p.setId((long) (200 + i));
            p.setName("Product " + i);
            p.setBasePrice(100.0 * i);
            p.setCategory(laptopCategory);
            orderCounts.add(new Object[]{(long) (200 + i), 1L});
            products.add(p);
        }
        
        when(orderRepository.countOrdersByProduct()).thenReturn(orderCounts);
        lenient().when(productRepository.findAllById(any())).thenReturn(products);

        List<RecommendationResponse> results = service.recommend(1L, 3);

        assertTrue(results.size() <= 3);
    }

    @Test
    void testRecommend_userNotFound_throws() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.recommend(999L, 5));
        assertTrue(ex.getMessage().contains("999"));
    }
}
