package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByIdAndUser_Id(Long id, Long userId);
    Page<Order> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);
    List<Order> findByUser_Id(Long userId);

    // Aliases for compatibility
    default Optional<Order> findByIdAndUserId(Long id, Long userId) {
        return findByIdAndUser_Id(id, userId);
    }

    default Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable) {
        return findByUser_IdOrderByCreatedAtDesc(userId, pageable);
    }

    default List<Order> findByUserId(Long userId) {
        return findByUser_Id(userId);
    }
}
