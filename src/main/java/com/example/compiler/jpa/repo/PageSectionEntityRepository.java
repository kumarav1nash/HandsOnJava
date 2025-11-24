package com.example.compiler.jpa.repo;

import com.example.compiler.jpa.entity.CoursePageEntity;
import com.example.compiler.jpa.entity.PageSectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PageSectionEntityRepository extends JpaRepository<PageSectionEntity, Long> {
    List<PageSectionEntity> findByPageOrderByPositionAsc(CoursePageEntity page);
}

