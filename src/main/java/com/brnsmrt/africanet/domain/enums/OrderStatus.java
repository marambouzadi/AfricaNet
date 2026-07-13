package com.brnsmrt.africanet.domain.enums;

public enum OrderStatus {
    PENDING,      // En attente de confirmation
    CONFIRMED,    // Confirmée
    PROCESSING,   // En préparation
    SHIPPED,      // Expédiée
    DELIVERED,    // Livrée
    CANCELLED,    // Annulée
    REFUNDED      // Remboursée
}