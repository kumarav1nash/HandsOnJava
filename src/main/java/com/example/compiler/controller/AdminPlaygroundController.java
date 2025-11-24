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

    // ---------- Generate and save test cases ----------
    public static class GenerateCasesRequest {
        public String problemId;
        public String code;
        public Integer count;
    }

    public static class GeneratedCaseResult {
        public String input;
        public String expectedOutput;
        public String actualOutput;
        public String stderr;
        public int exitCode;
        public long durationMs;
        public boolean passed;
        public GeneratedCaseResult(String input, String expectedOutput, String actualOutput, String stderr, int exitCode, long durationMs, boolean passed) {
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.actualOutput = actualOutput;
            this.stderr = stderr;
            this.exitCode = exitCode;
            this.durationMs = durationMs;
            this.passed = passed;
        }
    }

    public static class GenerateCasesResponse {
        public String problemId;
        public List<GeneratedCaseResult> cases;
        public GenerateCasesResponse(String problemId, List<GeneratedCaseResult> cases) {
            this.problemId = problemId;
            this.cases = cases;
        }
    }

    @PostMapping(path = "/generate-testcases", consumes = MediaType.APPLICATION_JSON_VALUE)
    public GenerateCasesResponse generateCases(@RequestBody GenerateCasesRequest req) throws Exception {
        Problem p = repo.findById(req.problemId).orElseThrow(() -> new IllegalArgumentException("Problem not found: " + req.problemId));
        int count = req.count == null ? 5 : req.count;
        List<LLMService.GeneratedCase> generated = llmService.generateTestCases(p, req.code, count);

        // Validate each by running the provided code and comparing outputs
        OutputComparator comparator = comparatorFactory.get(comparisonConfig.forProblem(p.getId()));
        List<GeneratedCaseResult> results = new ArrayList<>();
        for (LLMService.GeneratedCase gc : generated) {
            JavaRunnerService.Result r = runner.compileAndRun(req.code, gc.input);
            boolean passed = comparator.compare(gc.expectedOutput, r.stdout) && r.exitCode == 0;
            results.add(new GeneratedCaseResult(gc.input, gc.expectedOutput, r.stdout, r.stderr, r.exitCode, r.durationMs, passed));
        }
        return new GenerateCasesResponse(p.getId(), results);
    }

    public static class SaveCasesRequest {
        public String problemId;
        public List<TestCase> cases;
        public Boolean hidden; // if true, mark as non-sample
    }

    @PostMapping(path = "/save-testcases", consumes = MediaType.APPLICATION_JSON_VALUE)
    public java.util.Map<String, Object> saveCases(@RequestBody SaveCasesRequest req) {
        Problem p = repo.findById(req.problemId).orElseThrow(() -> new IllegalArgumentException("Problem not found: " + req.problemId));
        boolean hidden = req.hidden != null && req.hidden;
        int saved = 0;
        if (req.cases != null) {
            for (TestCase tc : req.cases) {
                TestCase toSave = new TestCase(tc.getInput(), tc.getExpectedOutput(), !hidden); // sample = !hidden
                repo.saveTestCase(p.getId(), toSave, !hidden);
                saved++;
            }
        }
        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("problemId", p.getId());
        resp.put("saved", saved);
        resp.put("hidden", hidden);
        return resp;
    }
}