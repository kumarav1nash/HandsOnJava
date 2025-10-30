package com.example.compiler.controller;

import com.example.compiler.model.RunRequest;
import com.example.compiler.model.RunResponse;
import com.example.compiler.service.JavaRunnerService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
public class JavaController {

    private final JavaRunnerService runner = new JavaRunnerService();

    @PostMapping(path = "/api/java/run", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public RunResponse run(@RequestBody RunRequest request) throws Exception {
        JavaRunnerService.Result res = runner.compileAndRun(
                request.getCode() == null ? "" : request.getCode(),
                request.getInput() == null ? "" : request.getInput()
        );
        return new RunResponse(res.stdout, res.stderr, res.exitCode, res.durationMs);
    }
}