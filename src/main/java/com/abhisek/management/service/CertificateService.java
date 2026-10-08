package com.abhisek.management.service;

import com.abhisek.management.entity.CampusRequest;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class CertificateService {

    public byte[] generateCertificate(CampusRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Campus request cannot be null"
            );
        }

        if (!"APPROVED".equalsIgnoreCase(request.getStatus())
                && !"COMPLETED".equalsIgnoreCase(request.getStatus())) {

            throw new IllegalArgumentException(
                    "Certificate is available only for approved requests"
            );
        }

        try (PDDocument document = new PDDocument()) {

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content =
                         new PDPageContentStream(document, page)) {

                float pageWidth = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();

                // ----------------------------------------------------
                // BORDER
                // ----------------------------------------------------

                content.setLineWidth(2);

                content.addRect(
                        35,
                        35,
                        pageWidth - 70,
                        pageHeight - 70
                );

                content.stroke();

                content.setLineWidth(1);

                content.addRect(
                        45,
                        45,
                        pageWidth - 90,
                        pageHeight - 90
                );

                content.stroke();

                // ----------------------------------------------------
                // TITLE
                // ----------------------------------------------------

                PDType1Font boldFont =
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA_BOLD
                        );

                PDType1Font normalFont =
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA
                        );

                writeCentered(
                        content,
                        "CAMPUSONE",
                        boldFont,
                        24,
                        pageWidth,
                        pageHeight - 120
                );

                writeCentered(
                        content,
                        "CERTIFICATE",
                        boldFont,
                        20,
                        pageWidth,
                        pageHeight - 155
                );

                // ----------------------------------------------------
                // CERTIFICATE TYPE
                // ----------------------------------------------------

                String certificateType =
                        getCertificateTitle(
                                request.getRequestType()
                        );

                writeCentered(
                        content,
                        certificateType,
                        boldFont,
                        16,
                        pageWidth,
                        pageHeight - 205
                );

                // ----------------------------------------------------
                // BODY
                // ----------------------------------------------------

                float y = pageHeight - 280;

                writeCentered(
                        content,
                        "This is to certify that",
                        normalFont,
                        13,
                        pageWidth,
                        y
                );

                y -= 45;

                String studentName =
                        request.getUser() != null
                                ? request.getUser().getName()
                                : "Student";

                writeCentered(
                        content,
                        studentName,
                        boldFont,
                        20,
                        pageWidth,
                        y
                );

                y -= 50;

                writeCentered(
                        content,
                        "has submitted a valid campus request",
                        normalFont,
                        13,
                        pageWidth,
                        y
                );

                y -= 25;

                writeCentered(
                        content,
                        "through the CampusOne Campus Operations Platform.",
                        normalFont,
                        13,
                        pageWidth,
                        y
                );

                y -= 50;

                writeCentered(
                        content,
                        "Request ID: " + request.getId(),
                        normalFont,
                        12,
                        pageWidth,
                        y
                );

                y -= 25;

                writeCentered(
                        content,
                        "Request Type: " + certificateType,
                        normalFont,
                        12,
                        pageWidth,
                        y
                );

                // ----------------------------------------------------
                // DESCRIPTION
                // ----------------------------------------------------

                y -= 55;

                writeCentered(
                        content,
                        "Request Description:",
                        boldFont,
                        12,
                        pageWidth,
                        y
                );

                y -= 25;

                String description =
                        request.getDescription() == null
                                ? ""
                                : request.getDescription();

                writeCentered(
                        content,
                        truncate(description, 90),
                        normalFont,
                        11,
                        pageWidth,
                        y
                );

                // ----------------------------------------------------
                // APPROVAL
                // ----------------------------------------------------

                y -= 60;

                writeCentered(
                        content,
                        "Status: APPROVED",
                        boldFont,
                        13,
                        pageWidth,
                        y
                );

                if (request.getCompletedAt() != null) {

                    y -= 25;

                    writeCentered(
                            content,
                            "Completion Date: "
                                    + request.getCompletedAt()
                                    .toLocalDate(),
                            normalFont,
                            11,
                            pageWidth,
                            y
                    );
                }

                // ----------------------------------------------------
                // FOOTER
                // ----------------------------------------------------

                writeCentered(
                        content,
                        "Generated by CampusOne",
                        normalFont,
                        10,
                        pageWidth,
                        75
                );
            }

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            document.save(output);

            return output.toByteArray();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to generate certificate",
                    e
            );
        }
    }

    private String getCertificateTitle(String requestType) {

        if (requestType == null ||
                requestType.isBlank()) {

            return "CAMPUS CERTIFICATE";
        }

        return switch (
                requestType.trim().toUpperCase()
        ) {

            case "BONAFIDE" ->
                    "BONAFIDE CERTIFICATE";

            case "CHARACTER" ->
                    "CHARACTER CERTIFICATE";

            case "STUDENT_ID" ->
                    "STUDENT CERTIFICATE";

            case "HOSTEL" ->
                    "HOSTEL CERTIFICATE";

            default ->
                    requestType.trim().toUpperCase()
                            + " CERTIFICATE";
        };
    }

    private void writeCentered(
            PDPageContentStream content,
            String text,
            PDType1Font font,
            float fontSize,
            float pageWidth,
            float y) throws IOException {

        if (text == null) {
            text = "";
        }

        text = sanitize(text);

        float textWidth =
                font.getStringWidth(text)
                        / 1000
                        * fontSize;

        float x =
                (pageWidth - textWidth) / 2;

        content.beginText();

        content.setFont(font, fontSize);

        content.newLineAtOffset(x, y);

        content.showText(text);

        content.endText();
    }

    private String sanitize(String text) {

        return text
                .replace("\n", " ")
                .replace("\r", " ")
                .replace("\t", " ");
    }

    private String truncate(
            String text,
            int maxLength) {

        if (text == null) {
            return "";
        }

        if (text.length() <= maxLength) {
            return text;
        }

        return text.substring(0, maxLength - 3)
                + "...";
    }
}