package com.brnsmrt.africanet.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Composant responsable de la génération et validation des JWT (access tokens).
 *
 * <p>Algorithme : HMAC-SHA256 (HS256)</p>
 * <p>Le secret doit faire au minimum 32 caractères (256 bits).</p>
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration; // en millisecondes

    // ── Génération ────────────────────────────────────────────────────────────

    /**
     * Génère un access token JWT pour l'utilisateur donné.
     *
     * @param userDetails l'utilisateur authentifié
     * @return le JWT signé sous forme de String
     */
    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        return buildToken(extraClaims, userDetails, accessTokenExpiration);
    }

    /**
     * Génère un access token avec des claims supplémentaires (ex: rôle).
     *
     * @param extraClaims claims additionnels à inclure dans le payload
     * @param userDetails l'utilisateur authentifié
     * @return le JWT signé
     */
    public String generateAccessToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, accessTokenExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims,
                              UserDetails userDetails,
                              long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())          // email de l'utilisateur
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // ── Validation ────────────────────────────────────────────────────────────

    /**
     * Vérifie si le token est valide pour l'utilisateur donné.
     *
     * @param token       le JWT à valider
     * @param userDetails l'utilisateur à comparer
     * @return true si valide, false sinon
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Valide la signature et la structure du token (sans vérifier l'utilisateur).
     *
     * @param token le JWT à valider
     * @return true si le token est syntaxiquement valide et non expiré
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            log.warn("JWT malformé : {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("JWT expiré : {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT non supporté : {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT vide ou null : {}", e.getMessage());
        }
        return false;
    }

    // ── Extraction des claims ─────────────────────────────────────────────────

    /** Extrait le username (email) du token */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Extrait la date d'expiration */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /** Extrait n'importe quel claim du token */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // ── Méthodes privées ──────────────────────────────────────────────────────

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Construit la clé HMAC-SHA256 à partir du secret Base64 configuré.
     * Si le secret n'est pas en Base64, on l'encode directement en bytes.
     */
    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            // Le secret n'est pas encodé en Base64 → on utilise les bytes directs
            return Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }
    }
}
