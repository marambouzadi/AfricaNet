package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.Payment;
import com.brnsmrt.africanet.domain.enums.PaymentMethod;
import com.brnsmrt.africanet.domain.enums.PaymentStatus;
import com.brnsmrt.africanet.repository.OrderRepository;
import com.brnsmrt.africanet.repository.PaymentRepository;
import com.brnsmrt.africanet.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments/simulate")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/initiate")
    public ResponseEntity<Map<String, Object>> initiate(@RequestParam Long orderId) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Commande introuvable"));

        String fakeTransactionId = "SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Map<String, Object> metadata = Map.of(
                "simulator", true,
                "createdVia", "test-flow"
        );

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .currency("TND")
                .paymentMethod(PaymentMethod.CARD)
                .provider("SIMULATED")
                .providerTransactionId(fakeTransactionId)
                .status(PaymentStatus.PENDING)
                .metadata(metadata)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        return ResponseEntity.ok(Map.of(
                "transactionId", fakeTransactionId,
                "amount", order.getTotalAmount(),
                "orderNumber", order.getOrderNumber()
        ));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, String>> confirm(@RequestParam String transactionId) {
        Payment payment = paymentRepository.findByProviderTransactionId(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paiement introuvable"));

        payment.setStatus(PaymentStatus.PAID);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        orderService.markPaymentSuccess(payment.getOrder().getId());

        return ResponseEntity.ok(Map.of("status", "SUCCESS"));
    }

    @PostMapping("/fail")
    public ResponseEntity<Map<String, String>> fail(@RequestParam String transactionId,
                                                     @RequestParam(required = false) String reason) {
        Payment payment = paymentRepository.findByProviderTransactionId(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paiement introuvable"));

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason != null ? reason : "Paiement refusé");
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        orderService.markPaymentFailed(payment.getOrder().getId(), reason);

        return ResponseEntity.ok(Map.of("status", "FAILED"));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> status(@RequestParam String transactionId) {
        Payment payment = paymentRepository.findByProviderTransactionId(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paiement introuvable"));

        return ResponseEntity.ok(Map.of("status", payment.getStatus().name()));
    }
}