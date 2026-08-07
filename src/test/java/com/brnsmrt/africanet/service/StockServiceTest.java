package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.Inventory;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.enums.MovementType;
import com.brnsmrt.africanet.dto.request.AdjustStockRequest;
import com.brnsmrt.africanet.dto.response.InventoryResponse;
import com.brnsmrt.africanet.exception.ResourceNotFoundException;
import com.brnsmrt.africanet.repository.InventoryMovementRepository;
import com.brnsmrt.africanet.repository.InventoryRepository;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private InventoryMovementRepository movementRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StockService stockService;

    private Product product;
    private Inventory inventory;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(5L);
        product.setName("HP EliteBook 840");
        product.setSku("HP-EBK-840");

        inventory = new Inventory();
        inventory.setId(100L);
        inventory.setProduct(product);
        inventory.setQuantity(10);
        inventory.setReservedQuantity(2);
        inventory.setMinThreshold(3);
    }

    @Test
    @DisplayName("getStockByProduct - succès quand le stock existe")
    void getStockByProduct_Success() {
        when(inventoryRepository.findByProductId(5L)).thenReturn(Optional.of(inventory));

        InventoryResponse res = stockService.getStockByProduct(5L);

        assertThat(res).isNotNull();
        assertThat(res.getProductId()).isEqualTo(5L);
        assertThat(res.getQuantity()).isEqualTo(10);
        assertThat(res.getQuantityAvailable()).isEqualTo(8);
    }

    @Test
    @DisplayName("getStockByProduct - exception quand le stock n'existe pas")
    void getStockByProduct_NotFound() {
        when(inventoryRepository.findByProductId(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stockService.getStockByProduct(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Stock introuvable");
    }

    @Test
    @DisplayName("adjustStock - augmentation de la quantité (MovementType.IN)")
    void adjustStock_In_Success() {
        AdjustStockRequest req = new AdjustStockRequest();
        req.setMovementType(MovementType.IN);
        req.setQuantity(5);
        req.setNotes("Réapprovisionnement fournisseur");

        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByProductId(5L)).thenReturn(Optional.of(inventory));

        InventoryResponse res = stockService.adjustStock(5L, req, null);

        assertThat(res).isNotNull();
        assertThat(inventory.getQuantity()).isEqualTo(15);
        verify(inventoryRepository).save(inventory);
        verify(movementRepository).save(any());
    }

    @Test
    @DisplayName("getLowStockAlerts - filtre les alertes de stock")
    void getLowStockAlerts_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        when(inventoryRepository.findLowStockAlerts(pageable))
                .thenReturn(new PageImpl<>(Collections.singletonList(inventory)));

        Page<InventoryResponse> res = stockService.getLowStockAlerts(pageable);

        assertThat(res).isNotNull();
        assertThat(res.getContent()).hasSize(1);
    }
}
