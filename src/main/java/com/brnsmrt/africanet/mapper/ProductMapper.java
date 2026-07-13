package com.brnsmrt.africanet.mapper;

import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.ProductImage;
import com.brnsmrt.africanet.domain.ProductSpecification;
import com.brnsmrt.africanet.domain.ProductTag;
import com.brnsmrt.africanet.dto.response.ProductImageResponse;
import com.brnsmrt.africanet.dto.response.ProductResponse;
import com.brnsmrt.africanet.dto.response.ProductSpecResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "brandName", expression = "java(product.getBrand() != null ? product.getBrand().getName() : null)")
    @Mapping(target = "categoryName", expression = "java(product.getCategory().getName())")
    @Mapping(target = "images", expression = "java(mapImages(product))")
    @Mapping(target = "specifications", expression = "java(mapSpecs(product))")
    @Mapping(target = "tags", expression = "java(mapTags(product))")
    ProductResponse toResponse(Product product);

    default List<ProductImageResponse> mapImages(Product product) {
        return product.getImages().stream().map(img -> {
            ProductImageResponse r = new ProductImageResponse();
            r.setId(img.getId());
            r.setUrl(img.getUrl());
            r.setAltText(img.getAltText());
            r.setSortOrder(img.getSortOrder());
            r.setIsPrimary(img.getIsPrimary());
            return r;
        }).collect(Collectors.toList());
    }

    default List<ProductSpecResponse> mapSpecs(Product product) {
        return product.getSpecifications().stream().map(spec -> {
            ProductSpecResponse r = new ProductSpecResponse();
            r.setId(spec.getId());
            r.setSpecKey(spec.getSpecKey());
            r.setSpecValue(spec.getSpecValue());
            r.setSortOrder(spec.getSortOrder());
            return r;
        }).collect(Collectors.toList());
    }

    default List<String> mapTags(Product product) {
        return product.getProductTags().stream()
                .map(pt -> pt.getTag().getName())
                .collect(Collectors.toList());
    }
}