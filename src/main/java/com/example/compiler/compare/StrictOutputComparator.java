package com.example.compiler.compare;

public class StrictOutputComparator implements OutputComparator {
    @Override
    public boolean compare(String expected, String actual) {
        String e = expected == null ? "" : expected;
        String a = actual == null ? "" : actual;
        return e.equals(a);
    }
}