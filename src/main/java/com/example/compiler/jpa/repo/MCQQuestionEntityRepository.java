package com.example.compiler.jpa.repo;

import com.example.compiler.jpa.entity.MCQQuestionEntity;
import com.example.compiler.jpa.entity.PageSectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MCQQuestionEntityRepository extends JpaRepository<MCQQuestionEntity, Long> {
    List<MCQQuestionEntity> findBySection(PageSectionEntity section);
}

