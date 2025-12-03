package com.example.compiler.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import org.junit.jupiter.params.provider.Arguments;

class TextUtilsTest {

    static Stream<Arguments> unescapeCases() {
        return Stream.of(
                arguments("\\n", "\n"),
                arguments("\\r", "\r"),
                arguments("\\t", "\t"),
                arguments("foo\\nbar", "foo\nbar"),
                arguments("foo\\rbar", "foo\rbar"),
                arguments("foo\\tbar", "foo\tbar"),
                arguments("line1\\r\\nline2", "line1\nline2"),
                arguments("multi\\nline\\ntext", "multi\nline\ntext")
        );
    }

    @ParameterizedTest
    @MethodSource("unescapeCases")
    void unescape_decodes_common_sequences(String input, String expected) {
        String actual = TextUtils.unescape(input);
        assertEquals(expected, actual);
    }

    @Test
    void unescape_handles_null_and_empty() {
        assertEquals("", TextUtils.unescape(null));
        assertEquals("", TextUtils.unescape(""));
    }
}