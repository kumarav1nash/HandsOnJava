package com.example.compiler.jpa.repo;

import com.example.compiler.jpa.entity.ProblemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemEntityRepository extends JpaRepository<ProblemEntity, String> {
}