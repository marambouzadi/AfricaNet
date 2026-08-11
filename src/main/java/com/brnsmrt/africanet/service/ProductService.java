package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.*;
import com.brnsmrt.africanet.domain.enums.ProductCondition;
import com.brnsmrt.africanet.dto.request.CreateProductRequest;
import com.brnsmrt.africanet.dto.request.ProductImageRequest;
import com.brnsmrt.africanet.dto.request.ProductSpecRequest;
import com.brnsmrt.africanet.dto.response.PagedResponse;
import com.brnsmrt.africanet.dto.response.ProductResponse;
import com.brnsmrt.africanet.exception.ResourceNotFoundException;
import com.brnsmrt.africanet.mapper.ProductMapper;
import com.brnsmrt.africanet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final TagRepository tagRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProducts(
            Long categoryId, Long brandId, ProductCondition condition,
            BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        Page<Product> products = productRepository.searchWithFilters(
                categoryId, brandId, condition, minPrice, maxPrice, pageable);
        return new PagedResponse<>(products.map(this::enrichResponseWithStock));
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> search(String query, Pageable pageable) {
        Page<Product> results = productRepository.fullTextSearch(query, pageable);
        return new PagedResponse<>(results.map(this::enrichResponseWithStock));
    }

    @Transactional
    public ProductResponse create(CreateProductRequest req) {
        Product product = new Product();
        applyBasicFields(product, req);

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));
        product.setCategory(category);

        if (req.getBrandId() != null) {
            Brand brand = brandRepository.findById(req.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Marque introuvable"));
            product.setBrand(brand);
        } else if (req.getBrandName() != null && !req.getBrandName().trim().isEmpty()) {
            Brand brand = brandRepository.findByNameIgnoreCase(req.getBrandName().trim())
                    .orElseGet(() -> {
                        Brand newBrand = new Brand();
                        newBrand.setName(req.getBrandName().trim());
                        newBrand.setSlug(generateSlugFromText(req.getBrandName().trim()));
                        return brandRepository.save(newBrand);
                    });
            product.setBrand(brand);
        }

        attachImages(product, req);
        attachSpecifications(product, req);
        attachTags(product, req);

        return enrichResponseWithStock(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, CreateProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable: " + id));

        applyBasicFields(product, req);

        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));
            product.setCategory(category);
        }

        if (req.getBrandId() != null) {
            Brand brand = brandRepository.findById(req.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Marque introuvable"));
            product.setBrand(brand);
        } else if (req.getBrandName() != null && !req.getBrandName().trim().isEmpty()) {
            Brand brand = brandRepository.findByNameIgnoreCase(req.getBrandName().trim())
                    .orElseGet(() -> {
                        Brand newBrand = new Brand();
                        newBrand.setName(req.getBrandName().trim());
                        newBrand.setSlug(generateSlugFromText(req.getBrandName().trim()));
                        return brandRepository.save(newBrand);
                    });
            product.setBrand(brand);
        } else {
            product.setBrand(null);
        }

        // orphanRemoval=true -> clear() supprime les anciennes lignes en DB
        product.getImages().clear();
        product.getSpecifications().clear();
        product.getProductTags().clear();

        attachImages(product, req);
        attachSpecifications(product, req);
        attachTags(product, req);

        return enrichResponseWithStock(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable: " + id));
        product.setIsActive(false); // soft delete
        productRepository.save(product);
    }

    // ---- Méthodes privées ----

    private void applyBasicFields(Product product, CreateProductRequest req) {
        product.setName(req.getName());
        if (product.getId() == null) { // uniquement à la création
            product.setSlug(generateSlug(req.getName()));
        }
        product.setDescription(req.getDescription());
        product.setShortDesc(req.getShortDesc());
        product.setCondition(req.getCondition());
        product.setBasePrice(req.getBasePrice());
        product.setSalePrice(req.getSalePrice());
        product.setSku(req.getSku());
        product.setWeightKg(req.getWeightKg());
        product.setIsFeatured(req.getIsFeatured());
        product.setMetaTitle(req.getMetaTitle());
        product.setMetaDesc(req.getMetaDesc());
    }

    private void attachImages(Product product, CreateProductRequest req) {
        if (req.getImages() == null || req.getImages().isEmpty()) return;

        boolean hasPrimary = req.getImages().stream().anyMatch(ProductImageRequest::getIsPrimary);

        for (int i = 0; i < req.getImages().size(); i++) {
            ProductImageRequest imgReq = req.getImages().get(i);
            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setUrl(imgReq.getUrl());
            img.setAltText(imgReq.getAltText());
            img.setSortOrder(imgReq.getSortOrder());
            // si aucune image marquée primary, la première le devient
            img.setIsPrimary(hasPrimary ? imgReq.getIsPrimary() : (i == 0));
            product.getImages().add(img);
        }
    }

    private void attachSpecifications(Product product, CreateProductRequest req) {
        if (req.getSpecifications() == null) return;
        for (ProductSpecRequest specReq : req.getSpecifications()) {
            ProductSpecification spec = new ProductSpecification();
            spec.setProduct(product);
            spec.setSpecKey(specReq.getSpecKey());
            spec.setSpecValue(specReq.getSpecValue());
            spec.setSortOrder(specReq.getSortOrder());
            product.getSpecifications().add(spec);
        }
    }

    private void attachTags(Product product, CreateProductRequest req) {
        if (req.getTagNames() == null) return;
        for (String tagName : req.getTagNames()) {
            Tag tag = tagRepository.findByName(tagName)
                    .orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(tagName);
                        newTag.setSlug(generateSlugFromText(tagName));
                        return tagRepository.save(newTag);
                    });
            ProductTag productTag = new ProductTag();
            productTag.setProduct(product);
            productTag.setTag(tag);
            product.getProductTags().add(productTag);
        }
    }

    private String generateSlug(String name) {
        String base = generateSlugFromText(name);
        String slug = base;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private String generateSlugFromText(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
    }
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable: " + id));
        return enrichResponseWithStock(product);
    }

    private ProductResponse enrichResponseWithStock(Product product) {
        ProductResponse res = productMapper.toResponse(product);
        if (product != null && product.getId() != null) {
            try {
                inventoryRepository.findByProductId(product.getId()).ifPresentOrElse(
                    inv -> res.setStock(Math.max(0, inv.getQuantity() - inv.getReservedQuantity())),
                    () -> res.setStock(1)
                );
            } catch (Exception e) {
                res.setStock(1);
            }
        }
        return res;
    }
}