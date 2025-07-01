package com.academic.service.impl;

import com.academic.domain.Grade;
import com.academic.domain.Student;
import com.academic.domain.CETCertificate;
import com.academic.service.StudentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.*;
import java.util.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class StudentServiceImpl implements StudentService {
    private Map<String, Student> studentMap = new HashMap<>();
    private final String dataDirectory;
    private final String dataFile;
    private final ObjectMapper mapper;
    private List<Grade> grades = new ArrayList<>();

    public StudentServiceImpl(String dataDirectory) {
        this.dataDirectory = dataDirectory;
        this.dataFile = dataDirectory + File.separator + "students.json";

        // 配置Jackson
        this.mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule()); // 处理LocalDate
        mapper.enable(SerializationFeature.INDENT_OUTPUT); // 美化输出

        loadStudents();
    }

    private void loadStudents() {
        File file = new File(dataFile);
        if (file.exists()) {
            try {
                // 从JSON文件读取
                studentMap = mapper.readValue(file,
                        new TypeReference<HashMap<String, Student>>() {});
            } catch (Exception e) {
                System.err.println("加载学生数据失败: " + e.getMessage());
                studentMap = new HashMap<>();
            }
        }
    }

    private void saveStudents() {
        File dir = new File(dataDirectory);
        if (!dir.exists() && !dir.mkdirs()) {
            System.err.println("无法创建目录: " + dataDirectory);
            return;
        }

        try {
            // 保存为JSON文件
            mapper.writeValue(new File(dataFile), studentMap);
        } catch (IOException e) {
            System.err.println("保存学生数据失败: " + e.getMessage());
        }
    }

    @Override
    public List<Student> findByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return Collections.emptyList();
        }

        return studentMap.values().stream()
                .filter(student -> student.getName() != null &&
                                  student.getName().contains(name))
                .collect(Collectors.toList());
    }

    @Override
    public Student findById(UUID id) {
        if (id == null) {
            return null;
        }

        // 遍历所有学生找到匹配的UUID
        return studentMap.values().stream()
                .filter(student -> id.equals(student.getId()))
                .findFirst()
                .orElse(null);
    }

    @Override
    public Student findByStudentId(String studentId) {
        if (studentId == null) {
            return null;
        }
        return studentMap.get(studentId);
    }

    @Override
    public List<Student> findByAgeRange(int minAge, int maxAge) {
        if (minAge > maxAge) {
            throw new IllegalArgumentException("最小年龄不能大于最大年龄");
        }

        return studentMap.values().stream()
                .filter(student -> {
                    int age = student.getAge();
                    return age >= minAge && age <= maxAge;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Student addStudent(Student student) {
        if (student == null || student.getStudentId() == null) {
            throw new IllegalArgumentException("学生信息不完整");
        }

        if (studentMap.containsKey(student.getStudentId())) {
            throw new IllegalArgumentException("学号已存在");
        }

        studentMap.put(student.getStudentId(), student);
        saveStudents();
        return student;
    }

    @Override
    public Student updateStudent(Student student) {
        if (student == null || student.getStudentId() == null) {
            throw new IllegalArgumentException("学生信息不完整");
        }

        if (!studentMap.containsKey(student.getStudentId())) {
            throw new IllegalArgumentException("学生不存在");
        }

        studentMap.put(student.getStudentId(), student);
        saveStudents();
        return student;
    }

    @Override
    public boolean deleteStudent(String studentId) {
        if (studentId == null || !studentMap.containsKey(studentId)) {
            return false;
        }

        studentMap.remove(studentId);
        saveStudents();
        return true;
    }

    @Override
    public List<Student> getAllStudents() {
        return new ArrayList<>(studentMap.values());
    }

    @Override
    public boolean addCertificateToStudent(String studentId, CETCertificate certificate) {
        Student student = findByStudentId(studentId);
        if (student == null || certificate == null) {
            return false;
        }

        student.getCertificates().add(certificate);
        updateStudent(student);
        return true;
    }

    @Override
    public boolean removeCertificateFromStudent(String studentId, UUID certificateId) {
        Student student = findByStudentId(studentId);
        if (student == null || certificateId == null) {
            return false;
        }

        List<CETCertificate> certificates = student.getCertificates();
        boolean removed = certificates.removeIf(cert -> certificateId.equals(cert.getId()));

        if (removed) {
            updateStudent(student); // 保存更改到文件
        }

        return removed;
    }

    @Override
    public boolean addGradeToStudent(String studentId, Grade grade) {
        Student student = findByStudentId(studentId);
        if (student == null || grade == null) {
            return false;
        }

        grade.setStudentId(student.getId());
        student.getGrades().add(grade);
        updateStudent(student);
        return true;
    }

    @Override
    public boolean updateStudentGrade(String studentId, UUID gradeId, Grade updatedGrade) {
        Student student = findByStudentId(studentId);
        if (student == null || gradeId == null || updatedGrade == null) {
            return false;
        }

        List<Grade> grades = student.getGrades();
        for (int i = 0; i < grades.size(); i++) {
            if (gradeId.equals(grades.get(i).getId())) {
                updatedGrade.setId(gradeId);
                updatedGrade.setStudentId(student.getId());
                grades.set(i, updatedGrade);
                updateStudent(student);
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean removeGradeFromStudent(String studentId, UUID gradeId) {
        Student student = findByStudentId(studentId);
        if (student == null || gradeId == null) {
            return false;
        }

        boolean removed = student.getGrades().removeIf(g -> gradeId.equals(g.getId()));
        if (removed) {
            updateStudent(student);
        }
        return removed;
    }

    @Override
    public List<Grade> getStudentGrades(String studentId) {
        Student student = findByStudentId(studentId);
        return student != null ? student.getGrades() : Collections.emptyList();
    }

    @Override
    public double getStudentAverageScore(String studentId) {
        List<Grade> grades = getStudentGrades(studentId);
        if (grades.isEmpty()) {
            return 0.0;
        }
        double sum = 0.0;
        for (Grade grade : grades) {
            sum += grade.getScore();
        }
        return sum / grades.size();
    }

    @Override
    public Grade getStudentHighestGrade(String studentId) {
        List<Grade> grades = getStudentGrades(studentId);
        if (grades.isEmpty()) {
            return null;
        }
        return grades.stream()
                .max(Comparator.comparing(Grade::getScore))
                .orElse(null);
    }

    @Override
    public Grade getStudentLowestGrade(String studentId) {
        List<Grade> grades = getStudentGrades(studentId);
        if (grades.isEmpty()) {
            return null;
        }
        return grades.stream()
                .min(Comparator.comparing(Grade::getScore))
                .orElse(null);
    }

    @Override
    public Map<String, Integer> getStudentScoreDistribution(String studentId) {
        List<Grade> grades = getStudentGrades(studentId);
        Map<String, Integer> distribution = new HashMap<>();
        distribution.put("优秀(90-100)", 0);
        distribution.put("良好(80-89)", 0);
        distribution.put("中等(70-79)", 0);
        distribution.put("及格(60-69)", 0);
        distribution.put("不及格(0-59)", 0);

        for (Grade grade : grades) {
            double score = grade.getScore();
            if (score >= 90) {
                distribution.put("优秀(90-100)", distribution.get("优秀(90-100)") + 1);
            } else if (score >= 80) {
                distribution.put("良好(80-89)", distribution.get("良好(80-89)") + 1);
            } else if (score >= 70) {
                distribution.put("中等(70-79)", distribution.get("中等(70-79)") + 1);
            } else if (score >= 60) {
                distribution.put("及格(60-69)", distribution.get("及格(60-69)") + 1);
            } else {
                distribution.put("不及格(0-59)", distribution.get("不及格(0-59)") + 1);
            }
        }
        return distribution;
    }

    @Override
    public void printStudentGradeReport(String studentId) {
        Student student = findByStudentId(studentId);
        if (student == null) {
            System.out.println("找不到学号为 " + studentId + " 的学生");
            return;
        }

        List<Grade> grades = getStudentGrades(studentId);
        if (grades.isEmpty()) {
            System.out.println(student.getName() + " (学号: " + studentId + ") 暂无成绩记录");
            return;
        }

        System.out.println("\n=============== 学生成绩档案 ===============");
        System.out.println("学生: " + student.getName() + " (学号: " + studentId + ")");
        System.out.println("专业: " + student.getMajor() + ", 年级: " + student.getGrade());
        System.out.println("----------------------------------------");
        System.out.println("成绩列表:");

        for (Grade g : grades) {
            System.out.println("  - ID: " + g.getId() +
                              "\n    课程: " + g.getCourseName() +
                              "\n    分数: " + g.getScore() +
                              "\n    学期: " + g.getSemester() +
                              "\n    日期: " + g.getRecordDate());
        }

        System.out.println("----------------------------------------");
        System.out.println("统计信息:");
        System.out.println("  - 平均分: " + String.format("%.2f", getStudentAverageScore(studentId)));

        Grade highest = getStudentHighestGrade(studentId);
        System.out.println("  - 最高分: " + highest.getScore() + " (" + highest.getCourseName() + ")");

        Grade lowest = getStudentLowestGrade(studentId);
        System.out.println("  - 最低分: " + lowest.getScore() + " (" + lowest.getCourseName() + ")");

        System.out.println("  - 成绩分布:");
        Map<String, Integer> distribution = getStudentScoreDistribution(studentId);
        for (Map.Entry<String, Integer> entry : distribution.entrySet()) {
            if (entry.getValue() > 0) {
                System.out.println("    · " + entry.getKey() + ": " + entry.getValue() + "门");
            }
        }
        System.out.println("=======================================\n");
    }
}