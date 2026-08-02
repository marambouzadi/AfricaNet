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

/**
 * Service d'évaluation AI des appareils Trade-In (module Mohamed).
 * Utilise l'algorithme de scoring AfricaNet :
 *   1. Prix marché (40%)  2. Âge (20%)  3. État général (30%)  4. Composants (10%)
 *   Valeur finale = score * 0.75 (marge AfricaNet 25%)
 *
 * Utilise l'entité TradeInRequest (unifiée avec le système de Maram).
 */
@Service
public class TradeInEvaluationService {

    private final UserRepository userRepository;
    private final TradeInRequestRepository tradeInRepository;
    private final BrandRepository brandRepository;
    private final DeviceBaseValueRepository deviceBaseValueRepository;

    // Poids de la formule de scoring
    private static final double MARKET_PRICE_WEIGHT = 0.40;
    private static final double AGE_WEIGHT = 0.20;
    private static final double CONDITION_WEIGHT = 0.30;
    private static final double COMPONENT_WEIGHT = 0.10;

    // Marge bénéficiaire Africa Net (25%)
    private static final double PROFIT_MARGIN_MULTIPLIER = 0.75;

    // Valeur par défaut si marque/modèle non trouvé en base
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

    /**
     * Évalue un appareil et persiste le résultat dans trade_in_requests.
     */
    public EvaluationResult evaluate(TradeInEvaluationRequest request) {
        // Valider que l'utilisateur existe
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "Utilisateur introuvable avec l'ID : " + request.getUserId()));

        Brand brand = brandRepository.findByNameIgnoreCase(request.getBrand())
                .orElseThrow(() -> new RuntimeException(
                        "Marque introuvable avec le nom : " + request.getBrand()));
        // 1. Prix de base marché depuis la DB
        double basePrice = computeBaseValue(request.getBrand(), request.getDeviceModel());

        // 2. Âge de l'appareil
        int age = computeAge(request.getYearOfPurchase());
        double ageFactor = computeAgeFactor(age);

        // 3. Score état général (moyenne pondérée des 5 critères, échelle 1-10)
        double conditionOverallScore = computeOverallCondition(
                request.getScreenScore(),
                request.getKeyboardScore(),
                request.getBatteryScore(),
                request.getChassisScore(),
                request.getPerformanceScore()
        );

        // 4. Score moyen des composants (simple, échelle 1-10)
        double avgComponentScore = computeAvgComponentScore(
                request.getScreenScore(),
                request.getKeyboardScore(),
                request.getBatteryScore(),
                request.getChassisScore(),
                request.getPerformanceScore()
        );

        // Application de la formule de scoring
        double score = 0;
        score += basePrice * MARKET_PRICE_WEIGHT;
        score += ageFactor * basePrice * AGE_WEIGHT;
        score += (conditionOverallScore / 10.0) * basePrice * CONDITION_WEIGHT;
        score += (avgComponentScore / 10.0) * basePrice * COMPONENT_WEIGHT;

        // Application de la marge AfricaNet (25%)
        double estimatedValue = Math.round(score * PROFIT_MARGIN_MULTIPLIER * 100.0) / 100.0;
        BigDecimal finalEstimatedValue = BigDecimal.valueOf(estimatedValue);

        double conditionScore = conditionOverallScore / 10.0;
        ConditionOverall overall = mapScoreToOverallCondition(conditionOverallScore);

        // Construction des détails condition (Map<String,Object> pour JSONB)
        Map<String, Object> conditionDetails = buildConditionDetailsMap(request);

        // Résumé lisible
        String conditionSummary = buildConditionSummary(
                request, basePrice, age, ageFactor, conditionOverallScore,
                avgComponentScore, score, estimatedValue);

        // Évaluation AI (Map<String,Object> pour JSONB)
        Map<String, Object> aiEvaluation = new HashMap<>();
        aiEvaluation.put("summary", conditionSummary);
        aiEvaluation.put("score", conditionScore);
        aiEvaluation.put("method", "AI_SCORING_V1");

        // Génération du numéro de référence unique
        String refNumber = generateReferenceNumber();

        // Persistance via l'entité unifiée TradeInRequest
        TradeInRequest tradeIn = new TradeInRequest();
        tradeIn.setReferenceNumber(refNumber);
        tradeIn.setDeviceType(DeviceType.LAPTOP); // Défaut laptop — sera précisé via submit() détaillé
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

    // ---- Helpers de calcul ----

    private ConditionOverall mapScoreToOverallCondition(double score) {
        if (score >= 9.0) return ConditionOverall.EXCELLENT;
        if (score >= 7.0) return ConditionOverall.GOOD;
        if (score >= 5.0) return ConditionOverall.FAIR;
        return ConditionOverall.POOR;
    }

    private Map<String, Object> buildConditionDetailsMap(TradeInEvaluationRequest request) {
        Map<String, Object> details = new HashMap<>();
        details.put("screen",      Map.of("score", request.getScreenScore()));
        details.put("keyboard",    Map.of("score", request.getKeyboardScore()));
        details.put("battery",     Map.of("score", request.getBatteryScore()));
        details.put("chassis",     Map.of("score", request.getChassisScore()));
        details.put("performance", Map.of("score", request.getPerformanceScore()));
        return details;
    }

    public double computeOverallCondition(int screen, int keyboard, int battery, int chassis, int performance) {
        return (screen * 0.25) + (keyboard * 0.15) + (battery * 0.25) + (chassis * 0.15) + (performance * 0.20);
    }

    public double computeAvgComponentScore(int screen, int keyboard, int battery, int chassis, int performance) {
        return (screen + keyboard + battery + chassis + performance) / 5.0;
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
        if (brand == null || model == null) return DEFAULT_BASE_VALUE;
        String b = brand.trim();
        String m = model.trim();
        Optional<DeviceBaseValue> exact = deviceBaseValueRepository.findByBrandAndModel(b, m);
        if (exact.isPresent()) return exact.get().getBaseValue();
        Optional<DeviceBaseValue> partial = deviceBaseValueRepository.findByBrandAndModelStartingWith(b, m);
        if (partial.isPresent()) return partial.get().getBaseValue();
        return DEFAULT_BASE_VALUE;
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
        sb.append("\n");
        sb.append(String.format("Écran: %d/10 | Clavier: %d/10 | Batterie: %d/10 | Châssis: %d/10 | Perf: %d/10\n",
                request.getScreenScore(), request.getKeyboardScore(), request.getBatteryScore(),
                request.getChassisScore(), request.getPerformanceScore()));
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
