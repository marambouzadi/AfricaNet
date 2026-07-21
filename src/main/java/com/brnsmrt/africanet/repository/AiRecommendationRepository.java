package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.AiRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiRecommendationRepository extends JpaRepository<AiRecommendation, Long> {
}
