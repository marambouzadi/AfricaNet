package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}