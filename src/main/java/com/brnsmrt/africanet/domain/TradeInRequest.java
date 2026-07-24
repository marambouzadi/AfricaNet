package com.brnsmrt.africanet.domain;

import com.brnsmrt.africanet.domain.enums.ConditionOverall;
import com.brnsmrt.africanet.domain.enums.DeviceType;
import com.brnsmrt.africanet.domain.enums.TradeInStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "trade_in_requests")
@Getter @Setter
public class TradeInRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reference_number", nullable = false, unique = true, length = 30)
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", nullable = false, length = 50)
    private DeviceType deviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(nullable = false, length = 200)
    private String model;

    @Column(name = "manufacture_year")
    private Short manufactureYear;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_overall", nullable = false, length = 20)
    private ConditionOverall conditionOverall;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "condition_details", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> conditionDetails;
    // ex: { "screen": {"score":8,"notes":"légère rayure"}, "battery": {...} }

    @Column(name = "estimated_value_ai", precision = 10, scale = 3)
    private BigDecimal estimatedValueAi;

    @Column(name = "final_value", precision = 10, scale = 3)
    private BigDecimal finalValue;

    @Column(name = "counter_offer", precision = 10, scale = 3)
    private BigDecimal counterOffer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TradeInStatus status = TradeInStatus.SUBMITTED;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_evaluation", columnDefinition = "jsonb")
    private Map<String, Object> aiEvaluation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "tradeInRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TradeInImage> images = new ArrayList<>();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}