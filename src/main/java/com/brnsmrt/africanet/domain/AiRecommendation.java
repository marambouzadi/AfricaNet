package com.brnsmrt.africanet.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "ai_recommendations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id")
    private String sessionId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal score;

    private String reason;

    @Column(name = "shown_at")
    private LocalDateTime shownAt;

    @Column(name = "clicked_at")
    private LocalDateTime clickedAt;

    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
