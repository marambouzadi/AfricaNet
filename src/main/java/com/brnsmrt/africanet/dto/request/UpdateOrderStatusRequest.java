package com.brnsmrt.africanet.dto.request;

import com.brnsmrt.africanet.domain.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UpdateOrderStatusRequest {

    @NotNull(message = "Le statut est obligatoire")
    private OrderStatus status;

    @Size(max = 500, message = "Les notes ne doivent pas dépasser 500 caractères")
    private String notes;
}