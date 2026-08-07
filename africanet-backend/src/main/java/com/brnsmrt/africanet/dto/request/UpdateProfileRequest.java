package com.brnsmrt.africanet.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 60, message = "Le prénom doit faire entre 2 et 60 caractères")
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 60, message = "Le nom doit faire entre 2 et 60 caractères")
    private String lastName;

    @Email(message = "Format d'email invalide")
    @Size(max = 150, message = "L'email ne doit pas dépasser 150 caractères")
    private String email;

    @Size(max = 20, message = "Le téléphone ne doit pas dépasser 20 caractères")
    private String phone;

    @Size(max = 255, message = "L'avatar ne doit pas dépasser 255 caractères")
    private String avatarUrl;

    @Size(min = 8, message = "Le mot de passe doit faire au moins 8 caractères")
    private String newPassword;

    private String currentPassword;
}
