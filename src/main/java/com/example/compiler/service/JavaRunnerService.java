package com.example.compiler.service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

public class JavaRunnerService {
    private static final long COMPILE_TIMEOUT_SEC = 10;
    private static final long RUN_TIMEOUT_SEC = 5;

    public Result compileAndRun(String code, String input) throws IOException {
        Path workDir = Files.createTempDirectory("java_sandbox_" + UUID.randomUUID());
        try {
            Files.write(workDir.resolve("Main.java"), code.getBytes(StandardCharsets.UTF_8));

            Result compile = exec(new String[]{"javac", "Main.java"}, workDir, null, COMPILE_TIMEOUT_SEC);
            if (compile.exitCode != 0) {
                return new Result("", compile.stderr, compile.exitCode, compile.durationMs);
            }

            Result run = exec(new String[]{"java", "Main"}, workDir, input, RUN_TIMEOUT_SEC);
            return run;
        } finally {
            // Clean up temp directory
            try {
                Files.walk(workDir)
                        .sorted((a, b) -> b.compareTo(a)) // delete files before dir
                        .forEach(p -> {
                            try { Files.deleteIfExists(p); } catch (IOException ignored) {}
                        });
            } catch (Exception ignored) {}
        }
    }

    private Result exec(String[] cmd, Path cwd, String stdin, long timeoutSec) throws IOException {
        ProcessBuilder pb = new ProcessBuilder(cmd)
                .directory(cwd.toFile())
                .redirectErrorStream(false);
        Instant start = Instant.now();
        Process p = pb.start();

        if (stdin != null && !stdin.isEmpty()) {
            try (BufferedWriter w = new BufferedWriter(new OutputStreamWriter(p.getOutputStream(), StandardCharsets.UTF_8))) {
                w.write(stdin);
            }
        } else {
            p.getOutputStream().close();
        }

        String stdout = readStream(p.getInputStream());
        String stderr = readStream(p.getErrorStream());
        boolean finished;
        try {
            finished = p.waitFor(timeoutSec, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            finished = false;
        }
        if (!finished) {
            p.destroyForcibly();
            stderr = (stderr == null ? "" : stderr) + "\nProcess timed out";
        }
        int exit = finished ? p.exitValue() : -1;
        long durationMs = Math.max(1, java.time.Duration.between(start, Instant.now()).toMillis());
        return new Result(stdout, stderr, exit, durationMs);
    }

    private String readStream(InputStream is) throws IOException {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line).append('\n');
            }
            return sb.toString();
        }
    }

    public static class Result {
        public final String stdout;
        public final String stderr;
        public final int exitCode;
        public final long durationMs;

        public Result(String stdout, String stderr, int exitCode, long durationMs) {
            this.stdout = stdout;
            this.stderr = stderr;
            this.exitCode = exitCode;
            this.durationMs = durationMs;
        }
    }
}