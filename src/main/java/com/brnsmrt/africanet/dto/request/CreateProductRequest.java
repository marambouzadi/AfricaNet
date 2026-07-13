package com.brnsmrt.africanet.dto.request;

import com.brnsmrt.africanet.domain.enums.ProductCondition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class CreateProductRequest {

    @NotBlank
    private String name;

    private String description;

    @Size(max = 500)
    private String shortDesc;

    private Long brandId;

    @NotNull
    private Long categoryId;

    @NotNull
    private ProductCondition condition;

    @NotNull @Positive
    private BigDecimal basePrice;

    private BigDecimal salePrice;

    @Size(max = 100)
    private String sku;

    private BigDecimal weightKg;

    private Boolean isFeatured = false;

    @Size(max = 255)
    private String metaTitle;

    @Size(max = 500)
    private String metaDesc;

    private List<ProductImageRequest> images = new ArrayList<>();
    private List<ProductSpecRequest> specifications = new ArrayList<>();
    private List<String> tagNames = new ArrayList<>();
}