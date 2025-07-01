function showMenusByRole(role) {
    const menuItems = document.querySelectorAll('.nav-item');
    menuItems.forEach(item => {
        if (item.querySelector('a[href="course-management.html"]')) {
            item.style.display = 'block';
            return;
        }

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


    return true; // 默认允许访问
}

document.addEventListener('DOMContentLoaded', function() {
    // 先执行权限检查
    if (checkPagePermission()) {
        // 获取当前用户角色并显示相应菜单
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const role = currentUser.role || 'guest';
        showMenusByRole(role);
    }
});

function initDefaultData() {
    try {
        if (typeof initializeDefaultStudents === 'function') {
            initializeDefaultStudents();
        }
        if (typeof initializeDefaultCourses === 'function') {
            initializeDefaultCourses();
        }

    } catch (e) {
        console.error('初始化数据失败:', e);
    }
}


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


function exportAllData() {
    const data = {
        students: JSON.parse(localStorage.getItem('students') || '[]'),
        teachers: JSON.parse(localStorage.getItem('teachers') || '[]'),
        admins: JSON.parse(localStorage.getItem('admins') || '[]'),
        courses: JSON.parse(localStorage.getItem('courses') || '[]'),
        grades: JSON.parse(localStorage.getItem('grades') || '[]'),
        certificates: JSON.parse(localStorage.getItem('certificates') || '[]'),
        users: JSON.parse(localStorage.getItem('users') || '[]')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'school_management_data.json';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}