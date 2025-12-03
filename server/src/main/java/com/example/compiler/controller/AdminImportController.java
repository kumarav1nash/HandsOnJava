package com.example.compiler.controller;

import com.example.compiler.model.ImportResponse;
import com.example.compiler.repo.ProblemRepository;
import com.example.compiler.service.ProblemImportExportService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(path = "/api/admin", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminImportController {

    private final ProblemImportExportService importExportService;

    @Value("${admin.token:}")
    private String adminToken;

    public AdminImportController(ProblemRepository repo) {
        this.importExportService = new ProblemImportExportService(repo);
    }

    @PostMapping(path = "/import/problems/csv", consumes = {"text/plain", "text/csv"})
    public ImportResponse importProblemsCsv(
            @RequestBody String csv,
            @RequestParam(name = "dryRun", defaultValue = "false") boolean dryRun,
            @RequestHeader(name = "X-Admin-Token", required = false) String token
    ) {
        // Token must be configured and match
        if (adminToken == null || adminToken.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin token not configured on server");
        }
        if (token == null || !Objects.equals(adminToken, token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin token");
        }

        if (csv == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV body is required");
        }

        // Compute a lightweight summary by parsing IDs and rows; do not mutate state on dryRun
        Summary summary = summarizeCsv(csv);

        if (dryRun) {
            return new ImportResponse("dry_run", summary.problems, summary.testcases, "Validated CSV format");
        }

        try {
            importExportService.importCsv(csv);
        } catch (UnsupportedOperationException e) {
            // Memory repository is read-only; inform admin to switch to JPA
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Repository is read-only. Set storage.type=jpa to enable imports.");
        }

        return new ImportResponse("imported", summary.problems, summary.testcases, "Import completed successfully");
    }

    private Summary summarizeCsv(String csv) {
        String[] lines = csv.split("\r?\n");
        int start = 0;
        if (lines.length > 0 && lines[0].toLowerCase().startsWith("id,")) {
            start = 1; // skip header
        }
        Set<String> ids = new HashSet<>();
        int rows = 0;
        for (int i = start; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;
            String[] cols = parseCsvLine(line);
            if (cols.length < 9) continue; // skip malformed
            ids.add(cols[0]);
            rows++;
        }
        return new Summary(ids.size(), rows);
    }

    private static String[] parseCsvLine(String line) {
        List<String> out = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < line.length() && line.charAt(i + 1) == '"') {
                        cur.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    cur.append(c);
                }
            } else {
                if (c == ',') {
                    out.add(cur.toString());
                    cur.setLength(0);
                } else if (c == '"') {
                    inQuotes = true;
                } else {
                    cur.append(c);
                }
            }
        }
        out.add(cur.toString());
        return out.toArray(new String[0]);
    }

    private static class Summary {
        final int problems;
        final int testcases;
        Summary(int problems, int testcases) {
            this.problems = problems;
            this.testcases = testcases;
        }
    }
}