package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.Favorite;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    Page<Favorite> findByUser(User user, Pageable pageable);
    Optional<Favorite> findByUserAndProduct(User user, Product product);
    void deleteByUserAndProduct(User user, Product product);
}
