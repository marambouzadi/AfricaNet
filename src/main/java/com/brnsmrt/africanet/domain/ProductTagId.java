package com.brnsmrt.africanet.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;

@Embeddable
@Getter @Setter
@EqualsAndHashCode
public class ProductTagId implements Serializable {

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "tag_id")
    private Long tagId;
}