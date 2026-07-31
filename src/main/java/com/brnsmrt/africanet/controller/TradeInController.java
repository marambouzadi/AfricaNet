package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.ai.TradeInEvaluationService;
import com.brnsmrt.africanet.ai.dto.EvaluationResult;
import com.brnsmrt.africanet.dto.request.TradeInEvaluationRequest;
import com.brnsmrt.africanet.dto.request.TradeInSubmitRequest;
import com.brnsmrt.africanet.dto.response.TradeInResponse;
import com.brnsmrt.africanet.service.TradeInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur Trade-In unifié.
 *
 * Système Mohamed (AI) :
 *   POST /api/trade-in/evaluate  → évaluation rapide par scoring AI
 *
 * Système Maram (config détaillée) :
 *   POST /api/trade-in/submit    → soumission complète (images, validation, auth)
 *   GET  /api/trade-in/my        → liste paginée des reprises de l'utilisateur connecté
 *   GET  /api/trade-in/my/{id}   → détail d'une reprise
 */
@RestController
@RequestMapping("/api/trade-in")
@RequiredArgsConstructor
@Validated
public class TradeInController {

    private final TradeInEvaluationService tradeInEvaluationService;
    private final TradeInService tradeInService;

    // =====================================================================
    // MODULE AI (Mohamed) — Évaluation rapide
    // =====================================================================

    /**
     * Évalue un appareil et retourne une estimation en TND.
     * N'exige pas d'authentication — accessible depuis le formulaire public /reprise.
     * L'userId doit être fourni dans le corps de la requête.
     */
    @PostMapping("/evaluate")
    public ResponseEntity<EvaluationResult> evaluateTradeIn(
            @Valid @RequestBody TradeInEvaluationRequest request) {
        EvaluationResult result = tradeInEvaluationService.evaluate(request);
        return ResponseEntity.ok(result);
    }

    // =====================================================================
    // MODULE DÉTAILLÉ (Maram) — Endpoints sécurisés utilisateur
    // =====================================================================

    /**
     * Soumission détaillée d'une demande de reprise.
     * Inclut : validation complète, images, conditions détaillées par composant.
     * Requiert un token JWT valide.
     */
    @PostMapping("/submit")
    public ResponseEntity<TradeInResponse> submitTradeIn(
            @Valid @RequestBody TradeInSubmitRequest req,
            Authentication authentication) {
        return ResponseEntity.ok(tradeInService.submit(req, authentication));
    }

    /**
     * Liste paginée des reprises de l'utilisateur connecté.
     * Utilisé par la page dashboard "Mes Reprises".
     */
    @GetMapping("/my")
    public ResponseEntity<Page<TradeInResponse>> getMyTradeIns(
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            Authentication authentication) {
        return ResponseEntity.ok(tradeInService.getMyTradeIns(authentication, pageable));
    }

    /**
     * Détail d'une reprise appartenant à l'utilisateur connecté.
     */
    @GetMapping("/my/{id}")
    public ResponseEntity<TradeInResponse> getMyTradeInById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(tradeInService.getMyTradeInById(id, authentication));
    }
}
