package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findByNameIgnoreCase(String name);
}