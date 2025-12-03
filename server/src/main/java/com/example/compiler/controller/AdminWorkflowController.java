package com.example.compiler.controller;

import com.example.compiler.model.ProblemStatus;
import com.example.compiler.model.AuditRecord;
import com.example.compiler.repo.ProblemRepository;
import com.example.compiler.service.WorkflowService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/admin/problems/{id}/workflow", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminWorkflowController {
    private final ProblemRepository repo;
    private final WorkflowService workflow;

    public AdminWorkflowController(ProblemRepository repo, WorkflowService workflow) {
        this.repo = repo;
        this.workflow = workflow;
    }

    private void ensureProblemExists(String id) {
        repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Problem not found: " + id));
    }

    @GetMapping(path = "/status")
    public ProblemStatus status(@PathVariable String id) {
        ensureProblemExists(id);
        return workflow.getStatus(id);
    }

    @GetMapping(path = "/audit")
    public List<AuditRecord> audit(@PathVariable String id) {
        ensureProblemExists(id);
        return workflow.getAudit(id);
    }

    public static class ActionRequest {
        public String actor; // optional, default "admin"
        public String comment;
    }

    @PostMapping(path = "/submit", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ProblemStatus submit(@PathVariable String id, @RequestBody ActionRequest req) {
        ensureProblemExists(id);
        String actor = (req != null && req.actor != null && !req.actor.isEmpty()) ? req.actor : "admin";
        return workflow.submitForReview(id, actor, req == null ? null : req.comment);
    }

    @PostMapping(path = "/request-changes", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ProblemStatus requestChanges(@PathVariable String id, @RequestBody ActionRequest req) {
        ensureProblemExists(id);
        String actor = (req != null && req.actor != null && !req.actor.isEmpty()) ? req.actor : "admin";
        return workflow.requestChanges(id, actor, req == null ? null : req.comment);
    }

    @PostMapping(path = "/publish", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ProblemStatus publish(@PathVariable String id, @RequestBody ActionRequest req) {
        ensureProblemExists(id);
        String actor = (req != null && req.actor != null && !req.actor.isEmpty()) ? req.actor : "admin";
        return workflow.publish(id, actor, req == null ? null : req.comment);
    }

    @PostMapping(path = "/revert", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ProblemStatus revert(@PathVariable String id, @RequestBody ActionRequest req) {
        ensureProblemExists(id);
        String actor = (req != null && req.actor != null && !req.actor.isEmpty()) ? req.actor : "admin";
        return workflow.revertToDraft(id, actor, req == null ? null : req.comment);
    }
}