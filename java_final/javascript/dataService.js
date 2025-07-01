// js/dataService.js
// 获取学生数据
function getStudents() {
    return JSON.parse(localStorage.getItem('students')) || [];
}

// 保存学生数据到本地存储
function saveStudents(students) {
    localStorage.setItem('students', JSON.stringify(students));
}

// 添加学生
function addStudent(student) {
    const students = getStudents();
    students.push(student);
    saveStudents(students);
}

// 更新学生
function updateStudent(studentId, updatedStudent) {
    let students = getStudents();
    students = students.map(student => student.id === studentId ? updatedStudent : student);
    saveStudents(students);
}

// 删除学生
function deleteStudent(studentId) {
    let students = getStudents();
    students = students.filter(student => student.id !== studentId);
    saveStudents(students);
}


// 从后端获取学生数据
const apiBaseUrl = 'http://localhost:3000/api';

// 获取学生列表
async function fetchStudents() {
    try {
        const response = await fetch(`${apiBaseUrl}/students`);
        if (!response.ok) {
            throw new Error('获取学生数据失败');
        }
        return await response.json();
    } catch (error) {
        console.error('获取学生数据出错:', error);
        throw new Error('获取学生数据失败');
    }
}

async function fetchGrades() {
    try {
        const response = await fetch('http://localhost:3000/api/grades');
        if (!response.ok) throw new Error('获取成绩数据失败');
        const data = await response.json();

        // 完善字段名映射
        return data.map(grade => ({
            ...grade,
            id: grade.id,
            studentId: grade.studentId || grade.student_id,
            studentName: grade.studentName || grade.student_name,
            courseId: grade.courseId || grade.course_id,
            courseName: grade.courseName || grade.course_name,
            semester: grade.semester,
            score: grade.score,
        }));
    } catch (error) {
        console.error('获取成绩数据出错:', error);
        return JSON.parse(localStorage.getItem('grades') || '[]');
    }
}

async function saveStudent(student) {
    try {
        console.log('准备保存学生数据:', student);

        // 获取当前所有学生
        const students = getStudents();

        const existingStudent = students.find(s => String(s.id) === String(student.id));
        const isNewStudent = !existingStudent;

        console.log('是否为新学生:', isNewStudent);

        const method = isNewStudent ? 'POST' : 'PUT';
        const url = isNewStudent
            ? 'http://localhost:3000/api/students'
            : `http://localhost:3000/api/students/${student.id}`;

        console.log(`使用${method}方法请求${url}`);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(student)
        });

        const responseText = await response.text();
        console.log('服务器响应:', response.status, responseText);

        if (!response.ok) {
            throw new Error(`保存学生数据失败: ${responseText}`);
        }

        // 解析JSON响应
        const result = JSON.parse(responseText);

        // 如果是新添加的学生，添加到本地存储
        if (isNewStudent && result.success) {
            let students = getStudents();
            student.id = result.id; // 使用服务器返回的ID
            students.push(student);
            saveStudents(students);
            console.log('学生已添加到本地存储:', student);
        }

        return result;
    } catch (error) {
        console.error('保存学生数据出错:', error);

        // 服务器保存失败时使用本地存储作为回退方案
        console.log('尝试使用本地存储保存学生数据');

        let students = getStudents();
        const isNewStudent = !student.id || student.id === '';

        if (!isNewStudent) {
            // 更新现有学生
            const index = students.findIndex(s => String(s.id) === String(student.id));
            if (index !== -1) {
                students[index] = student;
            } else {
                students.push(student);
            }
        } else {
            student.id = String(Date.now());
            students.push(student);
        }

        // 保存回本地存储
        saveStudents(students);

        return { success: true, message: '已保存到本地存储', student };
    }
}

// 从后端获取证书数据
async function fetchCertificates() {
  try {
    const response = await fetch('http://localhost:3000/api/certificate');
    if (!response.ok) throw new Error('获取证书数据失败');

    const data = await response.json();
    return data.map(cert => ({
      id: cert.id,
      studentId: cert.student_id,
      studentName: cert.student_name || '未知学生',
      name: cert.name || '未命名证书',
      issueDate: cert.issue_date,
      description: cert.description
    }));
  } catch (error) {
    console.error('获取证书数据出错:', error);
    throw new Error('获取证书数据失败');
  }
}

