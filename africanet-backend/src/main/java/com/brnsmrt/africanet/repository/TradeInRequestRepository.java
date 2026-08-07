package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.TradeInRequest;
import com.brnsmrt.africanet.domain.enums.TradeInStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TradeInRequestRepository extends JpaRepository<TradeInRequest, Long> {

    Page<TradeInRequest> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<TradeInRequest> findByIdAndUser_Id(Long id, Long userId);

    Page<TradeInRequest> findByStatus(TradeInStatus status, Pageable pageable);

    boolean existsByReferenceNumber(String referenceNumber);
}