package com.example.compiler.jpa.repo;

import com.example.compiler.jpa.entity.TestCaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseEntityRepository extends JpaRepository<TestCaseEntity, Long> {
    List<TestCaseEntity> findByProblem_Id(String problemId);
    List<TestCaseEntity> findByProblem_IdAndIsSampleTrue(String problemId);
    void deleteByProblem_Id(String problemId);
}