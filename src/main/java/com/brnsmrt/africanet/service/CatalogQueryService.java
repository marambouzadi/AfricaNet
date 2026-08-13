package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.domain.Product;
import com.brnsmrt.africanet.repository.CategoryRepository;
import com.brnsmrt.africanet.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CatalogQueryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CatalogQueryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, String>> populateProductCategories() {
        return this.categoryRepository.findAll().stream()
                .map(c -> Map.of("id", String.valueOf(c.getId()), "name", c.getName(), "slug", c.getSlug()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchCatalog(String keyword, Double maxPrice) {
        List<Product> products;
        if (maxPrice != null) {
            products = productRepository.findByBasePriceLessThanEqual(BigDecimal.valueOf(maxPrice));
        } else if (keyword == null || keyword.isBlank()) {
            products = productRepository.findAll();
        } else {
            products = productRepository.findByNameContainingIgnoreCase(keyword);
        }

        return products.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("name", p.getName());
            m.put("brand", p.getBrand() != null ? p.getBrand().getName() : "N/A");
            m.put("price", p.getBasePrice() != null ? p.getBasePrice().toPlainString() : "0");
            m.put("sku", p.getSku());
            m.put("condition", p.getCondition() != null ? p.getCondition().name() : "N/A");
            return m;
        }).collect(Collectors.toList());
    }
}
