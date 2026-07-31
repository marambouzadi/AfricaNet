package com.brnsmrt.africanet.domain;

import com.brnsmrt.africanet.domain.enums.TradeInImageType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "trade_in_images")
@Getter @Setter
public class TradeInImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trade_in_id", nullable = false)
    private TradeInRequest tradeInRequest;

    @Column(nullable = false, length = 500)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(name = "image_type", length = 30)
    private TradeInImageType imageType;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();
}