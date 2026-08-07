package com.brnsmrt.africanet.dto.request;

import com.brnsmrt.africanet.domain.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateOrderRequest {

    @NotEmpty(message = "La commande doit contenir au moins un article")
    @Valid
    private List<OrderItemRequest> items;

    @NotNull(message = "L'adresse de livraison est obligatoire")
    @Valid
    private AddressDto shippingAddress;

    @Valid
    private AddressDto billingAddress;

    @NotNull(message = "Le moyen de paiement est obligatoire")
    private PaymentMethod paymentMethod;

    @Size(max = 50, message = "Le code coupon ne doit pas dépasser 50 caractères")
    private String couponCode;

    @Size(max = 1000, message = "Les notes ne doivent pas dépasser 1000 caractères")
    private String customerNotes;
}