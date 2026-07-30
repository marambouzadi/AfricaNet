package com.brnsmrt.africanet.ai;


import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.OrderItem;
import com.brnsmrt.africanet.repository.OrderRepository;
import com.brnsmrt.africanet.repository.OrderItemRepository;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.dto.response.RecommendationResponse;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final com.brnsmrt.africanet.repository.AiRecommendationRepository aiRecommendationRepository;
    private final com.brnsmrt.africanet.repository.ProductViewRepository productViewRepository;

    // Blending weights for hybrid scoring
    private static final double CONTENT_WEIGHT = 0.70;
    private static final double POPULARITY_WEIGHT = 0.30;

    public RecommendationService(UserRepository userRepository,
                                  OrderRepository orderRepository,
                                  OrderItemRepository orderItemRepository,
                                  ProductRepository productRepository,
                                  com.brnsmrt.africanet.repository.AiRecommendationRepository aiRecommendationRepository,
                                  com.brnsmrt.africanet.repository.ProductViewRepository productViewRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.aiRecommendationRepository = aiRecommendationRepository;
        this.productViewRepository = productViewRepository;
    }

    /**
     * Recommend products for a user.
     * Uses content-based scoring from purchase/view history when available,
     * falls back to popularity-based scoring otherwise.
     * Blends both signals with configurable weights for hybrid results.
     */
    public List<RecommendationResponse> recommend(Long userId, int maxResults) {
        // Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + userId));

        List<Order> userOrders = orderRepository.findByUser_Id(userId);

        Map<Long, Double> contentScores;
        Set<Long> purchasedProductIds = new HashSet<>();

        if (userOrders.isEmpty()) {
            // Check product views if user has no order history
            contentScores = viewBasedScores(userId);
        } else {
            // Content-based scoring from orders
            contentScores = contentBasedScores(userOrders);
            for (Order order : userOrders) {
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getProduct() != null) {
                        purchasedProductIds.add(item.getProduct().getId());
                    }
                }
            }
        }

        if (contentScores.isEmpty()) {
            // Pure popularity fallback
            return popularityBasedRecommendations(userId, purchasedProductIds, maxResults);
        }

        // Popularity scores for hybrid blending
        Map<Long, Double> popularityScores = popularityScores(purchasedProductIds);

        // Merge into hybrid scores
        Set<Long> allCandidateIds = new HashSet<>();
        allCandidateIds.addAll(contentScores.keySet());
        allCandidateIds.addAll(popularityScores.keySet());

        List<ScoredProduct> scored = new ArrayList<>();
        for (Long productId : allCandidateIds) {
            double cs = contentScores.getOrDefault(productId, 0.0);
            double ps = popularityScores.getOrDefault(productId, 0.0);
            double hybrid = (cs * CONTENT_WEIGHT) + (ps * POPULARITY_WEIGHT);
            scored.add(new ScoredProduct(productId, hybrid, cs > 0 ? "content" : "popularity"));
        }

        scored.sort((a, b) -> Double.compare(b.score, a.score));

        return buildResponses(userId, scored, maxResults);
    }

    /**
     * Content-based scoring from user's product view history.
     */
    private Map<Long, Double> viewBasedScores(Long userId) {
        List<Object[]> categoryViews = productViewRepository.countViewsPerCategoryByUser(userId);
        if (categoryViews.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<Long, Integer> categoryViewCounts = new HashMap<>();
        int totalViews = 0;
        for (Object[] row : categoryViews) {
            Long categoryId = (Long) row[0];
            Long count = (Long) row[1];
            categoryViewCounts.put(categoryId, count.intValue());
            totalViews += count.intValue();
        }

        if (totalViews == 0) {
            return Collections.emptyMap();
        }

        List<Long> categoryIds = new ArrayList<>(categoryViewCounts.keySet());
        List<Product> candidates = productRepository.findByCategoryIdIn(categoryIds);

        Map<Long, Double> scores = new HashMap<>();
        for (Product candidate : candidates) {
            Long catId = candidate.getCategory().getId();
            double affinity = (double) categoryViewCounts.getOrDefault(catId, 0) / totalViews;
            scores.put(candidate.getId(), affinity);
        }

        return scores;
    }

    /**
     * Content-based scoring: products in the same categories the user has purchased from
     * receive a score proportional to how many purchases fell in that category.
     */
    private Map<Long, Double> contentBasedScores(List<Order> userOrders) {
        // Count purchases per category
        Map<Long, Integer> categoryPurchaseCounts = new HashMap<>();
        Set<Long> purchasedProductIds = new HashSet<>();
        int totalPurchases = 0;

        for (Order order : userOrders) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() != null && item.getProduct().getCategory() != null) {
                    Long categoryId = item.getProduct().getCategory().getId();
                    categoryPurchaseCounts.merge(categoryId, 1, Integer::sum);
                    purchasedProductIds.add(item.getProduct().getId());
                    totalPurchases++;
                }
            }
        }

        if (totalPurchases == 0) {
            return Collections.emptyMap();
        }

        // Find candidate products in those categories, excluding already purchased
        List<Long> affineCategoryIds = new ArrayList<>(categoryPurchaseCounts.keySet());
        List<Product> candidates = productRepository.findByCategoryIdIn(affineCategoryIds);

        Map<Long, Double> scores = new HashMap<>();
        for (Product candidate : candidates) {
            if (purchasedProductIds.contains(candidate.getId())) {
                continue; // skip already-purchased
            }
            Long catId = candidate.getCategory().getId();
            double affinity = (double) categoryPurchaseCounts.get(catId) / totalPurchases;
            scores.put(candidate.getId(), affinity);
        }

        return scores;
    }

    /**
     * Popularity-based scoring: products ordered most frequently across all users.
     */
    private Map<Long, Double> popularityScores(Set<Long> excludeProductIds) {
        List<Object[]> productCounts = orderItemRepository.countOrdersByProduct();

        if (productCounts.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<Long, Integer> orderCounts = new HashMap<>();
        for (Object[] row : productCounts) {
            Long pid = (Long) row[0];
            Long count = (Long) row[1];
            if (!excludeProductIds.contains(pid)) {
                orderCounts.put(pid, count.intValue());
            }
        }

        if (orderCounts.isEmpty()) {
            return Collections.emptyMap();
        }

        int maxCount = Collections.max(orderCounts.values());
        Map<Long, Double> scores = new HashMap<>();
        for (Map.Entry<Long, Integer> entry : orderCounts.entrySet()) {
            scores.put(entry.getKey(), (double) entry.getValue() / maxCount);
        }

        return scores;
    }

    /**
     * Pure popularity fallback when user has no purchase history.
     */
    private List<RecommendationResponse> popularityBasedRecommendations(
            Long userId, Set<Long> excludeIds, int maxResults) {
        Map<Long, Double> popScores = popularityScores(excludeIds);

        List<ScoredProduct> scored = popScores.entrySet().stream()
                .map(e -> new ScoredProduct(e.getKey(), e.getValue(), "popularity"))
                .sorted((a, b) -> Double.compare(b.score, a.score))
                .toList();

        return buildResponses(userId, scored, maxResults);
    }

    private List<RecommendationResponse> buildResponses(Long userId,
                                                         List<ScoredProduct> scored,
                                                         int maxResults) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        List<RecommendationResponse> results = new ArrayList<>();
        com.brnsmrt.africanet.domain.User user = userRepository.findById(userId).orElse(null);

        List<ScoredProduct> topScored = scored.stream().limit(maxResults).toList();
        List<Long> productIds = topScored.stream().map(ScoredProduct::productId).toList();
        
        List<Product> products = productRepository.findAllById(productIds);
        Map<Long, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        for (ScoredProduct sp : topScored) {
            Product product = productMap.get(sp.productId);
            if (product == null) continue;

            String reason = sp.source.equals("content")
                    ? String.format("Based on your purchase/view history in %s category",
                    product.getCategory() != null ? product.getCategory().getName() : "related")
                    : "Popular among other AfricaNet customers";

            double finalScore = Math.round(sp.score * 1000.0) / 1000.0;

            // Log to database
            com.brnsmrt.africanet.domain.AiRecommendation aiRecommendation = com.brnsmrt.africanet.domain.AiRecommendation.builder()
                    .user(user)
                    .product(product)
                    .score(java.math.BigDecimal.valueOf(finalScore))
                    .reason(reason)
                    .createdAt(LocalDateTime.now())
                    .shownAt(LocalDateTime.now())
                    .build();
            aiRecommendationRepository.save(aiRecommendation);

            results.add(RecommendationResponse.builder()
                    .userId(userId)
                    .productId(product.getId())
                    .productName(product.getName())
                    .price(product.getBasePrice().doubleValue())
                    .score(finalScore)
                    .reason(reason)
                    .createdAt(timestamp)
                    .build());
        }

        return results;
    }

    /**
     * Mark a recommendation as clicked by the user for analytics.
     */
    public boolean markClicked(Long recommendationId) {
        return aiRecommendationRepository.findById(recommendationId).map(rec -> {
            rec.setClickedAt(LocalDateTime.now());
            aiRecommendationRepository.save(rec);
            return true;
        }).orElse(false);
    }

    /**
     * Mark a recommendation as purchased by the user for conversion tracking.
     */
    public boolean markPurchased(Long recommendationId) {
        return aiRecommendationRepository.findById(recommendationId).map(rec -> {
            rec.setPurchasedAt(LocalDateTime.now());
            aiRecommendationRepository.save(rec);
            return true;
        }).orElse(false);
    }

    /**
     * Internal helper record for sorting scored products.
     */
    private record ScoredProduct(Long productId, double score, String source) {}
}
