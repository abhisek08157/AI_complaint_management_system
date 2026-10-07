package com.abhisek.management.dto;

public class AnalyticsDashboardResponse {

    private UserStats users;
    private ComplaintStats complaints;
    private RequestStats campusRequests;
    private GatePassStats gatePasses;
    private AnnouncementStats announcements;

    public AnalyticsDashboardResponse() {
    }

    public AnalyticsDashboardResponse(
            UserStats users,
            ComplaintStats complaints,
            RequestStats campusRequests,
            GatePassStats gatePasses,
            AnnouncementStats announcements) {

        this.users = users;
        this.complaints = complaints;
        this.campusRequests = campusRequests;
        this.gatePasses = gatePasses;
        this.announcements = announcements;
    }

    public UserStats getUsers() {
        return users;
    }

    public ComplaintStats getComplaints() {
        return complaints;
    }

    public RequestStats getCampusRequests() {
        return campusRequests;
    }

    public GatePassStats getGatePasses() {
        return gatePasses;
    }

    public AnnouncementStats getAnnouncements() {
        return announcements;
    }


    public static class UserStats {

        private long total;
        private long students;
        private long staff;
        private long wardens;
        private long security;
        private long admins;

        public UserStats() {
        }

        public UserStats(
                long total,
                long students,
                long staff,
                long wardens,
                long security,
                long admins) {

            this.total = total;
            this.students = students;
            this.staff = staff;
            this.wardens = wardens;
            this.security = security;
            this.admins = admins;
        }

        public long getTotal() {
            return total;
        }

        public long getStudents() {
            return students;
        }

        public long getStaff() {
            return staff;
        }

        public long getWardens() {
            return wardens;
        }

        public long getSecurity() {
            return security;
        }

        public long getAdmins() {
            return admins;
        }
    }


    public static class ComplaintStats {

        private long total;
        private long submitted;
        private long assigned;
        private long inProgress;
        private long resolved;

        public ComplaintStats() {
        }

        public ComplaintStats(
                long total,
                long submitted,
                long assigned,
                long inProgress,
                long resolved) {

            this.total = total;
            this.submitted = submitted;
            this.assigned = assigned;
            this.inProgress = inProgress;
            this.resolved = resolved;
        }

        public long getTotal() {
            return total;
        }

        public long getSubmitted() {
            return submitted;
        }

        public long getAssigned() {
            return assigned;
        }

        public long getInProgress() {
            return inProgress;
        }

        public long getResolved() {
            return resolved;
        }
    }


    public static class RequestStats {

        private long total;
        private long pending;
        private long underReview;
        private long approved;
        private long rejected;
        private long completed;

        public RequestStats() {
        }

        public RequestStats(
                long total,
                long pending,
                long underReview,
                long approved,
                long rejected,
                long completed) {

            this.total = total;
            this.pending = pending;
            this.underReview = underReview;
            this.approved = approved;
            this.rejected = rejected;
            this.completed = completed;
        }

        public long getTotal() {
            return total;
        }

        public long getPending() {
            return pending;
        }

        public long getUnderReview() {
            return underReview;
        }

        public long getApproved() {
            return approved;
        }

        public long getRejected() {
            return rejected;
        }

        public long getCompleted() {
            return completed;
        }
    }


    public static class GatePassStats {

        private long total;
        private long pending;
        private long approved;
        private long rejected;
        private long outside;
        private long completed;

        public GatePassStats() {
        }

        public GatePassStats(
                long total,
                long pending,
                long approved,
                long rejected,
                long outside,
                long completed) {

            this.total = total;
            this.pending = pending;
            this.approved = approved;
            this.rejected = rejected;
            this.outside = outside;
            this.completed = completed;
        }

        public long getTotal() {
            return total;
        }

        public long getPending() {
            return pending;
        }

        public long getApproved() {
            return approved;
        }

        public long getRejected() {
            return rejected;
        }

        public long getOutside() {
            return outside;
        }

        public long getCompleted() {
            return completed;
        }
    }


    public static class AnnouncementStats {

        private long total;
        private long draft;
        private long published;
        private long expired;

        public AnnouncementStats() {
        }

        public AnnouncementStats(
                long total,
                long draft,
                long published,
                long expired) {

            this.total = total;
            this.draft = draft;
            this.published = published;
            this.expired = expired;
        }

        public long getTotal() {
            return total;
        }

        public long getDraft() {
            return draft;
        }

        public long getPublished() {
            return published;
        }

        public long getExpired() {
            return expired;
        }
    }
}