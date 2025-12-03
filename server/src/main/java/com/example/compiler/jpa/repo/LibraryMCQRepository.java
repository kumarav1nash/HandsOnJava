package com.example.compiler.jpa.repo;

import com.example.compiler.jpa.entity.LibraryMCQEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LibraryMCQRepository extends JpaRepository<LibraryMCQEntity, Long> {
}
