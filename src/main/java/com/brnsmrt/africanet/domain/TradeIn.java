package com.brnsmrt.africanet.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "trade_in_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TradeIn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String model;
    
    private String brand;
    
    @Column(name = "year_of_purchase")
    private Integer yearOfPurchase;
    
    @Column(name = "screen_condition")
    private Integer screenCondition;
    
    @Column(name = "battery_condition")
    private Integer batteryCondition;
    
    @Column(name = "body_condition")
    private Integer bodyCondition;
    
    @Column(name = "functionality_condition")
    private Integer functionalityCondition;
    
    private String notes;
    
    @Column(name = "condition_score")
    private Double conditionScore;
    
    @Column(name = "estimated_value")
    private Double estimatedValue;
    
    @Column(name = "condition_summary", length = 1024)
    private String conditionSummary;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String status;
}
