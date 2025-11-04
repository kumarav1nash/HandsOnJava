package com.example.compiler.service;

import com.example.compiler.model.ProblemStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@Testcontainers
@EnabledIfEnvironmentVariable(named = "WITH_DOCKER", matches = "true")
public class WorkflowStatusJpaIT {

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
    WorkflowService workflowService;

    @Test
    void statusPersistsAcrossServiceInstances() {
        String pid = "p1"; // seeded by V1__init.sql

        // Default should be DRAFT
        assertEquals(ProblemStatus.DRAFT, workflowService.getStatus(pid));

        // Move to IN_REVIEW and verify persistence
        workflowService.submitForReview(pid, "author", "please review");
        assertEquals(ProblemStatus.IN_REVIEW, workflowService.getStatus(pid));
    }
}