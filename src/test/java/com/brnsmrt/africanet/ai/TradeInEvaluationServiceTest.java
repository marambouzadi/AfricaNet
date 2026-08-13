package com.brnsmrt.africanet.ai;

import com.brnsmrt.africanet.domain.Brand;
import com.brnsmrt.africanet.domain.DeviceBaseValue;
import com.brnsmrt.africanet.dto.request.TradeInEvaluationRequest;
import com.brnsmrt.africanet.repository.BrandRepository;
import com.brnsmrt.africanet.repository.DeviceBaseValueRepository;
import com.brnsmrt.africanet.repository.TradeInRequestRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.ai.dto.EvaluationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TradeInEvaluationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TradeInRequestRepository tradeInRepository;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private DeviceBaseValueRepository deviceBaseValueRepository;

    @InjectMocks
    private TradeInEvaluationService service;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
    }

    @Test
    void testScoringExactness() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        
        Brand apple = new Brand();
        apple.setName("Apple");
        when(brandRepository.findByNameIgnoreCase("Apple")).thenReturn(Optional.of(apple));

        DeviceBaseValue dbv = new DeviceBaseValue();
        dbv.setBaseValue(1000.0);
        when(deviceBaseValueRepository.findByBrandAndModel("Apple", "MacBook Pro")).thenReturn(Optional.of(dbv));
        
        when(tradeInRepository.save(any())).thenAnswer(invocation -> {
            com.brnsmrt.africanet.domain.TradeInRequest req = invocation.getArgument(0);
            req.setId(99L);
            return req;
        });

        TradeInEvaluationRequest request = new TradeInEvaluationRequest();
        request.setUserId(1L);
        request.setBrand("Apple");
        request.setDeviceModel("MacBook Pro");
        request.setYearOfPurchase(java.time.Year.of(LocalDate.now().getYear() - 2)); 
        request.setScreenScore(10);
        request.setKeyboardScore(10);
        request.setBatteryScore(10);
        request.setChassisScore(10);
        request.setPerformanceScore(10);
        
        EvaluationResult result = service.evaluate(request);
        
        // Base = 1000
        // Market (40%) = 400
        // Age (20% * 1.0) = 200
        // Condition (30% * 10/10) = 300
        // Component (10% * 10/10) = 100
        // Total = 1000 * 0.75 margin = 750.0
        assertEquals(750.0, result.getEstimatedValue(), 0.01);
    }

    @Test
    void testEdgeCase_NullYear_NullScores() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        
        Brand samsung = new Brand();
        samsung.setName("Samsung");
        when(brandRepository.findByNameIgnoreCase("Samsung")).thenReturn(Optional.of(samsung));

        DeviceBaseValue dbv = new DeviceBaseValue();
        dbv.setBaseValue(800.0);
        when(deviceBaseValueRepository.findByBrandAndModel("Samsung", "Galaxy")).thenReturn(Optional.of(dbv));
        
        when(tradeInRepository.save(any())).thenAnswer(invocation -> {
            com.brnsmrt.africanet.domain.TradeInRequest req = invocation.getArgument(0);
            req.setId(100L);
            return req;
        });

        TradeInEvaluationRequest request = new TradeInEvaluationRequest();
        request.setUserId(1L);
        request.setBrand("Samsung");
        request.setDeviceModel("Galaxy");
        request.setYearOfPurchase(null);
        request.setScreenScore(null);
        
        EvaluationResult result = service.evaluate(request);
        
        // Base = 800
        // Age = 3 -> ageFactor 0.7 
        // Scores default to 5 
        assertEquals(444.0, result.getEstimatedValue(), 0.01);
    }

    @Test
    void testEdgeCase_UnknownBrandAndFutureYear() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(brandRepository.findByNameIgnoreCase("UnknownBrand")).thenReturn(Optional.empty());
        when(brandRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(deviceBaseValueRepository.findByBrandAndModel(any(), any())).thenReturn(Optional.empty());
        when(deviceBaseValueRepository.findByBrandAndModelStartingWith(any(), any())).thenReturn(Optional.empty());

        when(tradeInRepository.save(any())).thenAnswer(invocation -> {
            com.brnsmrt.africanet.domain.TradeInRequest req = invocation.getArgument(0);
            req.setId(101L);
            return req;
        });

        TradeInEvaluationRequest request = new TradeInEvaluationRequest();
        request.setUserId(1L);
        request.setBrand("UnknownBrand");
        request.setDeviceModel("FutureTech");
        request.setDeviceType("LAPTOP");
        request.setYearOfPurchase(java.time.Year.of(LocalDate.now().getYear() + 5)); 
        request.setScreenScore(10);
        request.setKeyboardScore(10);
        request.setBatteryScore(10);
        request.setChassisScore(10);
        request.setPerformanceScore(10);
        
        EvaluationResult result = service.evaluate(request);
        
        // LAPTOP fallback = 1500
        assertEquals(1125.0, result.getEstimatedValue(), 0.01);
    }
}
