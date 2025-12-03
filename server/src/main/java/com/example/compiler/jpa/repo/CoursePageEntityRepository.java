package com.example.compiler.jpa.repo;

import com.example.compiler.jpa.entity.CourseEntity;
import com.example.compiler.jpa.entity.CoursePageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoursePageEntityRepository extends JpaRepository<CoursePageEntity, Long> {
    List<CoursePageEntity> findByCourseOrderByPositionAsc(CourseEntity course);
}

