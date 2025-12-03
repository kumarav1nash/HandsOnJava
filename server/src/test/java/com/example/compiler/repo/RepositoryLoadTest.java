package com.example.compiler.repo;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@EnabledIfEnvironmentVariable(named = "WITH_DOCKER", matches = "true")
public class RepositoryLoadTest {

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
    void concurrentReadsUnderLoad() throws InterruptedException {
        int threads = 10;
        int iterationsPerThread = 200;
        ExecutorService exec = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);

        for (int t = 0; t < threads; t++) {
            exec.submit(() -> {
                try {
                    for (int i = 0; i < iterationsPerThread; i++) {
                        repo.findAll();
                        repo.findById("p1");
                        repo.findTestCasesByProblemId("p1");
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        assertTrue(latch.await(60, TimeUnit.SECONDS));
        exec.shutdownNow();
    }
}