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
}