package com.academic.repository.impl;

import com.academic.domain.Course;
import com.academic.repository.CourseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.*;
import java.util.*;

public class FileCourseRepository implements CourseRepository {
    private final String courseDir;
    private final ObjectMapper objectMapper;

    public FileCourseRepository(String baseDir) {
        this.courseDir = baseDir + File.separator + "courses";
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());

        // 确保目录存在
        File dir = new File(courseDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    @Override
    public Course save(Course course) {
        try {
            File file = new File(courseDir, course.getId().toString() + ".json");
            objectMapper.writeValue(file, course);
            return course;
        } catch (IOException e) {
            throw new RuntimeException("保存课程失败", e);
        }
    }

    @Override
    public Course findById(UUID id) {
        File file = new File(courseDir, id.toString() + ".json");
        if (!file.exists()) {
            return null;
        }
        try {
            return objectMapper.readValue(file, Course.class);
        } catch (IOException e) {
            throw new RuntimeException("读取课程失败", e);
        }
    }

    @Override
    public Course findByCode(String code) {
        List<Course> allCourses = findAll();
        return allCourses.stream()
                .filter(c -> c.getCode().equals(code))
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<Course> findAll() {
        List<Course> courses = new ArrayList<>();
        File dir = new File(courseDir);
        File[] files = dir.listFiles((d, name) -> name.endsWith(".json"));

        if (files != null) {
            for (File file : files) {
                try {
                    Course course = objectMapper.readValue(file, Course.class);
                    courses.add(course);
                } catch (IOException e) {
                    System.err.println("读取课程文件失败: " + file.getName());
                }
            }
        }
        return courses;
    }

    @Override
    public boolean delete(UUID id) {
        File file = new File(courseDir, id.toString() + ".json");
        return file.exists() && file.delete();
    }
}