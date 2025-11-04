package com.example.compiler.config;

import com.example.compiler.compare.ComparatorMode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ComparisonConfig {
    private final Environment env;

    @Value("${compare.mode.default:lenient}")
    private String defaultMode;

    public ComparisonConfig(Environment env) {
        this.env = env;
    }

    public ComparatorMode defaultMode() {
        return ComparatorMode.fromString(defaultMode);
    }

    public ComparatorMode forProblem(String problemId) {
        String key = "compare.mode.p." + problemId;
        String v = env.getProperty(key);
        if (v == null || v.isEmpty()) {
            return defaultMode();
        }
        return ComparatorMode.fromString(v);
    }
}