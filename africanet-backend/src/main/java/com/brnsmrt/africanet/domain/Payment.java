package com.brnsmrt.africanet.domain;

import com.brnsmrt.africanet.domain.enums.PaymentMethod;
import com.brnsmrt.africanet.domain.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private BigDecimal amount;
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    private String provider;

    @Column(name = "provider_transaction_id")
    private String providerTransactionId;

    @Column(name = "flouci_payment_id")
    private String flouciPaymentId;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(name = "failure_reason")
    private String failureReason;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}