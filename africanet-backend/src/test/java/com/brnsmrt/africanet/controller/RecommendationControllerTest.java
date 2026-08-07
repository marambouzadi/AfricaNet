package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.ai.RecommendationService;
import com.brnsmrt.africanet.dto.response.RecommendationResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecommendationControllerTest {

    @Mock
    private RecommendationService recommendationService;

    @InjectMocks
    private RecommendationController recommendationController;

    @Test
    void testGetRecommendations_success() {
        RecommendationResponse rec = RecommendationResponse.builder()
                .userId(1L)
                .productId(100L)
                .productName("MacBook Air M2")
                .price(3200.0)
                .score(0.92)
                .reason("Based on purchase history")
                .createdAt("2026-07-30T12:00:00")
                .build();

        when(recommendationService.recommend(1L, 5)).thenReturn(List.of(rec));

        ResponseEntity<List<RecommendationResponse>> response = recommendationController.getRecommendations(1L, 5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("MacBook Air M2", response.getBody().get(0).getProductName());
        verify(recommendationService).recommend(1L, 5);
    }

    @Test
    void testTrackClick_success() {
        when(recommendationService.markClicked(10L)).thenReturn(true);

        ResponseEntity<Void> response = recommendationController.trackClick(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(recommendationService).markClicked(10L);
    }

    @Test
    void testTrackPurchase_success() {
        when(recommendationService.markPurchased(10L)).thenReturn(true);

        ResponseEntity<Void> response = recommendationController.trackPurchase(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(recommendationService).markPurchased(10L);
    }
}
