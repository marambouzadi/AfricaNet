package com.brnsmrt.africanet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class FlouciService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${flouci.public-key}")
    private String publicKey;

    @Value("${flouci.private-key}")
    private String privateKey;

    @Value("${flouci.base-url}")
    private String baseUrl;

    @Value("${flouci.success-link}")
    private String successLink;

    @Value("${flouci.fail-link}")
    private String failLink;

    @Value("${flouci.webhook}")
    private String webhook;

    @SuppressWarnings("unchecked")
    public FlouciPaymentResult generatePayment(double amountTnd, String trackingId, String clientName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + publicKey + ":" + privateKey);

        String amountInMillimes = String.valueOf(Math.round(amountTnd * 1000));

        Map<String, Object> body = Map.of(
                "amount", amountInMillimes,
                "developer_tracking_id", trackingId,
                "accept_card", true,
                "success_link", successLink + "?tx=" + trackingId,
                "fail_link", failLink + "?tx=" + trackingId,
                "webhook", webhook,
                "client_id", clientName
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl + "/generate_payment", request, Map.class
        );

        if (response.getBody() == null || response.getBody().get("result") == null) {
            throw new RuntimeException("Erreur lors de la génération du paiement Flouci");
        }

        Map<String, Object> result = (Map<String, Object>) response.getBody().get("result");

        return new FlouciPaymentResult(
                (String) result.get("payment_id"),
                (String) result.get("link")
        );
    }

    @SuppressWarnings("unchecked")
    public String verifyPaymentStatus(String flouciPaymentId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + publicKey + ":" + privateKey);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/verify_payment/" + flouciPaymentId,
                HttpMethod.GET, request, Map.class
        );

        if (response.getBody() == null || response.getBody().get("result") == null) {
            throw new RuntimeException("Erreur lors de la vérification du paiement Flouci");
        }

        Map<String, Object> result = (Map<String, Object>) response.getBody().get("result");
        return (String) result.get("status"); // SUCCESS, PENDING, EXPIRED, FAILURE
    }

    public record FlouciPaymentResult(String paymentId, String link) {}
}
