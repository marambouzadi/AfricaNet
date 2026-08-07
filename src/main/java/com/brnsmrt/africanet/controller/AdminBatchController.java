package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.batch.ReportBatchService;
import com.brnsmrt.africanet.batch.StockBatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/batch")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Batch", description = "Gestion et déclenchement des Traitements Batch (Stock & Rapports)")
public class AdminBatchController {

    private final StockBatchService stockBatchService;
    private final ReportBatchService reportBatchService;

    @Operation(summary = "Déclencher manuellement le Batch Audit & Seuil Stock")
    @PostMapping("/run/stock")
    public ResponseEntity<Map<String, Object>> runStockBatch() {
        try {
            Map<String, Object> result = stockBatchService.runStockBatch();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Échec du lancement du batch stock", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Erreur lors du lancement du batch stock: " + e.getMessage()
            ));
        }
    }

    @Operation(summary = "Déclencher manuellement le Batch Rapport de Ventes")
    @PostMapping("/run/report")
    public ResponseEntity<Map<String, Object>> runReportBatch() {
        try {
            Map<String, Object> result = reportBatchService.runReportBatch();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Échec du lancement du batch rapport", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Erreur lors du lancement du batch rapport: " + e.getMessage()
            ));
        }
    }
}
