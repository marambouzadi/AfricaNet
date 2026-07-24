package com.brnsmrt.africanet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Lancée quand le compte utilisateur est désactivé (isActive = false).
 * HTTP 403 FORBIDDEN
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class AccountDisabledException extends RuntimeException {
    public AccountDisabledException() {
        super("Ce compte est désactivé. Veuillez contacter le support.");
    }

    public AccountDisabledException(String message) {
        super(message);
    }
}
