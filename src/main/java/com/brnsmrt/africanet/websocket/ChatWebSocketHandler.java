package com.brnsmrt.africanet.websocket;

import com.brnsmrt.africanet.ai.ResilientAiWrapper;
import com.brnsmrt.africanet.service.ChatHistoryService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

	private final ResilientAiWrapper resilientAiWrapper;
	private final StringRedisTemplate redisTemplate;
	private final ObjectMapper objectMapper;
	private final ChatHistoryService chatHistoryService;
	private static final String REDIS_KEY_PREFIX = "chat:context:";
	private static final long SESSION_TTL_MINUTES = 30;

	ChatWebSocketHandler(ResilientAiWrapper resilientAiWrapper, StringRedisTemplate redisTemplate, ObjectMapper objectMapper, ChatHistoryService chatHistoryService) {
		this.resilientAiWrapper = resilientAiWrapper;
		this.redisTemplate = redisTemplate;
		this.objectMapper = objectMapper;
		this.chatHistoryService = chatHistoryService;
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) {
		// Handled dynamically on first message to support client-provided session IDs
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) {
		String payload = message.getPayload();
		String sessionId = session.getId();
		String userMessage = payload;
		
		try {
			JsonNode node = objectMapper.readTree(payload);
			if (node.has("sessionId")) {
				sessionId = node.get("sessionId").asText();
			}
			if (node.has("message")) {
				userMessage = node.get("message").asText();
			}
		} catch (Exception e) {
			// Fallback to raw payload if not JSON
		}

		// Rate limiting: 10 msgs per minute
		String rlKey = "ratelimit:" + sessionId;
		Long count = redisTemplate.opsForValue().increment(rlKey);
		if (count != null && count == 1) {
			redisTemplate.expire(rlKey, 60, TimeUnit.SECONDS);
		}
		if (count != null && count > 10) {
			sendToken(session, sessionId, " Error: Rate limit exceeded. Please wait a minute.");
			return;
		}

		String redisKey = REDIS_KEY_PREFIX + sessionId;
		String memoryIdStr = redisTemplate.opsForValue().get(redisKey);
		
		if (memoryIdStr == null) {
		    memoryIdStr = UUID.randomUUID().toString();
		    redisTemplate.opsForValue().set(redisKey, memoryIdStr, SESSION_TTL_MINUTES, TimeUnit.MINUTES);
		} else {
		    redisTemplate.expire(redisKey, SESSION_TTL_MINUTES, TimeUnit.MINUTES);
		}
		
		chatHistoryService.logMessage(sessionId, "USER", userMessage);
		
		final String finalSessionId = sessionId;
		StringBuilder aiResponseBuilder = new StringBuilder();

		resilientAiWrapper.processChat(memoryIdStr, userMessage, 
		        token -> {
					aiResponseBuilder.append(token);
					sendToken(session, finalSessionId, token);
				},
		        () -> chatHistoryService.logMessage(finalSessionId, "ASSISTANT", aiResponseBuilder.toString()), 
		        error -> {
		            error.printStackTrace();
					sendToken(session, finalSessionId, " Error: Connection to AI failed.");
		        }
		);
	}

	private void sendToken(WebSocketSession session, String sessionId, String token) {
		try {
			Map<String, String> response = new HashMap<>();
			response.put("sessionId", sessionId);
			response.put("response", token);
			String json = objectMapper.writeValueAsString(response);
			if (session.isOpen()) {
				session.sendMessage(new TextMessage(json));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		// TTL handles cleanup
	}
}