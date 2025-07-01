package com.academic.repository;

import com.academic.domain.Grade;
import java.util.List;
import java.util.UUID;

public interface GradeRepository {
    Grade findById(UUID id);
    List<Grade> findAllByStudentId(UUID studentId);
    List<Grade> findAllByCourseId(UUID courseId);
    Grade save(Grade grade);
    void delete(UUID id);
    boolean exists(UUID id);
}