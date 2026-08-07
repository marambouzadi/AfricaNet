package com.brnsmrt.africanet.dto.request;

import com.brnsmrt.africanet.domain.enums.ProductCondition;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class CreateProductRequest {

    @NotBlank(message = "Le nom du produit est obligatoire")
    @Size(min = 2, max = 200, message = "Le nom doit contenir entre 2 et 200 caractères")
    private String name;

    @Size(max = 5000, message = "La description ne doit pas dépasser 5000 caractères")
    private String description;

    @Size(max = 500, message = "La description courte ne doit pas dépasser 500 caractères")
    private String shortDesc;

    private Long brandId;
    private String brandName;

    @NotNull(message = "La catégorie est obligatoire")
    private Long categoryId;

    @NotNull(message = "L'état du produit est obligatoire")
    private ProductCondition condition;

    @NotNull(message = "Le prix de base est obligatoire")
    @Positive(message = "Le prix de base doit être positif")
    @DecimalMax(value = "999999.999", message = "Le prix de base ne peut pas dépasser 999 999,999 TND")
    private BigDecimal basePrice;

    @Positive(message = "Le prix soldé doit être positif")
    @DecimalMax(value = "999999.999", message = "Le prix soldé ne peut pas dépasser 999 999,999 TND")
    private BigDecimal salePrice;

    @Size(max = 100, message = "Le SKU ne doit pas dépasser 100 caractères")
    private String sku;

    @Positive(message = "Le poids doit être positif")
    private BigDecimal weightKg;

    private Boolean isFeatured = false;

    @Size(max = 255, message = "Le meta titre ne doit pas dépasser 255 caractères")
    private String metaTitle;

    @Size(max = 500, message = "La meta description ne doit pas dépasser 500 caractères")
    private String metaDesc;

    private List<ProductImageRequest> images = new ArrayList<>();
    private List<ProductSpecRequest> specifications = new ArrayList<>();
    private List<String> tagNames = new ArrayList<>();
}