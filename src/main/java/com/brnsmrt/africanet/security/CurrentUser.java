package com.brnsmrt.africanet.security;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.lang.annotation.*;

@Target({ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@AuthenticationPrincipal(expression = "id")
@Parameter(hidden = true)
public @interface CurrentUser {
}