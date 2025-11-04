package com.example.compiler.controller;

import com.example.compiler.model.*;
import com.example.compiler.repo.ProblemRepository;
import com.example.compiler.service.JavaRunnerService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import com.example.compiler.util.TextUtils;
import com.example.compiler.compare.*;
import com.example.compiler.config.ComparisonConfig;

@RestController
@RequestMapping(path = "/api/solutions", produces = MediaType.APPLICATION_JSON_VALUE)
public class SolutionsController {
    private final JavaRunnerService runner = new JavaRunnerService();
    private final ProblemRepository repo;
    private final OutputComparatorFactory comparatorFactory;
    private final ComparisonConfig comparisonConfig;

    public SolutionsController(ProblemRepository repo, OutputComparatorFactory comparatorFactory, ComparisonConfig comparisonConfig) {
        this.repo = repo;
        this.comparatorFactory = comparatorFactory;
        this.comparisonConfig = comparisonConfig;
    }

    @PostMapping(path = "/run", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SolutionRunResponse run(@RequestBody SolutionRunRequest req) throws Exception {
        Problem p = repo.findById(req.getProblemId()).orElseThrow(() -> new IllegalArgumentException("Problem not found: " + req.getProblemId()));
        List<TestCase> samples = repo.findTestCasesByProblemId(p.getId());

        List<TestCaseResult> results = new ArrayList<>();
        ComparatorMode mode = comparisonConfig.forProblem(p.getId());
        OutputComparator comparator = comparatorFactory.get(mode);
        for (TestCase tc : samples) {
            JavaRunnerService.Result r = runner.compileAndRun(req.getCode(), tc.getInput());
            boolean passed = comparator.compare(tc.getExpectedOutput(), r.stdout) && r.exitCode == 0;
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

    // Normalization moved to TextUtils.normalizeOutput
}