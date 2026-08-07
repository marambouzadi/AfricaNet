package com.brnsmrt.africanet.dto.response;

import lombok.Data;

@Data
public class ProductImageResponse {
    private Long id;
    private String url;
    private String altText;
    private Integer sortOrder;
    private Boolean isPrimary;
}