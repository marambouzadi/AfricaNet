package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.domain.enums.UserRole;
import com.brnsmrt.africanet.dto.request.LoginRequest;
import com.brnsmrt.africanet.dto.request.RegisterRequest;
import com.brnsmrt.africanet.dto.response.AuthResponse;
import com.brnsmrt.africanet.exception.DuplicateEmailException;
import com.brnsmrt.africanet.exception.InvalidCredentialsException;
import com.brnsmrt.africanet.repository.RefreshTokenRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .passwordHash("hashed_password")
                .firstName("Ahmed")
                .lastName("Ben Ali")
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("register - inscription réussie d'un nouvel utilisateur")
    void register_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("newuser@example.com");
        req.setPassword("Password123!");
        req.setFirstName("Ahmed");
        req.setLastName("Ben Ali");

        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("mocked.jwt.token");

        AuthResponse res = authService.register(req);

        assertThat(res).isNotNull();
        assertThat(res.getAccessToken()).isEqualTo("mocked.jwt.token");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register - lève DuplicateEmailException si l'email existe déjà")
    void register_DuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@example.com");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(DuplicateEmailException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("login - connexion réussie avec des identifiants valides")
    void login_Success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("Password123!");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123!", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(user)).thenReturn("mocked.jwt.token");

        AuthResponse res = authService.login(req);

        assertThat(res).isNotNull();
        assertThat(res.getAccessToken()).isEqualTo("mocked.jwt.token");
    }

    @Test
    @DisplayName("login - lève InvalidCredentialsException si le mot de passe est incorrect")
    void login_InvalidPassword() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("WrongPassword");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashed_password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
