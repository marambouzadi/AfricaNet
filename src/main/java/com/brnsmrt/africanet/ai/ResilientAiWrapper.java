package com.brnsmrt.africanet.ai;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

@Service
@Profile("ai")
public class ResilientAiWrapper {

    private final Assistant assistant;
    private final CircuitBreaker circuitBreaker;

    public ResilientAiWrapper(Assistant assistant, CircuitBreakerRegistry registry) {
        this.assistant = assistant;
        this.circuitBreaker = registry.circuitBreaker("ai-service");
    }

    public void processChat(UUID memoryId, String userMessage, Consumer<String> tokenSender) {
        if (!circuitBreaker.tryAcquirePermission()) {
            tokenSender.accept(" The assistant is currently overloaded. Please try again later.");
            return;
        }

        long startNanos = System.nanoTime();

        try {
            assistant.chat(memoryId, userMessage)
                    .onPartialResponse(tokenSender)
                    .onCompleteResponse(response -> {
                        circuitBreaker.onSuccess(System.nanoTime() - startNanos, TimeUnit.NANOSECONDS);
                    })
                    .onError(error -> {
                        circuitBreaker.onError(System.nanoTime() - startNanos, TimeUnit.NANOSECONDS, error);
                        tokenSender.accept(" Error: Connection to AI failed.");
                    })
                    .start();
        } catch (Exception e) {
            circuitBreaker.onError(System.nanoTime() - startNanos, TimeUnit.NANOSECONDS, e);
            tokenSender.accept(" Error: " + e.getMessage());
        }
    }
}