package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.dto.request.TradeInSubmitRequest;
import com.brnsmrt.africanet.dto.response.TradeInResponse;
import com.brnsmrt.africanet.service.TradeInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/trade-in")
@RequiredArgsConstructor
@Validated
public class TradeInController {

    private final TradeInService tradeInService;
    private final com.brnsmrt.africanet.ai.TradeInEvaluationService tradeInEvaluationService;
    private final com.brnsmrt.africanet.repository.UserRepository userRepository;
    @PostMapping("/evaluate")
    public ResponseEntity<com.brnsmrt.africanet.ai.dto.EvaluationResult> evaluateTradeIn(
            @Valid @RequestBody com.brnsmrt.africanet.dto.request.TradeInEvaluationRequest request,
            Authentication authentication) {

        if (authentication != null) {
            com.brnsmrt.africanet.domain.User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            request.setUserId(user.getId());
        }

        return ResponseEntity.ok(tradeInEvaluationService.evaluate(request));
    }

    @PostMapping
    public ResponseEntity<TradeInResponse> submit(
            @Valid @RequestBody TradeInSubmitRequest req,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tradeInService.submit(req, authentication));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<TradeInResponse>> getMyTradeIns(
            @ParameterObject @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication) {
        return ResponseEntity.ok(tradeInService.getMyTradeIns(authentication, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TradeInResponse> getMyTradeInById(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(tradeInService.getMyTradeInById(id, authentication));
    }
}