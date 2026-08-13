package com.brnsmrt.africanet;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class AfricanetApplicationTests {

    @MockitoBean
    private dev.langchain4j.model.chat.StreamingChatModel streamingChatModel;

    @MockitoBean
    private com.brnsmrt.africanet.ai.ResilientAiWrapper resilientAiWrapper;

    @MockitoBean
    private com.brnsmrt.africanet.ai.ChatbotService chatbotService;

    @MockitoBean
    private io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry circuitBreakerRegistry;

    @MockitoBean
    private com.brnsmrt.africanet.service.ChatHistoryService chatHistoryService;

    @MockitoBean
    private com.brnsmrt.africanet.repository.UserRepository userRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.TradeInRequestRepository tradeInRequestRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.OrderRepository orderRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.OrderItemRepository orderItemRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.ProductRepository productRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.BrandRepository brandRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.CategoryRepository categoryRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.DeviceBaseValueRepository deviceBaseValueRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.AiRecommendationRepository aiRecommendationRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.ChatMessageEntityRepository chatMessageEntityRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.ChatSessionRepository chatSessionRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.ProductViewRepository productViewRepository;

    @MockitoBean
    private org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    @MockitoBean
    private org.springframework.data.redis.connection.RedisConnectionFactory redisConnectionFactory;

    @MockitoBean
    private com.brnsmrt.africanet.repository.InventoryRepository inventoryRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.ContactMessageRepository contactMessageRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.FavoriteRepository favoriteRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.InventoryMovementRepository inventoryMovementRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.PaymentRepository paymentRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.ProductImageRepository productImageRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.ProductSpecificationRepository productSpecificationRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.ShipmentRepository shipmentRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.TagRepository tagRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.UserAddressRepository userAddressRepository;

    @MockitoBean
    private com.brnsmrt.africanet.repository.VerificationTokenRepository verificationTokenRepository;

    @Test
    void contextLoads() {
    }
}
