package com.brnsmrt.africanet.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
class ChatWebSocketHandler extends TextWebSocketHandler {

	private final Assistant assistant;
	private final ConcurrentHashMap<String, UUID> sessionMemoryIds = new ConcurrentHashMap<>();

	ChatWebSocketHandler(Assistant assistant) {
		this.assistant = assistant;
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) {
		sessionMemoryIds.put(session.getId(), UUID.randomUUID());
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) {
		UUID memoryId = sessionMemoryIds.get(session.getId());
		String userMessage = message.getPayload();

		assistant.chat(memoryId, userMessage).onPartialResponse(token -> sendToken(session, token))
				.onCompleteResponse(response -> {})
				.onError(error -> sendToken(session, "Error: " + error.getMessage()))
				.start();
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
		sessionMemoryIds.remove(session.getId());
	}

}