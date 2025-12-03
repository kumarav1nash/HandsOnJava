package com.example.compiler.controller;

import com.example.compiler.model.Problem;
import com.example.compiler.repo.ProblemRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/admin/problems", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminProblemsController {

    private final ProblemRepository repo;

    public AdminProblemsController(ProblemRepository repo) {
        this.repo = repo;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public void create(@RequestBody Problem problem) {
        validate(problem);
        repo.saveProblem(problem);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void update(@PathVariable String id, @RequestBody Problem problem) {
        validate(problem);
        if (!id.equals(problem.getId())) {
            throw new IllegalArgumentException("Path id and body id must match");
        }
        repo.saveProblem(problem);
    }

    @DeleteMapping(path = "/{id}")
    public void delete(@PathVariable String id) {
        repo.deleteProblem(id);
    }

    private void validate(Problem p) {
        if (p.getId() == null || p.getId().isEmpty()) throw new IllegalArgumentException("Problem id is required");
        if (p.getTitle() == null || p.getTitle().isEmpty()) throw new IllegalArgumentException("Title is required");
        if (p.getStatement() == null || p.getStatement().isEmpty()) throw new IllegalArgumentException("Statement is required");
        if (p.getInputSpec() == null || p.getInputSpec().isEmpty()) throw new IllegalArgumentException("Input spec is required");
        if (p.getOutputSpec() == null || p.getOutputSpec().isEmpty()) throw new IllegalArgumentException("Output spec is required");
        if (p.getConstraints() == null) throw new IllegalArgumentException("Constraints are required");
    }
}