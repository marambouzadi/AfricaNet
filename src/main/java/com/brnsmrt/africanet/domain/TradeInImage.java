package com.brnsmrt.africanet.domain;

import com.brnsmrt.africanet.domain.enums.TradeInImageType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "trade_in_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeInImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "trade_in_id", nullable = false)
    private TradeInRequest tradeInRequest;

    @Column(nullable = false, length = 500)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(name = "image_type", length = 30)
    private TradeInImageType imageType;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) uploadedAt = LocalDateTime.now();
    }
}
