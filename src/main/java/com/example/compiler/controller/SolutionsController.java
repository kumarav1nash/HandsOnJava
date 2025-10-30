package com.example.compiler.controller;

import com.example.compiler.model.*;
import com.example.compiler.repo.InMemoryProblemRepo;
import com.example.compiler.service.JavaRunnerService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(path = "/api/solutions", produces = MediaType.APPLICATION_JSON_VALUE)
public class SolutionsController {
    private final JavaRunnerService runner = new JavaRunnerService();

    @PostMapping(path = "/run", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SolutionRunResponse run(@RequestBody SolutionRunRequest req) throws Exception {
        Problem p = InMemoryProblemRepo.get(req.getProblemId());
        if (p == null) throw new IllegalArgumentException("Problem not found: " + req.getProblemId());

        List<TestCaseResult> results = new ArrayList<>();
        for (TestCase tc : p.getSamples()) {
            JavaRunnerService.Result r = runner.compileAndRun(req.getCode(), tc.getInput());
            boolean passed = normalize(r.stdout).equals(normalize(tc.getExpectedOutput())) && r.exitCode == 0;
            // Memory usage is not tracked for the external process; set null
            results.add(new TestCaseResult(tc.getInput(), tc.getExpectedOutput(), r.stdout, r.stderr, r.exitCode, r.durationMs, passed, null));
        }
        boolean allPassed = results.stream().allMatch(TestCaseResult::isPassed);
        return new SolutionRunResponse(p.getId(), allPassed, results);
    }

    @PostMapping(path = "/submit", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SolutionSubmitResponse submit(@RequestBody SolutionSubmitRequest req) throws Exception {
        // For demonstration, submission runs against the same sample tests and marks accepted only if all pass
        SolutionRunResponse run = run(new SolutionRunRequest() {{ setProblemId(req.getProblemId()); setCode(req.getCode()); setLanguage("java"); }});
        boolean accepted = run.isAllPassed();
        String message = accepted ? "Accepted" : "Rejected";
        return new SolutionSubmitResponse(run.getProblemId(), accepted, run.getResults(), message);
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().replaceAll("\\r\\n", "\n");
    }
}