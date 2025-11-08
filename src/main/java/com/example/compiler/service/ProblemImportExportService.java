package com.example.compiler.service;

import com.example.compiler.model.Problem;
import com.example.compiler.model.ProblemPack;
import com.example.compiler.model.TestCase;
import com.example.compiler.repo.ProblemRepository;
import com.example.compiler.util.CsvUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Service responsible for exporting and importing problems with test cases.
 */
public class ProblemImportExportService {
    private final ProblemRepository repo;

    public ProblemImportExportService(ProblemRepository repo) {
        this.repo = repo;
    }

    public ProblemPack exportPack(String problemId) {
        Problem base = repo.findById(problemId)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found: " + problemId));
        List<TestCase> samples = repo.findTestCasesByProblemId(problemId);
        List<TestCase> all = repo.findAllTestCasesByProblemId(problemId);

        // Hidden = all - samples (by value)
        Set<String> sampleKeys = new HashSet<>();
        for (TestCase t : samples) {
            sampleKeys.add(key(t));
        }
        List<TestCase> hidden = new ArrayList<>();
        for (TestCase t : all) {
            if (!sampleKeys.contains(key(t))) {
                hidden.add(t);
            }
        }

        return new ProblemPack(base.getId(), base.getTitle(), base.getStatement(), base.getInputSpec(), base.getOutputSpec(), base.getConstraints(), base.getTags(), samples, hidden);
    }

    public void importPack(ProblemPack pack) {
        if (pack == null) throw new IllegalArgumentException("ProblemPack cannot be null");
        if (pack.getId() == null || pack.getTitle() == null) {
            throw new IllegalArgumentException("ProblemPack must include id and title");
        }
        Problem p = new Problem(pack.getId(), pack.getTitle(), pack.getStatement(), pack.getInputSpec(), pack.getOutputSpec(), pack.getSamples(), pack.getConstraints(), pack.getTags());
        repo.saveProblem(p);
        repo.deleteTestCasesByProblemId(p.getId());
        if (pack.getSamples() != null) {
            for (TestCase t : pack.getSamples()) {
                repo.saveTestCase(p.getId(), t, true);
            }
        }
        if (pack.getHidden() != null) {
            for (TestCase t : pack.getHidden()) {
                repo.saveTestCase(p.getId(), t, false);
            }
        }
    }

    private static String key(TestCase t) {
        return (t.getInput() == null ? "" : t.getInput()) + "\u0000" + (t.getExpectedOutput() == null ? "" : t.getExpectedOutput());
    }

    // --- CSV Export/Import ---

    public String exportCsv(String problemId) {
        Problem base = repo.findById(problemId)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found: " + problemId));
        List<TestCase> samples = repo.findTestCasesByProblemId(problemId);
        List<TestCase> all = repo.findAllTestCasesByProblemId(problemId);

        StringBuilder sb = new StringBuilder();
        sb.append("id,title,statement,inputSpec,outputSpec,constraints,tags,isSample,input,expectedOutput\n");
        // Write samples
        for (TestCase t : samples) {
            sb.append(csvRow(base, true, t)).append('\n');
        }
        // Write hidden (all minus samples)
        Set<String> sampleKeys = new java.util.HashSet<>();
        for (TestCase t : samples) sampleKeys.add(key(t));
        for (TestCase t : all) {
            if (!sampleKeys.contains(key(t))) {
                sb.append(csvRow(base, false, t)).append('\n');
            }
        }
        return sb.toString();
    }

    public String exportCsvAll() {
        List<Problem> problems = repo.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("id,title,statement,inputSpec,outputSpec,constraints,tags,isSample,input,expectedOutput\n");
        for (Problem base : problems) {
            String pid = base.getId();
            List<TestCase> samples = repo.findTestCasesByProblemId(pid);
            List<TestCase> all = repo.findAllTestCasesByProblemId(pid);
            for (TestCase t : samples) {
                sb.append(csvRow(base, true, t)).append('\n');
            }
            Set<String> sampleKeys = new java.util.HashSet<>();
            for (TestCase t : samples) sampleKeys.add(key(t));
            for (TestCase t : all) {
                if (!sampleKeys.contains(key(t))) {
                    sb.append(csvRow(base, false, t)).append('\n');
                }
            }
        }
        return sb.toString();
    }

    public void importCsv(String csv) {
        if (csv == null) throw new IllegalArgumentException("CSV cannot be null");
        String[] lines = csv.split("\r?\n");
        int start = 0;
        if (lines.length > 0 && lines[0].toLowerCase().startsWith("id,")) {
            start = 1; // skip header
        }
        java.util.Map<String, java.util.List<String[]>> byProblem = new java.util.HashMap<>();
        for (int i = start; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;
            String[] cols = CsvUtils.parseLine(line);
            if (cols.length < 9) continue; // skip malformed (support old format)
            byProblem.computeIfAbsent(cols[0], k -> new java.util.ArrayList<>()).add(cols);
        }
        for (java.util.Map.Entry<String, java.util.List<String[]>> e : byProblem.entrySet()) {
            String id = e.getKey();
            java.util.List<String[]> rows = e.getValue();
            // Take metadata from first row
            String[] m = rows.get(0);
            String title = m[1];
            String statement = m[2];
            String inputSpec = m[3];
            String outputSpec = m[4];
            String constraints = m[5];
            java.util.List<String> tags = java.util.Collections.emptyList();
            // Old format has 9 cols; new format adds tags at index 6
            if (m.length >= 10) {
                tags = parseTagsField(m[6]);
            }
            Problem p = new Problem(id, title, statement, inputSpec, outputSpec, java.util.Collections.emptyList(), constraints, tags);
            repo.saveProblem(p);
            repo.deleteTestCasesByProblemId(id);
            for (String[] r : rows) {
                boolean isSample = Boolean.parseBoolean(r[m.length >= 10 ? 7 : 6].trim());
                String input = CsvUtils.unescapeField(r[m.length >= 10 ? 8 : 7]);
                String expected = CsvUtils.unescapeField(r[m.length >= 10 ? 9 : 8]);
                repo.saveTestCase(id, new TestCase(input, expected), isSample);
            }
        }
    }

    private static String csvRow(Problem base, boolean isSample, TestCase t) {
        return CsvUtils.join(new String[]{
                base.getId(),
                base.getTitle(),
                safe(base.getStatement()),
                safe(base.getInputSpec()),
                safe(base.getOutputSpec()),
                safe(base.getConstraints()),
                CsvUtils.escapeField(joinTags(base.getTags())),
                String.valueOf(isSample),
                CsvUtils.escapeField(t.getInput()),
                CsvUtils.escapeField(t.getExpectedOutput())
        });
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }

    // CSV helpers moved to CsvUtils

    private static java.util.List<String> parseTagsField(String field) {
        String raw = CsvUtils.unescapeField(field);
        if (raw == null || raw.trim().isEmpty()) return java.util.Collections.emptyList();
        // Split on comma or pipe with optional surrounding whitespace
        String[] parts = raw.split("\\s*[\\|,]\\s*");
        java.util.List<String> out = new java.util.ArrayList<>();
        for (String p : parts) {
            String tag = p.trim();
            if (!tag.isEmpty()) out.add(tag);
        }
        return out;
    }

    private static String joinTags(java.util.List<String> tags) {
        if (tags == null || tags.isEmpty()) return "";
        return String.join(",", tags);
    }
}