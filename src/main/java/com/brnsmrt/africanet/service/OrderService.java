package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.exception.ResourceNotFoundException;
import com.brnsmrt.africanet.exception.BusinessException;
import com.brnsmrt.africanet.domain.*;
import com.brnsmrt.africanet.domain.enums.MovementType;
import com.brnsmrt.africanet.domain.enums.OrderStatus;
import com.brnsmrt.africanet.domain.enums.PaymentStatus;
import com.brnsmrt.africanet.domain.enums.ReferenceType;
import com.brnsmrt.africanet.dto.request.*;
import com.brnsmrt.africanet.dto.response.OrderResponse;
import com.brnsmrt.africanet.mapper.OrderMapper;
import com.brnsmrt.africanet.repository.OrderRepository;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockService stockService;
    private final OrderMapper orderMapper;
    private final OrderNumberGenerator orderNumberGenerator;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.19"); // TVA 19%
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("7.000");
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("200.000");

    /**
     * Créer une nouvelle commande
     */
    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        log.info("Création commande pour user {}", userId);

        // 1. Charger tous les produits
        List<Long> productIds = request.getItems().stream()
                .map(OrderItemRequest::getProductId)
                .toList();

        Map<Long, Product> productMap = productRepository.findAllById(productIds).stream()
                .collect(java.util.stream.Collectors.toMap(Product::getId, p -> p));

        if (productMap.size() != productIds.size()) {
            throw new ResourceNotFoundException("Certains produits sont introuvables");
        }

        // 2. Créer la commande
        Order order = Order.builder()
                .orderNumber(orderNumberGenerator.generate())
                .user(User.builder().id(userId).build())
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .couponCode(request.getCouponCode())
                .customerNotes(request.getCustomerNotes())
                .shippingAddress(addressToMap(request.getShippingAddress()))
                .billingAddress(request.getBillingAddress() != null
                        ? addressToMap(request.getBillingAddress())
                        : addressToMap(request.getShippingAddress()))
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        // 3. Ajouter les items et vérifier le stock
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productMap.get(itemReq.getProductId());

            if (!product.isActive()) {
                throw new BusinessException("Le produit " + product.getName() + " n'est plus disponible");
            }

            // Vérifier + réserver le stock
            AdjustStockRequest reserveReq = new AdjustStockRequest();
            reserveReq.setMovementType(MovementType.RESERVATION);
            reserveReq.setQuantity(itemReq.getQuantity());
            stockService.adjustStock(product.getId(), reserveReq, null);

            BigDecimal unitPrice = product.getSalePrice() != null
                    ? product.getSalePrice()
                    : product.getBasePrice();
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .productSnapshot(buildProductSnapshot(product))
                    .build();

            order.addItem(item);
            subtotal = subtotal.add(totalPrice);
        }

        // 4. Calcul des montants
        BigDecimal shippingAmount = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO
                : SHIPPING_FEE;

        // Les prix des produits sont TTC (TVA incluse)
        BigDecimal subtotalHt = subtotal.divide(new BigDecimal("1.19"), 3, java.math.RoundingMode.HALF_UP);
        BigDecimal taxAmount = subtotal.subtract(subtotalHt);

        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setShippingAmount(shippingAmount);
        order.setDiscountAmount(BigDecimal.ZERO); // TODO: gérer coupons
        order.setTotalAmount(
                subtotal.add(shippingAmount)
                        .subtract(order.getDiscountAmount())
        );

        // 5. Historique initial
        order.addStatusHistory(OrderStatusHistory.builder()
                .status(OrderStatus.PENDING)
                .notes("Commande créée")
                .changedBy(userId)
                .build());

        Order saved = orderRepository.save(order);
        log.info("Commande {} créée avec succès (total: {} TND)",
                saved.getOrderNumber(), saved.getTotalAmount());

        return orderMapper.toResponse(saved);
    }

    /**
     * Récupérer une commande par ID (avec vérification propriétaire)
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = findOrderOrThrow(orderId, userId);
        return orderMapper.toResponse(order);
    }

    /**
     * Récupérer une commande par ID (admin)
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdAdmin(Long orderId) {
        Order order = findOrderOrThrow(orderId);
        return orderMapper.toResponse(order);
    }

    /**
     * Historique des commandes d'un utilisateur
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(orderMapper::toResponse);
    }

    /**
     * Liste toutes les commandes (admin)
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable) {
        Page<Order> orders = (status != null)
                ? orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : orderRepository.findAll(pageable);
        return orders.map(orderMapper::toResponse);
    }

    /**
     * Annuler une commande (client)
     */
    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = findOrderOrThrow(orderId, userId);

        if (!canBeCancelled(order.getStatus())) {
            throw new BusinessException("Cette commande ne peut plus être annulée");
        }

        // Libérer le stock réservé
        for (OrderItem item : order.getItems()) {
            AdjustStockRequest releaseReq = new AdjustStockRequest();
            releaseReq.setMovementType(MovementType.RELEASE);
            releaseReq.setQuantity(item.getQuantity());
            stockService.adjustStock(item.getProductId(), releaseReq, null);
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.addStatusHistory(OrderStatusHistory.builder()
                .status(OrderStatus.CANCELLED)
                .notes("Annulation demandée par le client")
                .changedBy(userId)
                .build());

        return orderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Mise à jour du statut (admin)
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request, Long adminId) {
        Order order = findOrderOrThrow(orderId);

        validateStatusTransition(order.getStatus(), request.getStatus());

        // Si annulation par admin : libérer le stock
        if (request.getStatus() == OrderStatus.CANCELLED && canBeCancelled(order.getStatus())) {
            for (OrderItem item : order.getItems()) {
                AdjustStockRequest releaseReq = new AdjustStockRequest();
                releaseReq.setMovementType(MovementType.RELEASE);
                releaseReq.setQuantity(item.getQuantity());
                stockService.adjustStock(item.getProductId(), releaseReq, null);
            }
        }

        // Si passage à SHIPPED : décrémenter effectivement le stock
        if (request.getStatus() == OrderStatus.SHIPPED) {
            for (OrderItem item : order.getItems()) {
                AdjustStockRequest releaseReq = new AdjustStockRequest();
                releaseReq.setMovementType(MovementType.RELEASE);
                releaseReq.setQuantity(item.getQuantity());
                stockService.adjustStock(item.getProductId(), releaseReq, null);

                AdjustStockRequest outReq = new AdjustStockRequest();
                outReq.setMovementType(MovementType.OUT);
                outReq.setQuantity(item.getQuantity());
                outReq.setReferenceType(ReferenceType.ORDER);
                outReq.setReferenceId(order.getId());
                stockService.adjustStock(item.getProductId(), outReq, null);
            }
        }

        order.setStatus(request.getStatus());
        order.addStatusHistory(OrderStatusHistory.builder()
                .status(request.getStatus())
                .notes(request.getNotes())
                .changedBy(adminId)
                .build());

        log.info("Commande {} passée à {}", order.getOrderNumber(), request.getStatus());
        return orderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Appelé quand un paiement est confirmé avec succès (par un gateway de paiement).
     * Passe la commande de PENDING à CONFIRMED.
     */
    @Transactional
    public void markPaymentSuccess(Long orderId) {
        Order order = findOrderOrThrow(orderId);

        order.setPaymentStatus(PaymentStatus.PAID);

        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
            order.addStatusHistory(OrderStatusHistory.builder()
                    .status(OrderStatus.CONFIRMED)
                    .notes("Paiement confirmé")
                    .changedBy(null)
                    .build());
        }

        orderRepository.save(order);
        log.info("Paiement confirmé pour la commande {}", order.getOrderNumber());
    }

    /**
     * Appelé quand un paiement échoue. Annule la commande et libère le stock réservé.
     */
    @Transactional
    public void markPaymentFailed(Long orderId, String reason) {
        Order order = findOrderOrThrow(orderId);

        order.setPaymentStatus(PaymentStatus.FAILED);

        if (canBeCancelled(order.getStatus())) {
            for (OrderItem item : order.getItems()) {
                AdjustStockRequest releaseReq = new AdjustStockRequest();
                releaseReq.setMovementType(MovementType.RELEASE);
                releaseReq.setQuantity(item.getQuantity());
                stockService.adjustStock(item.getProductId(), releaseReq, null);
            }

            order.setStatus(OrderStatus.CANCELLED);
            order.addStatusHistory(OrderStatusHistory.builder()
                    .status(OrderStatus.CANCELLED)
                    .notes("Paiement échoué : " + (reason != null ? reason : "raison inconnue"))
                    .changedBy(null)
                    .build());
        }

        orderRepository.save(order);
        log.info("Paiement échoué pour la commande {}", order.getOrderNumber());
    }

    // ================== HELPERS ==================

    private Order findOrderOrThrow(Long orderId, Long userId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
    }

    private Order findOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
    }

    private boolean canBeCancelled(OrderStatus status) {
        return status == OrderStatus.PENDING || status == OrderStatus.CONFIRMED;
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus target) {
        // Règles de transition
        Map<OrderStatus, Set<OrderStatus>> allowed = Map.of(
                OrderStatus.PENDING, Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
                OrderStatus.CONFIRMED, Set.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
                OrderStatus.PROCESSING, Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
                OrderStatus.SHIPPED, Set.of(OrderStatus.DELIVERED),
                OrderStatus.DELIVERED, Set.of(OrderStatus.REFUNDED)
        );

        if (!allowed.getOrDefault(current, Set.of()).contains(target)) {
            throw new BusinessException(
                    String.format("Transition invalide : %s → %s", current, target)
            );
        }
    }

    private Map<String, Object> addressToMap(AddressDto dto) {
        Map<String, Object> map = new HashMap<>();
        map.put("fullName", dto.getFullName());
        map.put("street", dto.getStreet());
        map.put("city", dto.getCity());
        map.put("state", dto.getState());
        map.put("postalCode", dto.getPostalCode());
        map.put("country", dto.getCountry());
        map.put("phone", dto.getPhone());
        return map;
    }

    private Map<String, Object> buildProductSnapshot(Product product) {
        Map<String, Object> snap = new HashMap<>();
        snap.put("name", product.getName());
        snap.put("sku", product.getSku());
        snap.put("condition", product.getCondition());
        snap.put("basePrice", product.getBasePrice());
        snap.put("salePrice", product.getSalePrice());
        // Ajoute l'image primaire si dispo
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            snap.put("image", product.getImages().get(0).getUrl());
        }
        return snap;
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            return null;
        }
    }
}