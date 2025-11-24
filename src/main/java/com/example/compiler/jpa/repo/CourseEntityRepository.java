package com.example.compiler.jpa.repo;

import com.example.compiler.jpa.entity.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseEntityRepository extends JpaRepository<CourseEntity, String> {
}

