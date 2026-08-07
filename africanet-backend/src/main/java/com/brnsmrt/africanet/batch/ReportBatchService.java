package com.brnsmrt.africanet.batch;

import com.brnsmrt.africanet.domain.Order;
import com.brnsmrt.africanet.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportBatchService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> runReportBatch() {
        log.info("========== [DEBUT BATCH RAPPORT DE VENTES] ==========");
        int page = 0;
        int pageSize = 50;
        int totalOrders = 0;
        int completedCount = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        Page<Order> orderPage;
        do {
            orderPage = orderRepository.findAll(PageRequest.of(page, pageSize));
            for (Order order : orderPage.getContent()) {
                totalOrders++;
                String status = order.getStatus() != null ? order.getStatus().name() : "";
                if ("DELIVERED".equals(status) || "SHIPPED".equals(status) || "CONFIRMED".equals(status)) {
                    completedCount++;
                    if (order.getTotalAmount() != null) {
                        totalRevenue = totalRevenue.add(order.getTotalAmount());
                    }
                }
            }
            page++;
        } while (orderPage.hasNext());

        log.info("========== [RAPPORT GENERATION COMPLETEE] ==========");
        log.info("Total commandes analysées : {}", totalOrders);
        log.info("Commandes réussies        : {}", completedCount);
        log.info("Chiffre d'affaires agrégé  : {} TND", totalRevenue);
        log.info("====================================================");

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("totalOrders", totalOrders);
        result.put("completedOrders", completedCount);
        result.put("totalRevenueTnd", totalRevenue);
        result.put("generatedAt", LocalDateTime.now().toString());
        return result;
    }
}
