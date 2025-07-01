package com.academic;
import com.academic.repository.CourseRepository;
import com.academic.repository.impl.FileCourseRepository;
import com.academic.service.CourseService;
import com.academic.service.impl.CourseServiceImpl;

import com.academic.service.StudentService;
import com.academic.domain.Grade;
import com.academic.domain.Course;
import com.academic.service.impl.StudentServiceImpl;
import com.academic.domain.Student;
import com.academic.domain.CETCertificate;
import java.util.UUID;
import java.util.List;
import java.time.LocalDate;
import java.io.File;

public class StudentManagementApp {
    public static void main(String[] args) {
        String baseDir = System.getProperty("user.home") + File.separator + "Documents" + File.separator + "academic_data";
        String courseDir = baseDir + File.separator + "courses";

        // 创建目录
        createDirectory(baseDir);
        createDirectory(courseDir);

        //初始化服务
        StudentService studentService = new StudentServiceImpl(baseDir);

        // 创建学生对象
        Student student1 = new Student(null, "张三", LocalDate.of(2000, 1, 1),
                "电话:123456789", "S001", 3, "计算机科学");
        Student student2 = new Student(null, "李四", LocalDate.of(2002, 3, 15),
                "电话:987654321", "S002", 2, "数学");

        // 功能点1：添加学生，自动保存到文件
        try {
            studentService.addStudent(student1);
        } catch (IllegalArgumentException e) {
            System.out.println("学生S001已存在，更新信息...");
            studentService.updateStudent(student1);
        }
        try {
            studentService.addStudent(student2);
        } catch (IllegalArgumentException e) {
            System.out.println("学生S002已存在，更新信息...");
            studentService.updateStudent(student2);
        }

        //功能点1：查询学生
        Student student3 = studentService.findByStudentId("S002");
        if (student3 != null) {
            // 功能点4：添加四六级证书
            UUID studentUuid = student3.getId();
            CETCertificate cet4 = new CETCertificate(
                    UUID.randomUUID(),
                    studentUuid,
                    "CET",
                    4,
                    550,
                    LocalDate.of(2023, 6, 10),  // Issue date
                    "教育部考试中心",
                    LocalDate.of(2026, 6, 10)   // Expiration date (typically 3 years after issue)
            );
            boolean added = studentService.addCertificateToStudent("S002", cet4);
            if (added) {
                // 确保更新后的学生信息被保存到文件
                studentService.updateStudent(student3);
                System.out.println("证书已成功添加并保存");
            } else {
                System.out.println("证书添加失败");
            }
        } else {
            System.out.println("错误：未找到学号为S002的学生");
        }

        // 初始化课程服务
        CourseRepository courseRepository = new FileCourseRepository(baseDir);
        CourseService courseService = new CourseServiceImpl(courseRepository, studentService);

        // 功能点5：创建课程
        // 创建课程前先检查是否已存在
        Course mathCourse = null;
        Course programmingCourse = null;
        Course dataStructureCourse = null;
        Course existingMathCourse = courseService.findCourseByCode("MATH101");
        if (existingMathCourse == null) {
            mathCourse = new Course(
                    null,
                    "MATH101",
                    "高等数学",
                    4,
                    "必修"
            );
            mathCourse.setSemester("大一上学期");
            mathCourse.setDescription("微积分基础，包括极限、导数、积分和级数等内容");
            courseService.addCourse(mathCourse);
        } else {
            mathCourse = existingMathCourse;
        }

        Course existingProgrammingCourse = courseService.findCourseByCode("CS101");
        if (existingProgrammingCourse == null) {
            programmingCourse = new Course(
                    null,
                    "CS101",
                    "程序设计",
                    3,
                    "必修"
            );
            programmingCourse.setSemester("大一上学期");
            courseService.addCourse(programmingCourse);
        } else {
            programmingCourse = existingProgrammingCourse;
        }

        Course existingDataStructureCourse = courseService.findCourseByCode("CS201");
        if (existingDataStructureCourse == null) {
            dataStructureCourse = new Course(
                    null,
                    "CS201",
                    "数据结构",
                    4,
                    "必修"
            );
            dataStructureCourse.setSemester("大一下学期");
            courseService.addCourse(dataStructureCourse);
        } else {
            dataStructureCourse = existingDataStructureCourse; // 添加这行
        }

        Course physicsCourse = null;
        Course existingPhysicsCourse = courseService.findCourseByCode("PHY101");
        if (existingPhysicsCourse == null) {
            physicsCourse = new Course(
                    null,
                    "PHY101",
                    "大学物理",
                    4,
                    "必修"
            );
            physicsCourse.setSemester("大一下学期");
            physicsCourse.setDescription("力学、热学、电磁学和光学基础");
            courseService.addCourse(physicsCourse);
        } else {
            physicsCourse = existingPhysicsCourse;
        }

        Course softwareEngineeringCourse = null;
        Course existingSoftwareEngineeringCourse = courseService.findCourseByCode("CS301");
        if (existingSoftwareEngineeringCourse == null) {
            softwareEngineeringCourse = new Course(
                    null,
                    "CS301",
                    "软件工程",
                    4,
                    "必修"
            );
            softwareEngineeringCourse.setSemester("大三上学期");
            softwareEngineeringCourse.setDescription("软件开发生命周期、项目管理、软件设计和测试等。仅限大三上学期学生选修。");
            courseService.addCourse(softwareEngineeringCourse);
        } else {
            softwareEngineeringCourse = existingSoftwareEngineeringCourse;
        }

        // 设置先修课程关系
        courseService.addPrerequisite(dataStructureCourse.getId(), programmingCourse.getId());

        // 打印课程详情
        System.out.println("\n===== 课程信息 =====");
        courseService.printCourseDetails(dataStructureCourse.getId());

        Student studentForGrades = studentService.findByStudentId("S001");
        List<Grade> grades = null;
        if (studentForGrades != null) {
            // 功能点2：添加成绩
            UUID mathCourseId = UUID.randomUUID();
            Grade mathGrade = new Grade(
                    "高等数学",
                    studentForGrades.getId(),
                    mathCourse.getId(),
                    85.5,
                    LocalDate.of(2023, 6, 20),
                    "2023-春季"
            );

            Grade progGrade = new Grade(
                    "程序设计",
                    student1.getId(),
                    programmingCourse.getId(),
                    92.0,
                    LocalDate.of(2023, 6, 15),
                    "2023-春季"
            );

            Grade physicsGrade = new Grade(
                    "大学物理",
                    student1.getId(),
                    physicsCourse.getId(),
                    65.0,
                    LocalDate.of(2023, 6, 22),
                    "2023-春季"
            );

            studentService.addGradeToStudent("S001", mathGrade);
            studentService.addGradeToStudent("S001", progGrade);
            studentService.addGradeToStudent("S001", physicsGrade);

            // 功能点5：展示学生选课列表
            System.out.println("\n===== 学生已修课程列表 =====");
            String studentId = "S001";
            List<Grade> studentGrades = studentService.getStudentGrades(studentId);
            if (studentGrades.isEmpty()) {
                System.out.println("学生 " + studentId + " 暂无已修课程");
            } else {
                System.out.println("学生 " + studentId + " 已修课程：");
                for (Grade grade : studentGrades) {
                    Course course = courseService.findCourseById(grade.getCourseId());
                    String courseName = course != null ? course.getName() : grade.getCourseName();
                    System.out.println("  - " + courseName + " (" + grade.getScore() + "分)");
                }
            }

            // 功能点3：输出学生成绩档案
            studentService.printStudentGradeReport("S001");

            // 功能点2：查询成绩
            grades = studentService.getStudentGrades("S001");
            System.out.println("张三的成绩列表：");
            for (Grade g : grades) {
                System.out.println("  - " + g.getCourseName() + ": " + g.getScore() +
                        " (" + g.getSemester() + ")");
            }

            // 功能点2：修改成绩
            if (!grades.isEmpty()) {
                UUID gradeId = grades.get(0).getId();
                Grade updatedGrade = new Grade(
                        "高等数学",
                        studentForGrades.getId(),
                        mathCourseId,
                        90.0,
                        LocalDate.of(2023, 6, 20),
                        "2023-春季"
                );

                boolean updated = studentService.updateStudentGrade("S002", gradeId, updatedGrade);
                if (updated) {
                    System.out.println("成功更新数学成绩");
                }
            }
        }

        // 检查学生是否可以选择特定课程
        String studentId = "S001";
        UUID courseId = dataStructureCourse.getId();
        boolean canTake = courseService.canStudentTakeCourse(studentId, courseId);

        System.out.println("\n===== 选课检查 =====");
        System.out.println("学生 " + studentId + (canTake ? " 可以" : " 不可以") +
                "选修 " + dataStructureCourse.getName());
        if (!canTake) {
            System.out.println("原因: 未满足先修课程要求");
            List<Course> prerequisites = courseService.getPrerequisites(courseId);
            System.out.println("需要先完成以下课程:");
            for (Course prereq : prerequisites) {
                System.out.println("  - " + prereq.getName() + " (" + prereq.getCode() + ")");
            }
        }

        // 功能点5：通过课程代码查找课程
        mathCourse = courseService.findCourseByCode("MATH101");

        if (mathCourse != null) {
            // 修改课程信息
            mathCourse.setCredits(5); // 修改学分
            mathCourse.setDescription("高等数学进阶课程，包括微积分、多元函数和向量分析"); // 修改描述
            mathCourse.setSemester("大一全年"); // 修改学期
            mathCourse.setCourseType("核心必修"); // 修改课程类型

            // 保存修改后的课程
            courseService.updateCourse(mathCourse);

            // 输出修改后的课程信息
            System.out.println("\n===== 修改后的课程信息 =====");
            courseService.printCourseDetails(mathCourse.getId());
        } else {
            System.out.println("找不到课程代码为MATH101的课程");
        }

        // 功能点5：通过课程代码找到要删除的课程
        Course courseToDelete = courseService.findCourseByCode("CS301");  // 删除软件工程课程

        if (courseToDelete != null) {
            // 输出删除前的课程信息
            System.out.println("\n===== 即将删除的课程信息 =====");
            courseService.printCourseDetails(courseToDelete.getId());

            // 执行删除操作
            boolean isDeleted = courseService.deleteCourse(courseToDelete.getId());

            // 输出删除结果
            if (isDeleted) {
                System.out.println("\n课程 " + courseToDelete.getName() + " (" + courseToDelete.getCode() + ") 已成功删除");
            } else {
                System.out.println("\n删除课程失败");
            }

            // 尝试再次查找该课程验证是否删除成功
            Course checkCourse = courseService.findCourseByCode(courseToDelete.getCode());
            if (checkCourse == null) {
                System.out.println("验证结果：课程已从系统中移除");
            } else {
                System.out.println("验证结果：课程仍然存在于系统中");
            }
        } else {
            System.out.println("\n找不到指定的课程");
        }

        // 功能点2：删除学生的某个成绩
        UUID gradeIdToRemove = grades.get(0).getId();
        boolean result = studentService.removeGradeFromStudent("S001", gradeIdToRemove);
        if (result) {
            System.out.println("成绩删除成功！");
        } else {
            System.out.println("成绩删除失败！");
        }
        System.out.println("张三的成绩列表：");
        for (Grade g : grades) {
            System.out.println("  - " + g.getCourseName() + ": " + g.getScore() +
                    " (" + g.getSemester() + ")");
        }

        // 功能点1：修改学生信息
        Student student4 = studentService.findByStudentId("S001");
        if (student4 != null) {
            student4.setMajor("软件工程");
            studentService.updateStudent(student4);
        }


        //功能点1：按姓名，学号，或者年龄段查询学生
        System.out.println("\n===== 查询学生结果 =====");
        List<Student> studentsByName = studentService.findByName("张");
        System.out.println("按姓名查询结果（张）：" + studentsByName.size() + "个学生");
        for (Student s : studentsByName) {
            System.out.println("  - " + s.getName() + ", 学号: " + s.getStudentId() + ", 专业: " + s.getMajor());
        }
        Student studentByStudentId = studentService.findByStudentId("S001");
        System.out.println("按学号查询结果（S001）: " + (studentByStudentId != null ?
                studentByStudentId.getName() : "未找到"));
        List<Student> studentsByAge = studentService.findByAgeRange(20, 24);
        System.out.println("按年龄段查询结果（20-24岁）：" + studentsByAge.size() + "个学生");
        for (Student s : studentsByAge) {
            System.out.println("  - " + s.getName());
        }
        List<Student> allStudents = studentService.getAllStudents();
        System.out.println("所有学生清单（共" + allStudents.size() + "人）：");
        for (Student s : allStudents) {
            System.out.println("  - " + s.getName() + ", 学号: " + s.getStudentId() +
                    ", 专业: " + s.getMajor() + ", 年级: " + s.getGrade());
        }

        // 功能点1：删除学生
        //studentService.deleteStudent("S001");

        //功能点4：删除四六级证书
        System.out.println("\n===== 删除学生证书 =====");
        if (student3 != null && !student3.getCertificates().isEmpty()) {
            // 获取第一个证书的ID
            UUID certificateId = student3.getCertificates().get(0).getId();

            // 删除证书
            boolean removed = studentService.removeCertificateFromStudent("S002", certificateId);

            if (removed) {
                System.out.println("成功删除李四的证书");
            } else {
                System.out.println("删除证书失败");
            }
        } else {
            System.out.println("李四没有证书可以删除");
        }

        System.out.println("学生管理系统已运行完成。");
    }

    private static void createDirectory(String path) {
        File dir = new File(path);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            if (!created) {
                System.err.println("错误：无法创建目录 " + path);
            }
        }

        // 检查读写权限
        if (!dir.canRead()) {
            System.err.println("错误：无法读取目录 " + path);
        }
        if (!dir.canWrite()) {
            System.err.println("错误：无法写入目录 " + path);
        }

        // 尝试创建测试文件验证权限
        try {
            File testFile = new File(dir, "test.tmp");
            if (testFile.createNewFile()) {
                testFile.delete();
            } else {
                System.err.println("错误：无法在目录中创建文件 " + path);
            }
        } catch (Exception e) {
            System.err.println("错误：目录访问测试失败: " + e.getMessage());
        }
    }
}