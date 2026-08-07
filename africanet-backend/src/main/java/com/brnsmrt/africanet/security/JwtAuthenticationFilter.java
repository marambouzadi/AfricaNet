package com.brnsmrt.africanet.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtre HTTP exécuté une seule fois par requête.
 *
 * <p>Fonctionnement :
 * <ol>
 *   <li>Lit le header {@code Authorization: Bearer <token>}</li>
 *   <li>Valide le JWT via {@link JwtTokenProvider}</li>
 *   <li>Charge l'utilisateur depuis la base</li>
 *   <li>Injecte l'authentification dans le {@link SecurityContextHolder}</li>
 * </ol>
 * </p>
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String AUTH_HEADER   = "Authorization";

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String jwt = extractJwtFromRequest(request);

        // Pas de token → on passe au filtre suivant (Spring Security bloquera si la route est protégée)
        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (jwtTokenProvider.validateToken(jwt)) {
                String email = jwtTokenProvider.extractUsername(jwt);

                // On ne recharge que si le SecurityContext est vide (évite les doublons)
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    if (jwtTokenProvider.isTokenValid(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,                          // credentials nulles (JWT = stateless)
                                        userDetails.getAuthorities()
                                );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // ✅ Injection dans le SecurityContext → l'utilisateur est authentifié
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.debug("Utilisateur authentifié via JWT : {}", email);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'authentification JWT : {}", e.getMessage());
            // On ne bloque pas → Spring Security renverra 401 si la route est protégée
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extrait le token brut depuis le header Authorization.
     *
     * @param request la requête HTTP
     * @return le JWT sans le préfixe "Bearer ", ou null si absent
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTH_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
