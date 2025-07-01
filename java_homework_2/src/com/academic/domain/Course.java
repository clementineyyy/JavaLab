package com.academic.domain;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Course implements Serializable {
    private static final long serialVersionUID = 1L;

    private UUID id;
    private String code;
    private String name;
    private int credits;
    private String courseType; // 必修/选修
    private String semester;   // 开课学期
    private List<UUID> prerequisites; // 先修课程ID列表
    private String description;

    public Course() {
        this.id = UUID.randomUUID();
        this.prerequisites = new ArrayList<>();
    }

    public Course(UUID id, String code, String name, int credits, String courseType) {
        this.id = id == null ? UUID.randomUUID() : id;
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.courseType = courseType;
        this.prerequisites = new ArrayList<>();
    }

    public void setId(UUID id) {
        this.id = id;
    }

    // 添加和移除先修课程的方法
    public void addPrerequisite(UUID courseId) {
        if (!prerequisites.contains(courseId)) {
            prerequisites.add(courseId);
        }
    }

    public boolean removePrerequisite(UUID courseId) {
        return prerequisites.remove(courseId);
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }
    public String getCourseType() { return courseType; }
    public void setCourseType(String courseType) { this.courseType = courseType; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public List<UUID> getPrerequisites() { return prerequisites; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}