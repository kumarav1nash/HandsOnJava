package com.example.compiler.compare;

import com.example.compiler.util.TextUtils;

import java.util.Arrays;
import java.util.stream.Stream;

/**
 * Comparator that supports multiple acceptable outputs.
 * The expected string can list alternatives separated by "||".
 * Example: "0 3||1 2" will accept either "0 3" or "1 2" (after normalization).
 */
public class AlternativesOutputComparator implements OutputComparator {
    @Override
    public boolean compare(String expected, String actual) {
        String normalizedActual = TextUtils.normalizeOutput(actual);
        String normalizedExpected = TextUtils.normalizeOutput(expected);

        // Split alternatives by the token "||" and trim surrounding whitespace
        Stream<String> alternatives = Arrays.stream(normalizedExpected.split("\\|\\|"))
                .map(s -> s.trim())
                .filter(s -> !s.isEmpty());

        // Accept if actual equals any alternative (lenient normalization already applied)
        return alternatives.anyMatch(alt -> normalizedActual.equals(alt));
    }
}