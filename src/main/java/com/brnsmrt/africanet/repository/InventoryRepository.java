package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    @Query("""
        SELECT i FROM Inventory i
        WHERE (i.quantity - i.reservedQuantity) <= i.minThreshold
        """)
    Page<Inventory> findLowStockAlerts(Pageable pageable);
}