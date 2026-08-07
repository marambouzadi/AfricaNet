package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.DeviceBaseValue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeviceBaseValueRepository extends JpaRepository<DeviceBaseValue, Long> {

    /**
     * Find a device base value by exact brand and model (case-insensitive).
     */
    @Query("SELECT d FROM DeviceBaseValue d WHERE LOWER(d.brand) = LOWER(:brand) AND LOWER(d.model) = LOWER(:model)")
    Optional<DeviceBaseValue> findByBrandAndModel(@Param("brand") String brand, @Param("model") String model);

    /**
     * Find a device base value where the given model starts with the stored model (partial match, case-insensitive).
     * Returns the first match found.
     */
    @Query("SELECT d FROM DeviceBaseValue d WHERE LOWER(d.brand) = LOWER(:brand) AND LOWER(:model) LIKE CONCAT(LOWER(d.model), '%') ORDER BY LENGTH(d.model) DESC")
    Optional<DeviceBaseValue> findByBrandAndModelStartingWith(@Param("brand") String brand, @Param("model") String model);
}
