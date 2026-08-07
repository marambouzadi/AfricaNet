package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.domain.Brand;
import com.brnsmrt.africanet.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<List<Brand>> getAll() {
        return ResponseEntity.ok(brandRepository.findAll());
    }
}
