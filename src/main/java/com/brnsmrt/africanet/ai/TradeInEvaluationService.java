package com.brnsmrt.africanet.ai;

import com.brnsmrt.africanet.domain.Brand;
import com.brnsmrt.africanet.domain.DeviceBaseValue;
import com.brnsmrt.africanet.domain.TradeInRequest;
import com.brnsmrt.africanet.domain.TradeInImage;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.domain.enums.ConditionOverall;
import com.brnsmrt.africanet.domain.enums.DeviceType;
import com.brnsmrt.africanet.domain.enums.TradeInStatus;
import com.brnsmrt.africanet.dto.request.TradeInEvaluationRequest;
import com.brnsmrt.africanet.repository.BrandRepository;
import com.brnsmrt.africanet.repository.DeviceBaseValueRepository;
import com.brnsmrt.africanet.repository.TradeInRequestRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.ai.dto.EvaluationResult;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

//Final Value = (Market 40% + Age 20% + Condition 30% + Components 10%) * 0.75 )
@Service
public class TradeInEvaluationService {

    private final UserRepository userRepository;
    private final TradeInRequestRepository tradeInRepository;
    private final BrandRepository brandRepository;
    private final DeviceBaseValueRepository deviceBaseValueRepository;

    private static final double MARKET_PRICE_WEIGHT = 0.40;
    private static final double AGE_WEIGHT = 0.20;
    private static final double CONDITION_WEIGHT = 0.30;
    private static final double COMPONENT_WEIGHT = 0.10;

    private static final double PROFIT_MARGIN_MULTIPLIER = 0.75;

    private static final double DEFAULT_BASE_VALUE = 1500.0;

    public TradeInEvaluationService(UserRepository userRepository,
                                    TradeInRequestRepository tradeInRepository,
                                    BrandRepository brandRepository,
                                    DeviceBaseValueRepository deviceBaseValueRepository) {
        this.userRepository = userRepository;
        this.tradeInRepository = tradeInRepository;
        this.brandRepository = brandRepository;
        this.deviceBaseValueRepository = deviceBaseValueRepository;
    }

    public EvaluationResult evaluate(TradeInEvaluationRequest request) {
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }
        if (user == null) {
            throw new IllegalArgumentException("Unauthenticated user: A valid userId is required to submit a trade-in");
        }

        String brandName = (request.getBrand() != null && !request.getBrand().trim().isEmpty())
                ? request.getBrand().trim() : "Autre";
        Brand brand = brandRepository.findByNameIgnoreCase(brandName)
                .orElseGet(() -> {
                    Brand newBrand = new Brand();
                    newBrand.setName(brandName);
                    String slug = brandName.toLowerCase()
                            .replaceAll("[^a-z0-9\\s-]", "")
                            .trim()
                            .replaceAll("\\s+", "-");
                    if (slug.isEmpty()) {
                        slug = "brand-" + System.currentTimeMillis();
                    }
                    newBrand.setSlug(slug);
                    newBrand.setIsActive(true);
                    return brandRepository.save(newBrand);
                });
        //Base market price
        double basePrice = computeBaseValue(request.getBrand(), request.getDeviceModel());
        if (basePrice == DEFAULT_BASE_VALUE) {
            basePrice = computeBaseValueByType(request.getDeviceType());
        }

        //Device age penalty
        int age = computeAge(request.getYearOfPurchase());
        double ageFactor = computeAgeFactor(age);

        //Weighted overall condition score (1-10)
        double conditionOverallScore = computeOverallCondition(
                request.getScreenScore(),
                request.getKeyboardScore(),
                request.getBatteryScore(),
                request.getChassisScore(),
                request.getPerformanceScore()
        );

        //Average component score (1-10)
        double avgComponentScore = computeAvgComponentScore(
                request.getScreenScore(),
                request.getKeyboardScore(),
                request.getBatteryScore(),
                request.getChassisScore(),
                request.getPerformanceScore()
        );

        //Compute final unadjusted score
        double score = 0;
        score += basePrice * MARKET_PRICE_WEIGHT;
        score += ageFactor * basePrice * AGE_WEIGHT;
        score += (conditionOverallScore / 10.0) * basePrice * CONDITION_WEIGHT;
        score += (avgComponentScore / 10.0) * basePrice * COMPONENT_WEIGHT;

