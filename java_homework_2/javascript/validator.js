// js/validator.js

// 验证学号
export function validateStudentId(studentId) {
    return /^S\d{3}$/.test(studentId);
}

// 验证姓名
export function validateName(name) {
    return name.trim().length > 0;
}

// 验证年龄
export function validateAge(age) {
    return age >= 15 && age <= 50;
}

// 验证邮箱
export function validateEmail(email) {
    return email.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}