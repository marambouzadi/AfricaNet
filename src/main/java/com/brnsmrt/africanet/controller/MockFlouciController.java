package com.brnsmrt.africanet.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/mock-flouci/api/v2")
public class MockFlouciController {

    private final Map<String, MockPayment> payments = new ConcurrentHashMap<>();

    @PostMapping("/generate_payment")
    public ResponseEntity<Map<String, Object>> generatePayment(@RequestBody Map<String, Object> body) {
        String paymentId = "MOCK-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        MockPayment payment = new MockPayment();
        payment.amount = body.get("amount");
        payment.trackingId = (String) body.get("developer_tracking_id");
        payment.successLink = (String) body.get("success_link");
        payment.failLink = (String) body.get("fail_link");
        payment.status = "PENDING";

        payments.put(paymentId, payment);

        String fakePaymentPageLink = "http://localhost:8090/mock-flouci/api/v2/pay/" + paymentId;
        return ResponseEntity.ok(Map.of(
                "result", Map.of(
                        "success", true,
                        "payment_id", paymentId,
                        "link", fakePaymentPageLink,
                        "developer_tracking_id", payment.trackingId
                )
        ));
    }

    @GetMapping("/verify_payment/{paymentId}")
    public ResponseEntity<Map<String, Object>> verifyPayment(@PathVariable String paymentId) {
        MockPayment payment = payments.get(paymentId);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("result", Map.of("status", payment.status)));
    }

    @GetMapping(value = "/pay/{paymentId}", produces = MediaType.TEXT_HTML_VALUE)
    public String fakePaymentPage(@PathVariable String paymentId) {
        MockPayment payment = payments.get(paymentId);
        if (payment == null) {
            return "<h1>Paiement introuvable</h1>";
        }

        return """
            <html>
            <head><title>Flouci (Simulation)</title>
            <style>
                body { font-family: sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#f5f5f3; }
                .card { background:white; padding:40px; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.1); text-align:center; max-width:400px; }
                button { padding:12px 24px; margin:8px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
                .pay { background:#1A3FA0; color:white; }
                .fail { background:#f5f5f3; color:#333; border:1px solid #ccc; }
            </style>
            </head>
            <body>
                <div class="card">
                    <h2>Flouci (Mode Simulation)</h2>
                    <p>Montant : %s millimes</p>
                    <p>Ref : %s</p>
                    <form method="post" action="/mock-flouci/api/v2/pay/%s/confirm">
                        <button type="submit" class="pay">Payer maintenant</button>
                    </form>
                    <form method="post" action="/mock-flouci/api/v2/pay/%s/fail">
                        <button type="submit" class="fail">Simuler un echec</button>
                    </form>
                </div>
            </body>
            </html>
            """.formatted(payment.amount, payment.trackingId, paymentId, paymentId);
    }

    @PostMapping("/pay/{paymentId}/confirm")
    public ResponseEntity<Void> confirmFakePayment(@PathVariable String paymentId) {
        MockPayment payment = payments.get(paymentId);
        if (payment != null) {
            payment.status = "SUCCESS";
            return redirectTo(payment.successLink + "?tx=" + payment.trackingId);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/pay/{paymentId}/fail")
    public ResponseEntity<Void> failFakePayment(@PathVariable String paymentId) {
        MockPayment payment = payments.get(paymentId);
        if (payment != null) {
            payment.status = "FAILURE";
            return redirectTo(payment.failLink + "?tx=" + payment.trackingId);
        }
        return ResponseEntity.notFound().build();
    }

    private ResponseEntity<Void> redirectTo(String url) {
        return ResponseEntity.status(302).header("Location", url).build();
    }

    private static class MockPayment {
        Object amount;
        String trackingId;
        String successLink;
        String failLink;
        String status;
    }
}