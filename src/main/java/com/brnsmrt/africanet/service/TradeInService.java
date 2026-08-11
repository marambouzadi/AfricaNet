package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.*;
import com.brnsmrt.africanet.domain.enums.ConditionOverall;
import com.brnsmrt.africanet.domain.enums.ProductCondition;
import com.brnsmrt.africanet.domain.enums.TradeInStatus;
import com.brnsmrt.africanet.dto.request.ConditionScoreDto;
import com.brnsmrt.africanet.dto.request.TradeInImageRequest;
import com.brnsmrt.africanet.dto.request.TradeInReviewRequest;
import com.brnsmrt.africanet.dto.request.TradeInSubmitRequest;
import com.brnsmrt.africanet.dto.response.TradeInImageResponse;
import com.brnsmrt.africanet.dto.response.TradeInResponse;
import com.brnsmrt.africanet.exception.ResourceNotFoundException;
import com.brnsmrt.africanet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
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
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

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
    public TradeInResponse acceptOffer(Long id, Authentication authentication) {
        TradeInRequest tradeIn = tradeInRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de reprise introuvable: " + id));

        tradeIn.setStatus(TradeInStatus.SUBMITTED);
        if (tradeIn.getEstimatedValueAi() != null) {
            tradeIn.setFinalValue(tradeIn.getEstimatedValueAi());
        }
        tradeIn.setUpdatedAt(LocalDateTime.now());

        TradeInRequest saved = tradeInRepository.save(tradeIn);
        return toResponse(saved);
    }

    @Transactional
    public TradeInResponse proposeCounterOffer(Long id, BigDecimal proposedPrice, Authentication authentication) {
        TradeInRequest tradeIn = tradeInRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de reprise introuvable: " + id));

        tradeIn.setCounterOffer(proposedPrice);
        tradeIn.setStatus(TradeInStatus.SUBMITTED);
        tradeIn.setUpdatedAt(LocalDateTime.now());

        return toResponse(tradeInRepository.save(tradeIn));
    }

    @Transactional
    public TradeInResponse reviewTradeIn(Long id, TradeInReviewRequest req, Authentication authentication) {
        TradeInRequest tradeIn = tradeInRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de reprise introuvable: " + id));

        tradeIn.setStatus(req.getStatus());
        if (req.getFinalValue() != null) {
            tradeIn.setFinalValue(req.getFinalValue());
        }
        if (req.getSalePrice() != null) {
            if (tradeIn.getConditionDetails() == null) {
                tradeIn.setConditionDetails(new java.util.HashMap<>());
            }
            tradeIn.getConditionDetails().put("salePrice", req.getSalePrice());
        }
        if (req.getReviewNotes() != null) {
            tradeIn.setReviewNotes(req.getReviewNotes());
        }

        User reviewer = userRepository.findByEmail(authentication.getName()).orElse(null);
        tradeIn.setReviewedBy(reviewer);
        tradeIn.setUpdatedAt(LocalDateTime.now());

        TradeInRequest saved = tradeInRepository.save(tradeIn);

        // Publish to catalog if status is APPROVED or COMPLETED (or update existing product price)
        if (saved.getStatus() == TradeInStatus.APPROVED || saved.getStatus() == TradeInStatus.COMPLETED) {
            publishApprovedTradeInAsProduct(saved);
        }

        return toResponse(saved);
    }

    /**
     * Synchronizes existing APPROVED trade-ins to the catalog on application startup.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void syncApprovedTradeInsToCatalog() {
        try {
            tradeInRepository.findAll().stream()
                    .filter(t -> t.getStatus() == TradeInStatus.APPROVED || t.getStatus() == TradeInStatus.COMPLETED)
                    .forEach(t -> {
                        try {
                            publishApprovedTradeInAsProduct(t);
                        } catch (Exception itemErr) {
                            System.err.println("Could not sync trade-in #" + t.getId() + " to catalog: " + itemErr.getMessage());
                        }
                    });
        } catch (Exception e) {
            // Log error silently if database is not fully ready
        }
    }

    /**
     * Creates a Product & Inventory entry from an approved TradeInRequest so it appears in the catalog.
     */
    @Transactional
    public void publishApprovedTradeInAsProduct(TradeInRequest tradeIn) {
        String sku = tradeIn.getReferenceNumber();
        BigDecimal price = tradeIn.getFinalValue() != null ? tradeIn.getFinalValue()
                : (tradeIn.getEstimatedValueAi() != null ? tradeIn.getEstimatedValueAi() : new BigDecimal("990.000"));

        BigDecimal customSalePriceTemp = null;
        if (tradeIn.getConditionDetails() != null && tradeIn.getConditionDetails().get("salePrice") != null) {
            try {
                customSalePriceTemp = new BigDecimal(String.valueOf(tradeIn.getConditionDetails().get("salePrice")));
            } catch (Exception ignored) {}
        }
        final BigDecimal customSalePrice = customSalePriceTemp;

        if (productRepository.existsBySku(sku)) {
            // Update prices on existing catalog product
            productRepository.findAll().stream()
                    .filter(p -> sku.equals(p.getSku()))
                    .findFirst()
                    .ifPresent(p -> {
                        p.setBasePrice(price);
                        if (customSalePrice != null) p.setSalePrice(customSalePrice);
                        productRepository.save(p);
                    });
            return;
        }

        Category category = categoryRepository.findAll().stream().findFirst().orElse(null);
        if (category == null) {
            return;
        }

        Brand brand = null;
        if (tradeIn.getBrand() != null && tradeIn.getBrand().getId() != null) {
            brand = brandRepository.findById(tradeIn.getBrand().getId()).orElse(null);
        }
        String brandName = brand != null ? brand.getName() : "";
        String productName = (brandName + " " + tradeIn.getModel()).trim();
        if (productName.isEmpty()) {
            productName = "Appareil Repris #" + tradeIn.getId();
        }

        String baseSlug = productName.toLowerCase()
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        if (baseSlug.isEmpty()) baseSlug = "trade-in";
        baseSlug += "-" + sku.toLowerCase();

        String slugCandidate = baseSlug;
        int counter = 1;
        while (productRepository.existsBySlug(slugCandidate)) {
            slugCandidate = baseSlug + "-" + counter++;
        }

        ProductCondition condition = (tradeIn.getConditionOverall() == ConditionOverall.EXCELLENT)
                ? ProductCondition.REFURBISHED : ProductCondition.USED;

        Product product = Product.builder()
                .name(productName)
                .slug(slugCandidate)
                .brand(brand)
                .category(category)
                .condition(condition)
                .basePrice(price)
                .salePrice(customSalePrice != null ? customSalePrice : price)
                .sku(sku)
                .isActive(true)
                .isFeatured(false)
                .viewCount(0)
                .description("Appareil reconditionné issu du programme de reprise AfricaNet. Référence: " + sku + ". Année: " + (tradeIn.getManufactureYear() != null ? tradeIn.getManufactureYear() : "N/A"))
                .shortDesc("Reprise AfricaNet - Appareil " + (tradeIn.getConditionOverall() != null ? tradeIn.getConditionOverall() : "Vérifié"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Product savedProduct = productRepository.save(product);

        // Add all trade-in images to catalog product if available
        if (tradeIn.getImages() != null && !tradeIn.getImages().isEmpty()) {
            for (int i = 0; i < tradeIn.getImages().size(); i++) {
                TradeInImage tradeImg = tradeIn.getImages().get(i);
                if (tradeImg.getUrl() != null && !tradeImg.getUrl().isBlank()) {
                    ProductImage img = new ProductImage();
                    img.setProduct(savedProduct);
                    img.setUrl(tradeImg.getUrl().trim());
                    img.setIsPrimary(i == 0);
                    img.setSortOrder(i + 1);
                    savedProduct.getImages().add(img);
                }
            }
            productRepository.save(savedProduct);
        }

        // Add specifications and technical ratings from tradeIn
        Map<String, Object> details = tradeIn.getConditionDetails();
        int sortOrder = 1;

        if (details != null) {
            if (details.get("cpu") != null) {
                ProductSpecification spec = new ProductSpecification();
                spec.setProduct(savedProduct);
                spec.setSpecKey("Processeur");
                spec.setSpecValue(String.valueOf(details.get("cpu")));
                spec.setSortOrder(sortOrder++);
                savedProduct.getSpecifications().add(spec);
            }
            if (details.get("ram") != null) {
                ProductSpecification spec = new ProductSpecification();
                spec.setProduct(savedProduct);
                spec.setSpecKey("RAM");
                spec.setSpecValue(String.valueOf(details.get("ram")));
                spec.setSortOrder(sortOrder++);
                savedProduct.getSpecifications().add(spec);
            }
            if (details.get("storage") != null) {
                ProductSpecification spec = new ProductSpecification();
                spec.setProduct(savedProduct);
                spec.setSpecKey("Stockage");
                spec.setSpecValue(String.valueOf(details.get("storage")));
                spec.setSortOrder(sortOrder++);
                savedProduct.getSpecifications().add(spec);
            }
            if (details.get("screenSize") != null) {
                ProductSpecification spec = new ProductSpecification();
                spec.setProduct(savedProduct);
                spec.setSpecKey("Affichage");
                spec.setSpecValue(String.valueOf(details.get("screenSize")) + "\"");
                spec.setSortOrder(sortOrder++);
                savedProduct.getSpecifications().add(spec);
            }
        }

        // Add 4 component rating notes (Écran, Batterie, Performances, Esthétique)
        int defaultScore = (tradeIn.getConditionOverall() == ConditionOverall.EXCELLENT) ? 9
                : (tradeIn.getConditionOverall() == ConditionOverall.GOOD) ? 8
                : (tradeIn.getConditionOverall() == ConditionOverall.FAIR) ? 6 : 4;

        int screenScore = extractScore(details, "screen", defaultScore);
        int batteryScore = extractScore(details, "battery", defaultScore);
        int perfScore = extractScore(details, "performance", defaultScore);
        int chassisScore = extractScore(details, "chassis", defaultScore);

        ProductSpecification specEcran = new ProductSpecification();
        specEcran.setProduct(savedProduct);
        specEcran.setSpecKey("Écran");
        specEcran.setSpecValue(String.valueOf(screenScore));
        specEcran.setSortOrder(sortOrder++);
        savedProduct.getSpecifications().add(specEcran);

        ProductSpecification specBatt = new ProductSpecification();
        specBatt.setProduct(savedProduct);
        specBatt.setSpecKey("Batterie");
        specBatt.setSpecValue(String.valueOf(batteryScore));
        specBatt.setSortOrder(sortOrder++);
        savedProduct.getSpecifications().add(specBatt);

        ProductSpecification specPerf = new ProductSpecification();
        specPerf.setProduct(savedProduct);
        specPerf.setSpecKey("Performances");
        specPerf.setSpecValue(String.valueOf(perfScore));
        specPerf.setSortOrder(sortOrder++);
        savedProduct.getSpecifications().add(specPerf);

        ProductSpecification specEsth = new ProductSpecification();
        specEsth.setProduct(savedProduct);
        specEsth.setSpecKey("Esthétique");
        specEsth.setSpecValue(String.valueOf(chassisScore));
        specEsth.setSortOrder(sortOrder++);
        savedProduct.getSpecifications().add(specEsth);

        productRepository.save(savedProduct);

        // Add Inventory entry
        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setQuantity(1);
        inventory.setReservedQuantity(0);
        inventory.setMinThreshold(1);
        inventory.setWarehouseLocation("Tunis Entrepôt Principal");
        inventory.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inventory);
    }



        private int extractScore(Map<String, Object> details, String key, int fallback) {
        if (details == null) return fallback;
        Object obj = details.get(key);
        if (obj instanceof Map) {
            Object scoreObj = ((Map<?, ?>) obj).get("score");
            if (scoreObj instanceof Number) {
                return ((Number) scoreObj).intValue();
            }
        }
        return fallback;
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