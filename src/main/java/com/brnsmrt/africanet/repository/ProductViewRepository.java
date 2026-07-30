package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.ProductView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductViewRepository extends JpaRepository<ProductView, Long> {

    List<ProductView> findByUser_Id(Long userId);

    List<ProductView> findBySessionId(String sessionId);

    @Query("SELECT pv.product.category.id, COUNT(pv) FROM ProductView pv WHERE pv.user.id = :userId AND pv.product.category IS NOT NULL GROUP BY pv.product.category.id")
    List<Object[]> countViewsPerCategoryByUser(@Param("userId") Long userId);
}
