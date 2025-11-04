package com.example.compiler.compare;

import com.example.compiler.util.TextUtils;

public class LenientOutputComparator implements OutputComparator {
    @Override
    public boolean compare(String expected, String actual) {
        String e = TextUtils.normalizeOutput(expected);
        String a = TextUtils.normalizeOutput(actual);
        return e.equals(a);
    }
}