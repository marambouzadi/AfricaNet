package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.dto.request.AdjustStockRequest;
import com.brnsmrt.africanet.dto.response.InventoryResponse;
import com.brnsmrt.africanet.service.StockService;
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

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class StockController {

    private final StockService stockService;

    @GetMapping
    public ResponseEntity<Page<InventoryResponse>> getAllStock(
            @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(stockService.getAllStock(pageable));
    }

    @GetMapping("/alerts")
    public ResponseEntity<Page<InventoryResponse>> getAlerts(
            @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(stockService.getLowStockAlerts(pageable));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getStockByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(stockService.getStockByProduct(productId));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<InventoryResponse> adjustStock(
            @PathVariable Long productId,
            @Valid @RequestBody AdjustStockRequest req,
            Authentication authentication) {
        return ResponseEntity.ok(stockService.adjustStock(productId, req, authentication));
    }
}