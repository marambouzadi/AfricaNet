package com.brnsmrt.africanet.config;

import com.brnsmrt.africanet.domain.*;
import com.brnsmrt.africanet.domain.enums.ProductCondition;
import com.brnsmrt.africanet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class RealProductSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (productRepository.count() > 20) {
            log.info("Products already seeded, skipping RealProductSeeder.");
            return;
        }

        log.info("Starting RealProductSeeder - Injecting 13 real laptops...");

        // Note: we might not be able to delete due to constraints, so we just add them if not present.
        // It's safer to just insert new ones if they don't exist.

        // Create Categories
        Category gamerCategory = saveCategory("PC Gamer", "pc-gamer", "PC Portables Hautes Performances pour le Gaming");
        Category proCategory = saveCategory("PC Pro", "pc-pro", "PC Portables pour les Professionnels et Créateurs");

        // Create Brands
        Brand asus = saveBrand("ASUS");
        Brand dell = saveBrand("DELL");
        Brand hp = saveBrand("HP");
        Brand lenovo = saveBrand("LENOVO");
        Brand apple = saveBrand("APPLE");
        Brand msi = saveBrand("MSI");
        Brand microsoft = saveBrand("MICROSOFT");

        // 1. ASUS TUF A15
        createProduct("ASUS TUF A15", "asus-tuf-a15", asus, gamerCategory,
                "Ryzen 7-7735HS, 16Go DDR5, 512Go SSD, RTX 3050 4Go, 15.6\" FHD 144Hz",
                new BigDecimal("2280.000"), 5);

        // 2. DELL Latitude 3420
        createProduct("DELL Latitude 3420", "dell-latitude-3420", dell, proCategory,
                "Core i5-1145G7, 16Go DDR4, 256Go SSD, Intel Xe, 14\" FHD",
                new BigDecimal("1180.000"), 3);

        // 3. Dell latitude 7450
        createProduct("Dell Latitude 7450", "dell-latitude-7450", dell, proCategory,
                "Core Ultra 5 135U, 16Go DDR5, 256Go SSD, Intel Graphics, 14.0\" FHD",
                new BigDecimal("1980.000"), 2);

        // 4. HP EliteBook 640 G9
        createProduct("HP EliteBook 640 G9", "hp-elitebook-640-g9", hp, proCategory,
                "Core i5-1245U, 16Go DDR5, 256Go SSD, Intel Iris Xe, 14\" FHD",
                new BigDecimal("1580.000"), 4);

        // 5. HP OMEN 17
        createProduct("HP OMEN 17", "hp-omen-17", hp, gamerCategory,
                "Ryzen AI 9-365, 32Go DDR5, 1To SSD, RTX 5070 8Go, 17.3\" 240Hz 2560x1440",
                new BigDecimal("5980.000"), 2);

        // 6. HP ZBook 16 G9
        createProduct("HP ZBook 16 G9", "hp-zbook-16--g9", hp, proCategory,
                "Core i7-12850HX, 16Go DDR5, 512Go SSD, RTX A1000 4Go, 16\" FHD",
                new BigDecimal("2480.000"), 2);

        // 7. Lenovo LOQ
        createProduct("Lenovo LOQ", "lenovo-loq", lenovo, gamerCategory,
                "Core i5-13450HX, 16Go DDR5, 512Go SSD, RTX 5050 8Go, 15.6\" FHD 144Hz",
                new BigDecimal("3180.000"), 3);

        // 8. Lenovo ThinkPad P1 Gen6
        createProduct("Lenovo ThinkPad P1 Gen6", "lenovo-thinkpad-p1-gen6", lenovo, proCategory,
                "Core i7-13800H, 64Go DDR5, 2To SSD, RTX ADA 4000 12Go, 16\" 4K OLED",
                new BigDecimal("4980.000"), 1);

        // 9. MACBOOK Air 15p 2024
        createProduct("MACBOOK Air 15p 2024", "macbook-air--15p-2024", apple, proCategory,
                "M3, 16Go RAM, 256Go SSD",
                new BigDecimal("2880.000"), 5);

        // 10. MACBOOK AIR 15p 2025
        createProduct("MACBOOK AIR 15p 2025", "macbook-air-15p-2025", apple, proCategory,
                "M4, 16Go RAM, 512Go SSD",
                new BigDecimal("3680.000"), 3);

        // 11. MACBOOK PRO 14p 2023
        createProduct("MACBOOK PRO 14p 2023", "macbook-pro-14p-2023", apple, proCategory,
                "M2 Pro, 16Go RAM, 512Go SSD",
                new BigDecimal("3380.000"), 2);

        // 12. MSI GF 63
        createProduct("MSI GF 63", "msi--gf-63", msi, gamerCategory,
                "Core i5-11400H, 16Go DDR4, 512Go SSD, GTX 1650 4Go, 15.6\" FHD 144Hz",
                new BigDecimal("1720.000"), 4);

        // 13. Surface Laptop 5
        createProduct("Surface Laptop 5", "surface-laptop-5", microsoft, proCategory,
                "Core i7-1265U, 16Go DDR5, 256Go SSD, Intel Iris Xe, 13.5\" 2K",
                new BigDecimal("1780.000"), 2);

        log.info("RealProductSeeder finished successfully.");
    }

    private Category saveCategory(String name, String slug, String description) {
        return categoryRepository.findBySlug(slug).orElseGet(() -> {
            Category category = new Category();
            category.setName(name);
            category.setSlug(slug);
            category.setDescription(description);
            category.setIsActive(true);
            return categoryRepository.save(category);
        });
    }

    private Brand saveBrand(String name) {
        String slug = name.toLowerCase().replace(" ", "-");
        return brandRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            Brand brand = new Brand();
            brand.setName(name);
            brand.setSlug(slug);
            brand.setIsActive(true);
            return brandRepository.save(brand);
        });
    }

    private void createProduct(String name, String slug, Brand brand, Category category, String desc, BigDecimal price, int qty) {
        if (productRepository.existsBySlug(slug)) {
            return;
        }

        Product product = Product.builder()
                .name(name)
                .slug(slug)
                .shortDesc(desc)
                .description("Ce PC est une excellente machine de la gamme AfricaNet. " + desc)
                .brand(brand)
                .category(category)
                .condition(ProductCondition.NEW)
                .basePrice(price.add(new BigDecimal("100.000")))
                .salePrice(price)
                .sku("SKU-" + slug.toUpperCase())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .viewCount(0)
                .build();

        // boolean fields with initializers are not handled by @Builder, set explicitly
        product.setIsActive(true);
        product.setIsFeatured(true);

        for (int i = 1; i <= 5; i++) {
            ProductImage pi = new ProductImage();
            pi.setProduct(product);
            pi.setUrl("/uploads/products/" + slug + "/" + i + ".jpg");
            pi.setIsPrimary(i == 1);
            pi.setSortOrder(i);
            product.getImages().add(pi);
        }

        Product savedProduct = productRepository.save(product);

        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setQuantity(qty);
        inventory.setReservedQuantity(0);
        inventory.setMinThreshold(2);
        inventory.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inventory);
    }
}
