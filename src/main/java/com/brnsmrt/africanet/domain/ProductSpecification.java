package com.brnsmrt.africanet.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "product_specifications")
@Getter @Setter
public class ProductSpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "spec_key", nullable = false, length = 100)
    private String specKey;

    @Column(name = "spec_value", nullable = false, length = 255)
    private String specValue;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}