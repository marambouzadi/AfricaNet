package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.domain.enums.OrderStatus;
import com.brnsmrt.africanet.dto.request.UpdateOrderStatusRequest;
import com.brnsmrt.africanet.dto.response.OrderResponse;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Orders", description = "Gestion des commandes (Admin)")
@SecurityRequirement(name = "bearerAuth")
@Validated
public class AdminOrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @Operation(summary = "Liste toutes les commandes")
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAll(
            Authentication auth,
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(status, pageable));
    }

    @Operation(summary = "Détail d'une commande (admin)")
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderByIdAdmin(id));
    }

    @Operation(summary = "Changer le statut d'une commande")
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Authentication auth) {
        Long adminId = resolveAdminId(auth);
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request, adminId));
    }

    // ——— helper ———

    /**
     * Résout l'ID de l'admin à partir du nom d'utilisateur Spring Security (email).
     * Évite d'utiliser @CurrentUser qui dépend d'un UserDetails personnalisé avec un champ "id".
     */
    private Long resolveAdminId(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .map(u -> u.getId())
                .orElse(null);
    }
}
