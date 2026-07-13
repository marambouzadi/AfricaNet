package com.brnsmrt.africanet.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductImageRequest {
    @NotBlank
    private String url;
    private String altText;
    private Integer sortOrder = 0;
    private Boolean isPrimary = false;
}