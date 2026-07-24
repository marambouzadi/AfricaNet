package com.brnsmrt.africanet.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConditionScoreDto {
    @NotNull @Min(1) @Max(10)
    private Integer score;
    private String notes;
}