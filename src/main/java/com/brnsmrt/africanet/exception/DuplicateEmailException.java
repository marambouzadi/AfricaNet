package com.brnsmrt.africanet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Lancée quand on tente de créer un compte ou modifier un email
 * avec une adresse déjà utilisée par un autre compte.
 * HTTP 409 CONFLICT
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) {
        super("Un compte existe déjà avec l'adresse email : " + email);
    }

    public DuplicateEmailException() {
        super("Cet email est déjà utilisé par un autre compte.");
    }
}
