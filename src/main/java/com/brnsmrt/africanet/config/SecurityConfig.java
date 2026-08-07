package com.brnsmrt.africanet.config;

import com.brnsmrt.africanet.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuration principale de Spring Security pour AfricaNet.
 *
 * <p>Stratégie : JWT Stateless (pas de sessions HTTP côté serveur)</p>
 *
 * <h3>Règles d'accès :</h3>
 * <ul>
 *   <li>PUBLIC  : POST /api/auth/**, GET /api/products/**, Swagger UI, H2 console</li>
 *   <li>AUTH    : tout le reste (panier, commandes, profil...)</li>
 *   <li>ADMIN   : /api/admin/**, /api/stock/** (rôle ADMIN requis)</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity           // Active @PreAuthorize, @PostAuthorize sur les méthodes
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    // ── Security Filter Chain ─────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Désactiver CSRF (inutile en mode JWT stateless)
            .csrf(AbstractHttpConfigurer::disable)

            // 2. CORS (autorise Angular sur localhost:4200)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Pas de sessions HTTP (stateless)
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 3.5 Gestion des exceptions (401 au lieu de 403 pour unauthenticated)
            .exceptionHandling(exceptions ->
                    exceptions.authenticationEntryPoint((request, response, authException) -> {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage());
                    })
            )

            // 4. Règles d'autorisation des routes
            .authorizeHttpRequests(auth -> auth

                // ── Routes publiques ──────────────────────────────────────
                    .requestMatchers(
                            "/api/auth/register",
                            "/api/auth/login",
                            "/api/auth/refresh",
                            "/swagger-ui/**",
                            "/swagger-ui.html",
                            "/api-docs/**",
                            "/v3/api-docs/**",
                            "/error",
                            "/mock-flouci/**",
                            "/ws/**",
                            "/api/contact"
                    ).permitAll()

                // Catalogue public (lecture seule)
                .requestMatchers(HttpMethod.GET,
                        "/api/products",
                        "/api/products/**",
                        "/api/categories",
                        "/api/categories/**",
                        "/api/brands",
                        "/api/brands/**"
                ).permitAll()

                // ── Routes Admin uniquement ───────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/stock/**").hasAnyRole("ADMIN", "MANAGER")

                // ── Tout le reste nécessite d'être connecté ───────────────
                .anyRequest().authenticated()
            )

            // 5. Provider d'authentification (DAO + bcrypt)
            .authenticationProvider(authenticationProvider())

            // 6. Notre filtre JWT passe AVANT le filtre d'authentification username/password
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ── CORS Configuration ────────────────────────────────────────────────────

    /**
     * Configuration CORS pour autoriser le frontend Angular (dev + prod).
     * En production, remplacer les origines par les domaines réels.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Origines autorisées
        config.setAllowedOrigins(List.of(
                "http://localhost:4200",     // Angular dev
                "http://localhost:3000", // Next.js dev
                "http://localhost:8090"
        ));

        // Méthodes HTTP autorisées
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Headers autorisés dans les requêtes
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));

        // Headers exposés dans les réponses
        config.setExposedHeaders(List.of("Authorization"));

        // Autoriser les cookies / credentials
        config.setAllowCredentials(true);

        // Cache preflight 1 heure
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ── Beans d'authentification ──────────────────────────────────────────────

    /**
     * Provider qui utilise la base de données + bcrypt pour l'authentification.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * AuthenticationManager exposé comme Bean pour être injecté dans AuthService.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Encodeur de mots de passe bcrypt avec un cost factor de 12.
     * Conforme aux recommandations de sécurité de l'architecture AfricaNet.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
