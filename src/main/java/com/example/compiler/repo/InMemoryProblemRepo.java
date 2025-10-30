package com.example.compiler.repo;

import com.example.compiler.model.Problem;
import com.example.compiler.model.TestCase;

import java.util.*;

public class InMemoryProblemRepo {
    private static final Map<String, Problem> PROBLEMS = new LinkedHashMap<>();

    static {
        // Problem 1: Hello, Name
        PROBLEMS.put("p1", new Problem(
                "p1",
                "Hello, Name",
                "Read a single line as a name and print 'Hello, <name>!'",
                "Input: a single line containing a name",
                "Output: 'Hello, <name>!'",
                Arrays.asList(
                        new TestCase("Alice\n", "Hello, Alice!\n"),
                        new TestCase("Bob\n", "Hello, Bob!\n")
                ),
                "Constraints: name length <= 100 characters"
        ));

        // Problem 2: Sum of Integers
        PROBLEMS.put("p2", new Problem(
                "p2",
                "Sum of Integers",
                "Given N followed by N integers, output their sum.",
                "Input: first line N, next line N space-separated integers",
                "Output: one line with the sum",
                Arrays.asList(
                        new TestCase("3\n1 2 3\n", "6\n"),
                        new TestCase("5\n10 20 30 40 50\n", "150\n")
                ),
                "Constraints: 1 <= N <= 10^5, values |ai| <= 10^9"
        ));

        // Problem 3: Reverse String
        PROBLEMS.put("p3", new Problem(
                "p3",
                "Reverse String",
                "Read a string and print its reverse.",
                "Input: a single line string",
                "Output: reversed string",
                Arrays.asList(
                        new TestCase("hello\n", "olleh\n"),
                        new TestCase("Java\n", "avaJ\n")
                ),
                "Constraints: string length <= 10^5"
        ));
    }

    public static List<Problem> list() { return new ArrayList<>(PROBLEMS.values()); }
    public static Problem get(String id) { return PROBLEMS.get(id); }
}