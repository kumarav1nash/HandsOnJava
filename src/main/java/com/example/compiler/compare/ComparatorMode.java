package com.example.compiler.compare;

public enum ComparatorMode {
    STRICT,
    LENIENT,
    VERY_LENIENT,
    ALTERNATIVES;

    public static ComparatorMode fromString(String s) {
        if (s == null) return LENIENT;
        switch (s.trim().toLowerCase()) {
            case "strict": return STRICT;
            case "very_lenient":
            case "very-lenient": return VERY_LENIENT;
            case "alternatives": return ALTERNATIVES;
            case "lenient":
            default: return LENIENT;
        }
    }
}