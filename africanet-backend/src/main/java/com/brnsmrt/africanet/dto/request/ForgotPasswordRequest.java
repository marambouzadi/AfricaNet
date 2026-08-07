package com.brnsmrt.africanet.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "L'email est requis")
    @Email(message = "Format d'email invalide")
    private String email;
}
