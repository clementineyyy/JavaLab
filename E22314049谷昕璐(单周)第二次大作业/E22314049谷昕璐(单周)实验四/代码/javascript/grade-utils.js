/**
 * 将成绩数据按"姓名_学号_考试"格式整理存储
 */
function organizeGradesByExam() {
    // 获取现有数据
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const grades = JSON.parse(localStorage.getItem('grades') || '[]');

    // 创建格式化后的数据结构
    const organizedGrades = {};

    // 遍历所有成绩记录
    grades.forEach(grade => {
        // 找到对应的学生
        const student = students.find(s => s.id === grade.studentId);
        if (!student) return;

        // 找到对应的课程
        const course = courses.find(c => c.id === grade.courseId);
        if (!course) return;

        // 创建目录键名：姓名_学号_考试
        const examName = grade.examType || '期末考试'; // 默认为期末考试
        const dirKey = `${student.name}_${student.studentId}_${examName}`;

        // 如果该键不存在则初始化
        if (!organizedGrades[dirKey]) {
            organizedGrades[dirKey] = {
                studentName: student.name,
                studentId: student.studentId,
                examName: examName,
                grades: []
            };
        }

        // 添加成绩记录
        organizedGrades[dirKey].grades.push({
            courseId: course.courseId,
            courseName: course.courseName,
            score: grade.score,
            credit: course.credit
        });
    });

    // 存储到localStorage
    localStorage.setItem('organizedGrades', JSON.stringify(organizedGrades));
    console.log('成绩数据已按"姓名_学号_考试"格式整理完成');

    return organizedGrades;
}

/**
 * 导出整理后的成绩为JSON文件
 */
function exportOrganizedGrades() {
    // 确保数据是最新的
    const organizedGrades = organizeGradesByExam();

    // 转换为JSON字符串
    const jsonString = JSON.stringify(organizedGrades, null, 2);

    // 创建下载链接
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 创建临时下载链接并触发下载
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_grades_by_exam.json';
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}