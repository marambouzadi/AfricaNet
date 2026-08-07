package com.brnsmrt.africanet.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Getter @Setter
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;

    @Column(name = "min_threshold", nullable = false)
    private Integer minThreshold = 5;

    @Column(name = "warehouse_location", length = 100)
    private String warehouseLocation;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated = LocalDateTime.now();

    // quantity_available = quantity - reserved_quantity (calculé, pas stocké)
    @Transient
    public Integer getQuantityAvailable() {
        return quantity - reservedQuantity;
    }
}