package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.ProductSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductSpecificationRepository extends JpaRepository<ProductSpecification, Long> {
    List<ProductSpecification> findByProductIdOrderBySortOrderAsc(Long productId);
    void deleteByProductId(Long productId);
}