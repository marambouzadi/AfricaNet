package com.brnsmrt.africanet.domain;

import com.brnsmrt.africanet.domain.enums.ProductCondition;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(nullable = false, unique = true, length = 255)
    private String slug;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "short_desc", length = 500)
    private String shortDesc;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductCondition condition;
    
    @Column(name = "base_price", nullable = false, precision = 10, scale = 3)
    private BigDecimal basePrice;
    
    @Column(name = "sale_price", precision = 10, scale = 3)
    private BigDecimal salePrice;
    
    @Column(unique = true, length = 100)
    private String sku;
    
    @Column(name = "weight_kg", precision = 8, scale = 3)
    private BigDecimal weightKg;
    
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
    
    @Column(name = "is_featured", nullable = false)
    private boolean isFeatured = false;
    
    @Column(name = "meta_title", length = 255)
    private String metaTitle;
    
    @Column(name = "meta_desc", length = 500)
    private String metaDesc;
    
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;
    
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
}
