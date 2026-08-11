package com.brnsmrt.africanet.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:src/main/resources/products}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absoluteUploadPath = Paths.get(uploadDir).toAbsolutePath().normalize().toUri().toString();
        if (!absoluteUploadPath.endsWith("/")) {
            absoluteUploadPath += "/";
        }
        registry.addResourceHandler("/uploads/**", "/uploads/products/**")
                .addResourceLocations(absoluteUploadPath, "classpath:/products/", "classpath:/static/products/");
    }
}
