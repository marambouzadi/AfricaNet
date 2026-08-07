package com.brnsmrt.africanet.domain;

import com.brnsmrt.africanet.domain.enums.TokenType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Token UUID aléatoire envoyé par email */
    @Column(nullable = false, unique = true)
    private String token;

    /**
     * Type du token :
     *  - EMAIL_VERIFY  → lien de vérification d'email
     *  - PASSWORD_RESET → lien de réinitialisation de mot de passe
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenType type;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /** NULL = pas encore utilisé */
    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /** Vérifie si le token peut encore être utilisé */
    public boolean isValid() {
        return usedAt == null && LocalDateTime.now().isBefore(expiresAt);
    }

    /** Marque le token comme utilisé */
    public void markAsUsed() {
        this.usedAt = LocalDateTime.now();
    }
}
