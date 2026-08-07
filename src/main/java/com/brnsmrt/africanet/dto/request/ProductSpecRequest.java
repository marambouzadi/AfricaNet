package com.brnsmrt.africanet.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductSpecRequest {
    @NotBlank
    private String specKey;
    @NotBlank
    private String specValue;
    private Integer sortOrder = 0;
}