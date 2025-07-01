// 用户信息加载函数
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('userName').textContent = user.name || '未知用户';
        document.getElementById('userRole').textContent = user.role || '未知角色';
        document.getElementById('userAvatar').textContent = user.name ? user.name.charAt(0) : 'U';
    } else {
        console.error('未找到用户信息');
    }
}

// 检查用户访问权限
function checkUserAccess(allowedRoles) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !allowedRoles.includes(user.role)) {
        // 如果用户未登录或角色不符，重定向到登录页
        alert('您没有访问此页面的权限');
        window.location.href = 'index.html';
    }
}

function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.username) {
        window.location.href = 'index.html';
        return false;
    }
    return currentUser;
}

// 获取当前用户
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
}

// 检查用户权限
function checkPermission(requiredRole) {
    const currentUser = getCurrentUser();
    if (!currentUser.username) {
        return false;
    }

    // 管理员拥有所有权限
    if (currentUser.role === 'admin') {
        return true;
    }

    // 检查特定权限
    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(currentUser.role);
    } else {
        return currentUser.role === requiredRole;
    }
}

// 登出
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// 初始化页面权限
function initPageAuth() {
    const currentUser = checkAuth();
    if (!currentUser) return;

    // 设置用户信息
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = currentUser.name || currentUser.username;
    }

    const userRole = currentUser.role || 'student';
    const roleMap = {
        'student': '学生',
        'teacher': '教师',
        'admin': '管理员'
    };

    if (document.getElementById('userRole')) {
        document.getElementById('userRole').textContent = roleMap[userRole] || '用户';
    }

    // 设置用户头像
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.textContent = (currentUser.name || currentUser.username).charAt(0).toUpperCase();
    }

    // 根据角色显示/隐藏菜单项
    document.querySelectorAll('.nav-item').forEach(item => {
        const showForRoles = Array.from(item.classList)
            .filter(cls => cls.endsWith('-menu'))
            .map(cls => cls.replace('-menu', ''));

        if (showForRoles.length > 0 && !showForRoles.includes(userRole)) {
            item.style.display = 'none';
        }
    });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initPageAuth);

// 为登出按钮添加事件
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                logout();
            }
        });
    }
});

// auth.js 修改示例
document.addEventListener('DOMContentLoaded', function() {
  // 获取当前页面
  const currentPage = window.location.pathname.split('/').pop();

  // 如果当前已经在登录页，则不执行重定向
  if (currentPage === 'index.html' || currentPage === '') {
    return; // 在登录页面时退出函数
  }

  // 检查登录状态的代码
  const isLoggedIn = localStorage.getItem('currentUser') !== null;

  // 只有不在登录页且未登录时才重定向
  if (!isLoggedIn) {
    window.location.href = 'index.html';
  }
});