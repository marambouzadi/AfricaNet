package com.brnsmrt.africanet.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_adresses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String label; // "Maison", "Bureau", etc.
    
    private String fullname;

    private String street;

    private String city;

    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    private String country;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.country == null) {
            this.country = "Tunisie";
        }
        if (this.isDefault == null) {
            this.isDefault = false;
        }
    }
}
