package com.brnsmrt.africanet.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "device_base_values", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"brand", "model"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeviceBaseValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(name = "base_value", nullable = false)
    private Double baseValue;
}
