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
    private static final int MAX_STDOUT_BYTES = 64 * 1024; // 64KB
    private static final int MAX_STDERR_BYTES = 32 * 1024; // 32KB
    private static final String TRUNCATED_SUFFIX = "\n[output truncated]";
    private static final String TIMEOUT_MSG = "Process timed out";
    private static final String OOME_HINT = "\nHint: program exceeded memory limit (-Xmx) or produced excessive output";

    public Result compileAndRun(String code, String input) throws IOException {
        Path workDir = Files.createTempDirectory("java_sandbox_" + UUID.randomUUID());
        try {
            Files.write(workDir.resolve("Main.java"), code.getBytes(StandardCharsets.UTF_8));

            Result compile = exec(new String[]{"javac", "-J-Xmx256m", "Main.java"}, workDir, null, COMPILE_TIMEOUT_SEC);
            if (compile.exitCode != 0) {
                return new Result("", compile.stderr, compile.exitCode, compile.durationMs);
            }

            Result run = exec(new String[]{"java", "-Xmx64m", "Main"}, workDir, input, RUN_TIMEOUT_SEC);
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

        CappedStreamGobbler outGobbler = new CappedStreamGobbler(p.getInputStream(), MAX_STDOUT_BYTES);
        CappedStreamGobbler errGobbler = new CappedStreamGobbler(p.getErrorStream(), MAX_STDERR_BYTES);
        Thread outThread = new Thread(outGobbler, "stdout-gobbler");
        Thread errThread = new Thread(errGobbler, "stderr-gobbler");
        outThread.start();
        errThread.start();
        boolean finished;
        try {
            finished = p.waitFor(timeoutSec, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            finished = false;
        }
        if (!finished) {
            p.destroyForcibly();
            // Give gobblers a moment to finish after process kill
            try { outThread.join(2000); } catch (InterruptedException ignored) {}
            try { errThread.join(2000); } catch (InterruptedException ignored) {}
            String stderr = errGobbler.getResult();
            stderr = (stderr == null ? "" : stderr) + "\n" + TIMEOUT_MSG;
            long durationMs = Math.max(1, java.time.Duration.between(start, Instant.now()).toMillis());
            return new Result(outGobbler.getResult(), stderr, -1, durationMs);
        }
        // Normal completion; ensure gobblers finished
        try { outThread.join(5000); } catch (InterruptedException ignored) {}
        try { errThread.join(5000); } catch (InterruptedException ignored) {}
        String stdout = outGobbler.getResult();
        String stderr = errGobbler.getResult();
        int exit = p.exitValue();
        if (stderr != null && (stderr.contains("OutOfMemoryError") || (stdout != null && stdout.endsWith(TRUNCATED_SUFFIX)))) {
            stderr = stderr + OOME_HINT;
        }
        long durationMs = Math.max(1, java.time.Duration.between(start, Instant.now()).toMillis());
        return new Result(stdout, stderr, exit, durationMs);
    }

    private String readStreamCapped(InputStream is, int capBytes) throws IOException {
        try (BufferedInputStream bis = new BufferedInputStream(is)) {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buf = new byte[4096];
            int total = 0;
            int r;
            while ((r = bis.read(buf)) != -1) {
                int remaining = capBytes - total;
                if (remaining <= 0) {
                    // Drain remainder without storing
                    continue;
                }
                int toWrite = Math.min(r, remaining);
                baos.write(buf, 0, toWrite);
                total += toWrite;
            }
            String out = new String(baos.toByteArray(), StandardCharsets.UTF_8);
            if (total >= capBytes) {
                out = out + TRUNCATED_SUFFIX;
            }
            return out;
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

    private class CappedStreamGobbler implements Runnable {
        private final InputStream is;
        private final int capBytes;
        private volatile String result;

        CappedStreamGobbler(InputStream is, int capBytes) {
            this.is = is;
            this.capBytes = capBytes;
        }

        @Override
        public void run() {
            try (BufferedInputStream bis = new BufferedInputStream(is)) {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buf = new byte[4096];
                int total = 0;
                int r;
                while ((r = bis.read(buf)) != -1) {
                    int remaining = capBytes - total;
                    if (remaining <= 0) {
                        // Drain remainder without storing
                        continue;
                    }
                    int toWrite = Math.min(r, remaining);
                    baos.write(buf, 0, toWrite);
                    total += toWrite;
                }
                String out = new String(baos.toByteArray(), StandardCharsets.UTF_8);
                if (total >= capBytes) {
                    out = out + TRUNCATED_SUFFIX;
                }
                result = out;
            } catch (IOException e) {
                result = (result == null ? "" : result) + "\n" + e.getMessage();
            }
        }

        String getResult() {
            return result;
        }
    }
}