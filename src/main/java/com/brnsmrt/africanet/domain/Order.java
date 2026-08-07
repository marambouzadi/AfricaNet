package com.brnsmrt.africanet.domain;

import com.brnsmrt.africanet.domain.enums.OrderStatus;
import com.brnsmrt.africanet.domain.enums.PaymentMethod;
import com.brnsmrt.africanet.domain.enums.PaymentStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 30)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal subtotal;

    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 3)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "shipping_amount", nullable = false, precision = 10, scale = 3)
    @Builder.Default
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 10, scale = 3)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 3)
    private BigDecimal totalAmount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "shipping_address", nullable = false, columnDefinition = "jsonb")
    private String shippingAddress;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "billing_address", columnDefinition = "jsonb")
    private String billingAddress;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 50)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "customer_notes", columnDefinition = "TEXT")
    private String customerNotes;

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ── Helper Getters & Setters for Compatibility ───────────

    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    public void setUserId(Long userId) {
        if (userId != null) {
            User u = new User();
            u.setId(userId);
            this.user = u;
        }
    }

    public List<OrderItem> getItems() {
        return this.orderItems;
    }

    public void setItems(List<OrderItem> items) {
        this.orderItems = items;
    }

    public void addItem(OrderItem item) {
        item.setOrder(this);
        this.orderItems.add(item);
    }

    public void addStatusHistory(OrderStatusHistory history) {
        history.setOrder(this);
        this.statusHistory.add(history);
    }

    public void setShippingAddress(Map<String, Object> address) {
        this.shippingAddress = toJson(address);
    }

    public void setBillingAddress(Map<String, Object> address) {
        this.billingAddress = toJson(address);
    }

    private static String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return new ObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            return null;
        }
    }
}
