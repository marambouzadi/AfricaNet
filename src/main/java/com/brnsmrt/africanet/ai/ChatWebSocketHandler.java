package com.brnsmrt.africanet.ai;

import com.brnsmrt.africanet.ai.dto.ChatMessage;
import com.brnsmrt.africanet.dto.response.ChatResponse;
import com.brnsmrt.africanet.service.ChatHistoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Slf4j
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatbotService chatbotService;
    private final ObjectMapper objectMapper;
    private final ChatHistoryService chatHistoryService;

    public ChatWebSocketHandler(ChatbotService chatbotService, ObjectMapper objectMapper, ChatHistoryService chatHistoryService) {
        this.chatbotService = chatbotService;
        this.objectMapper = objectMapper;
        this.chatHistoryService = chatHistoryService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WebSocket connection established: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        ChatMessage chatMessage = objectMapper.readValue(message.getPayload(), ChatMessage.class);
        String userMessage = chatMessage.getMessage();
        String clientSessionId = chatMessage.getSessionId();

        // Log user message to DB
        chatHistoryService.logMessage(clientSessionId, "USER", userMessage);

        StringBuilder aiResponseBuilder = new StringBuilder();

        chatbotService.chat(clientSessionId, userMessage)
                .onPartialResponse(token -> {
                    aiResponseBuilder.append(token);
                    sendResponse(session, clientSessionId, token);
                })
                .onCompleteResponse(response -> {
                    // Log complete AI response to DB
                    chatHistoryService.logMessage(clientSessionId, "ASSISTANT", aiResponseBuilder.toString());
                })
                .onError(error -> {
                    log.error("Ollama Chatbot error (fallback to simulation): ", error);
                    // Fallback to simulated response if AI fails
                    new Thread(() -> {
                        String response = "Bonjour ! Je suis l'assistant virtuel AfricaNet (Mode Simulé). Je peux vous aider à choisir un ordinateur ou estimer la reprise de votre ancien matériel. Que souhaitez-vous savoir ?";
                        String[] words = response.split(" ");
                        for (String word : words) {
                            try { Thread.sleep(50); } catch (InterruptedException e) {}
                            sendResponse(session, clientSessionId, word + " ");
                            aiResponseBuilder.append(word).append(" ");
                        }
                        chatHistoryService.logMessage(clientSessionId, "ASSISTANT", aiResponseBuilder.toString());
                    }).start();
                })
                .start();
    }

    private void sendResponse(WebSocketSession session, String clientSessionId, String token) {
        if (session == null || !session.isOpen()) {
            return;
        }
        try {
            ChatResponse chatResponse = ChatResponse.builder()
                    .sessionId(clientSessionId)
                    .response(token)
                    .build();
            
            String jsonPayload = objectMapper.writeValueAsString(chatResponse);
            synchronized (session) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(jsonPayload));
                }
            }
        } catch (Exception e) {
            log.error("Error sending WebSocket response", e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("WebSocket connection closed: {}", session.getId());
    }
}
