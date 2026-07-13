package com.brnsmrt.africanet.dto.response;

import com.brnsmrt.africanet.domain.enums.ProductCondition;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String shortDesc;
    private String brandName;
    private String categoryName;
    private ProductCondition condition;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private String sku;
    private BigDecimal weightKg;
    private Boolean isActive;
    private Boolean isFeatured;
    private String metaTitle;
    private String metaDesc;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<ProductImageResponse> images;
    private List<ProductSpecResponse> specifications;
    private List<String> tags;
}