package com.brnsmrt.africanet.ai;

import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.repository.OrderRepository;
import com.brnsmrt.africanet.service.CatalogQueryService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.List;

import com.brnsmrt.africanet.ai.RecommendationService;
import com.brnsmrt.africanet.ai.TradeInEvaluationService;

import org.springframework.stereotype.Component;
import dev.langchain4j.agent.tool.Tool;

@Component
public class AssistantTools {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final TradeInEvaluationService tradeInEvaluationService;
    private final RecommendationService recommendationService;
    private final CatalogQueryService catalogQueryService;

    public AssistantTools(UserRepository userRepository,
                          OrderRepository orderRepository,
                          TradeInEvaluationService tradeInEvaluationService,
                          RecommendationService recommendationService,
                          CatalogQueryService catalogQueryService) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.tradeInEvaluationService = tradeInEvaluationService;
        this.recommendationService = recommendationService;
        this.catalogQueryService = catalogQueryService;
    }

    @Tool("Get the current date/today's date")
    public String currentDate() {
        return LocalDate.now().toString();
    }

    @Tool("Get the current local time")
    public String currentTime() {
        return LocalTime.now().withNano(0).toString();
    }

    @Tool("List all product categories or item types available on Africa Net (e.g. PC Portables, Desktops, Accessoires)")
    public List<Map<String, String>> populateProductCategories() {
        return catalogQueryService.populateProductCategories();
    }

    @Tool("Search the Africa Net product catalog by keyword or max price filter. Returns products with name, brand, price, SKU, and condition status.")
    public List<Map<String, Object>> searchCatalog(String keyword, Double maxPrice) {
        return catalogQueryService.searchCatalog(keyword, maxPrice);
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
