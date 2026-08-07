package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.dto.request.CreateOrderRequest;
import com.brnsmrt.africanet.dto.response.OrderResponse;
import com.brnsmrt.africanet.service.OrderService;
import com.brnsmrt.africanet.service.InvoiceService;
import com.brnsmrt.africanet.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;




import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Gestion des commandes client")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
@Validated
public class OrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;

    @Operation(summary = "Créer une commande")
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @CurrentUser Long userId) {
        return ResponseEntity.ok(orderService.createOrder(userId, request));
    }

    @Operation(summary = "Mes commandes")
    @GetMapping("/me")
    public ResponseEntity<Page<OrderResponse>> myOrders(
            @CurrentUser Long userId,
            @ParameterObject @PageableDefault(size = 10) Pageable pageable) {

        // ✅ Si aucun tri valide → on force un tri par id DESC
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "id")
            );
        }

        return ResponseEntity.ok(orderService.getUserOrders(userId, pageable));
    }

    @Operation(summary = "Détail d'une commande")
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long id,
            @CurrentUser Long userId) {
        return ResponseEntity.ok(orderService.getOrderById(id, userId));
    }

    @Operation(summary = "Annuler une commande")
    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            @CurrentUser Long userId) {
        return ResponseEntity.ok(orderService.cancelOrder(id, userId));
    }

    @Operation(summary = "Télécharger la facture PDF")
    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(
            @PathVariable Long id,
            @CurrentUser Long userId) {
        OrderResponse order = orderService.getOrderById(id, userId);
        byte[] pdf = invoiceService.generateInvoice(order);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"facture-" + order.getOrderNumber() + ".pdf\"")
                .body(pdf);
    }
}