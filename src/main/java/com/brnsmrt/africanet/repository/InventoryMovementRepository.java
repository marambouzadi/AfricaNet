package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.InventoryMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    Page<InventoryMovement> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
}