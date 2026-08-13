package com.brnsmrt.africanet.config;

import com.brnsmrt.africanet.ai.ChatWebSocketHandler;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

        private final ChatWebSocketHandler chatWebSocketHandler;

        @Value("${app.cors.allowed-origins:http://localhost:3000}")
        private String[] allowedOrigins;

        WebSocketConfig(ChatWebSocketHandler chatWebSocketHandler) {
            this.chatWebSocketHandler = chatWebSocketHandler;
        }

        @Override
        public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
            registry.addHandler(chatWebSocketHandler, "/ws/chat")
                    .setAllowedOrigins(allowedOrigins);
        }
    }
