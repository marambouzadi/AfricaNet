package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.VerificationToken;
import com.brnsmrt.africanet.domain.enums.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    /** Recherche un token par sa valeur et son type */
    Optional<VerificationToken> findByTokenAndType(String token, TokenType type);

    /** Supprime tous les tokens d'un user pour un type donné (avant d'en créer un nouveau) */
    @Modifying
    @Query("DELETE FROM VerificationToken v WHERE v.user.id = :userId AND v.type = :type")
    void deleteByUserIdAndType(@Param("userId") Long userId, @Param("type") TokenType type);
}
