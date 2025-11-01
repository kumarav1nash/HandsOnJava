package com.example.compiler.repo;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@Testcontainers
@EnabledIfEnvironmentVariable(named = "WITH_DOCKER", matches = "true")
public class JpaProblemRepositoryIT {

    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("code_editor")
            .withUsername("code_editor")
            .withPassword("code_editor");

    @DynamicPropertySource
    static void databaseProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("storage.type", () -> "jpa");
    }

    @Autowired
    ProblemRepository repo;

    @Test
    void flywaySeedsAndFindAllWorks() {
        List<com.example.compiler.model.Problem> list = repo.findAll();
        assertTrue(list.size() >= 3, "Expected at least 3 seeded problems");
    }

    @Test
    void findByIdAndSamplesWorks() {
        java.util.Optional<com.example.compiler.model.Problem> opt = repo.findById("p1");
        assertTrue(opt.isPresent());
        java.util.List<com.example.compiler.model.TestCase> samples = repo.findTestCasesByProblemId("p1");
        assertFalse(samples.isEmpty());
        assertEquals("Hello, Alice!\n", samples.get(0).getExpectedOutput());
    }

    @Test
    void crudOperationsWorkTransactionally() {
        // Save new problem
        com.example.compiler.model.Problem p = new com.example.compiler.model.Problem(
                "pz", "Temp", "stmt", "input", "output", java.util.Collections.emptyList(), "constraints"
        );
        repo.saveProblem(p);
        assertTrue(repo.findById("pz").isPresent());

        // Add test case
        repo.saveTestCase("pz", new com.example.compiler.model.TestCase("1\n2\n", "3\n"));
        assertEquals(1, repo.findTestCasesByProblemId("pz").size());

        // Delete test cases and problem
        repo.deleteTestCasesByProblemId("pz");
        assertEquals(0, repo.findTestCasesByProblemId("pz").size());
        repo.deleteProblem("pz");
        assertFalse(repo.findById("pz").isPresent());
    }
}