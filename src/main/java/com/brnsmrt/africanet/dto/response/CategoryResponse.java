package com.brnsmrt.africanet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Integer sortOrder;
    private Boolean isActive;
}
