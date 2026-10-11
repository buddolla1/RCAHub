package com.syf.rcahub.controller;

import com.syf.rcahub.dto.PageResponse;
import com.syf.rcahub.dto.RcaRequest;
import com.syf.rcahub.dto.RcaResponse;
import com.syf.rcahub.dto.RcaSearchCriteria;
import com.syf.rcahub.service.RcaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/rcas")
public class RcaController {

    private final RcaService rcaService;

    public RcaController(RcaService rcaService) {
        this.rcaService = rcaService;
    }

    @PostMapping
    public ResponseEntity<RcaResponse> create(@Valid @RequestBody RcaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rcaService.create(request));
    }

    @GetMapping
    public PageResponse<RcaResponse> findAll(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) String incidentNumber,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String application,
            @RequestParam(required = false) String rcaStatus,
            @RequestParam(required = false) @Min(1) @Max(12) Integer month,
            @RequestParam(required = false) @Min(2000) @Max(9999) Integer year) {
        return rcaService.findAll(new RcaSearchCriteria(
                page, size, sortBy, sortDirection, incidentNumber, priority,
                application, rcaStatus, month, year));
    }

    @GetMapping("/{id}")
    public RcaResponse findById(@PathVariable @Min(1) long id) {
        return rcaService.findById(id);
    }

    @PutMapping("/{id}")
    public RcaResponse update(@PathVariable @Min(1) long id,
                              @Valid @RequestBody RcaRequest request) {
        return rcaService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Min(1) long id) {
        rcaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
