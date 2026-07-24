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