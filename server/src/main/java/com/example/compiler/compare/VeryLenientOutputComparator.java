package com.example.compiler.compare;

import com.example.compiler.util.TextUtils;

public class VeryLenientOutputComparator implements OutputComparator {
    @Override
    public boolean compare(String expected, String actual) {
        String e = TextUtils.normalizeOutput(expected);
        String a = TextUtils.normalizeOutput(actual);
        // Additional tolerance: trim outer whitespace and collapse internal multiple spaces
        e = e.trim().replaceAll("\\s+", " ");
        a = a.trim().replaceAll("\\s+", " ");
        return e.equals(a);
    }
}