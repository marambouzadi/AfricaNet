package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.Product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByBasePriceLessThanEqual(Double maxPrice);
    List<Product> findByNameContainingIgnoreCase(String keyword);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByCategoryIdIn(List<Long> categoryIds);
}
