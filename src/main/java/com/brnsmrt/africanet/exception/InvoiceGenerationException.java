package com.brnsmrt.africanet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Lancée quand la génération de la facture PDF échoue.
 * HTTP 500 INTERNAL_SERVER_ERROR
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class InvoiceGenerationException extends RuntimeException {
    public InvoiceGenerationException(String message) {
        super(message);
    }

    public InvoiceGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
