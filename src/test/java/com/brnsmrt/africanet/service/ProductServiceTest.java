package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.Category;
import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.domain.enums.ProductCondition;
import com.brnsmrt.africanet.dto.request.CreateProductRequest;
import com.brnsmrt.africanet.dto.response.PagedResponse;
import com.brnsmrt.africanet.dto.response.ProductResponse;
import com.brnsmrt.africanet.exception.ResourceNotFoundException;
import com.brnsmrt.africanet.mapper.ProductMapper;
import com.brnsmrt.africanet.repository.BrandRepository;
import com.brnsmrt.africanet.repository.CategoryRepository;
import com.brnsmrt.africanet.repository.ProductRepository;
import com.brnsmrt.africanet.repository.TagRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private BrandRepository brandRepository;
    @Mock
    private TagRepository tagRepository;
    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private ProductResponse productResponse;
    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("PC Portables");

        product = new Product();
        product.setId(10L);
        product.setName("Dell Latitude 5420");
        product.setSlug("dell-latitude-5420");
        product.setCategory(category);
        product.setBasePrice(new BigDecimal("1200.00"));
        product.setIsActive(true);

        productResponse = new ProductResponse();
        productResponse.setId(10L);
        productResponse.setName("Dell Latitude 5420");
        productResponse.setCategoryId(1L);
        productResponse.setCategoryName("PC Portables");
        productResponse.setBasePrice(new BigDecimal("1200.00"));
    }

    @Test
    @DisplayName("getById - succès quand le produit existe et est actif")
    void getById_Success() {
        when(productRepository.findByIdAndIsActiveTrue(10L)).thenReturn(Optional.of(product));
        when(productMapper.toResponse(product)).thenReturn(productResponse);

        ProductResponse result = productService.getById(10L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getName()).isEqualTo("Dell Latitude 5420");
        verify(productRepository).findByIdAndIsActiveTrue(10L);
    }

    @Test
    @DisplayName("getById - lève ResourceNotFoundException si produit non trouvé")
    void getById_NotFound() {
        when(productRepository.findByIdAndIsActiveTrue(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Produit introuvable");
    }

    @Test
    @DisplayName("create - création de produit avec succès")
    void create_Success() {
        CreateProductRequest req = new CreateProductRequest();
        req.setName("Lenovo ThinkPad T14");
        req.setCategoryId(1L);
        req.setBasePrice(new BigDecimal("1500.00"));
        req.setCondition(ProductCondition.REFURBISHED);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toResponse(any(Product.class))).thenReturn(productResponse);

        ProductResponse result = productService.create(req);

        assertThat(result).isNotNull();
        verify(categoryRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("delete - désactive le produit (soft delete)")
    void delete_Success() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        productService.delete(10L);

        assertThat(product.getIsActive()).isFalse();
        verify(productRepository).save(product);
    }

    @Test
    @DisplayName("getProducts - retourne les produits paginés")
    void getProducts_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        when(productRepository.searchWithFilters(null, null, null, null, null, pageable))
                .thenReturn(new PageImpl<>(Collections.singletonList(product)));
        when(productMapper.toResponse(product)).thenReturn(productResponse);

        PagedResponse<ProductResponse> result = productService.getProducts(null, null, null, null, null, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }
}
