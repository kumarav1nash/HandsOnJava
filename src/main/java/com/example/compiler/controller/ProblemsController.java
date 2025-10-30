package com.example.compiler.controller;

import com.example.compiler.model.Problem;
import com.example.compiler.repo.InMemoryProblemRepo;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/problems", produces = MediaType.APPLICATION_JSON_VALUE)
public class ProblemsController {

    @GetMapping
    public List<Problem> list() {
        return InMemoryProblemRepo.list();
    }

    @GetMapping(path = "/{id}")
    public Problem get(@PathVariable String id) {
        Problem p = InMemoryProblemRepo.get(id);
        if (p == null) throw new IllegalArgumentException("Problem not found: " + id);
        return p;
    }
}