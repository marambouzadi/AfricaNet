package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.RefreshToken;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.domain.enums.UserRole;
import com.brnsmrt.africanet.dto.request.LoginRequest;
import com.brnsmrt.africanet.dto.request.RegisterRequest;
import com.brnsmrt.africanet.dto.request.UpdateProfileRequest;
import com.brnsmrt.africanet.dto.response.AuthResponse;
import com.brnsmrt.africanet.dto.response.UserResponse;
import com.brnsmrt.africanet.repository.RefreshTokenRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.security.JwtTokenProvider;
import com.brnsmrt.africanet.exception.AccountDisabledException;
import com.brnsmrt.africanet.exception.DuplicateEmailException;
import com.brnsmrt.africanet.exception.InvalidCredentialsException;
import com.brnsmrt.africanet.exception.InvalidRefreshTokenException;
import com.brnsmrt.africanet.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    // ── REGISTER ──────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .emailVerified(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser);
    }

    // ── LOGIN ─────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        if (!user.isEnabled()) {
            throw new AccountDisabledException();
        }

        return buildAuthResponse(user);
    }

    // ── HELPERS ───────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String rawRefreshToken = generateSecureRandomToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(sha256Hash(rawRefreshToken))
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000))
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .user(userResponse)
                .build();
    }

    private String generateSecureRandomToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] tokenBytes = new byte[64];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private String sha256Hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 non disponible", e);
        }
    }

    // ── REFRESH ───────────────────────────────────────────────

    public AuthResponse refreshToken(String rawRefreshToken) {
        String hashedToken = sha256Hash(rawRefreshToken);

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(InvalidRefreshTokenException::new);

        if (!storedToken.isValid()) {
            throw new InvalidRefreshTokenException("Refresh token expiré ou révoqué");
        }

        User user = storedToken.getUser();

        // Rotation : on révoque l'ancien token et on en génère un nouveau
        storedToken.setIsRevoked(true);
        refreshTokenRepository.save(storedToken);

        return buildAuthResponse(user);
    }

    // ── PROFIL ────────────────────────────────────────────────

    public UserResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .build();
    }

    public UserResponse updateUserProfile(String currentEmail, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());

        // Mise à jour de l'email si fourni et différent
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equalsIgnoreCase(currentEmail)) {
            boolean emailTaken = userRepository.findByEmail(request.getEmail()).isPresent();
            if (emailTaken) {
                throw new DuplicateEmailException();
            }
            user.setEmail(request.getEmail());
        }

        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        return UserResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .phone(savedUser.getPhone())
                .avatarUrl(savedUser.getAvatarUrl())
                .role(savedUser.getRole())
                .build();
    }

    // ── LOGOUT ────────────────────────────────────────────────

    public void logout(String rawRefreshToken) {
        String hashedToken = sha256Hash(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hashedToken)
                .ifPresent(token -> {
                    token.setIsRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }
}