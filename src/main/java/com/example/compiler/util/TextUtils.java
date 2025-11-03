package com.example.compiler.util;

public final class TextUtils {
    private TextUtils() {}

    /** 
     * Normalize program output for comparison:
     * - Convert CRLF and CR to LF
     * - Remove trailing newlines only (not leading or internal whitespace)
     */
    public static String normalizeOutput(String s) {
        if (s == null) return "";
        String lf = s.replace("\r\n", "\n").replace("\r", "\n");
        return lf.replaceAll("\n+$", "");
    }

    /**
     * Decode common escaped sequences in stored text (e.g., DB values):
     * Converts literal sequences "\\n", "\\r", "\\t", and "\\r\\n" into actual characters.
     */
    public static String unescape(String s) {
        if (s == null) return "";
        // First handle CRLF as a unit, then individual escapes
        String out = s.replace("\\r\\n", "\n");
        out = out.replace("\\n", "\n");
        out = out.replace("\\r", "\r");
        out = out.replace("\\t", "\t");
        return out;
    }
}