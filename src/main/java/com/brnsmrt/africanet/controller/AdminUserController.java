package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.dto.response.UserResponse;
import com.brnsmrt.africanet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        Page<UserResponse> users = userRepository.findAll(pageable).map(this::toResponse);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> toggleActive(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
