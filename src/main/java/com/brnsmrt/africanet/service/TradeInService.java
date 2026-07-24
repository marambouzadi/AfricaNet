package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.*;
import com.brnsmrt.africanet.domain.enums.TradeInStatus;
import com.brnsmrt.africanet.dto.request.ConditionScoreDto;
import com.brnsmrt.africanet.dto.request.TradeInImageRequest;
import com.brnsmrt.africanet.dto.request.TradeInReviewRequest;
import com.brnsmrt.africanet.dto.request.TradeInSubmitRequest;
import com.brnsmrt.africanet.dto.response.TradeInImageResponse;
import com.brnsmrt.africanet.dto.response.TradeInResponse;
import com.brnsmrt.africanet.exception.ResourceNotFoundException;
import com.brnsmrt.africanet.repository.BrandRepository;
import com.brnsmrt.africanet.repository.TradeInRequestRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TradeInService {

    private final TradeInRequestRepository tradeInRepository;
    private final BrandRepository brandRepository;
    private final UserRepository userRepository;

    @Transactional
    public TradeInResponse submit(TradeInSubmitRequest req, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        TradeInRequest tradeIn = new TradeInRequest();
        tradeIn.setUser(user);
        tradeIn.setReferenceNumber(generateReferenceNumber());
        tradeIn.setDeviceType(req.getDeviceType());
        tradeIn.setModel(req.getModel());
        tradeIn.setManufactureYear(req.getManufactureYear());
        tradeIn.setSerialNumber(req.getSerialNumber());
        tradeIn.setConditionOverall(req.getConditionOverall());

        if (req.getBrandId() != null) {
            Brand brand = brandRepository.findById(req.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Marque introuvable"));
            tradeIn.setBrand(brand);
        }

        // Conversion condition_details (Map<String, ConditionScoreDto> -> Map<String,Object> pour JSONB)
        Map<String, Object> conditionDetailsJson = req.getConditionDetails().entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> Map.of("score", e.getValue().getScore(), "notes",
                                e.getValue().getNotes() != null ? e.getValue().getNotes() : "")
                ));
        tradeIn.setConditionDetails(conditionDetailsJson);

        // Estimation provisoire (règles métier simples, en attendant le vrai module IA de Mohamed)
        BigDecimal estimated = estimateValue(tradeIn, req.getConditionDetails());
        tradeIn.setEstimatedValueAi(estimated);

        Map<String, Object> aiEval = new HashMap<>();
        aiEval.put("estimatedValue", estimated);
        aiEval.put("method", "RULE_BASED_PLACEHOLDER"); // Mohamed remplacera par un vrai appel IA
        tradeIn.setAiEvaluation(aiEval);

        tradeIn.setStatus(TradeInStatus.SUBMITTED);

        // Images
        if (req.getImages() != null) {
            for (TradeInImageRequest imgReq : req.getImages()) {
                TradeInImage img = new TradeInImage();
                img.setTradeInRequest(tradeIn);
                img.setUrl(imgReq.getUrl());
                img.setImageType(imgReq.getImageType());
                tradeIn.getImages().add(img);
            }
        }

        return toResponse(tradeInRepository.save(tradeIn));
    }

    public Page<TradeInResponse> getMyTradeIns(Authentication authentication, Pageable pageable) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return tradeInRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::toResponse);
    }

    public TradeInResponse getMyTradeInById(Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        TradeInRequest tradeIn = tradeInRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Demande de reprise introuvable: " + id));
        return toResponse(tradeIn);
    }

    public Page<TradeInResponse> getAllForAdmin(Pageable pageable) {
        return tradeInRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public TradeInResponse reviewTradeIn(Long id, TradeInReviewRequest req, Authentication authentication) {
        TradeInRequest tradeIn = tradeInRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de reprise introuvable: " + id));

        tradeIn.setStatus(req.getStatus());
        if (req.getFinalValue() != null) {
            tradeIn.setFinalValue(req.getFinalValue());
        }
        if (req.getReviewNotes() != null) {
            tradeIn.setReviewNotes(req.getReviewNotes());
        }

        User reviewer = userRepository.findByEmail(authentication.getName()).orElse(null);
        tradeIn.setReviewedBy(reviewer);
        tradeIn.setUpdatedAt(LocalDateTime.now());

        return toResponse(tradeInRepository.save(tradeIn));
    }

    /**
     * Estimation provisoire basée sur la formule de l'archi (section 6),
     * simplifiée car on n'a pas encore de vraie base de prix marché.
     * Mohamed remplacera cette méthode par un appel à son AI service.
     */
    private BigDecimal estimateValue(TradeInRequest tradeIn, Map<String, ConditionScoreDto> conditionDetails) {
        // Prix de base fictif selon le type d'appareil (placeholder, en attendant une vraie table de prix marché)
        BigDecimal basePrice = switch (tradeIn.getDeviceType()) {
            case LAPTOP -> new BigDecimal("1500");
            case DESKTOP -> new BigDecimal("1200");
            case PHONE -> new BigDecimal("800");
            case TABLET -> new BigDecimal("600");
        };

        // Facteur âge (20%)
        int age = tradeIn.getManufactureYear() != null
                ? Year.now().getValue() - tradeIn.getManufactureYear()
                : 3;
        BigDecimal ageFactor = age <= 2 ? new BigDecimal("1.0")
                : age <= 4 ? new BigDecimal("0.7")
                : new BigDecimal("0.4");

        // Score moyen des composants (10%) + état général (30%)
        double avgScore = conditionDetails.values().stream()
                .mapToInt(ConditionScoreDto::getScore)
                .average()
                .orElse(5.0);
        BigDecimal avgComponentScore = BigDecimal.valueOf(avgScore).divide(BigDecimal.TEN, 4, RoundingMode.HALF_UP);

        BigDecimal conditionOverallScore = switch (tradeIn.getConditionOverall()) {
            case EXCELLENT -> new BigDecimal("1.0");
            case GOOD -> new BigDecimal("0.8");
            case FAIR -> new BigDecimal("0.6");
            case POOR -> new BigDecimal("0.3");
        };

        BigDecimal score = basePrice.multiply(new BigDecimal("0.40"))
                .add(ageFactor.multiply(basePrice).multiply(new BigDecimal("0.20")))
                .add(conditionOverallScore.multiply(basePrice).multiply(new BigDecimal("0.30")))
                .add(avgComponentScore.multiply(basePrice).multiply(new BigDecimal("0.10")));

        // Marge bénéficiaire Africa Net (25% de marge, comme dans l'archi)
        return score.multiply(new BigDecimal("0.75")).setScale(3, RoundingMode.HALF_UP);
    }

    private String generateReferenceNumber() {
        String prefix = "TRD-" + Year.now().getValue() + "-";
        long count = tradeInRepository.count() + 1;
        String candidate = prefix + String.format("%05d", count);
        while (tradeInRepository.existsByReferenceNumber(candidate)) {
            count++;
            candidate = prefix + String.format("%05d", count);
        }
        return candidate;
    }

    private TradeInResponse toResponse(TradeInRequest t) {
        TradeInResponse res = new TradeInResponse();
        res.setId(t.getId());
        res.setReferenceNumber(t.getReferenceNumber());
        res.setDeviceType(t.getDeviceType());
        res.setBrandName(t.getBrand() != null ? t.getBrand().getName() : null);
        res.setModel(t.getModel());
        res.setManufactureYear(t.getManufactureYear());
        res.setSerialNumber(t.getSerialNumber());
        res.setConditionOverall(t.getConditionOverall());
        res.setConditionDetails(t.getConditionDetails());
        res.setEstimatedValueAi(t.getEstimatedValueAi());
        res.setFinalValue(t.getFinalValue());
        res.setCounterOffer(t.getCounterOffer());
        res.setStatus(t.getStatus());
        res.setReviewNotes(t.getReviewNotes());
        res.setCreatedAt(t.getCreatedAt());
        res.setUpdatedAt(t.getUpdatedAt());
        res.setImages(t.getImages().stream().map(img -> {
            TradeInImageResponse r = new TradeInImageResponse();
            r.setId(img.getId());
            r.setUrl(img.getUrl());
            r.setImageType(img.getImageType());
            return r;
        }).collect(Collectors.toList()));
        return res;
    }
}