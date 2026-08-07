package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.dto.request.TradeInReviewRequest;
import com.brnsmrt.africanet.dto.response.TradeInResponse;
import com.brnsmrt.africanet.service.TradeInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/admin/trade-in")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AdminTradeInController {

    private final TradeInService tradeInService;

    @GetMapping
    public ResponseEntity<Page<TradeInResponse>> getAll(
            @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(tradeInService.getAllForAdmin(pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TradeInResponse> review(
            @PathVariable Long id,
            @Valid @RequestBody TradeInReviewRequest req,
            Authentication authentication) {
        return ResponseEntity.ok(tradeInService.reviewTradeIn(id, req, authentication));
    }
}