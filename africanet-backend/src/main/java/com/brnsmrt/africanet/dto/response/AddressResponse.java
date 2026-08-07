package com.brnsmrt.africanet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {
    private Long id;
    private String label;
    private String fullname;
    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private boolean isDefault;
    private LocalDateTime createdAt;
}
