package com.example.compiler.controller;

import com.example.compiler.model.Problem;
import com.example.compiler.model.ProblemPack;
import com.example.compiler.model.TestCase;
import com.example.compiler.repo.ProblemRepository;
import com.example.compiler.service.ProblemImportExportService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/problems", produces = MediaType.APPLICATION_JSON_VALUE)
public class ProblemsController {

    private final ProblemRepository repo;
    private final ProblemImportExportService importExportService;

    public ProblemsController(ProblemRepository repo) {
        this.repo = repo;
        this.importExportService = new ProblemImportExportService(repo);
    }

    @GetMapping
    public List<Problem> list() {
        return repo.findAll();
    }

    @GetMapping(path = "/{id}")
    public Problem get(@PathVariable String id) {
        Problem base = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Problem not found: " + id));
        List<TestCase> samples = repo.findTestCasesByProblemId(id);
        // Recompose Problem with samples to maintain backward compatibility
        return new Problem(base.getId(), base.getTitle(), base.getStatement(), base.getInputSpec(), base.getOutputSpec(), samples, base.getConstraints());
    }

    @GetMapping(path = "/{id}/export")
    public ProblemPack export(@PathVariable String id) {
        return importExportService.exportPack(id);
    }

    @PostMapping(path = "/import", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void importPack(@RequestBody ProblemPack pack) {
        importExportService.importPack(pack);
    }
}