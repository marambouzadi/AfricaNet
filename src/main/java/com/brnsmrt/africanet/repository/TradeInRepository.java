package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.TradeIn;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TradeInRepository extends JpaRepository<TradeIn, Long> {
    java.util.List<TradeIn> findByUser_Id(Long userId);
}
