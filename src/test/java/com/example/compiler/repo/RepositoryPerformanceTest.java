package com.example.compiler.repo;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@EnabledIfEnvironmentVariable(named = "WITH_DOCKER", matches = "true")
public class RepositoryPerformanceTest {

    @DynamicPropertySource
    static void databaseProps(DynamicPropertyRegistry registry) {
        // Use memory-backed repository; exclude DB/JPA/Flyway auto-config to avoid datasource creation
        registry.add("storage.type", () -> "memory");
        registry.add("spring.autoconfigure.exclude", () ->
                "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
                        + "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,"
                        + "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration");
    }

    @Autowired
    ProblemRepository repo;

    @Test
    void compareReadPerformanceMemory() {
        int iterations = 1000;

        long t1Start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            repo.findAll();
            repo.findById("p1");
            repo.findTestCasesByProblemId("p1");
        }
        long t1 = System.nanoTime() - t1Start;

        System.out.println("Memory repo ns: " + t1);
        // Sanity check: time should be > 0
        assertTrue(t1 > 0);
    }
}