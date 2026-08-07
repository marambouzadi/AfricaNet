package com.brnsmrt.africanet.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        log.info("📧 PREPARING EMAIL FOR PASSWORD RESET TO: {}", to);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject("Réinitialisation de votre mot de passe AfricaNet");
            
            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                    + "<h2 style='color: #1A3FA0;'>AfricaNet</h2>"
                    + "<p>Bonjour,</p>"
                    + "<p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>"
                    + "<div style='text-align: center; margin: 30px 0;'>"
                    + "<a href='" + resetLink + "' style='background-color: #1A3FA0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;'>Réinitialiser mon mot de passe</a>"
                    + "</div>"
                    + "<p>Si le bouton ne fonctionne pas, copiez-collez le lien suivant dans votre navigateur :</p>"
                    + "<p style='color: #6B7280; font-size: 12px; word-break: break-all;'>" + resetLink + "</p>"
                    + "<p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>"
                    + "<hr style='border: none; border-top: 1px solid #E2E2DF; margin-top: 30px;' />"
                    + "<p style='color: #6B7280; font-size: 12px; text-align: center;'>L'équipe AfricaNet</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ EMAIL SENT SUCCESSFULLY TO: {}", to);
        } catch (Exception e) {
            log.error("❌ FAILED TO SEND EMAIL TO: {}. Error: {}", to, e.getMessage());
            // Fallback: log the reset link for development purposes if SMTP is not configured properly
            log.info("==========================================================================");
            log.info("FALLBACK DEVELOPMENT LINK: {}", resetLink);
            log.info("==========================================================================");
        }
    }
}
