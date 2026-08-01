package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.domain.Favorite;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.dto.response.PagedResponse;
import com.brnsmrt.africanet.dto.response.ProductResponse;
import com.brnsmrt.africanet.exception.ResourceNotFoundException;
import com.brnsmrt.africanet.mapper.ProductMapper;
import com.brnsmrt.africanet.repository.FavoriteRepository;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springdoc.core.annotations.ParameterObject;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PagedResponse<ProductResponse>> getFavorites(
            @ParameterObject @PageableDefault(size = 50) Pageable pageable) {
        User user = getCurrentUser();
        Page<Favorite> favorites = favoriteRepository.findByUser(user, pageable);
        
        Page<ProductResponse> responses = favorites.map(fav -> productMapper.toResponse(fav.getProduct()));
        return ResponseEntity.ok(new PagedResponse<>(responses));
    }
    
    @GetMapping("/ids")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Long>> getFavoriteIds() {
        User user = getCurrentUser();
        // Just return a quick list of product IDs for frontend state
        List<Long> ids = favoriteRepository.findByUser(user, Pageable.unpaged())
                            .getContent().stream()
                            .map(fav -> fav.getProduct().getId())
                            .collect(Collectors.toList());
        return ResponseEntity.ok(ids);
    }

    @PostMapping("/{productId}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<Map<String, String>> addFavorite(@PathVariable Long productId) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (favoriteRepository.findByUserAndProduct(user, product).isEmpty()) {
            Favorite favorite = Favorite.builder()
                    .user(user)
                    .product(product)
                    .createdAt(LocalDateTime.now())
                    .build();
            favoriteRepository.save(favorite);
        }
        
        Map<String, String> res = new HashMap<>();
        res.put("status", "added");
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<Map<String, String>> removeFavorite(@PathVariable Long productId) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        favoriteRepository.deleteByUserAndProduct(user, product);
        
        Map<String, String> res = new HashMap<>();
        res.put("status", "removed");
        return ResponseEntity.ok(res);
    }
}
