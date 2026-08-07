package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /** Recherche un token par son hash (utilisé lors du refresh) */
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /** Révoque tous les tokens actifs d'un utilisateur (lors du logout global) */
    @Modifying
    @Query("UPDATE RefreshToken r SET r.isRevoked = true WHERE r.user.id = :userId AND r.isRevoked = false")
    void revokeAllByUserId(@Param("userId") Long userId);

    /** Supprime tous les tokens expirés ou révoqués d'un utilisateur (nettoyage) */
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.user.id = :userId AND (r.isRevoked = true OR r.expiresAt < CURRENT_TIMESTAMP)")
    void deleteExpiredOrRevokedByUserId(@Param("userId") Long userId);
}
