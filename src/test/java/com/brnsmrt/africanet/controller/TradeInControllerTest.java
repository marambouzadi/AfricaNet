package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.ai.TradeInEvaluationService;
import com.brnsmrt.africanet.ai.dto.EvaluationResult;
import com.brnsmrt.africanet.domain.TradeIn;
import com.brnsmrt.africanet.dto.request.TradeInRequest;
import com.brnsmrt.africanet.repository.TradeInRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TradeInControllerTest {

    @Mock
    private TradeInEvaluationService tradeInEvaluationService;

    @Mock
    private TradeInRepository tradeInRepository;

    @InjectMocks
    private TradeInController tradeInController;

    @Test
    void testEvaluateTradeIn_success() {
        TradeInRequest request = TradeInRequest.builder()
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
                .conditionSummary("Estimated Value: 1800 TND")
                .status("EVALUATING")
                .build();

        when(tradeInEvaluationService.evaluate(any())).thenReturn(expectedResult);

        ResponseEntity<EvaluationResult> response = tradeInController.evaluateTradeIn(request, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1800.0, response.getBody().getEstimatedValue());
        verify(tradeInEvaluationService).evaluate(request);
    }

}
