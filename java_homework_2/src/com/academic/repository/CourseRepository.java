package com.academic.repository;

import com.academic.domain.Course;
import java.util.List;
import java.util.UUID;

public interface CourseRepository {
    Course save(Course course);
    Course findById(UUID id);
    Course findByCode(String code);
    List<Course> findAll();
    boolean delete(UUID id);
}