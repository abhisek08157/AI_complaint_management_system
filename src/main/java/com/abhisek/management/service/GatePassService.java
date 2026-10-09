
package com.abhisek.management.service;

import com.abhisek.management.dto.GatePassCreateRequest;
import com.abhisek.management.dto.GatePassLogResponse;
import com.abhisek.management.dto.GatePassResponse;
import com.abhisek.management.dto.GatePassStatusRequest;
import com.abhisek.management.dto.GatePassVerificationResponse;
import com.abhisek.management.dto.GatePassVerifyRequest;
import com.abhisek.management.entity.GatePass;
import com.abhisek.management.entity.GatePassLog;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.GatePassLogRepository;
import com.abhisek.management.repository.GatePassRepository;
import com.abhisek.management.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class GatePassService {

    private final GatePassRepository gatePassRepository;
    private final GatePassLogRepository gatePassLogRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public GatePassService(
            GatePassRepository gatePassRepository,
            GatePassLogRepository gatePassLogRepository,
            CurrentUserService currentUserService,
            NotificationService notificationService,
            UserRepository userRepository) {

        this.gatePassRepository = gatePassRepository;
        this.gatePassLogRepository = gatePassLogRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // STUDENT - CREATE GATE PASS

    @Transactional
    public GatePassResponse createGatePass(GatePassCreateRequest request) {

        User student = currentUserService.getCurrentUser();

        if (!"STUDENT".equalsIgnoreCase(student.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can apply for gate passes");
        }

        validateCreateRequest(request);

        if (!request.getExpectedReturnTime().isAfter(request.getOutTime())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Expected return time must be after out time");
        }

        GatePass gatePass = new GatePass();
        gatePass.setPassCode(generatePassCode());
        gatePass.setQrToken(generateQrToken());
        gatePass.setReason(request.getReason().trim());
        gatePass.setDestination(request.getDestination().trim());
        gatePass.setOutTime(request.getOutTime());
        gatePass.setExpectedReturnTime(request.getExpectedReturnTime());
        gatePass.setStudent(student);
        gatePass.setStatus("PENDING");

        GatePass saved = gatePassRepository.save(gatePass);

        List<User> wardens = userRepository.findByRole("HOSTEL_WARDEN");

        for (User warden : wardens) {
            notificationService.createNotification(
                    warden,
                    "New Gate Pass Request",
                    "A new gate pass request has been submitted by "
                            + student.getEmail()
                            + ". Gate Pass ID: "
                            + saved.getId(),
                    "GATE_PASS");
        }

        return new GatePassResponse(saved);
    }

    // STUDENT - GET MY PASSES

    @Transactional(readOnly = true)
    public List<GatePassResponse> getMyGatePasses() {

        User student = currentUserService.getCurrentUser();

        if (!"STUDENT".equalsIgnoreCase(student.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can access their gate passes");
        }

        return gatePassRepository
                .findByStudentOrderByCreatedAtDesc(student)
                .stream()
                .map(GatePassResponse::new)
                .toList();
    }

    // STUDENT / ADMIN / WARDEN / SECURITY - GET PASS BY ID

    @Transactional(readOnly = true)
    public GatePassResponse getGatePassById(Long id) {

        GatePass gatePass = gatePassRepository.findByIdWithStudent(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Gate pass not found"));

        User currentUser = currentUserService.getCurrentUser();
        String role = currentUser.getRole();

        if ("ADMIN".equalsIgnoreCase(role)
                || "HOSTEL_WARDEN".equalsIgnoreCase(role)
                || "SECURITY".equalsIgnoreCase(role)) {
            return new GatePassResponse(gatePass);
        }

        if ("STUDENT".equalsIgnoreCase(role)) {
            if (gatePass.getStudent() == null
                    || !gatePass.getStudent().getId()
                            .equals(currentUser.getId())) {
                throw new ApiException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to view this gate pass");
            }

            return new GatePassResponse(gatePass);
        }

        throw new ApiException(
                HttpStatus.FORBIDDEN,
                "You are not allowed to view this gate pass");
    }

    // WARDEN - GET ALL GATE PASSES

    @Transactional(readOnly = true)
    public List<GatePassResponse> getWardenGatePasses() {

        User warden = currentUserService.getCurrentUser();

        if (!"HOSTEL_WARDEN".equalsIgnoreCase(warden.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only hostel warden can manage gate passes");
        }

        return gatePassRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(GatePassResponse::new)
                .toList();
    }

    // WARDEN - APPROVE / REJECT

    @Transactional
    public GatePassResponse updateGatePassDecision(
            Long id,
            GatePassStatusRequest request) {

        User warden = currentUserService.getCurrentUser();

        if (!"HOSTEL_WARDEN".equalsIgnoreCase(warden.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only hostel warden can approve or reject gate passes");
        }

        GatePass gatePass = gatePassRepository.findByIdWithStudent(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Gate pass not found"));

        if (!"PENDING".equalsIgnoreCase(gatePass.getStatus())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending gate passes can be approved or rejected");
        }

        if (request == null
                || request.getStatus() == null
                || request.getStatus().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Gate pass status is required");
        }

        String status = request.getStatus().trim().toUpperCase();

        if (!status.equals("APPROVED") && !status.equals("REJECTED")) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be APPROVED or REJECTED");
        }

        if (request.getWardenRemarks() == null
                || request.getWardenRemarks().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Warden remarks are required");
        }

        gatePass.setStatus(status);
        gatePass.setWardenRemarks(request.getWardenRemarks().trim());

        if ("APPROVED".equals(status)) {
            gatePass.setApprovedAt(LocalDateTime.now());
            gatePass.setExpiresAt(gatePass.getExpectedReturnTime());
        }

        GatePass updated = gatePassRepository.save(gatePass);

        if (gatePass.getStudent() != null) {
            String title = "APPROVED".equals(status)
                    ? "Gate Pass Approved"
                    : "Gate Pass Rejected";

            notificationService.createNotification(
                    gatePass.getStudent(),
                    title,
                    "Your gate pass #" + updated.getId()
                            + " has been " + status.toLowerCase() + ".",
                    "GATE_PASS");
        }

        return new GatePassResponse(updated);
    }

    // ADMIN - GET ALL PASSES

    @Transactional(readOnly = true)
    public List<GatePassResponse> getAllGatePasses() {

        User admin = currentUserService.getCurrentUser();

        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only admin can view all gate passes");
        }

        return gatePassRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(GatePassResponse::new)
                .toList();
    }

    // SECURITY - VERIFY QR

    @Transactional
    public GatePassVerificationResponse verifyGatePass(
            GatePassVerifyRequest request) {

        User security = currentUserService.getCurrentUser();

        if (!"SECURITY".equalsIgnoreCase(security.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only security personnel can verify gate passes");
        }

        if (request == null
                || request.getQrToken() == null
                || request.getQrToken().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "QR token is required");
        }

        if (request.getAction() == null
                || request.getAction().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Action is required");
        }

        String action = request.getAction().trim().toUpperCase();

        if (!action.equals("EXIT") && !action.equals("ENTRY")) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Action must be EXIT or ENTRY");
        }

        GatePass gatePass = gatePassRepository
                .findByQrToken(request.getQrToken().trim())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Invalid QR token"));

        if (!"APPROVED".equalsIgnoreCase(gatePass.getStatus())
                && !"OUTSIDE".equalsIgnoreCase(gatePass.getStatus())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Gate pass is not active");
        }

        if (gatePass.getExpiresAt() != null
                && LocalDateTime.now().isAfter(gatePass.getExpiresAt())) {

            gatePass.setStatus("EXPIRED");
            gatePassRepository.save(gatePass);

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Gate pass has expired");
        }

        if ("EXIT".equals(action)) {

            if (!"APPROVED".equalsIgnoreCase(gatePass.getStatus())) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "Gate pass is not ready for exit");
            }

            gatePass.setStatus("OUTSIDE");
            saveLog(gatePass, "EXIT", security);

        } else {

            if (!"OUTSIDE".equalsIgnoreCase(gatePass.getStatus())) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "Student has not exited using this pass");
            }

            gatePass.setStatus("COMPLETED");
            saveLog(gatePass, "ENTRY", security);
        }

        GatePass updated = gatePassRepository.save(gatePass);

        if (gatePass.getStudent() != null) {
            String title = "EXIT".equals(action)
                    ? "Gate Pass EXIT Verified"
                    : "Gate Pass ENTRY Verified";

            notificationService.createNotification(
                    gatePass.getStudent(),
                    title,
                    "Your gate pass #" + updated.getId()
                            + " has been verified for " + action + ".",
                    "GATE_PASS");
        }

        return new GatePassVerificationResponse(
                true,
                action + " verified successfully",
                action,
                new GatePassResponse(updated));
    }

    // SECURITY - GET LOGS
    // Return DTOs instead of JPA entities to avoid lazy-loading
    // errors when Jackson serializes the response.

    @Transactional(readOnly = true)
    public List<GatePassLogResponse> getGatePassLogs(Long gatePassId) {

        User security = currentUserService.getCurrentUser();

        if (!"SECURITY".equalsIgnoreCase(security.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only security personnel can view gate pass logs");
        }

        GatePass gatePass = gatePassRepository.findById(gatePassId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Gate pass not found"));

        return gatePassLogRepository
                .findByGatePassOrderByScannedAtDesc(gatePass)
                .stream()
                .map(GatePassLogResponse::new)
                .toList();
    }

    // CREATE LOG

    private void saveLog(
            GatePass gatePass,
            String action,
            User security) {

        GatePassLog log = new GatePassLog();
        log.setGatePass(gatePass);
        log.setAction(action);
        log.setVerifiedBy(security);

        gatePassLogRepository.save(log);
    }

    // VALIDATION

    private void validateCreateRequest(GatePassCreateRequest request) {

        if (request == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Gate pass request cannot be empty");
        }

        if (request.getReason() == null
                || request.getReason().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Reason is required");
        }

        if (request.getDestination() == null
                || request.getDestination().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Destination is required");
        }

        if (request.getOutTime() == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Out time is required");
        }

        if (request.getExpectedReturnTime() == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Expected return time is required");
        }

        if (request.getOutTime().isBefore(LocalDateTime.now())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Out time cannot be in the past");
        }
    }

    // GENERATE PASS CODE

    private String generatePassCode() {
        return "GP-" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    // GENERATE QR TOKEN

    private String generateQrToken() {
        return UUID.randomUUID().toString();
    }
}
