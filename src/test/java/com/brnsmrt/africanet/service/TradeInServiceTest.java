package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.TradeInRequest;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.domain.enums.DeviceType;
import com.brnsmrt.africanet.domain.enums.TradeInStatus;
import com.brnsmrt.africanet.dto.response.TradeInResponse;
import com.brnsmrt.africanet.exception.ResourceNotFoundException;
import com.brnsmrt.africanet.repository.TradeInRequestRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TradeInServiceTest {

    @Mock
    private TradeInRequestRepository tradeInRequestRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private TradeInService tradeInService;

    private User user;
    private TradeInRequest tradeIn;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");

        tradeIn = new TradeInRequest();
        tradeIn.setId(50L);
        tradeIn.setUser(user);
        tradeIn.setDeviceType(DeviceType.LAPTOP);
        tradeIn.setModel("Apple MacBook Pro 13");
        tradeIn.setStatus(TradeInStatus.SUBMITTED);
    }

    @Test
    @DisplayName("getAllForAdmin - liste toutes les demandes pour l'administration")
    void getAllForAdmin_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        when(tradeInRequestRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(Collections.singletonList(tradeIn)));

        Page<TradeInResponse> res = tradeInService.getAllForAdmin(pageable);

        assertThat(res).isNotNull();
        assertThat(res.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("getMyTradeInById - introuvable si la demande n'existe pas")
    void getMyTradeInById_NotFound() {
        when(authentication.getName()).thenReturn("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(tradeInRequestRepository.findByIdAndUser_Id(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tradeInService.getMyTradeInById(999L, authentication))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
