package com.example.compiler.jpa.repo;

import com.example.compiler.jpa.entity.LibraryConceptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LibraryConceptRepository extends JpaRepository<LibraryConceptEntity, Long> {
}
