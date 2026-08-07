package com.brnsmrt.africanet.dto.request;

import com.brnsmrt.africanet.domain.enums.TradeInImageType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TradeInImageRequest {
    @NotBlank
    private String url;
    private TradeInImageType imageType;
}