        //Apply 25% profit margin
        double estimatedValue = Math.round(score * PROFIT_MARGIN_MULTIPLIER * 100.0) / 100.0;
        BigDecimal finalEstimatedValue = BigDecimal.valueOf(estimatedValue);

        double conditionScore = conditionOverallScore / 10.0;
        ConditionOverall overall = mapScoreToOverallCondition(conditionOverallScore);

        Map<String, Object> conditionDetails = buildConditionDetailsMap(request);
        
        String conditionSummary = buildConditionSummary(
                request, basePrice, age, ageFactor, conditionOverallScore,
                avgComponentScore, score, estimatedValue);

        Map<String, Object> aiEvaluation = new HashMap<>();
        aiEvaluation.put("summary", conditionSummary);
        aiEvaluation.put("score", conditionScore);
        aiEvaluation.put("method", "AI_SCORING_V1");

        String refNumber = generateReferenceNumber();

        TradeInRequest tradeIn = new TradeInRequest();
        tradeIn.setReferenceNumber(refNumber);
        
        DeviceType resolvedDeviceType = DeviceType.LAPTOP;
        if (request.getDeviceType() != null) {
            try {
                resolvedDeviceType = DeviceType.valueOf(request.getDeviceType().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        tradeIn.setDeviceType(resolvedDeviceType);
        tradeIn.setBrand(brand);
        tradeIn.setModel(request.getDeviceModel());
        tradeIn.setManufactureYear(request.getYearOfPurchase() != null
                ? request.getYearOfPurchase().shortValue() : null);
        tradeIn.setConditionOverall(overall);
        tradeIn.setConditionDetails(conditionDetails);
        tradeIn.setEstimatedValueAi(finalEstimatedValue);
        tradeIn.setAiEvaluation(aiEvaluation);
        tradeIn.setUser(user);
        tradeIn.setStatus(TradeInStatus.EVALUATING);

        if (request.getImageUrls() != null) {
            for (String imgUrl : request.getImageUrls()) {
                if (imgUrl != null && !imgUrl.isBlank()) {
                    TradeInImage img = new TradeInImage();
                    img.setTradeInRequest(tradeIn);
                    img.setUrl(imgUrl.trim());
                    tradeIn.getImages().add(img);
                }
            }
        }

        TradeInRequest saved = tradeInRepository.save(tradeIn);

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

    private Map<String, Object> buildConditionDetailsMap(TradeInEvaluationRequest request) {
        Map<String, Object> details = new HashMap<>();
        details.put("screen",      Map.of("score", safeScore(request.getScreenScore())));
        details.put("keyboard",    Map.of("score", safeScore(request.getKeyboardScore())));
        details.put("battery",     Map.of("score", safeScore(request.getBatteryScore())));
        details.put("chassis",     Map.of("score", safeScore(request.getChassisScore())));
        details.put("performance", Map.of("score", safeScore(request.getPerformanceScore())));
        //Technical specs
        if (request.getCpu() != null && !request.getCpu().isBlank())
            details.put("cpu", request.getCpu().trim());
        if (request.getRam() != null && !request.getRam().isBlank())
            details.put("ram", request.getRam().trim());
        if (request.getStorage() != null && !request.getStorage().isBlank())
            details.put("storage", request.getStorage().trim());
        if (request.getScreenSize() != null)
            details.put("screenSize", request.getScreenSize());
        if (request.getDeviceType() != null && !request.getDeviceType().isBlank())
            details.put("deviceType", request.getDeviceType().trim());
        if (request.getNotes() != null && !request.getNotes().isBlank())
            details.put("notes", request.getNotes().trim());
        return details;
    }

    private int safeScore(Integer score) {
        return score != null ? score : 5;
    }

    public double computeOverallCondition(Integer screen, Integer keyboard, Integer battery, Integer chassis, Integer performance) {
        return (safeScore(screen) * 0.25) + (safeScore(keyboard) * 0.15) + (safeScore(battery) * 0.25) + (safeScore(chassis) * 0.15) + (safeScore(performance) * 0.20);
    }

    public double computeAvgComponentScore(Integer screen, Integer keyboard, Integer battery, Integer chassis, Integer performance) {
        return (safeScore(screen) + safeScore(keyboard) + safeScore(battery) + safeScore(chassis) + safeScore(performance)) / 5.0;
    }

    public int computeAge(Integer yearOfPurchase) {
        if (yearOfPurchase == null) return 3;
        int age = LocalDate.now().getYear() - yearOfPurchase;
        return Math.max(age, 0);
    }

    public double computeAgeFactor(int age) {
        if (age <= 2) return 1.0;
        if (age <= 4) return 0.7;
        return 0.4;
    }

    public double computeBaseValue(String brand, String model) {
        if (brand != null && model != null) {
            String b = brand.trim();
            String m = model.trim();
            Optional<DeviceBaseValue> exact = deviceBaseValueRepository.findByBrandAndModel(b, m);
            if (exact.isPresent()) return exact.get().getBaseValue();
            Optional<DeviceBaseValue> partial = deviceBaseValueRepository.findByBrandAndModelStartingWith(b, m);
            if (partial.isPresent()) return partial.get().getBaseValue();
        }
        return DEFAULT_BASE_VALUE;
    }

    //Fallback price by device type when no DB entry exists 
    public double computeBaseValueByType(String deviceType) {
        if (deviceType == null) return DEFAULT_BASE_VALUE;
        return switch (deviceType.toUpperCase()) {
            case "LAPTOP"  -> 1500.0;
            case "DESKTOP" -> 1200.0;
            case "PHONE"   -> 800.0;
            case "TABLET"  -> 600.0;
            default        -> DEFAULT_BASE_VALUE;
        };
    }

    private String generateReferenceNumber() {
        String prefix = "TRD-" + LocalDate.now().getYear() + "-";
        long count = tradeInRepository.count() + 1;
        String candidate = prefix + String.format("%05d", count);
        while (tradeInRepository.existsByReferenceNumber(candidate)) {
            count++;
            candidate = prefix + String.format("%05d", count);
        }
        return candidate;
    }

    private String buildConditionSummary(TradeInEvaluationRequest request, double basePrice,
                                          int age, double ageFactor,
                                          double conditionOverallScore,
                                          double avgComponentScore,
                                          double scoreBeforeMargin,
                                          double estimatedValue) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Appareil : %s %s", request.getBrand(), request.getDeviceModel()));
        if (request.getYearOfPurchase() != null) {
            sb.append(String.format(" (%d an%s)", age, age > 1 ? "s" : ""));
        }
        if (request.getCpu() != null && !request.getCpu().isBlank())
            sb.append(String.format("Processeur : %s\n", request.getCpu()));
        if (request.getRam() != null && !request.getRam().isBlank())
            sb.append(String.format("RAM : %s\n", request.getRam()));
        if (request.getStorage() != null && !request.getStorage().isBlank())
            sb.append(String.format("Stockage : %s\n", request.getStorage()));
        if (request.getScreenSize() != null)
            sb.append(String.format("Taille écran : %.1f\"\n", request.getScreenSize()));
        sb.append(String.format("Écran: %d/10 | Clavier: %d/10 | Batterie: %d/10 | Châssis: %d/10 | Perf: %d/10\n",
                safeScore(request.getScreenScore()), safeScore(request.getKeyboardScore()), safeScore(request.getBatteryScore()),
                safeScore(request.getChassisScore()), safeScore(request.getPerformanceScore())));
        sb.append(String.format("Prix marché de base : %.2f TND\n", basePrice));
        sb.append(String.format("Facteur âge : %.1f (%d an%s)\n", ageFactor, age, age > 1 ? "s" : ""));
        sb.append(String.format("Score état général : %.1f/10\n", conditionOverallScore));
        sb.append(String.format("Moyenne composants : %.1f/10\n", avgComponentScore));
        sb.append(String.format("Score brut : %.2f TND\n", scoreBeforeMargin));
        sb.append("Marge AfricaNet : 25%\n");
        sb.append(String.format("Valeur estimée : %.2f TND", estimatedValue));
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            sb.append(String.format("\nNotes : %s", request.getNotes()));
        }
        return sb.toString();
    }
}
