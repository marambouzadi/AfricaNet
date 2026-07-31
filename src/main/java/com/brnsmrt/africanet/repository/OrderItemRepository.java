package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder_UserId(Long userId);

    @Query("SELECT oi.productId, COUNT(oi) FROM OrderItem oi WHERE oi.productId IS NOT NULL GROUP BY oi.productId")
    List<Object[]> countOrdersByProduct();
}
