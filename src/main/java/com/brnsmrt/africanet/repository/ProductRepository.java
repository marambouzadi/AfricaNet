package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.enums.ProductCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlugAndIsActiveTrue(String slug);

    Page<Product> findByIsActiveTrue(Pageable pageable);
    
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    
    // AI Methods
    List<Product> findByBasePriceLessThanEqual(java.math.BigDecimal maxPrice);
    List<Product> findByNameContainingIgnoreCase(String keyword);
    List<Product> findByCategoryIdIn(List<Long> categoryIds);
    Optional<Product> findByIdAndIsActiveTrue(Long id);

    boolean existsBySlug(String slug);

    @Query("""
        SELECT p FROM Product p
        WHERE p.isActive = true
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:brandId IS NULL OR p.brand.id = :brandId)
        AND (:condition IS NULL OR p.condition = :condition)
        AND (:minPrice IS NULL OR p.basePrice >= :minPrice)
        AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice)
        """)
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category", "brand", "images", "specifications"})
    Page<Product> searchWithFilters(
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            @Param("condition") ProductCondition condition,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM Product p
        WHERE p.isActive = true
        AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))
        """)
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category", "brand", "images", "specifications"})
    Page<Product> fullTextSearch(@Param("query") String query, Pageable pageable);
}