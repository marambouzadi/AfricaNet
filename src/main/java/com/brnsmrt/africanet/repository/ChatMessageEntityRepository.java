package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageEntityRepository extends JpaRepository<ChatMessageEntity, Long> {
}
