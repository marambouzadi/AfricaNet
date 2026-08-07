package com.brnsmrt.africanet.config;

import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.domain.enums.UserRole;
import com.brnsmrt.africanet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        String adminEmail = "admin@africanet.tn";
        String defaultPassword = "Admin@AfricaNet2026";
        Optional<User> adminOpt = userRepository.findByEmail(adminEmail);

        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            admin.setRole(UserRole.ADMIN);
            admin.setIsActive(true);
            // Always reset password to default on startup to prevent lockout
            admin.setPasswordHash(passwordEncoder.encode(defaultPassword));
            userRepository.save(admin);
            log.info("Admin account verified and password reset to default.");
        } else {
            User newAdmin = User.builder()
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(defaultPassword))
                    .firstName("Admin")
                    .lastName("System")
                    .role(UserRole.ADMIN)
                    .isActive(true)
                    .emailVerified(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userRepository.save(newAdmin);
            log.info("Admin account has been created successfully.");
        }
        log.info("Admin credentials: email={}, password={}", adminEmail, defaultPassword);
    }
}
