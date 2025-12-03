package com.example.compiler.config;

import com.example.compiler.jpa.JpaProblemRepositoryAdapter;
import com.example.compiler.jpa.repo.ProblemEntityRepository;
import com.example.compiler.jpa.repo.TestCaseEntityRepository;
import com.example.compiler.repo.MemoryProblemRepository;
import com.example.compiler.repo.ProblemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RepositoryConfig {

    @Value("${storage.type:memory}")
    private String storageType;

    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "jpa")
    public ProblemRepository jpaProblemRepository(ProblemEntityRepository problems, TestCaseEntityRepository testCases) {
        return new JpaProblemRepositoryAdapter(problems, testCases);
    }

    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "memory", matchIfMissing = true)
    public ProblemRepository memoryProblemRepository() {
        return new MemoryProblemRepository();
    }
}