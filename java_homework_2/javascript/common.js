function showMenusByRole(role) {
    const menuItems = document.querySelectorAll('.nav-item');
    menuItems.forEach(item => {
        // 特殊处理：课程管理菜单始终显示
        if (item.querySelector('a[href="course-management.html"]')) {
            item.style.display = 'block';
            return;
        }

        // 原有逻辑
        if (item.classList.contains(role + '-menu') ||
            (!item.classList.contains('student-menu') &&
             !item.classList.contains('teacher-menu') &&
             !item.classList.contains('admin-menu'))) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// 获取学期显示文本
function getSemesterDisplay(semesterCode) {
    if (!semesterCode) return '未知';
    try {
        const parts = semesterCode.split('-');
        if (parts.length !== 3) return '未知';
        return `${parts[0]}-${parts[1]}学年第${parts[2]}学期`;
    } catch (e) {
        return '未知';
    }
}

function checkPagePermission() {
    // 获取当前页面URL
    const currentPage = window.location.pathname.split('/').pop();

    // 如果是课程管理页面，允许所有角色访问
    if (currentPage === 'course-management.html') {
        return true;
    }

    // 其他页面保持原有的权限检查逻辑
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const role = currentUser.role || '';

    // 根据角色和页面进行权限检查
    // ...其他权限逻辑...

    return true; // 默认允许访问
}
// 确保函数在页面加载时被调用
document.addEventListener('DOMContentLoaded', function() {
    // 先执行权限检查
    if (checkPagePermission()) {
        // 获取当前用户角色并显示相应菜单
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const role = currentUser.role || 'guest';
        showMenusByRole(role);
    }
});

// js/common.js

// 系统共享功能

function initDefaultData() {
    try {
        if (typeof initializeDefaultStudents === 'function') {
            initializeDefaultStudents();
        }
        if (typeof initializeDefaultCourses === 'function') {
            initializeDefaultCourses();
        }
        // 其他初始化函数...
    } catch (e) {
        console.error('初始化数据失败:', e);
    }
}

// 添加到common.js中
function initializeDefaultStudents() {
    // 先检查localStorage中是否已有学生数据，避免重复初始化
    if (!localStorage.getItem('students')) {
        const defaultStudents = [
            {
                studentId: '2021001',
                name: '张三',
                gender: '男',
                age: 20,
                grade: '大二',
                major: '计算机科学'
            },
            {
                studentId: '2021002',
                name: '李四',
                gender: '女',
                age: 19,
                grade: '大一',
                major: '软件工程'
            },
            {
                studentId: '2021003',
                name: '王五',
                gender: '男',
                age: 21,
                grade: '大三',
                major: '信息安全'
            }
        ];
        localStorage.setItem('students', JSON.stringify(defaultStudents));
    }
}

// 添加这个函数（如果不存在）
function initializeDefaultCourses() {
    if (!localStorage.getItem('courses')) {
        const defaultCourses = [
            // 课程数据...
        ];
        localStorage.setItem('courses', JSON.stringify(defaultCourses));
    }
}

// 检查用户登录状态
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.username) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// 用户注销
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// 显示用户信息
function displayUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    document.getElementById('userName').textContent = currentUser.name || currentUser.username;
    const roleMap = {
        'student': '学生',
        'teacher': '教师',
        'admin': '管理员'
    };
    document.getElementById('userRole').textContent = roleMap[currentUser.role] || '用户';

    // 设置头像
    const userAvatar = document.getElementById('userAvatar');
    if(userAvatar) {
        userAvatar.textContent = (currentUser.name || currentUser.username).charAt(0).toUpperCase();
    }
}