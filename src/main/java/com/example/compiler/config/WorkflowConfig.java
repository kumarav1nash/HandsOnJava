package com.example.compiler.config;

import com.example.compiler.jpa.repo.ProblemEntityRepository;
import com.example.compiler.service.InMemoryWorkflowStatusStore;
import com.example.compiler.service.JpaWorkflowStatusStore;
import com.example.compiler.service.WorkflowService;
import com.example.compiler.service.WorkflowStatusStore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WorkflowConfig {

    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "jpa")
    public WorkflowStatusStore jpaWorkflowStatusStore(ProblemEntityRepository problems) {
        return new JpaWorkflowStatusStore(problems);
    }

    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "memory", matchIfMissing = true)
    public WorkflowStatusStore inMemoryWorkflowStatusStore() {
        return new InMemoryWorkflowStatusStore();
    }
}