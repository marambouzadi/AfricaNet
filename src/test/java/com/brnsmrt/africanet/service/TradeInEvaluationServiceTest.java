package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.ai.TradeInEvaluationService;
import com.brnsmrt.africanet.ai.dto.EvaluationResult;
import com.brnsmrt.africanet.domain.Brand;
import com.brnsmrt.africanet.domain.DeviceBaseValue;
import com.brnsmrt.africanet.domain.TradeIn;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.dto.request.TradeInRequest;
import com.brnsmrt.africanet.repository.BrandRepository;
import com.brnsmrt.africanet.repository.DeviceBaseValueRepository;
import com.brnsmrt.africanet.repository.TradeInRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TradeInEvaluationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TradeInRepository tradeInRepository;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private DeviceBaseValueRepository deviceBaseValueRepository;

    private TradeInEvaluationService service;

    @BeforeEach
    void setUp() {
        service = new TradeInEvaluationService(userRepository, tradeInRepository, brandRepository, deviceBaseValueRepository);
    }

    @Test
    void testComputeOverallCondition_allPerfect() {
        double score = service.computeOverallCondition(10, 10, 10, 10, 10);
        assertEquals(10.0, score, 0.001);
    }

    @Test
    void testComputeOverallCondition_allWorst() {
        double score = service.computeOverallCondition(1, 1, 1, 1, 1);
        assertEquals(1.0, score, 0.001);
    }

    @Test
    void testComputeAvgComponentScore_allPerfect() {
        double score = service.computeAvgComponentScore(10, 10, 10, 10, 10);
        assertEquals(10.0, score, 0.001);
    }

    @Test
    void testEvaluate_success() {
        User user = new User();
        user.setId(1L);

        Brand brand = new Brand();
        brand.setId(1L);
        brand.setName("Apple");

        TradeInRequest request = TradeInRequest.builder()
                .deviceModel("MacBook Pro")
                .brand("Apple")
                .yearOfPurchase(2023)
                .screenScore(9)
                .keyboardScore(9)
                .batteryScore(8)
                .chassisScore(8)
                .performanceScore(9)
                .userId(1L)
                .build();

        DeviceBaseValue baseValue = new DeviceBaseValue();
        baseValue.setBrand("Apple");
        baseValue.setModel("MacBook Pro");
        baseValue.setBaseValue(3000.0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(brandRepository.findByNameIgnoreCase("Apple")).thenReturn(Optional.of(brand));
        when(deviceBaseValueRepository.findByBrandAndModel("Apple", "MacBook Pro")).thenReturn(Optional.of(baseValue));
        when(tradeInRepository.save(any())).thenAnswer(invocation -> {
            TradeIn t = invocation.getArgument(0);
            t.setId(100L);
            return t;
        });

        EvaluationResult result = service.evaluate(request);

        assertNotNull(result);
        assertEquals("MacBook Pro", result.getDeviceModel());
        assertTrue(result.getEstimatedValue() > 0);
        verify(tradeInRepository).save(any());
    }
}
