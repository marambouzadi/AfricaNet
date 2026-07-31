package com.brnsmrt.africanet.config;

import com.brnsmrt.africanet.ai.ChatbotService;
import com.brnsmrt.africanet.ai.AssistantTools;

import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.service.AiServices;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("ai")
public class AssistantConfiguration {

    @Bean
    ChatMemoryProvider chatMemoryProvider(com.brnsmrt.africanet.ai.RedisChatMemoryStore redisChatMemoryStore) {
        return memoryId -> MessageWindowChatMemory.builder()
                .id(memoryId)
                .maxMessages(10)
                .chatMemoryStore(redisChatMemoryStore)
                .build();
    }

    @Bean
    ChatbotService ChatbotService(StreamingChatModel streamingChatModel,
                                  ChatMemoryProvider chatMemoryProvider,
                                  AssistantTools assistantTools) {
        return AiServices.builder(ChatbotService.class)
                .streamingChatModel(streamingChatModel)
                .chatMemoryProvider(chatMemoryProvider)
                .tools(assistantTools)
                .build();
    }

}