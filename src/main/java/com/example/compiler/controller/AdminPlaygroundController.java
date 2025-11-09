package com.example.compiler.controller;

import com.example.compiler.model.*;
import com.example.compiler.repo.ProblemRepository;
import com.example.compiler.service.JavaRunnerService;
import com.example.compiler.service.llm.LLMService;
import com.example.compiler.compare.OutputComparator;
import com.example.compiler.compare.OutputComparatorFactory;
import com.example.compiler.config.ComparisonConfig;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(path = "/api/admin/playground", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminPlaygroundController {

    private final ProblemRepository repo;
    private final JavaRunnerService runner = new JavaRunnerService();
    private final OutputComparatorFactory comparatorFactory;
    private final ComparisonConfig comparisonConfig;
    private final LLMService llmService;

    public AdminPlaygroundController(ProblemRepository repo, OutputComparatorFactory comparatorFactory, ComparisonConfig comparisonConfig, LLMService llmService) {
        this.repo = repo;
        this.comparatorFactory = comparatorFactory;
        this.comparisonConfig = comparisonConfig;
        this.llmService = llmService;
    }

    public static class GenerateRequest {
        public String problemId;
        public String prompt;
    }

    public static class GenerateResponse {
        public String code;
        public String notes;
        public GenerateResponse(String code, String notes) {
            this.code = code;
            this.notes = notes;
        }
    }

    @PostMapping(path = "/generate", consumes = MediaType.APPLICATION_JSON_VALUE)
    public GenerateResponse generate(@RequestBody GenerateRequest req) throws Exception {
        Problem p = repo.findById(req.problemId).orElseThrow(() -> new IllegalArgumentException("Problem not found: " + req.problemId));
        LLMService.GenerationResult gr = llmService.generateSolution(p, req.prompt);
        return new GenerateResponse(gr.code, gr.notes);
    }

    @PostMapping(path = "/execute", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SolutionRunResponse execute(@RequestBody SolutionRunRequest req) throws Exception {
        Problem p = repo.findById(req.getProblemId()).orElseThrow(() -> new IllegalArgumentException("Problem not found: " + req.getProblemId()));
        List<TestCase> tests = repo.findAllTestCasesByProblemId(p.getId());
        List<TestCaseResult> results = new ArrayList<>();
        OutputComparator comparator = comparatorFactory.get(comparisonConfig.forProblem(p.getId()));
        for (TestCase tc : tests) {
            JavaRunnerService.Result r = runner.compileAndRun(req.getCode(), tc.getInput());
            boolean passed = comparator.compare(tc.getExpectedOutput(), r.stdout) && r.exitCode == 0;
            results.add(new TestCaseResult(tc.getInput(), tc.getExpectedOutput(), r.stdout, r.stderr, r.exitCode, r.durationMs, passed, null));
        }
        boolean allPassed = results.stream().allMatch(TestCaseResult::isPassed);
        return new SolutionRunResponse(p.getId(), allPassed, results);
    }
}