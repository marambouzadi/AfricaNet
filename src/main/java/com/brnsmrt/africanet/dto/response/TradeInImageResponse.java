package com.brnsmrt.africanet.dto.response;

import com.brnsmrt.africanet.domain.enums.TradeInImageType;
import lombok.Data;

@Data
public class TradeInImageResponse {
    private Long id;
    private String url;
    private TradeInImageType imageType;
}