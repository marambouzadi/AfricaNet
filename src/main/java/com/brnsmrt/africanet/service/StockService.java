package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.Inventory;
import com.brnsmrt.africanet.domain.InventoryMovement;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.domain.enums.MovementType;
import com.brnsmrt.africanet.dto.request.AdjustStockRequest;
import com.brnsmrt.africanet.dto.response.InventoryResponse;
import com.brnsmrt.africanet.exception.InsufficientStockException;
import com.brnsmrt.africanet.exception.ResourceNotFoundException;
import com.brnsmrt.africanet.repository.InventoryMovementRepository;
import com.brnsmrt.africanet.repository.InventoryRepository;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StockService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Page<InventoryResponse> getAllStock(Pageable pageable) {
        return inventoryRepository.findAll(pageable).map(this::toResponse);
    }

    public InventoryResponse getStockByProduct(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock introuvable pour le produit: " + productId));
        return toResponse(inventory);
    }

    public Page<InventoryResponse> getLowStockAlerts(Pageable pageable) {
        return inventoryRepository.findLowStockAlerts(pageable).map(this::toResponse);
    }

    @Transactional
    public InventoryResponse adjustStock(Long productId, AdjustStockRequest req, Authentication authentication) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable: " + productId));

        // Récupère l'inventaire existant, ou en crée un nouveau si première fois
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> {
                    Inventory newInv = new Inventory();
                    newInv.setProduct(product);
                    newInv.setQuantity(0);
                    newInv.setReservedQuantity(0);
                    return newInv;
                });

        int delta = computeDelta(req.getMovementType(), req.getQuantity());

        applyMovement(inventory, req.getMovementType(), delta);

        if (req.getMinThreshold() != null) {
            inventory.setMinThreshold(req.getMinThreshold());
        }
        if (req.getWarehouseLocation() != null) {
            inventory.setWarehouseLocation(req.getWarehouseLocation());
        }
        inventory.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inventory);

        // Historique du mouvement
        InventoryMovement movement = new InventoryMovement();
        movement.setProduct(product);
        movement.setMovementType(req.getMovementType());
        movement.setQuantity(delta);
        movement.setQuantityAfter(inventory.getQuantity());
        movement.setReferenceType(req.getReferenceType());
        movement.setReferenceId(req.getReferenceId());
        movement.setNotes(req.getNotes());

        if (authentication != null) {
            User user = userRepository.findByEmail(authentication.getName()).orElse(null);
            movement.setCreatedBy(user);
        }

        movementRepository.save(movement);

        return toResponse(inventory);
    }

    /**
     * Détermine le delta signé à appliquer sur "quantity" ou "reservedQuantity"
     * selon le type de mouvement.
     */
    private int computeDelta(MovementType type, int quantity) {
        return switch (type) {
            case IN -> quantity;                 // entrée: +quantity
            case OUT -> -quantity;                // sortie: -quantity
            case ADJUSTMENT -> quantity;          // ajustement libre (peut être négatif dans le body si besoin)
            case RESERVATION -> quantity;         // réserve du stock (touche reserved_quantity)
            case RELEASE -> -quantity;            // libère une réservation
        };
    }

    private void applyMovement(Inventory inventory, MovementType type, int delta) {
        switch (type) {
            case IN, OUT, ADJUSTMENT -> {
                int newQty = inventory.getQuantity() + delta;
                if (newQty < 0) {
                    throw new InsufficientStockException(
                            "Stock insuffisant. Disponible: " + inventory.getQuantity() + ", demandé: " + Math.abs(delta));
                }
                inventory.setQuantity(newQty);
            }
            case RESERVATION, RELEASE -> {
                int newReserved = inventory.getReservedQuantity() + delta;
                if (newReserved < 0) {
                    throw new InsufficientStockException("Quantité réservée invalide (négative).");
                }
                if (newReserved > inventory.getQuantity()) {
                    throw new InsufficientStockException("Impossible de réserver plus que le stock total.");
                }
                inventory.setReservedQuantity(newReserved);
            }
        }
    }

    private InventoryResponse toResponse(Inventory inv) {
        InventoryResponse res = new InventoryResponse();
        res.setId(inv.getId());
        res.setProductId(inv.getProduct().getId());
        res.setProductName(inv.getProduct().getName());
        res.setProductSku(inv.getProduct().getSku());
        res.setQuantity(inv.getQuantity());
        res.setReservedQuantity(inv.getReservedQuantity());
        res.setQuantityAvailable(inv.getQuantityAvailable());
        res.setMinThreshold(inv.getMinThreshold());
        res.setWarehouseLocation(inv.getWarehouseLocation());
        res.setIsLowStock(inv.getQuantityAvailable() <= inv.getMinThreshold());
        res.setLastUpdated(inv.getLastUpdated());
        return res;
    }
}