package com.brnsmrt.africanet.websocket;

import com.brnsmrt.africanet.ai.ResilientAiWrapper;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

	private final ResilientAiWrapper resilientAiWrapper;
	private final StringRedisTemplate redisTemplate;
	private static final String REDIS_KEY_PREFIX = "chat:context:";
	private static final long SESSION_TTL_MINUTES = 30;

	ChatWebSocketHandler(ResilientAiWrapper resilientAiWrapper, StringRedisTemplate redisTemplate) {
		this.resilientAiWrapper = resilientAiWrapper;
		this.redisTemplate = redisTemplate;
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) {
		String redisKey = REDIS_KEY_PREFIX + session.getId();
		UUID memoryId = UUID.randomUUID();
		redisTemplate.opsForValue().set(redisKey, memoryId.toString(), SESSION_TTL_MINUTES, TimeUnit.MINUTES);
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) {
		String redisKey = REDIS_KEY_PREFIX + session.getId();
		String memoryIdStr = redisTemplate.opsForValue().get(redisKey);
		
		if (memoryIdStr == null) {
		    // Session expired or not found, recreate it
		    memoryIdStr = UUID.randomUUID().toString();
		    redisTemplate.opsForValue().set(redisKey, memoryIdStr, SESSION_TTL_MINUTES, TimeUnit.MINUTES);
		} else {
		    // Refresh TTL on activity
		    redisTemplate.expire(redisKey, SESSION_TTL_MINUTES, TimeUnit.MINUTES);
		}
		
		String userMessage = message.getPayload();

		resilientAiWrapper.processChat(memoryIdStr, userMessage, 
		        token -> sendToken(session, token),
		        () -> {}, // onComplete
		        error -> error.printStackTrace() // onError
		);
	}

	private void sendToken(WebSocketSession session, String token) {
		try {
			session.sendMessage(new TextMessage(token));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		// We let the TTL handle cleanup so the user can reconnect within 30 minutes without losing context
	}
}