package com.example.compiler.controller;

import com.example.compiler.model.Problem;
import com.example.compiler.model.ProblemPack;
import com.example.compiler.model.ProblemPage;
import com.example.compiler.model.TestCase;
import com.example.compiler.repo.ProblemRepository;
import com.example.compiler.service.ProblemImportExportService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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

    // Paginated listing with optional tag filtering
    @GetMapping(path = "/page")
    public ProblemPage listPaged(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "tags", required = false) String tags,
            @RequestParam(name = "mode", defaultValue = "any") String mode
    ) {
        List<Problem> all = repo.findAll();
        // Filter by tags if provided
        if (tags != null && !tags.trim().isEmpty()) {
            final String[] tagList = tags.split("\\s*[\\|, ]\\s*");
            final boolean requireAll = "all".equalsIgnoreCase(mode);
            all = all.stream().filter(p -> {
                List<String> ptags = p.getTags();
                if (ptags == null || ptags.isEmpty()) return false;
                if (requireAll) {
                    for (String t : tagList) {
                        if (t == null || t.isEmpty()) continue;
                        if (!ptags.contains(t)) return false;
                    }
                    return true;
                } else {
                    for (String t : tagList) {
                        if (t == null || t.isEmpty()) continue;
                        if (ptags.contains(t)) return true;
                    }
                    return false;
                }
            }).collect(Collectors.toList());
        }
        int total = all.size();
        if (size <= 0) size = 20;
        if (page < 0) page = 0;
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        List<Problem> items = all.subList(from, to);
        int totalPages = (int) Math.ceil(total / (double) size);
        return new ProblemPage(items, page, size, total, totalPages);
    }

    // Unique tags across all problems
    @GetMapping(path = "/tags")
    public List<String> listTags() {
        return repo.findAll().stream()
                .map(Problem::getTags)
                .filter(list -> list != null)
                .flatMap(List::stream)
                .distinct()
                .sorted(String::compareToIgnoreCase)
                .collect(Collectors.toList());
    }

    @GetMapping(path = "/{id}")
    public Problem get(@PathVariable String id) {
        Problem base = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Problem not found: " + id));
        List<TestCase> samples = repo.findTestCasesByProblemId(id);
        // Recompose Problem with samples to maintain backward compatibility
        return new Problem(base.getId(), base.getTitle(), base.getStatement(), base.getInputSpec(), base.getOutputSpec(), samples, base.getConstraints(), base.getTags());
    }

    @GetMapping(path = "/{id}/export")
    public ProblemPack export(@PathVariable String id) {
        return importExportService.exportPack(id);
    }

    @PostMapping(path = "/import", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void importPack(@RequestBody ProblemPack pack) {
        importExportService.importPack(pack);
    }

    @GetMapping(path = "/{id}/export.csv", produces = "text/csv")
    public String exportCsvSingle(@PathVariable String id) {
        return importExportService.exportCsv(id);
    }

    @GetMapping(path = "/export.csv", produces = "text/csv")
    public String exportCsvAll() {
        return importExportService.exportCsvAll();
    }

    @PostMapping(path = "/import/csv", consumes = {"text/plain", "text/csv"})
    public void importCsv(@RequestBody String csv) {
        importExportService.importCsv(csv);
    }
}