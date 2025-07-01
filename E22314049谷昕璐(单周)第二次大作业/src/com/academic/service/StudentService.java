package com.academic.service;
import com.academic.domain.CETCertificate;
import com.academic.domain.Student;
import com.academic.domain.Grade;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface StudentService {
    //按姓名查询学生
    List<Student> findByName(String name);
    Student findById(UUID id);
    //按学号查询学生
    Student findByStudentId(String studentId);
    //按年龄段查询学生
    List<Student> findByAgeRange(int minAge, int maxAge);
    boolean addCertificateToStudent(String studentId, CETCertificate certificate);
    boolean removeCertificateFromStudent(String studentId, UUID certificateId);

    // 增加，更新，删除学生
    Student addStudent(Student student);
    Student updateStudent(Student student);
    boolean deleteStudent(String studentId);
    List<Student> getAllStudents();
    //对学生成绩的操作
    boolean addGradeToStudent(String studentId, com.academic.domain.Grade grade);
    boolean updateStudentGrade(String studentId, UUID gradeId, com.academic.domain.Grade updatedGrade);
    boolean removeGradeFromStudent(String studentId, UUID gradeId);
    List<com.academic.domain.Grade> getStudentGrades(String studentId);
    double getStudentAverageScore(String studentId);
    Grade getStudentHighestGrade(String studentId);
    Grade getStudentLowestGrade(String studentId);
    Map<String, Integer> getStudentScoreDistribution(String studentId);
    void printStudentGradeReport(String studentId);
}