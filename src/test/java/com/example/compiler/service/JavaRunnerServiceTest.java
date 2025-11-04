package com.example.compiler.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JavaRunnerServiceTest {

    @Test
    void runTimesOutForLongRunningProgram() throws Exception {
        String code = "public class Main {\n" +
                "  public static void main(String[] args) {\n" +
                "    try { Thread.sleep(10000); } catch (InterruptedException e) {}\n" +
                "    System.out.println(\"done\");\n" +
                "  }\n" +
                "}";
        JavaRunnerService svc = new JavaRunnerService();
        JavaRunnerService.Result res = svc.compileAndRun(code, "");
        assertEquals(-1, res.exitCode, "Exit code should indicate timeout");
        assertTrue(res.stderr != null && res.stderr.contains("Process timed out"), "stderr should include timeout message");
    }

    @Test
    void stdoutIsCappedAndTruncatedMarkerAppended() throws Exception {
        String code = "public class Main {\n" +
                "  public static void main(String[] args) {\n" +
                "    StringBuilder sb = new StringBuilder();\n" +
                "    for (int i = 0; i < 200_000; i++) sb.append('A');\n" +
                "    System.out.print(sb.toString());\n" +
                "  }\n" +
                "}";
        JavaRunnerService svc = new JavaRunnerService();
        JavaRunnerService.Result res = svc.compileAndRun(code, "");
        assertEquals(0, res.exitCode, "Program should complete normally");
        assertNotNull(res.stdout);
        assertTrue(res.stdout.contains("[output truncated]"), "stdout should include truncation marker");
    }

    @Test
    void memoryCapTriggersOutOfMemoryErrorWithHint() throws Exception {
        String code = "public class Main {\n" +
                "  public static void main(String[] args) {\n" +
                "    byte[] arr = new byte[200 * 1024 * 1024]; // 200MB\n" +
                "    System.out.println(arr.length);\n" +
                "  }\n" +
                "}";
        JavaRunnerService svc = new JavaRunnerService();
        JavaRunnerService.Result res = svc.compileAndRun(code, "");
        assertNotEquals(0, res.exitCode, "Program should fail under memory cap");
        assertTrue(res.stderr != null && res.stderr.contains("OutOfMemoryError"), "stderr should contain OOME");
        assertTrue(res.stderr.contains("Hint: program exceeded memory limit"), "stderr should include OOME hint");
    }
}