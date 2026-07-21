package com.brnsmrt.africanet.ai;

import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.Category;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.repository.CategoryRepository;
import com.brnsmrt.africanet.repository.OrderRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import com.brnsmrt.africanet.dto.response.RecommendationResponse;

import com.brnsmrt.africanet.ai.dto.EvaluationResult;

import com.brnsmrt.africanet.dto.request.TradeInRequest;

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

    @Tool("List the registered Africa Net customers: userId, name, email, phone number")
    public List<User> getAllCustomers() {
        Pageable pageable = PageRequest.of(0, 100);
        return userRepository.findAll(pageable).getContent();
    }

    @Tool("""
          Evaluate a trade-in device and return an estimated value. \
          Requires: deviceModel, brand, yearOfPurchase, screenCondition (1-5), \
          batteryCondition (1-5), bodyCondition (1-5), functionalityCondition (1-5), \
          optional notes, and the userId of the customer submitting the trade-in.""")
    public String evaluateTradeIn(String deviceModel, String brand, Integer yearOfPurchase,
                                   Integer screenCondition, Integer batteryCondition,
                                   Integer bodyCondition, Integer functionalityCondition,
                                   String notes, Long userId) {
        TradeInRequest request = TradeInRequest.builder()
                .deviceModel(deviceModel)
                .brand(brand)
                .yearOfPurchase(yearOfPurchase)
                .screenCondition(screenCondition)
                .batteryCondition(batteryCondition)
                .bodyCondition(bodyCondition)
                .functionalityCondition(functionalityCondition)
                .notes(notes)
                .userId(userId)
                .build();

        EvaluationResult response = tradeInEvaluationService.evaluate(request);
        return response.getConditionSummary();
    }

    @Tool("Get personalized product recommendations for a customer based on their purchase history. Requires the userId.")
    public String getRecommendations(Long userId) {
        List<RecommendationResponse> recommendations = recommendationService.recommend(userId, 5);

        if (recommendations.isEmpty()) {
            return "No recommendations available at this time. The customer may need to make some purchases first, or our catalog may be empty.";
        }

        return recommendations.stream()
                .map(r -> String.format("• %s (%.2f TND) — Score: %.0f%% — %s",
                        r.getProductName(), r.getPrice(), r.getScore() * 100, r.getReason()))
                .collect(Collectors.joining("\n"));
    }

    @Tool("List all product categories or item types available on Africa Net (e.g. PC Portables, Desktops, Accessoires)")
    public List<Category> populateProductCategories() {
        return this.categoryRepository.findAll();
    }

    @Tool("""
          Register a brand new customer account on the Africa Net e-commerce platform. \
          The profile must include a first name, last name, a valid email string, \
          and a contact phone number.""")
    public User registerNewCustomer(@jakarta.validation.Valid User newCustomer) {
        newCustomer.setRole("CUSTOMER"); 
        newCustomer.setActive(true);
        
        return userRepository.save(newCustomer);
    }

    @Tool("Search the Africa Net product catalog by keyword or max price filter. Returns a list of laptops with their price, SKU, and condition status.")
    public List<Product> searchCatalog(String keyword, Double maxPrice) {
        if (maxPrice != null) {
            return productRepository.findByBasePriceLessThanEqual(maxPrice);
        }
        if (keyword == null || keyword.isBlank()) {
            return productRepository.findAll();
        }
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    @Tool("Get the current real-time shipping and payment status of a purchase using its unique order number (e.g., ORD-2025-00001)")
    public String trackOrderStatus(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .map(order -> String.format("Order %s status: %s. Payment status: %s. Total: %.3f TND.",
                        order.getOrderNumber(), 
                        order.getStatus(),        // e.g., PENDING, PROCESSING, SHIPPED
                        order.getPaymentStatus(), // e.g., PAID, FAILED
                        order.getTotalAmount()))
                .orElse("We couldn't find an order with that reference number. Please double-check it.");
    }
}

