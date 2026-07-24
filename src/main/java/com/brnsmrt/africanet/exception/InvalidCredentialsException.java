package com.brnsmrt.africanet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Lancée quand l'email ou le mot de passe fourni est incorrect lors de la connexion.
 * HTTP 401 UNAUTHORIZED
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Email ou mot de passe incorrect");
    }

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
