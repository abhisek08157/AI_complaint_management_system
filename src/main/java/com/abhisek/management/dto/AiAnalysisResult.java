package com.abhisek.management.dto;

public class AiAnalysisResult {

    private Long complaintId;
    private String category;
    private String priority;
    private String summary;
    private String department;
    private Confidence confidence;
    private Entities entities;
    private boolean possibleRecurringIssue;
    private String reason;

    public AiAnalysisResult() {
    }

    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Confidence getConfidence() {
        return confidence;
    }

    public void setConfidence(Confidence confidence) {
        this.confidence = confidence;
    }

    public Entities getEntities() {
        return entities;
    }

    public void setEntities(Entities entities) {
        this.entities = entities;
    }

    public boolean isPossibleRecurringIssue() {
        return possibleRecurringIssue;
    }

    public void setPossibleRecurringIssue(boolean possibleRecurringIssue) {
        this.possibleRecurringIssue = possibleRecurringIssue;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }


    // ============================================================
    // CONFIDENCE
    // ============================================================

    public static class Confidence {

        private double category;
        private double priority;
        private double department;

        public Confidence() {
        }

        public double getCategory() {
            return category;
        }

        public void setCategory(double category) {
            this.category = category;
        }

        public double getPriority() {
            return priority;
        }

        public void setPriority(double priority) {
            this.priority = priority;
        }

        public double getDepartment() {
            return department;
        }

        public void setDepartment(double department) {
            this.department = department;
        }
    }


    // ============================================================
    // ENTITIES
    // ============================================================

    public static class Entities {

        private String block;
        private String room;
        private String facility;
        private String issue;

        public Entities() {
        }

        public String getBlock() {
            return block;
        }

        public void setBlock(String block) {
            this.block = block;
        }

        public String getRoom() {
            return room;
        }

        public void setRoom(String room) {
            this.room = room;
        }

        public String getFacility() {
            return facility;
        }

        public void setFacility(String facility) {
            this.facility = facility;
        }

        public String getIssue() {
            return issue;
        }

        public void setIssue(String issue) {
            this.issue = issue;
        }
    }
}