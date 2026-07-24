package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startOfDay")
    long countOrdersToday(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);
}