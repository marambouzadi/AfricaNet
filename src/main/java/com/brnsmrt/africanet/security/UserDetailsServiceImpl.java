package com.brnsmrt.africanet.security;

import com.brnsmrt.africanet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implémentation de {@link UserDetailsService} pour Spring Security.
 *
 * <p>Spring Security appelle {@code loadUserByUsername(email)} lors :
 * <ul>
 *   <li>De l'authentification classique (login)</li>
 *   <li>Du filtre JWT (rechargement du UserDetails depuis le SecurityContext)</li>
 * </ul>
 * </p>
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Charge l'utilisateur par son email (le "username" dans notre système).
     *
     * @param email l'email de l'utilisateur
     * @return UserDetails (notre entité User implémente UserDetails)
     * @throws UsernameNotFoundException si aucun user avec cet email n'existe
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Aucun utilisateur trouvé avec l'email : " + email
                ));
    }
}
