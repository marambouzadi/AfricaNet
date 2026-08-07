package com.brnsmrt.africanet.domain;

import com.brnsmrt.africanet.domain.enums.ShipmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(length = 100)
    private String carrier;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "tracking_url", length = 500)
    private String trackingUrl;

    @Column(name = "estimated_delivery")
    private LocalDate estimatedDelivery;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ShipmentStatus status = ShipmentStatus.PREPARING;
}