package com.example.compiler.jpa.repo;

import com.example.compiler.jpa.entity.MCQOptionEntity;
import com.example.compiler.jpa.entity.MCQQuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MCQOptionEntityRepository extends JpaRepository<MCQOptionEntity, Long> {
    List<MCQOptionEntity> findByQuestion(MCQQuestionEntity question);
}

