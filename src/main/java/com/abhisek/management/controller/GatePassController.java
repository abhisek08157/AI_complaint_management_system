
package com.abhisek.management.controller;

import com.abhisek.management.dto.GatePassCreateRequest;
import com.abhisek.management.dto.GatePassLogResponse;
import com.abhisek.management.dto.GatePassResponse;
import com.abhisek.management.dto.GatePassStatusRequest;
import com.abhisek.management.dto.GatePassVerificationResponse;
import com.abhisek.management.dto.GatePassVerifyRequest;
import com.abhisek.management.service.GatePassService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gate-passes")
public class GatePassController {

    private final GatePassService gatePassService;

    public GatePassController(GatePassService gatePassService) {
        this.gatePassService = gatePassService;
    }

    // STUDENT - CREATE GATE PASS

    @PostMapping
    public ResponseEntity<GatePassResponse> createGatePass(
            @RequestBody GatePassCreateRequest request) {

        GatePassResponse response =
                gatePassService.createGatePass(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // STUDENT - GET MY GATE PASSES

    @GetMapping("/my")
    public ResponseEntity<List<GatePassResponse>> getMyGatePasses() {

        return ResponseEntity.ok(
                gatePassService.getMyGatePasses()
        );
    }

    // GET GATE PASS BY ID

    @GetMapping("/{id}")
    public ResponseEntity<GatePassResponse> getGatePassById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                gatePassService.getGatePassById(id)
        );
    }

    // WARDEN - GET ALL GATE PASSES

    @GetMapping("/warden")
    public ResponseEntity<List<GatePassResponse>> getWardenGatePasses() {

        return ResponseEntity.ok(
                gatePassService.getWardenGatePasses()
        );
    }

    // WARDEN - APPROVE OR REJECT

    @PutMapping("/{id}/decision")
    public ResponseEntity<GatePassResponse> updateGatePassDecision(
            @PathVariable Long id,
            @RequestBody GatePassStatusRequest request) {

        return ResponseEntity.ok(
                gatePassService.updateGatePassDecision(id, request)
        );
    }

    // ADMIN - GET ALL GATE PASSES

    @GetMapping("/admin")
    public ResponseEntity<List<GatePassResponse>> getAllGatePasses() {

        return ResponseEntity.ok(
                gatePassService.getAllGatePasses()
        );
    }

    // SECURITY - VERIFY QR TOKEN

    @PostMapping("/verify")
    public ResponseEntity<GatePassVerificationResponse> verifyGatePass(
            @RequestBody GatePassVerifyRequest request) {

        return ResponseEntity.ok(
                gatePassService.verifyGatePass(request)
        );
    }

    // SECURITY - GET GATE PASS LOGS

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<GatePassLogResponse>> getGatePassLogs(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                gatePassService.getGatePassLogs(id)
        );
    }
}
