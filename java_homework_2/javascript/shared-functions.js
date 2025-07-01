// javascript/shared-functions.js
function importDataFromJson(event) {
    const file = event.target.files[0];
    if (!file) {
        alert('请选择一个 JSON 文件！');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.students && data.teachers && data.admins && data.courses && data.grades && data.certificates && data.users) {
                localStorage.setItem('students', JSON.stringify(data.students));
                localStorage.setItem('teachers', JSON.stringify(data.teachers));
                localStorage.setItem('admins', JSON.stringify(data.admins));
                localStorage.setItem('courses', JSON.stringify(data.courses));
                localStorage.setItem('grades', JSON.stringify(data.grades));
                localStorage.setItem('certificates', JSON.stringify(data.certificates));
                localStorage.setItem('users', JSON.stringify(data.users));

                if (data.currentUser) {
                    localStorage.setItem('currentUser', JSON.stringify(data.currentUser));
                }

                alert('数据导入成功！请刷新页面以查看更新。');
            } else {
                alert('文件格式不正确，请检查 JSON 数据结构！');
            }
        } catch (error) {
            alert('导入失败：文件内容无效或解析错误！');
        }
    };
    reader.readAsText(file);
}

function exportDataToJson() {
    // 获取所有数据
    const data = {
        students: JSON.parse(localStorage.getItem('students') || '[]'),
        teachers: JSON.parse(localStorage.getItem('teachers') || '[]'),
        admins: JSON.parse(localStorage.getItem('admins') || '[]'),
        courses: JSON.parse(localStorage.getItem('courses') || '[]'),
        grades: JSON.parse(localStorage.getItem('grades') || '[]'),
        certificates: JSON.parse(localStorage.getItem('certificates') || '[]'),
        users: JSON.parse(localStorage.getItem('users') || '[]'),
        currentUser: JSON.parse(localStorage.getItem('currentUser') || '{}')
    };

    // 转换为JSON字符串
    const jsonString = JSON.stringify(data, null, 2);

    // 创建Blob对象
    const blob = new Blob([jsonString], {type: 'application/json'});

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academic_system_data.json';

    // 触发下载
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}