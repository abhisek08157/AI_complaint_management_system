package com.abhisek.management.service;

import com.abhisek.management.dto.AiAnalysisResult;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    // TODO (AI teammate): replace the logic inside these methods with something
    // smarter, or call Gemini/OpenAI here later. Keep the method name and
    // return type the same so ComplaintService doesn't need any changes.
    public AiAnalysisResult analyzeComplaint(String title, String description) {

        String text = (title + " " + description).toLowerCase();

        String category = detectCategory(text);
        String priority = detectPriority(text);
        String summary = generateSummary(title, description);

        return new AiAnalysisResult(category, priority, summary);
    }

    private String detectCategory(String text) {
        if (text.contains("fan") || text.contains("light") || text.contains("wire") || text.contains("switch")) {
            return "ELECTRICAL";
        }
        if (text.contains("water") || text.contains("leak") || text.contains("tap") || text.contains("pipe")) {
            return "PLUMBING";
        }
        if (text.contains("wifi") || text.contains("internet") || text.contains("network")) {
            return "NETWORKING";
        }
        if (text.contains("chair") || text.contains("desk") || text.contains("table") || text.contains("bench")) {
            return "FURNITURE";
        }
        if (text.contains("dirty") || text.contains("clean") || text.contains("trash") || text.contains("garbage")) {
            return "CLEANING";
        }
        return "OTHER";
    }

    private String detectPriority(String text) {
        if (text.contains("fire") || text.contains("spark") || text.contains("shock") || text.contains("danger")) {
            return "CRITICAL";
        }
        if (text.contains("not working") || text.contains("broken") || text.contains("leak")) {
            return "HIGH";
        }
        if (text.contains("noise") || text.contains("slow")) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private String generateSummary(String title, String description) {
        String combined = title + " - " + description;
        return combined.length() > 120 ? combined.substring(0, 120) + "..." : combined;
    }
}