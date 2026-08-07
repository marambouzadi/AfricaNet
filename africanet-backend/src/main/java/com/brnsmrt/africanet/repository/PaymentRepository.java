package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByProviderTransactionId(String providerTransactionId);
    List<Payment> findByOrderId(Long orderId);
}