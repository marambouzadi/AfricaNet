package com.brnsmrt.africanet.dto.request;

import com.brnsmrt.africanet.domain.enums.TradeInStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TradeInReviewRequest {

    @NotNull(message = "Le statut de la reprise est obligatoire")
    private TradeInStatus status; // APPROVED, REJECTED, COMPLETED, EVALUATING

    @Positive(message = "La valeur finale doit être positive")
    private BigDecimal finalValue;

    @Size(max = 1000, message = "Les notes de révision ne doivent pas dépasser 1000 caractères")
    private String reviewNotes;
}