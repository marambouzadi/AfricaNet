package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.domain.Payment;
import com.brnsmrt.africanet.domain.enums.PaymentMethod;
import com.brnsmrt.africanet.domain.enums.PaymentStatus;
import com.brnsmrt.africanet.repository.OrderRepository;
import com.brnsmrt.africanet.repository.PaymentRepository;
import com.brnsmrt.africanet.service.FlouciService;
import com.brnsmrt.africanet.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments/flouci")
@RequiredArgsConstructor
public class FlouciPaymentController {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final FlouciService flouciService;
    private final OrderService orderService;

    @PostMapping("/initiate")
    public ResponseEntity<Map<String, String>> initiate(@RequestParam Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Commande introuvable"));

        String trackingId = "AN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        FlouciService.FlouciPaymentResult result = flouciService.generatePayment(
                order.getTotalAmount().doubleValue(),
                trackingId,
                order.getOrderNumber()
        );

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .currency("TND")
                .paymentMethod(PaymentMethod.CARD)
                .provider("flouci")
                .providerTransactionId(trackingId)
                .flouciPaymentId(result.paymentId())
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        return ResponseEntity.ok(Map.of(
                "paymentLink", result.link(),
                "transactionId", trackingId
        ));
    }

    /**
     * Appelé par le FRONT quand l'utilisateur revient sur /checkout/success ou /checkout/fail
     * pour vérifier le vrai statut auprès de Flouci.
     */
    @GetMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(@RequestParam String tx) {
        Payment payment = paymentRepository.findByProviderTransactionId(tx)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paiement introuvable"));

        if (payment.getFlouciPaymentId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment Flouci non lié");
        }

        String status = flouciService.verifyPaymentStatus(payment.getFlouciPaymentId());

        if ("SUCCESS".equals(status)) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            orderService.markPaymentSuccess(payment.getOrder().getId());
        } else if ("FAILURE".equals(status) || "EXPIRED".equals(status)) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Paiement Flouci statut: " + status);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            orderService.markPaymentFailed(payment.getOrder().getId(), status);
        }

        return ResponseEntity.ok(Map.of("status", status));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok().build();
    }
}
