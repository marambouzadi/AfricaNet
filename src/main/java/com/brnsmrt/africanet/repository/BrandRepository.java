package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    Brand findByNameIgnoreCase(String name);
}
