package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.DeviceBaseValue;
import com.brnsmrt.africanet.domain.TradeIn;
import com.brnsmrt.africanet.repository.DeviceBaseValueRepository;
import com.brnsmrt.africanet.repository.TradeInRepository;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.ai.dto.EvaluationResult;
import com.brnsmrt.africanet.dto.request.TradeInRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.brnsmrt.africanet.ai.TradeInEvaluationService;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TradeInEvaluationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TradeInRepository tradeInRepository;

    @Mock
    private DeviceBaseValueRepository deviceBaseValueRepository;

    private TradeInEvaluationService service;

    @BeforeEach
    void setUp() {
        service = new TradeInEvaluationService(userRepository, tradeInRepository, deviceBaseValueRepository);
    }

    // --- Overall condition scoring tests ---

    @Test
    void testComputeOverallCondition_allPerfect() {
        // All 5s: weighted avg = 5*0.30 + 5*0.25 + 5*0.20 + 5*0.25 = 5.0, scaled = 10.0
        double score = service.computeOverallCondition(5, 5, 5, 5);
        assertEquals(10.0, score, 0.001);
    }

    @Test
    void testComputeOverallCondition_allWorst() {
        // All 1s: weighted avg = 1.0, scaled = 2.0
        double score = service.computeOverallCondition(1, 1, 1, 1);
        assertEquals(2.0, score, 0.001);
    }

    @Test
    void testComputeOverallCondition_mixed() {
        // Screen=4, Battery=3, Body=5, Functionality=2
        // weighted avg = 4*0.30 + 3*0.25 + 5*0.20 + 2*0.25 = 1.2 + 0.75 + 1.0 + 0.5 = 3.45
        // scaled = 3.45 * 2 = 6.9
        double score = service.computeOverallCondition(4, 3, 5, 2);
        assertEquals(6.9, score, 0.001);
    }

    // --- Average component score tests ---

    @Test
    void testComputeAvgComponentScore_allPerfect() {
        // (5+5+5+5)/4 = 5.0, scaled = 10.0
        double score = service.computeAvgComponentScore(5, 5, 5, 5);
        assertEquals(10.0, score, 0.001);
    }

    @Test
    void testComputeAvgComponentScore_mixed() {
        // (4+3+5+2)/4 = 3.5, scaled = 7.0
        double score = service.computeAvgComponentScore(4, 3, 5, 2);
        assertEquals(7.0, score, 0.001);
    }

    // --- Age factor tests ---

    @Test
    void testComputeAgeFactor_recentDevice() {
        // ≤2 years → 1.0
        assertEquals(1.0, service.computeAgeFactor(0));
        assertEquals(1.0, service.computeAgeFactor(1));
        assertEquals(1.0, service.computeAgeFactor(2));
    }

    @Test
    void testComputeAgeFactor_moderateAge() {
        // ≤4 years → 0.7
        assertEquals(0.7, service.computeAgeFactor(3));
        assertEquals(0.7, service.computeAgeFactor(4));
    }

    @Test
    void testComputeAgeFactor_oldDevice() {
        // >4 years → 0.4
        assertEquals(0.4, service.computeAgeFactor(5));
        assertEquals(0.4, service.computeAgeFactor(10));
    }

    @Test
    void testComputeAge_nullYear_defaultsTo3() {
        assertEquals(3, service.computeAge(null));
    }

    @Test
    void testComputeAge_validYear() {
        int currentYear = java.time.LocalDate.now().getYear();
        assertEquals(2, service.computeAge(currentYear - 2));
        assertEquals(0, service.computeAge(currentYear));
    }

    @Test
    void testComputeAge_futureYear_clampsToZero() {
        int futureYear = java.time.LocalDate.now().getYear() + 1;
        assertEquals(0, service.computeAge(futureYear));
    }

    // --- Base value lookup tests ---

    @Test
    void testComputeBaseValue_knownDevice() {
        DeviceBaseValue macbook = new DeviceBaseValue(1L, "Apple", "MacBook Pro", 3200.0);
        when(deviceBaseValueRepository.findByBrandAndModel("Apple", "MacBook Pro"))
                .thenReturn(Optional.of(macbook));

        double value = service.computeBaseValue("Apple", "MacBook Pro");
        assertEquals(3200.0, value);
    }

    @Test
    void testComputeBaseValue_unknownDevice() {
        when(deviceBaseValueRepository.findByBrandAndModel(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(deviceBaseValueRepository.findByBrandAndModelStartingWith(anyString(), anyString()))
                .thenReturn(Optional.empty());

        double value = service.computeBaseValue("UnknownBrand", "UnknownModel");
        assertEquals(1500.0, value);
    }

    @Test
    void testComputeBaseValue_nullBrandOrModel() {
        assertEquals(1500.0, service.computeBaseValue(null, "XPS"));
        assertEquals(1500.0, service.computeBaseValue("Dell", null));
    }

    // --- Full scoring formula test ---

    @Test
    void testScoringFormula_manualCalculation() {
        // Given: basePrice=3200, age=2 (ageFactor=1.0), all conditions=5 (10/10)
        // score = 3200*0.40 + 1.0*3200*0.20 + (10/10)*3200*0.30 + (10/10)*3200*0.10
        //       = 1280 + 640 + 960 + 320 = 3200
        // tradeInValue = 3200 * 0.75 = 2400.0

        User user = new User();
        user.setId(1L);
        user.setFirstName("Test");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(tradeInRepository.save(any(TradeIn.class))).thenAnswer(invocation -> {
            TradeIn saved = invocation.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        DeviceBaseValue macbook = new DeviceBaseValue(1L, "Apple", "MacBook Pro", 3200.0);
        when(deviceBaseValueRepository.findByBrandAndModel("Apple", "MacBook Pro"))
                .thenReturn(Optional.of(macbook));

        int currentYear = java.time.LocalDate.now().getYear();

        TradeInRequest request = TradeInRequest.builder()
                .deviceModel("MacBook Pro")
                .brand("Apple")
                .yearOfPurchase(currentYear - 2) // 2 years old → ageFactor = 1.0
                .screenCondition(5)
                .batteryCondition(5)
                .bodyCondition(5)
                .functionalityCondition(5)
                .userId(1L)
                .build();

        EvaluationResult response = service.evaluate(request);

        assertNotNull(response);
        assertEquals(100L, response.getTradeInId());
        assertEquals(2400.0, response.getEstimatedValue(), 0.01);
        assertEquals("EVALUATED", response.getStatus());
    }

    @Test
    void testScoringFormula_oldDevicePoorCondition() {
        // Given: basePrice=1800, age=5 (ageFactor=0.4), screen=2, battery=2, body=3, func=1
        // conditionOverall = (2*0.30 + 2*0.25 + 3*0.20 + 1*0.25) * 2 = (0.6+0.5+0.6+0.25)*2 = 1.95*2 = 3.9
        // avgComponent = (2+2+3+1)/4 * 2 = 2.0 * 2 = 4.0
        // score = 1800*0.40 + 0.4*1800*0.20 + (3.9/10)*1800*0.30 + (4.0/10)*1800*0.10
        //       = 720 + 144 + 210.6 + 72 = 1146.6
        // tradeInValue = 1146.6 * 0.75 = 859.95

        User user = new User();
        user.setId(1L);
        user.setFirstName("Test");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(tradeInRepository.save(any(TradeIn.class))).thenAnswer(invocation -> {
            TradeIn saved = invocation.getArgument(0);
            saved.setId(200L);
            return saved;
        });

        DeviceBaseValue dell = new DeviceBaseValue(2L, "Dell", "Inspiron", 1800.0);
        when(deviceBaseValueRepository.findByBrandAndModel("Dell", "Inspiron"))
                .thenReturn(Optional.of(dell));

        int currentYear = java.time.LocalDate.now().getYear();

        TradeInRequest request = TradeInRequest.builder()
                .deviceModel("Inspiron")
                .brand("Dell")
                .yearOfPurchase(currentYear - 5) // 5 years old → ageFactor = 0.4
                .screenCondition(2)
                .batteryCondition(2)
                .bodyCondition(3)
                .functionalityCondition(1)
                .userId(1L)
                .build();

        EvaluationResult response = service.evaluate(request);

        assertNotNull(response);
        assertEquals(200L, response.getTradeInId());
        assertEquals(859.95, response.getEstimatedValue(), 0.01);
        assertEquals("EVALUATED", response.getStatus());
    }

    @Test
    void testEvaluate_userNotFound_throws() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        TradeInRequest request = TradeInRequest.builder()
                .deviceModel("XPS")
                .brand("Dell")
                .userId(999L)
                .screenCondition(3)
                .batteryCondition(3)
                .bodyCondition(3)
                .functionalityCondition(3)
                .build();

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.evaluate(request));
        assertTrue(ex.getMessage().contains("999"));
    }
}
