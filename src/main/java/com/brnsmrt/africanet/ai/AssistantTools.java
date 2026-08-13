package com.brnsmrt.africanet.ai;

import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.Category;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.repository.CategoryRepository;
import com.brnsmrt.africanet.repository.OrderRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

import com.brnsmrt.africanet.dto.response.RecommendationResponse;

import com.brnsmrt.africanet.ai.dto.EvaluationResult;

import com.brnsmrt.africanet.dto.request.TradeInEvaluationRequest;

import com.brnsmrt.africanet.ai.RecommendationService;

import com.brnsmrt.africanet.ai.TradeInEvaluationService;

import org.springframework.stereotype.Component;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import dev.langchain4j.agent.tool.Tool;

@Component
public class AssistantTools {
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final TradeInEvaluationService tradeInEvaluationService;
    private final RecommendationService recommendationService;

    public AssistantTools(UserRepository userRepository,
                          ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          OrderRepository orderRepository,
                          TradeInEvaluationService tradeInEvaluationService,
                          RecommendationService recommendationService) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.tradeInEvaluationService = tradeInEvaluationService;
        this.recommendationService = recommendationService;
    }

    @Tool("Get the current date/today's date")
    public String currentDate() {
        return LocalDate.now().toString();
    }

    @Tool("Get the current local time")
    public String currentTime() {
        return LocalTime.now().withNano(0).toString();
    }

    @Transactional(readOnly = true)
    @Tool("List all product categories or item types available on Africa Net (e.g. PC Portables, Desktops, Accessoires)")
    public List<Map<String, String>> populateProductCategories() {
        return this.categoryRepository.findAll().stream()
                .map(c -> Map.of("id", String.valueOf(c.getId()), "name", c.getName(), "slug", c.getSlug()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Tool("Search the Africa Net product catalog by keyword or max price filter. Returns products with name, brand, price, SKU, and condition status.")
    public List<Map<String, Object>> searchCatalog(String keyword, Double maxPrice) {
        List<Product> products;
        if (maxPrice != null) {
            products = productRepository.findByBasePriceLessThanEqual(BigDecimal.valueOf(maxPrice));
        } else if (keyword == null || keyword.isBlank()) {
            products = productRepository.findAll();
        } else {
            products = productRepository.findByNameContainingIgnoreCase(keyword);
        }

        return products.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("name", p.getName());
            m.put("brand", p.getBrand() != null ? p.getBrand().getName() : "N/A");
            m.put("price", p.getBasePrice() != null ? p.getBasePrice().toPlainString() : "0");
            m.put("sku", p.getSku());
            m.put("condition", p.getCondition() != null ? p.getCondition().name() : "N/A");
            return m;
        }).collect(Collectors.toList());
    }

    @Tool("Get the current real-time shipping and payment status of a purchase using its unique order number (e.g., ORD-2025-00001)")
    public String trackOrderStatus(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .map(order -> String.format("Order %s status: %s. Payment status: %s. Total: %s TND.",
                        order.getOrderNumber(),
                        order.getStatus(),
                        order.getPaymentStatus(),
                        order.getTotalAmount().toPlainString()))
                .orElse("We couldn't find an order with that reference number. Please double-check it.");
    }
}

