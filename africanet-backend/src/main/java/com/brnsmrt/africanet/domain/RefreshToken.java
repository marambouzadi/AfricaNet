package com.brnsmrt.africanet.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Référence vers l'utilisateur propriétaire du token.
     * Si l'utilisateur est supprimé → cascade DELETE en base.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Hash SHA-256 du refresh token (on ne stocke jamais le token brut).
     * La valeur brute est envoyée au client uniquement.
     */
    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /** true = token révoqué (logout ou rotation) */
    @Column(name = "is_revoked", nullable = false)
    @Builder.Default
    private Boolean isRevoked = false;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /** Vérifie si le token est encore valide (non expiré ET non révoqué) */
    public boolean isValid() {
        return !Boolean.TRUE.equals(isRevoked)
                && LocalDateTime.now().isBefore(expiresAt);
    }
}
