package com.brnsmrt.africanet.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Size(max = 150, message = "L'email ne doit pas dépasser 150 caractères")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, max = 100, message = "Le mot de passe doit contenir entre 8 et 100 caractères")
    private String password;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 60, message = "Le prénom doit contenir entre 2 et 60 caractères")
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 60, message = "Le nom doit contenir entre 2 et 60 caractères")
    private String lastName;

    @Pattern(
        regexp = "^[+0-9\\s\\-()]{7,20}$",
        message = "Format de téléphone invalide (ex: +216 20 123 456)"
    )
    private String phone;
}