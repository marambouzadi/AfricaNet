package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.ChatMessageEntity;
import com.brnsmrt.africanet.domain.ChatSession;
import com.brnsmrt.africanet.repository.ChatMessageEntityRepository;
import com.brnsmrt.africanet.repository.ChatSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ChatHistoryService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageEntityRepository messageRepository;

    public ChatHistoryService(ChatSessionRepository sessionRepository, ChatMessageEntityRepository messageRepository) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public ChatSession getOrCreateSession(String sessionToken) {
        Optional<ChatSession> existing = sessionRepository.findBySessionToken(sessionToken);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        ChatSession newSession = ChatSession.builder()
                .sessionToken(sessionToken)
                .startedAt(LocalDateTime.now())
                .messageCount(0)
                .build();
        return sessionRepository.save(newSession);
    }

    @Transactional
    public void logMessage(String sessionToken, String role, String content) {
        ChatSession session = getOrCreateSession(sessionToken);
        
        ChatMessageEntity message = ChatMessageEntity.builder()
                .session(session)
                .role(role)
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();
                
        messageRepository.save(message);
        
        session.setMessageCount(session.getMessageCount() + 1);
        sessionRepository.save(session);
    }
}
