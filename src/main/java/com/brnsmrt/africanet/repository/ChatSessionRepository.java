package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    Optional<ChatSession> findBySessionToken(String sessionToken);
}
