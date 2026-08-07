package com.brnsmrt.africanet.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "product_tags")
@Getter @Setter
public class ProductTag {

    @EmbeddedId
    private ProductTagId id = new ProductTagId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tagId")
    @JoinColumn(name = "tag_id")
    private Tag tag;
}