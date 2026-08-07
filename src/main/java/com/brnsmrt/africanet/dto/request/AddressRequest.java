package com.brnsmrt.africanet.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddressRequest {

    @Size(max = 50, message = "Le label ne doit pas dépasser 50 caractères")
    private String label;

    @NotBlank(message = "Le nom du destinataire est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom du destinataire doit contenir entre 2 et 100 caractères")
    private String fullname;

    @NotBlank(message = "L'adresse est obligatoire")
    @Size(max = 255, message = "L'adresse ne doit pas dépasser 255 caractères")
    private String street;

    @NotBlank(message = "La ville est obligatoire")
    @Size(max = 100, message = "La ville ne doit pas dépasser 100 caractères")
    private String city;

    @Size(max = 100, message = "Le gouvernorat ne doit pas dépasser 100 caractères")
    private String state;

    @Size(max = 10, message = "Le code postal ne doit pas dépasser 10 caractères")
    private String postalCode;

    @NotBlank(message = "Le pays est obligatoire")
    @Size(max = 100, message = "Le pays ne doit pas dépasser 100 caractères")
    private String country;

    @Pattern(
        regexp = "^[+0-9\\s\\-()]{7,20}$",
        message = "Format de téléphone invalide (ex: +216 20 123 456)"
    )
    private String phone;

    private boolean isDefault;
}
