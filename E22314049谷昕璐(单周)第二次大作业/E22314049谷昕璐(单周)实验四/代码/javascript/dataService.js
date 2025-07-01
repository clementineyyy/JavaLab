// js/dataService.js

// 获取学生数据
export function getStudents() {
    return JSON.parse(localStorage.getItem('students')) || [];
}

// 保存学生数据
export function saveStudents(students) {
    localStorage.setItem('students', JSON.stringify(students));
}

// 添加学生
export function addStudent(student) {
    const students = getStudents();
    students.push(student);
    saveStudents(students);
}

// 更新学生
export function updateStudent(studentId, updatedStudent) {
    let students = getStudents();
    students = students.map(student => student.id === studentId ? updatedStudent : student);
    saveStudents(students);
}

// 删除学生
export function deleteStudent(studentId) {
    let students = getStudents();
    students = students.filter(student => student.id !== studentId);
    saveStudents(students);
}