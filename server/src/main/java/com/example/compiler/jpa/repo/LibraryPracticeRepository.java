package com.example.compiler.jpa.repo;

import com.example.compiler.jpa.entity.LibraryPracticeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LibraryPracticeRepository extends JpaRepository<LibraryPracticeEntity, Long> {
}
