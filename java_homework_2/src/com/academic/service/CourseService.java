package com.academic.service;

import com.academic.domain.Course;
import java.util.List;
import java.util.UUID;

public interface CourseService {
    Course addCourse(Course course);
    Course updateCourse(Course course);
    boolean deleteCourse(UUID courseId);
    Course findCourseById(UUID id);
    Course findCourseByCode(String code);

    // 先修课程关系管理
    boolean addPrerequisite(UUID courseId, UUID prerequisiteId);
    List<Course> getPrerequisites(UUID courseId);

    // 课程选择验证
    boolean canStudentTakeCourse(String studentId, UUID courseId);
    void printCourseDetails(UUID courseId);
}
