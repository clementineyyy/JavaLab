// api-client.js
const API_URL = 'http://localhost:3000/api';

const ApiClient = {
  // 学生API
  async getStudents() {
    const response = await fetch(`${API_URL}/students`);
    const data = await response.json();
    return data.students;
  },

  async saveStudent(student) {
    const response = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    return await response.json();
  },

  // 成绩API
  async getGrades() {
    const response = await fetch(`${API_URL}/grades`);
    const data = await response.json();
    return data.grades;
  },

  async saveGrade(grade) {
    const response = await fetch(`${API_URL}/grades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grade)
    });
    return await response.json();
  }

};