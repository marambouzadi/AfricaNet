package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.dto.request.AddressRequest;
import com.brnsmrt.africanet.dto.response.AddressResponse;
import com.brnsmrt.africanet.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Validated
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getMyAddresses(Authentication authentication) {
        return ResponseEntity.ok(addressService.getMyAddresses(authentication));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(addressService.addAddress(request, authentication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long id,
            Authentication authentication) {
        addressService.deleteAddress(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
