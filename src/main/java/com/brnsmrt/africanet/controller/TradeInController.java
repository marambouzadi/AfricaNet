package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.ai.TradeInEvaluationService;
import com.brnsmrt.africanet.ai.dto.EvaluationResult;
import com.brnsmrt.africanet.domain.TradeIn;
import com.brnsmrt.africanet.dto.request.TradeInRequest;
import com.brnsmrt.africanet.repository.TradeInRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trade-in")
public class TradeInController {

    private final TradeInEvaluationService tradeInEvaluationService;
    private final TradeInRepository tradeInRepository;

    public TradeInController(TradeInEvaluationService tradeInEvaluationService,
                              TradeInRepository tradeInRepository) {
        this.tradeInEvaluationService = tradeInEvaluationService;
        this.tradeInRepository = tradeInRepository;
    }

    /**
     * Submit a trade-in evaluation request.
     * Evaluates device condition and returns estimated trade-in value (TND).
     */
    @PostMapping("/evaluate")
    public ResponseEntity<EvaluationResult> evaluateTradeIn(@Valid @RequestBody TradeInRequest request) {
        EvaluationResult result = tradeInEvaluationService.evaluate(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Get trade-in requests submitted by a specific user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TradeIn>> getUserTradeIns(@PathVariable Long userId) {
        List<TradeIn> tradeIns = tradeInRepository.findByUser_Id(userId);
        return ResponseEntity.ok(tradeIns);
    }
}
