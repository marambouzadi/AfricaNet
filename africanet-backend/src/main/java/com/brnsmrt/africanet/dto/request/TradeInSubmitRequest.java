package com.brnsmrt.africanet.dto.request;

import com.brnsmrt.africanet.domain.enums.ConditionOverall;
import com.brnsmrt.africanet.domain.enums.DeviceType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
public class TradeInSubmitRequest {

    @NotNull(message = "Le type d'appareil est obligatoire")
    private DeviceType deviceType;

    private Long brandId;

    @NotBlank(message = "Le modèle est obligatoire")
    @Size(min = 1, max = 100, message = "Le modèle ne doit pas dépasser 100 caractères")
    private String model;

    @Min(value = 1990, message = "L'année de fabrication doit être 1990 ou plus récente")
    @Max(value = 2025, message = "L'année de fabrication ne peut pas être dans le futur")
    private Short manufactureYear;

    @Size(max = 100, message = "Le numéro de série ne doit pas dépasser 100 caractères")
    private String serialNumber;

    @NotNull(message = "L'état général de l'appareil est obligatoire")
    private ConditionOverall conditionOverall;

    @NotNull(message = "Les détails de l'état sont obligatoires")
    private Map<String, ConditionScoreDto> conditionDetails;
    // clés attendues: screen, keyboard, battery, chassis, performance

    private List<TradeInImageRequest> images = new ArrayList<>();
}