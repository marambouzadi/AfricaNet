package com.brnsmrt.africanet.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.util.Map;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Type(JsonType.class)
    @Column(name = "product_snapshot", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> productSnapshot;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 3)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 3)
    private BigDecimal totalPrice;

    // ── Helper Getters & Setters for Compatibility ───────────

    public Long getProductId() {
        return product != null ? product.getId() : null;
    }

    public void setProductId(Long productId) {
        if (productId != null) {
            Product p = new Product();
            p.setId(productId);
            this.product = p;
        }
    }
}

