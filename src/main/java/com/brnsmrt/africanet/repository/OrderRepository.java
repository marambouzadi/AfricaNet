package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.Order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT o.product.id, COUNT(o) FROM Order o WHERE o.product IS NOT NULL GROUP BY o.product.id")
    List<Object[]> countOrdersByProduct();
}
