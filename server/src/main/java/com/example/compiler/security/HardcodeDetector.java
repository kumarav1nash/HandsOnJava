package com.example.compiler.security;

import com.example.compiler.model.TestCase;

import java.util.List;

public class HardcodeDetector {
    private static final int MIN_MATCH_LEN = 5;

    public boolean isSuspicious(String sourceCode, List<TestCase> tests) {
        if (sourceCode == null || sourceCode.isEmpty() || tests == null || tests.isEmpty()) return false;
        String code = stripWhitespace(sourceCode);
        for (TestCase t : tests) {
            String expected = stripWhitespace(t.getExpectedOutput());
            if (expected == null) continue;
            // Only consider non-trivial outputs
            if (expected.length() >= MIN_MATCH_LEN && code.contains(expected)) {
                return true;
            }
        }
        return false;
    }

    private String stripWhitespace(String s) {
        return s == null ? null : s.replaceAll("\\s+", "");
    }
}