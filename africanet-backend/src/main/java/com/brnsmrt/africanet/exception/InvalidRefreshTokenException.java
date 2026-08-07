package com.brnsmrt.africanet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Lancée quand le refresh token est expiré, révoqué ou introuvable.
 * HTTP 401 UNAUTHORIZED
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException() {
        super("Refresh token invalide, expiré ou révoqué. Veuillez vous reconnecter.");
    }

    public InvalidRefreshTokenException(String message) {
        super(message);
    }
}
