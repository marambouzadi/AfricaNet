package com.brnsmrt.africanet.ai;


import com.brnsmrt.africanet.domain.DeviceBaseValue;
import com.brnsmrt.africanet.domain.TradeIn;
import com.brnsmrt.africanet.domain.Brand;
import com.brnsmrt.africanet.repository.DeviceBaseValueRepository;
import com.brnsmrt.africanet.repository.TradeInRepository;
import com.brnsmrt.africanet.repository.BrandRepository;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.ai.dto.EvaluationResult;
import com.brnsmrt.africanet.domain.enums.ConditionOverall;
import com.brnsmrt.africanet.domain.enums.DeviceType;
import com.brnsmrt.africanet.domain.enums.TradeInStatus;
import com.brnsmrt.africanet.dto.request.TradeInRequest;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class TradeInEvaluationService {

    private final UserRepository userRepository;
    private final TradeInRepository tradeInRepository;
    private final BrandRepository brandRepository;
    private final DeviceBaseValueRepository deviceBaseValueRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Scoring formula weights
    private static final double MARKET_PRICE_WEIGHT = 0.40;
    private static final double AGE_WEIGHT = 0.20;
    private static final double CONDITION_WEIGHT = 0.30;
    private static final double COMPONENT_WEIGHT = 0.10;

    // Africa Net profit margin (20-30%, using 25%)
    private static final double PROFIT_MARGIN_MULTIPLIER = 0.75;

    // Fallback value when brand/model is not found in the database
    private static final double DEFAULT_BASE_VALUE = 1500.0;

    public TradeInEvaluationService(UserRepository userRepository,
                                    TradeInRepository tradeInRepository,
                                    BrandRepository brandRepository,
                                    DeviceBaseValueRepository deviceBaseValueRepository) {
        this.userRepository = userRepository;
        this.tradeInRepository = tradeInRepository;
        this.brandRepository = brandRepository;
        this.deviceBaseValueRepository = deviceBaseValueRepository;
    }

    /**
     * Evaluate a trade-in request using the Africa Net scoring algorithm:
     *   1. Market price (40%)
     *   2. Age factor (20%)
     *   3. Overall condition (30%)
     *   4. Specific components (10%)
     *   Final value = score * 0.75 (Africa Net 25% margin)
     */
    public EvaluationResult evaluate(TradeInRequest request) {
        // Validate user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "Customer not found with ID: " + request.getUserId()));

        Brand brand = brandRepository.findByNameIgnoreCase(request.getBrand()).orElse(null);

        // 1. Base market price from DB
        double basePrice = computeBaseValue(request.getBrand(), request.getDeviceModel());

        // 2. Age of the device
        int age = computeAge(request.getYearOfPurchase());
        double ageFactor = computeAgeFactor(age);

        // 3. Overall condition score (weighted average of 5 ratings, scale 1-10)
        double conditionOverallScore = computeOverallCondition(
                request.getScreenScore(),
                request.getKeyboardScore(),
                request.getBatteryScore(),
                request.getChassisScore(),
                request.getPerformanceScore()
        );

        // 4. Average component score (simple average, scale 1-10)
        double avgComponentScore = computeAvgComponentScore(
                request.getScreenScore(),
                request.getKeyboardScore(),
                request.getBatteryScore(),
                request.getChassisScore(),
                request.getPerformanceScore()
        );

        // Apply the scoring formula
        double score = 0;
        score += basePrice * MARKET_PRICE_WEIGHT;                          // 1. Market price (40%)
        score += ageFactor * basePrice * AGE_WEIGHT;                       // 2. Age factor (20%)
        score += (conditionOverallScore / 10.0) * basePrice * CONDITION_WEIGHT;  // 3. Condition (30%)
        score += (avgComponentScore / 10.0) * basePrice * COMPONENT_WEIGHT;      // 4. Components (10%)

        // Apply Africa Net profit margin (25%)
        double estimatedValue = Math.round(score * PROFIT_MARGIN_MULTIPLIER * 100.0) / 100.0;
        BigDecimal finalEstimatedValue = BigDecimal.valueOf(estimatedValue);

        // Condition score as a 0-1 value for storage
        double conditionScore = conditionOverallScore / 10.0;

        ConditionOverall overall = mapScoreToOverallCondition(conditionOverallScore);

        Map<String, Object> conditionDetailsJson = buildConditionDetailsJson(request);
        
        // Human-readable summary
        String conditionSummary = buildConditionSummary(
                request, basePrice, age, ageFactor, conditionOverallScore,
                avgComponentScore, score, estimatedValue);

        Map<String, Object> aiEvaluationJson = buildAiEvaluationJson(conditionSummary, conditionScore);

        String refNumber = "TRD-" + LocalDate.now().getYear() + "-" + System.currentTimeMillis();

        // Persist
        TradeIn tradeIn = new TradeIn();
        tradeIn.setReferenceNumber(refNumber);
        tradeIn.setDeviceType(DeviceType.LAPTOP); // Default to laptop for now
        tradeIn.setBrand(brand);
        tradeIn.setModel(request.getDeviceModel());
        tradeIn.setManufactureYear(request.getYearOfPurchase() != null ? request.getYearOfPurchase().shortValue() : null);
        tradeIn.setConditionOverall(overall);
        tradeIn.setConditionDetails(conditionDetailsJson);
        tradeIn.setEstimatedValueAi(finalEstimatedValue);
        tradeIn.setAiEvaluation(aiEvaluationJson);
        tradeIn.setUser(user);
        tradeIn.setStatus(TradeInStatus.EVALUATING);

        TradeIn saved = tradeInRepository.save(tradeIn);

        // Build response DTO
        return EvaluationResult.builder()
                .tradeInId(saved.getId())
                .deviceModel(request.getDeviceModel())
                .brand(request.getBrand())
                .conditionScore(conditionScore)
                .estimatedValue(estimatedValue)
                .conditionSummary(conditionSummary)
                .status("EVALUATING")
                .build();
    }

    private ConditionOverall mapScoreToOverallCondition(double score) {
        if (score >= 9.0) return ConditionOverall.EXCELLENT;
        if (score >= 7.0) return ConditionOverall.GOOD;
        if (score >= 5.0) return ConditionOverall.FAIR;
        return ConditionOverall.POOR;
    }

    private Map<String, Object> buildConditionDetailsJson(TradeInRequest request) {
        Map<String, Object> root = new java.util.HashMap<>();
        root.put("screen", java.util.Map.of("score", request.getScreenScore()));
        root.put("keyboard", java.util.Map.of("score", request.getKeyboardScore()));
        root.put("battery", java.util.Map.of("score", request.getBatteryScore()));
        root.put("chassis", java.util.Map.of("score", request.getChassisScore()));
        root.put("performance", java.util.Map.of("score", request.getPerformanceScore()));
        return root;
    }

    private Map<String, Object> buildAiEvaluationJson(String summary, double score) {
        return java.util.Map.of("summary", summary, "score", score);
    }

    /**
     * Compute the overall condition score as a weighted average of 5 ratings (1-10)
     */
    public double computeOverallCondition(int screen, int keyboard, int battery, int chassis, int performance) {
        return (screen * 0.25) + (keyboard * 0.15) + (battery * 0.25) + (chassis * 0.15) + (performance * 0.20);
    }

    /**
     * Compute the simple average of all 5 component scores (1-10)
     */
    public double computeAvgComponentScore(int screen, int keyboard, int battery, int chassis, int performance) {
        return (screen + keyboard + battery + chassis + performance) / 5.0;
    }

    /**
     * Compute the age of the device in years.
     */
    public int computeAge(Integer yearOfPurchase) {
        if (yearOfPurchase == null) {
            return 3; // conservative default when year is unknown
        }
        int currentYear = LocalDate.now().getYear();
        int age = currentYear - yearOfPurchase;
        return Math.max(age, 0);
    }

    /**
     * Compute the age-based factor using tier-based depreciation:
     *   ≤2 years → 1.0 (recent device, full value)
     *   ≤4 years → 0.7 (moderate depreciation)
     *   >4 years → 0.4 (significant depreciation)
     */
    public double computeAgeFactor(int age) {
        if (age <= 2) {
            return 1.0;
        } else if (age <= 4) {
            return 0.7;
        } else {
            return 0.4;
        }
    }

    /**
     * Look up the base market value for a device by brand and model from the database.
     * Falls back to a default value if the combination is not recognized.
     */
    public double computeBaseValue(String brand, String model) {
        if (brand == null || model == null) {
            return DEFAULT_BASE_VALUE;
        }

        String trimmedBrand = brand.trim();
        String trimmedModel = model.trim();

        // Try exact match first
        Optional<DeviceBaseValue> exact = deviceBaseValueRepository.findByBrandAndModel(trimmedBrand, trimmedModel);
        if (exact.isPresent()) {
            return exact.get().getBaseValue();
        }

        // Try partial match (model starts with a known model name)
        Optional<DeviceBaseValue> partial = deviceBaseValueRepository.findByBrandAndModelStartingWith(trimmedBrand, trimmedModel);
        if (partial.isPresent()) {
            return partial.get().getBaseValue();
        }

        return DEFAULT_BASE_VALUE;
    }

    private String buildConditionSummary(TradeInRequest request, double basePrice,
                                          int age, double ageFactor,
                                          double conditionOverallScore,
                                          double avgComponentScore,
                                          double scoreBeforeMargin,
                                          double estimatedValue) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Device: %s %s", request.getBrand(), request.getDeviceModel()));
        if (request.getYearOfPurchase() != null) {
            sb.append(String.format(" (%d year%s old)", age, age == 1 ? "" : "s"));
        }
        sb.append("\n");
        sb.append(String.format("Screen: %d/10 | Keyboard: %d/10 | Battery: %d/10 | Chassis: %d/10 | Performance: %d/10\n",
                request.getScreenScore(), request.getKeyboardScore(), request.getBatteryScore(),
                request.getChassisScore(), request.getPerformanceScore()));
        sb.append(String.format("Base Market Value: %.2f TND\n", basePrice));
        sb.append(String.format("Age Factor: %.1f (%d year%s)\n", ageFactor, age, age == 1 ? "" : "s"));
        sb.append(String.format("Overall Condition: %.1f/10\n", conditionOverallScore));
        sb.append(String.format("Component Average: %.1f/10\n", avgComponentScore));
        sb.append(String.format("Score Before Margin: %.2f TND\n", scoreBeforeMargin));
        sb.append(String.format("Africa Net Margin: 25%%\n"));
        sb.append(String.format("Estimated Trade-In Value: %.2f TND", estimatedValue));
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            sb.append(String.format("\nNotes: %s", request.getNotes()));
        }
        return sb.toString();
    }
}

