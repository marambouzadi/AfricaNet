package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder_User_Id(Long userId);

    @Query("SELECT oi.product.id, COUNT(oi) FROM OrderItem oi WHERE oi.product IS NOT NULL GROUP BY oi.product.id")
    List<Object[]> countOrdersByProduct();
}
