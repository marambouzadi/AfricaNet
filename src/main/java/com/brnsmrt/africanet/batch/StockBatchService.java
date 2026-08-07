package com.brnsmrt.africanet.batch;

import com.brnsmrt.africanet.domain.Inventory;
import com.brnsmrt.africanet.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockBatchService {

    private final InventoryRepository inventoryRepository;

    @Transactional
    public Map<String, Object> runStockBatch() {
        log.info("========== [DEBUT BATCH AUDIT STOCK] ==========");
        int page = 0;
        int pageSize = 50;
        int totalProcessed = 0;
        int alertCount = 0;

        Page<Inventory> inventoryPage;
        do {
            inventoryPage = inventoryRepository.findAll(PageRequest.of(page, pageSize));
            for (Inventory inventory : inventoryPage.getContent()) {
                totalProcessed++;
                int available = inventory.getQuantity() - inventory.getReservedQuantity();

                if (available <= inventory.getMinThreshold()) {
                    alertCount++;
                    log.warn("[BATCH ALERTE STOCK] Produit '{}' (ID: {}) sous le seuil d'alerte ! Disponible: {}, Seuil: {}",
                            inventory.getProduct() != null ? inventory.getProduct().getName() : "Inconnu",
                            inventory.getId(), available, inventory.getMinThreshold());
                }

                // Normalisation des quantités négatives
                if (inventory.getReservedQuantity() < 0) {
                    inventory.setReservedQuantity(0);
                }
                if (inventory.getQuantity() < 0) {
                    inventory.setQuantity(0);
                }
                inventory.setLastUpdated(LocalDateTime.now());
            }
            inventoryRepository.saveAll(inventoryPage.getContent());
            page++;
        } while (inventoryPage.hasNext());

        log.info("========== [FIN BATCH AUDIT STOCK : {} articles vérifiés, {} alertes] ==========", totalProcessed, alertCount);

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("totalProcessed", totalProcessed);
        result.put("alertCount", alertCount);
        result.put("timestamp", LocalDateTime.now().toString());
        return result;
    }
}
