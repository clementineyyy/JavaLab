package com.academic.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Student extends Person implements Serializable {
    private static final long serialVersionUID = 1L;

    private String studentId;
    private int grade;
    private String major;
    private List<CETCertificate> certificates = new ArrayList<>();
    private List<Grade> grades = new ArrayList<>();

    // 无参构造函数
    public Student() {
        super(UUID.randomUUID(), "", LocalDate.now(), "");
    }
    public Student(UUID id, String name, LocalDate birthDate, String contactInfo,
                  String studentId, int grade, String major) {
        super(id, name, birthDate, contactInfo);
        this.studentId = studentId;
        this.grade = grade;
        this.major = major;
        this.certificates = new ArrayList<>();
    }


    //实现多态和继承
    @Override
    public String getRole() {
        return "学生";
    }

    public int getAge() {
        return LocalDate.now().getYear() - birthDate.getYear();
    }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public int getGrade() { return grade; }
    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }
    public List<CETCertificate> getCertificates() { return certificates; }
    public List<Grade> getGrades() { return grades; }
}