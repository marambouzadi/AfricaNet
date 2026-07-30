package com.brnsmrt.africanet.batch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class BatchScheduler {

    private final StockBatchService stockBatchService;
    private final ReportBatchService reportBatchService;

    // Exécution du batch de stock tous les jours à 01:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    public void runStockBatchScheduled() {
        log.info("[SCHEDULER] Démarrage automatique du Batch Audit Stock...");
        try {
            stockBatchService.runStockBatch();
        } catch (Exception e) {
            log.error("[SCHEDULER ERROR] Échec de l'exécution du Batch Stock", e);
        }
    }

    // Exécution du batch de rapport de ventes tous les lundis à 02:00 AM
    @Scheduled(cron = "0 0 2 * * MON")
    public void runReportBatchScheduled() {
        log.info("[SCHEDULER] Démarrage automatique du Batch Rapport Ventes...");
        try {
            reportBatchService.runReportBatch();
        } catch (Exception e) {
            log.error("[SCHEDULER ERROR] Échec de l'exécution du Batch Rapport", e);
        }
    }
}
