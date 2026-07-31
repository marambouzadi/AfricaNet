package com.brnsmrt.africanet.controller;

import com.brnsmrt.africanet.domain.ContactMessage;
import com.brnsmrt.africanet.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContactMessageController {

    private final ContactMessageRepository repository;

    @PostMapping("/contact")
    public ResponseEntity<?> submitMessage(@RequestBody ContactMessage message) {
        message.setId(null);
        message.setIsRead(false);
        repository.save(message);
        return ResponseEntity.ok(Map.of("message", "Message envoyé avec succès"));
    }

    @GetMapping("/admin/contact-messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ContactMessage>> getMessages(Pageable pageable) {
        return ResponseEntity.ok(repository.findAllByOrderByCreatedAtDesc(pageable));
    }
    
    @PatchMapping("/admin/contact-messages/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return repository.findById(id).map(msg -> {
            msg.setIsRead(true);
            repository.save(msg);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
