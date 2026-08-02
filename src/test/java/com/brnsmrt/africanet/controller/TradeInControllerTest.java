package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.ai.TradeInEvaluationService;
import com.brnsmrt.africanet.ai.dto.EvaluationResult;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.dto.request.TradeInEvaluationRequest;
import com.brnsmrt.africanet.dto.response.TradeInResponse;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.service.TradeInService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TradeInControllerTest {

    @Mock
    private TradeInEvaluationService tradeInEvaluationService;

    @Mock
    private TradeInService tradeInService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TradeInController tradeInController;

    @Test
    void testEvaluateTradeIn_success() {
        TradeInEvaluationRequest request = TradeInEvaluationRequest.builder()
                .deviceModel("ThinkPad X1")
                .brand("Lenovo")
                .yearOfPurchase(2023)
                .screenScore(9)
                .keyboardScore(9)
                .batteryScore(8)
                .chassisScore(8)
                .performanceScore(9)
                .userId(1L)
                .build();

        EvaluationResult expectedResult = EvaluationResult.builder()
                .tradeInId(10L)
                .deviceModel("ThinkPad X1")
                .brand("Lenovo")
                .conditionScore(0.86)
                .estimatedValue(1800.0)
                .conditionSummary("Valeur estimée : 1800 TND")
                .status("EVALUATING")
                .build();

        User mockUser = new User();
        mockUser.setId(1L);

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(tradeInEvaluationService.evaluate(any())).thenReturn(expectedResult);

        ResponseEntity<EvaluationResult> response = tradeInController.evaluateTradeIn(request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1800.0, response.getBody().getEstimatedValue());
        verify(tradeInEvaluationService).evaluate(request);
    }

    @Test
    void testGetMyTradeIns_success() {
        TradeInResponse tradeInResponse = new TradeInResponse();
        tradeInResponse.setId(1L);
        Page<TradeInResponse> page = new PageImpl<>(List.of(tradeInResponse));

        when(tradeInService.getMyTradeIns(any(), any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<TradeInResponse>> response =
                tradeInController.getMyTradeIns(Pageable.unpaged(), authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());
        verify(tradeInService).getMyTradeIns(authentication, Pageable.unpaged());
    }

    @Test
    void testGetMyTradeInById_success() {
        TradeInResponse tradeInResponse = new TradeInResponse();
        tradeInResponse.setId(42L);

        when(tradeInService.getMyTradeInById(42L, authentication)).thenReturn(tradeInResponse);

        ResponseEntity<TradeInResponse> response =
                tradeInController.getMyTradeInById(42L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(42L, response.getBody().getId());
        verify(tradeInService).getMyTradeInById(42L, authentication);
    }
}