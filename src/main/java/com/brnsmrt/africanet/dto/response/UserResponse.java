package com.brnsmrt.africanet.dto.response;

import com.brnsmrt.africanet.domain.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String avatarUrl;
    private UserRole role;
    private boolean isActive;
    private LocalDateTime createdAt;
}