package com.brnsmrt.africanet.service;

import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class OrderNumberGenerator {

    private final AtomicLong counter = new AtomicLong(System.currentTimeMillis() % 100000);

    public String generate() {
        return String.format("ORD-%d-%05d", Year.now().getValue(), counter.incrementAndGet() % 100000);
    }
}