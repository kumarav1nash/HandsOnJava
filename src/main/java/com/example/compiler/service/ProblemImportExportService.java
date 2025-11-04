package com.example.compiler.service;

import com.example.compiler.model.Problem;
import com.example.compiler.model.ProblemPack;
import com.example.compiler.model.TestCase;
import com.example.compiler.repo.ProblemRepository;

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

        return new ProblemPack(base.getId(), base.getTitle(), base.getStatement(), base.getInputSpec(), base.getOutputSpec(), base.getConstraints(), samples, hidden);
    }

    public void importPack(ProblemPack pack) {
        if (pack == null) throw new IllegalArgumentException("ProblemPack cannot be null");
        if (pack.getId() == null || pack.getTitle() == null) {
            throw new IllegalArgumentException("ProblemPack must include id and title");
        }
        Problem p = new Problem(pack.getId(), pack.getTitle(), pack.getStatement(), pack.getInputSpec(), pack.getOutputSpec(), pack.getSamples(), pack.getConstraints());
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
        sb.append("id,title,statement,inputSpec,outputSpec,constraints,isSample,input,expectedOutput\n");
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
        sb.append("id,title,statement,inputSpec,outputSpec,constraints,isSample,input,expectedOutput\n");
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
            String[] cols = parseCsvLine(line);
            if (cols.length < 9) continue; // skip malformed
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
            Problem p = new Problem(id, title, statement, inputSpec, outputSpec, java.util.Collections.emptyList(), constraints);
            repo.saveProblem(p);
            repo.deleteTestCasesByProblemId(id);
            for (String[] r : rows) {
                boolean isSample = Boolean.parseBoolean(r[6].trim());
                String input = unescapeCsvField(r[7]);
                String expected = unescapeCsvField(r[8]);
                repo.saveTestCase(id, new TestCase(input, expected), isSample);
            }
        }
    }

    private static String csvRow(Problem base, boolean isSample, TestCase t) {
        return joinCsv(new String[]{
                base.getId(),
                base.getTitle(),
                safe(base.getStatement()),
                safe(base.getInputSpec()),
                safe(base.getOutputSpec()),
                safe(base.getConstraints()),
                String.valueOf(isSample),
                escapeCsvField(t.getInput()),
                escapeCsvField(t.getExpectedOutput())
        });
    }

    private static String joinCsv(String[] fields) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < fields.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(fields[i] == null ? "" : fields[i]);
        }
        return sb.toString();
    }

    private static String escapeCsvField(String s) {
        if (s == null) return "";
        // Use simple escaping by replacing newlines with \n and quotes with doubled quotes, wrap in quotes
        String v = s.replace("\r", "").replace("\n", "\\n").replace("\"", "\"\"");
        return '"' + v + '"';
    }

    private static String unescapeCsvField(String s) {
        if (s == null) return "";
        String v = s;
        if (v.length() >= 2 && v.startsWith("\"") && v.endsWith("\"")) {
            v = v.substring(1, v.length() - 1);
        }
        v = v.replace("\"\"", "\"").replace("\\n", "\n");
        return v;
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }

    private static String[] parseCsvLine(String line) {
        java.util.List<String> out = new java.util.ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (inQuotes) {
                if (c == '\"') {
                    // Lookahead for doubled quote
                    if (i + 1 < line.length() && line.charAt(i + 1) == '\"') {
                        cur.append('\"');
                        i++; // skip next
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
                } else if (c == '\"') {
                    inQuotes = true;
                } else {
                    cur.append(c);
                }
            }
        }
        out.add(cur.toString());
        return out.toArray(new String[0]);
    }
}