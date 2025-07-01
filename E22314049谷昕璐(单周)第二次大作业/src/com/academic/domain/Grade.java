package com.academic.domain;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;


public class Grade implements Serializable {
    private static final long serialVersionUID = 1L;

    private UUID id;
    private UUID studentId;
    private UUID courseId;
    private double score;
    private LocalDate recordDate;
    private String semester;
    private String courseName;

    @JsonCreator
    public Grade(
            @JsonProperty("courseName") String courseName,
            @JsonProperty("studentId") UUID studentId,
            @JsonProperty("courseId") Object courseId,
            @JsonProperty("score") double score,
            @JsonProperty("recordDate") LocalDate recordDate,
            @JsonProperty("semester") String semester) {
        this.courseName = courseName;
        this.studentId = studentId;
        this.courseId = (courseId instanceof UUID) ? (UUID)courseId : UUID.randomUUID();
        this.score = score;
        this.recordDate = recordDate;
        this.semester = semester;
    }


    public String getCourseName() { return courseName; }
    public void setId(UUID id) { this.id = id; }
    public UUID getId() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        return this.id;
    }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public UUID getCourseId() { return courseId; }
    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
    public LocalDate getRecordDate() { return recordDate; }
    public String getSemester() { return semester; }
}
