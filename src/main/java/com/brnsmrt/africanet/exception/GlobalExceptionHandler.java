package com.brnsmrt.africanet.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 404 ───────────────────────────────────────────────────────────────────
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    // ── 401 / 403 ─────────────────────────────────────────────────────────────
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect", null);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentials(InvalidCredentialsException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), null);
    }

    @ExceptionHandler(AccountDisabledException.class)
    public ResponseEntity<Map<String, Object>> handleAccountDisabled(AccountDisabledException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage(), null);
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateEmail(DuplicateEmailException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidRefreshToken(InvalidRefreshTokenException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), null);
    }

    @ExceptionHandler(ForbiddenAccessException.class)
    public ResponseEntity<Map<String, Object>> handleForbiddenAccess(ForbiddenAccessException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage(), null);
    }

    @ExceptionHandler(InvoiceGenerationException.class)
    public ResponseEntity<Map<String, Object>> handleInvoiceGeneration(InvoiceGenerationException ex) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), null);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameNotFound(UsernameNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, Object>> handleDisabled(DisabledException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Compte désactivé. Veuillez contacter le support.", null);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<Map<String, Object>> handleLocked(LockedException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Compte verrouillé. Veuillez contacter le support.", null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Accès refusé : vous n'avez pas les autorisations nécessaires", null);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidToken(InvalidTokenException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), null);
    }

    // ── 400 – Email déjà utilisé ──────────────────────────────────────────────
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    // ── 400 – Validation Jakarta Bean Validation (@Valid sur @RequestBody) ────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = error instanceof FieldError
                    ? ((FieldError) error).getField()
                    : error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Erreur de validation des champs", fieldErrors);
    }

    // ── 400 – Violation contraintes (@Validated sur @PathVariable / @RequestParam) ──
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> violations = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        v -> {
                            String path = v.getPropertyPath().toString();
                            // garde uniquement le dernier segment (ex: "registerRequest.email" → "email")
                            int dot = path.lastIndexOf('.');
                            return dot >= 0 ? path.substring(dot + 1) : path;
                        },
                        ConstraintViolation::getMessage,
                        (msg1, msg2) -> msg1
                ));
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Erreur de validation des paramètres", violations);
    }

    // ── 400 – Corps JSON illisible ou absent ──────────────────────────────────
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleNotReadable(HttpMessageNotReadableException ex) {
        String msg = "Corps de la requête invalide ou manquant";
        if (ex.getMessage() != null && ex.getMessage().contains("enum")) {
            msg = "Valeur invalide pour un champ enuméré. Vérifiez les valeurs autorisées.";
        }
        return buildErrorResponse(HttpStatus.BAD_REQUEST, msg, null);
    }

    // ── 400 – Paramètre requis manquant ──────────────────────────────────────
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(MissingServletRequestParameterException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST,
                "Paramètre manquant : '" + ex.getParameterName() + "' est obligatoire", null);
    }

    // ── 400 – Type de paramètre incorrect ────────────────────────────────────
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String msg = "Valeur invalide pour le paramètre '" + ex.getName() + "'";
        if (ex.getRequiredType() != null) {
            msg += " (type attendu : " + ex.getRequiredType().getSimpleName() + ")";
        }
        return buildErrorResponse(HttpStatus.BAD_REQUEST, msg, null);
    }

    // ── 400 – Stock insuffisant ───────────────────────────────────────────────
    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<Map<String, Object>> handleInsufficientStock(InsufficientStockException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    // ── 400 – Règle métier ────────────────────────────────────────────────────
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessException(BusinessException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    // ── ResponseStatusException (throw new ResponseStatusException(...)) ──────
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;
        return buildErrorResponse(status, ex.getReason() != null ? ex.getReason() : ex.getMessage(), null);
    }

    // ── 500 – Fallback ────────────────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
                null
        );
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message, Object details) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        if (details != null) {
            body.put("details", details);
        }
        return new ResponseEntity<>(body, status);
    }
}