async function saveCertificate(certificateData) {
  try {
    console.log('准备保存证书数据:', certificateData);

    // 创建符合后端API期望的数据结构
    const requestBody = {
      id: certificateData.id,
      student_id: certificateData.studentId,
      name: certificateData.name,
      issue_date: certificateData.issueDate,
      issuer:certificateData.issuer || null,
    };

    console.log('发送到服务器的数据:', requestBody);

      const response = await fetch('http://localhost:3000/api/certificate', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
          throw new Error(`服务器响应错误: ${response.status}`);
      }

      const result = await response.json();
      console.log('证书保存成功:', result);
      return result;
  } catch (error) {
      console.error('保存证书出错:', error);
      throw error;
  }
}

async function deleteCertificate(certificateId) {
    try {
        const response = await fetch(`${apiBaseUrl}/certificate/${certificateId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('删除证书失败');
        }

        return await response.json();
    } catch (error) {
        console.error('删除证书出错:', error);
        throw error;
    }
}


async function deleteStudentFromDB(studentId) {
  try {
    const response = await fetch(`http://localhost:3000/api/students/${studentId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('删除学生数据失败');

    let students = getStudents();
    students = students.filter(s => String(s.id) !== String(studentId));
    saveStudents(students);

    return await response.json();
  } catch (error) {
    console.error('删除学生数据出错:', error);
    throw error;
  }
}



async function fetchCourses() {
  try {
    const response = await fetch('http://localhost:3000/api/courses');
    if (!response.ok) throw new Error('获取课程数据失败');

    const coursesData = await response.json();

    // 将数据库中的课程数据更新到 localStorage
    localStorage.setItem('courses', JSON.stringify(coursesData));
    console.log('课程数据已从数据库同步到本地存储');

    return coursesData;
  } catch (error) {
    console.error('获取课程数据出错:', error);
    return JSON.parse(localStorage.getItem('courses') || '[]');
  }
}

// 从后端获取教师数据
async function fetchTeachers() {
  try {
    const response = await fetch('http://localhost:3000/api/teachers');
    if (!response.ok) throw new Error('获取教师数据失败');
    return await response.json();
  } catch (error) {
    console.error('获取教师数据出错:', error);
    return JSON.parse(localStorage.getItem('teachers') || '[]');
  }
}



async function saveGrade(grade) {
  try {
    const isLocalId = grade.id && !isNaN(grade.id) && grade.id.toString().length > 10;

    const method = grade.id && !isLocalId ? 'PUT' : 'POST';
    const url = grade.id && !isLocalId
      ? `http://localhost:3000/api/grades/${grade.id}`
      : 'http://localhost:3000/api/grades';

    console.log(`保存成绩使用${method}方法请求${url}`);

    // 创建新对象，如果是新增则移除ID字段
    const gradeData = {...grade};
    if (isLocalId) {
      delete gradeData.id;
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gradeData)
    });

    if (!response.ok) throw new Error('保存成绩数据失败');
    const result = await response.json();

    // 确保返回的数据包含完整字段
    if (result.grade) {
      result.grade.studentId = result.grade.studentId || result.grade.student_id;
      result.grade.courseId = result.grade.courseId || result.grade.course_id;
    }

    return result;
  } catch (error) {
    console.error('保存成绩数据出错:', error);
    throw error;
  }
}

// 删除成绩数据
async function deleteGrade(gradeId) {
  try {
    const response = await fetch(`http://localhost:3000/api/grades/${gradeId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('删除成绩数据失败');
    return await response.json();
  } catch (error) {
    console.error('删除成绩数据出错:', error);
    throw error;
  }
}

window.dataService = {
    fetchStudents,
    fetchGrades,
    fetchCourses,
    fetchTeachers,
    fetchCertificates,
    saveStudent,
    deleteStudentFromDB,
    saveGrade,
    deleteGrade,
    getStudents,
    saveStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    saveCertificate,
    deleteCertificate
};