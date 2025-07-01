package com.academic.service;

import com.academic.domain.Grade;

import java.util.List;
import java.util.UUID;

public interface GradeService {
    List<Grade> getStudentGrades(UUID studentId);
    List<Grade> getStudentGradesByStudentId(String studentId);
    double calculateStudentAverage(UUID studentId);
}