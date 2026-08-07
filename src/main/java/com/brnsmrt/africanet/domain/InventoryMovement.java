package com.brnsmrt.africanet.domain;

import com.brnsmrt.africanet.domain.enums.MovementType;
import com.brnsmrt.africanet.domain.enums.ReferenceType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_movements")
@Getter @Setter
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 20)
    private MovementType movementType;

    @Column(nullable = false)
    private Integer quantity; // positif = entrée, négatif = sortie

    @Column(name = "quantity_after", nullable = false)
    private Integer quantityAfter;

    @Column(name = "reference_id")
    private Long referenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 30)
    private ReferenceType referenceType;

    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}