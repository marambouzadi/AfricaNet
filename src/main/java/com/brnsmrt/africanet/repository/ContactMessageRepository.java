package com.brnsmrt.africanet.repository;

import com.brnsmrt.africanet.domain.ContactMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    Page<ContactMessage> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
