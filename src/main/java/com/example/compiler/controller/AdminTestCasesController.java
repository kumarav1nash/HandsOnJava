package com.example.compiler.controller;

import com.example.compiler.model.AdminTestCaseRequest;
import com.example.compiler.model.TestCase;
import com.example.compiler.repo.ProblemRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/admin/problems/{problemId}/testcases", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminTestCasesController {
    private final ProblemRepository repo;

    public AdminTestCasesController(ProblemRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<TestCase> listAll(@PathVariable String problemId) {
        return repo.findAllTestCasesByProblemId(problemId);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public void add(@PathVariable String problemId, @RequestBody AdminTestCaseRequest req) {
        validate(req);
        repo.saveTestCase(problemId, new TestCase(req.getInput(), req.getExpectedOutput()), req.isSample());
    }

    @DeleteMapping
    public void deleteAll(@PathVariable String problemId) {
        repo.deleteTestCasesByProblemId(problemId);
    }

    private void validate(AdminTestCaseRequest req) {
        if (req.getInput() == null) throw new IllegalArgumentException("Input is required");
        if (req.getExpectedOutput() == null) throw new IllegalArgumentException("Expected output is required");
    }
}