package com.brnsmrt.africanet.ai;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

@Service
public class ResilientAiWrapper {

    private final ChatbotService chatbotService;
    private final CircuitBreaker circuitBreaker;

    public ResilientAiWrapper(ChatbotService chatbotService, CircuitBreakerRegistry registry) {
        this.chatbotService = chatbotService;
        this.circuitBreaker = registry.circuitBreaker("ai-service");
    }

    public void processChat(String memoryId, String userMessage, 
                            Consumer<String> onPartial, 
                            Runnable onComplete, 
                            Consumer<Throwable> onError) {
                            
        if (!circuitBreaker.tryAcquirePermission()) {
            onPartial.accept(" The assistant is currently overloaded. Please try again later.");
            return;
        }

        long startNanos = System.nanoTime();

        try {
            chatbotService.chat(memoryId, userMessage)
                    .onPartialResponse(onPartial)
                    .onCompleteResponse(response -> {
                        circuitBreaker.onSuccess(System.nanoTime() - startNanos, TimeUnit.NANOSECONDS);
                        onComplete.run();
                    })
                    .onError(error -> {
                        circuitBreaker.onError(System.nanoTime() - startNanos, TimeUnit.NANOSECONDS, error);
                        onError.accept(error);
                    })
                    .start();
        } catch (Exception e) {
            circuitBreaker.onError(System.nanoTime() - startNanos, TimeUnit.NANOSECONDS, e);
            onError.accept(e);
        }
    }
}
