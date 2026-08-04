package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.User;
import com.brnsmrt.africanet.domain.UserAddress;
import com.brnsmrt.africanet.dto.request.AddressRequest;
import com.brnsmrt.africanet.dto.response.AddressResponse;
import com.brnsmrt.africanet.repository.UserAddressRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import com.brnsmrt.africanet.exception.ForbiddenAccessException;
import com.brnsmrt.africanet.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses(Authentication authentication) {
        User user = getUserByAuth(authentication);
        return addressRepository.findByUser_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse addAddress(AddressRequest request, Authentication authentication) {
        User user = getUserByAuth(authentication);

        if (request.isDefault()) {
            addressRepository.resetDefaultAddressForUser(user.getId());
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .label(request.getLabel())
                .fullname(request.getFullname())
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .isDefault(request.isDefault())
                .build();

        UserAddress saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteAddress(Long id, Authentication authentication) {
        User user = getUserByAuth(authentication);
        UserAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adresse introuvable"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ForbiddenAccessException();
        }

        addressRepository.delete(address);
    }

    private User getUserByAuth(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    private AddressResponse mapToResponse(UserAddress address) {
        return AddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .fullname(address.getFullname())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .build();
    }
}
