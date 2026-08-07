package com.brnsmrt.africanet.service;

import com.brnsmrt.africanet.dto.response.OrderItemResponse;
import com.brnsmrt.africanet.dto.response.OrderResponse;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    public byte[] generateInvoice(OrderResponse order) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);

            // En-tête
            doc.add(new Paragraph("AFRICA NET").setBold().setFontSize(20));
            doc.add(new Paragraph("Facture N° " + order.getOrderNumber()).setFontSize(12));
            doc.add(new Paragraph("Date : " +
                    order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))));

            doc.add(new Paragraph("\n"));

            // Adresse livraison
            doc.add(new Paragraph("Livraison à :").setBold());
            doc.add(new Paragraph(order.getShippingAddress().get("fullName") + "\n" +
                    order.getShippingAddress().get("street") + "\n" +
                    order.getShippingAddress().get("city") + " " +
                    order.getShippingAddress().getOrDefault("postalCode", "") + "\n" +
                    order.getShippingAddress().get("country")));

            doc.add(new Paragraph("\n"));

            // Tableau des articles
            Table table = new Table(UnitValue.createPercentArray(new float[]{4, 1, 2, 2}))
                    .useAllAvailableWidth();

            table.addHeaderCell(headerCell("Produit"));
            table.addHeaderCell(headerCell("Qté"));
            table.addHeaderCell(headerCell("Prix unitaire"));
            table.addHeaderCell(headerCell("Total"));

            for (OrderItemResponse item : order.getItems()) {
                String name = String.valueOf(item.getProductSnapshot().get("name"));
                table.addCell(name);
                table.addCell(String.valueOf(item.getQuantity()));
                table.addCell(item.getUnitPrice() + " TND");
                table.addCell(item.getTotalPrice() + " TND");
            }

            doc.add(table);
            doc.add(new Paragraph("\n"));

            // Totaux
            doc.add(alignRight("Sous-total : " + order.getSubtotal() + " TND"));
            doc.add(alignRight("TVA : " + order.getTaxAmount() + " TND"));
            doc.add(alignRight("Livraison : " + order.getShippingAmount() + " TND"));
            if (order.getDiscountAmount().signum() > 0) {
                doc.add(alignRight("Remise : -" + order.getDiscountAmount() + " TND"));
            }
            doc.add(alignRight("TOTAL : " + order.getTotalAmount() + " TND").setBold().setFontSize(14));

            doc.add(new Paragraph("\n\nMerci pour votre confiance !")
                    .setTextAlignment(TextAlignment.CENTER).setItalic());

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new com.brnsmrt.africanet.exception.InvoiceGenerationException("Erreur génération facture PDF", e);
        }
    }

    private Cell headerCell(String text) {
        return new Cell().add(new Paragraph(text).setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY);
    }

    private Paragraph alignRight(String text) {
        return new Paragraph(text).setTextAlignment(TextAlignment.RIGHT);
    }
}