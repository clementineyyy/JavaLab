package com.academic.service.impl;

import com.academic.domain.Course;
import com.academic.domain.Grade;
import com.academic.domain.Student;
import com.academic.repository.CourseRepository;
import com.academic.service.CourseService;
import com.academic.service.StudentService;

import java.util.*;

public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;
    private final StudentService studentService;

    public CourseServiceImpl(CourseRepository courseRepository, StudentService studentService) {
        this.courseRepository = courseRepository;
        this.studentService = studentService;
    }

    @Override
    public Course addCourse(Course course) {
        if (findCourseByCode(course.getCode()) != null) {
            throw new IllegalArgumentException("课程代码已存在: " + course.getCode());
        }
        return courseRepository.save(course);
    }

    @Override
    public Course updateCourse(Course course) {
        Course existingCourse = findCourseById(course.getId());
        if (existingCourse == null) {
            throw new IllegalArgumentException("课程不存在: " + course.getId());
        }
        return courseRepository.save(course);
    }

    @Override
    public boolean deleteCourse(UUID courseId) {
        return courseRepository.delete(courseId);
    }

    @Override
    public Course findCourseById(UUID id) {
        return courseRepository.findById(id);
    }

    @Override
    public Course findCourseByCode(String code) {
        return courseRepository.findByCode(code);
    }

    @Override
    public boolean addPrerequisite(UUID courseId, UUID prerequisiteId) {
        Course course = findCourseById(courseId);
        Course prerequisite = findCourseById(prerequisiteId);

        if (course == null || prerequisite == null) {
            return false;
        }

        // 检查循环依赖
        if (checkCircularDependency(prerequisiteId, courseId)) {
            System.out.println("错误: 添加此先修课程会导致循环依赖");
            return false;
        }

        course.addPrerequisite(prerequisiteId);
        courseRepository.save(course);
        return true;
    }

    @Override
    public List<Course> getPrerequisites(UUID courseId) {
        Course course = findCourseById(courseId);
        if (course == null) {
            return new ArrayList<>();
        }

        List<Course> prerequisites = new ArrayList<>();
        for (UUID prereqId : course.getPrerequisites()) {
            Course prereq = findCourseById(prereqId);
            if (prereq != null) {
                prerequisites.add(prereq);
            }
        }
        return prerequisites;
    }

    @Override
    public boolean canStudentTakeCourse(String studentId, UUID courseId) {
        Course course = findCourseById(courseId);
        if (course == null) {
            return false;
        }
        
        Student student = studentService.findByStudentId(studentId);
        if (student == null) {
            return false;
        }

        if (course.getSemester() != null) {
            String semester = course.getSemester();
            int requiredGrade = 0;

            if (semester.startsWith("大一")) {
                requiredGrade = 1;
            } else if (semester.startsWith("大二")) {
                requiredGrade = 2;
            } else if (semester.startsWith("大三")) {
                requiredGrade = 3;
            } else if (semester.startsWith("大四")) {
                requiredGrade = 4;
            }

            int studentGrade = student.getGrade();

            if (requiredGrade > 0 && studentGrade < requiredGrade) {
                return false;
            }
        }

        List<Grade> studentGrades = studentService.getStudentGrades(studentId);
        Set<UUID> completedCourseIds = new HashSet<>();

        for (Grade grade : studentGrades) {
            if (grade.getScore() >= 60) {
                completedCourseIds.add(grade.getCourseId());
            }
        }

        if (completedCourseIds.contains(courseId)) {
            return false;
        }

        for (UUID prereqId : course.getPrerequisites()) {
            if (!completedCourseIds.contains(prereqId)) {
                return false;
            }
        }

        return true;
    }

    @Override
    public void printCourseDetails(UUID courseId) {
        Course course = findCourseById(courseId);
        if (course == null) {
            System.out.println("找不到ID为 " + courseId + " 的课程");
            return;
        }

        System.out.println("\n========== 课程详情 ==========");
        System.out.println("课程名称: " + course.getName() + " (" + course.getCode() + ")");
        System.out.println("学分: " + course.getCredits());
        System.out.println("类型: " + course.getCourseType());
        if (course.getSemester() != null) {
            System.out.println("开课学期: " + course.getSemester());
        }

        List<Course> prerequisites = getPrerequisites(courseId);
        if (!prerequisites.isEmpty()) {
            System.out.println("先修课程:");
            for (Course prereq : prerequisites) {
                System.out.println("  - " + prereq.getName() + " (" + prereq.getCode() + ")");
            }
        } else {
            System.out.println("无先修课程要求");
        }

        if (course.getDescription() != null) {
            System.out.println("课程描述: " + course.getDescription());
        }
        System.out.println("================================");
    }

    // 检查是否存在循环依赖
    private boolean checkCircularDependency(UUID startCourseId, UUID targetCourseId) {
        Set<UUID> visited = new HashSet<>();
        return checkCircularDependencyDFS(startCourseId, targetCourseId, visited);
    }

    private boolean checkCircularDependencyDFS(UUID currentId, UUID targetId, Set<UUID> visited) {
        if (currentId.equals(targetId)) {
            return true;
        }

        if (visited.contains(currentId)) {
            return false;
        }

        visited.add(currentId);
        Course current = findCourseById(currentId);
        if (current == null) {
            return false;
        }

        for (UUID prereqId : current.getPrerequisites()) {
            if (checkCircularDependencyDFS(prereqId, targetId, visited)) {
                return true;
            }
        }

        return false;
    }
}
