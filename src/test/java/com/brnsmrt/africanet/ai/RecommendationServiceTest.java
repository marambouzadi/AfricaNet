package com.brnsmrt.africanet.ai;

import com.brnsmrt.africanet.domain.Category;
import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.OrderItem;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.repository.OrderRepository;
import com.brnsmrt.africanet.repository.OrderItemRepository;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.dto.response.RecommendationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecommendationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private com.brnsmrt.africanet.repository.AiRecommendationRepository aiRecommendationRepository;

    @Mock
    private com.brnsmrt.africanet.repository.ProductViewRepository productViewRepository;

    @InjectMocks
    private RecommendationService service;

    private User mockUser;
    private Product prod1;
    private Product prod2;
    private Product prod3;
    private Category catA;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);

        catA = new Category();
        catA.setId(10L);
        catA.setName("Electronics");

        prod1 = new Product();
        prod1.setId(101L);
        prod1.setCategory(catA);
        prod1.setBasePrice(BigDecimal.valueOf(100));
        prod1.setName("Laptop");

        prod2 = new Product();
        prod2.setId(102L);
        prod2.setCategory(catA);
        prod2.setBasePrice(BigDecimal.valueOf(50));
        prod2.setName("Mouse");

        prod3 = new Product();
        prod3.setId(103L);
        prod3.setCategory(catA);
        prod3.setBasePrice(BigDecimal.valueOf(200));
        prod3.setName("Monitor");
    }

    @Test
    void testHybridBlendingAndPurchasedExclusion() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        Order order = new Order();
        OrderItem item = new OrderItem();
        item.setProductId(101L);
        order.setItems(List.of(item));
        when(orderRepository.findByUserId(1L)).thenReturn(List.of(order));

        when(productRepository.findByCategoryIdIn(anyList())).thenReturn(List.of(prod1, prod2, prod3));
        when(productRepository.findAllById(any())).thenReturn(List.of(prod1, prod2, prod3));

        List<Object[]> popCounts = Arrays.asList(
                new Object[]{103L, 10L}, 
                new Object[]{102L, 5L},  
                new Object[]{101L, 2L}   
        );
        when(orderItemRepository.countOrdersByProduct()).thenReturn(popCounts);

        List<RecommendationResponse> results = service.recommend(1L, 5);

        assertEquals(2, results.size(), "Should exclude the already purchased prod1");
        
        // prod3 should be first because it has higher popularity
        assertEquals(103L, results.get(0).getProductId());
        assertEquals(1.0, results.get(0).getScore(), 0.01);
        
        // prod2 should be second
        assertEquals(102L, results.get(1).getProductId());
        assertEquals(0.85, results.get(1).getScore(), 0.01);
    }
}
