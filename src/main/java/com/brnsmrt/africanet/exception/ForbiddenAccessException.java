package com.brnsmrt.africanet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Lancée quand un utilisateur tente d'accéder ou de modifier
 * une ressource qui ne lui appartient pas (ex: adresse d'un autre user).
 * HTTP 403 FORBIDDEN
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenAccessException extends RuntimeException {
    public ForbiddenAccessException() {
        super("Accès refusé : cette ressource ne vous appartient pas.");
    }

    public ForbiddenAccessException(String message) {
        super(message);
    }
}
