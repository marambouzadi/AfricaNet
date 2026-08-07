package com.brnsmrt.africanet.dto.response;

import lombok.Data;

@Data
public class ProductSpecResponse {
    private Long id;
    private String specKey;
    private String specValue;
    private Integer sortOrder;
}