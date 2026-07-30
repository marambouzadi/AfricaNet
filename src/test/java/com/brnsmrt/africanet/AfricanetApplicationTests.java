package com.brnsmrt.africanet;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class AfricanetApplicationTests {

    @MockBean
    private dev.langchain4j.model.chat.StreamingChatModel streamingChatModel;

    @MockBean
    private com.brnsmrt.africanet.ai.Assistant assistant;

    @MockBean
    private com.brnsmrt.africanet.ai.ChatbotService chatbotService;

    @MockBean
    private io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry circuitBreakerRegistry;

    @MockBean
    private com.brnsmrt.africanet.service.ChatHistoryService chatHistoryService;

    @MockBean
    private com.brnsmrt.africanet.repository.UserRepository userRepository;

    @MockBean
    private com.brnsmrt.africanet.repository.TradeInRepository tradeInRepository;

    @MockBean
    private com.brnsmrt.africanet.repository.OrderRepository orderRepository;

    @MockBean
    private com.brnsmrt.africanet.repository.OrderItemRepository orderItemRepository;

    @MockBean
    private com.brnsmrt.africanet.repository.ProductRepository productRepository;

    @MockBean
    private com.brnsmrt.africanet.repository.BrandRepository brandRepository;

    @MockBean
    private com.brnsmrt.africanet.repository.CategoryRepository categoryRepository;

    @MockBean
    private com.brnsmrt.africanet.repository.DeviceBaseValueRepository deviceBaseValueRepository;

    @MockBean
    private com.brnsmrt.africanet.repository.AiRecommendationRepository aiRecommendationRepository;

    @MockBean
    private com.brnsmrt.africanet.repository.ChatMessageEntityRepository chatMessageEntityRepository;

    @MockBean
    private com.brnsmrt.africanet.repository.ChatSessionRepository chatSessionRepository;

    @MockBean
    private com.brnsmrt.africanet.repository.ProductViewRepository productViewRepository;

    @MockBean
    private org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    @Test
    void contextLoads() {
    }
}
