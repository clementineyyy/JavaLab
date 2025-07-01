document.addEventListener('DOMContentLoaded', function () {
    const attendances = JSON.parse(localStorage.getItem('attendances') || '[]');
    const attendanceTableBody = document.getElementById('attendanceTableBody');
    const attendanceForm = document.getElementById('attendanceForm');
    const attendanceModal = document.getElementById('attendanceModal');
    const modalTitle = document.getElementById('modalTitle');
    let editingAttendanceIndex = null;

    // 渲染考勤记录
    function renderAttendances() {
        attendanceTableBody.innerHTML = '';
        attendances.forEach((record, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.course}</td>
                <td>${record.date}</td>
                <td>${record.studentId}</td>
                <td>${record.studentName}</td>
                <td>${record.status}</td>
                <td>
                    <button class="btn btn-outline" data-index="${index}" data-action="edit">编辑</button>
                    <button class="btn btn-danger" data-index="${index}" data-action="delete">删除</button>
                </td>
            `;
            attendanceTableBody.appendChild(row);
        });
    }

    // 添加/编辑考勤记录
    attendanceForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const course = document.getElementById('attendanceCourse').value;
        const date = document.getElementById('attendanceDate').value;
        const studentId = document.getElementById('attendanceStudentId').value;
        const status = document.getElementById('attendanceStatus').value;

        if (editingAttendanceIndex !== null) {
            attendances[editingAttendanceIndex] = { course, date, studentId, status };
        } else {
            attendances.push({ course, date, studentId, status });
        }

        localStorage.setItem('attendances', JSON.stringify(attendances));
        renderAttendances();
        attendanceModal.style.display = 'none';
    });

    // 打开添加考勤模态框
    document.getElementById('addAttendanceBtn').addEventListener('click', function () {
        modalTitle.textContent = '记录考勤';
        attendanceForm.reset();
        editingAttendanceIndex = null;
        attendanceModal.style.display = 'block';
    });

    // 编辑/删除考勤记录
    attendanceTableBody.addEventListener('click', function (e) {
        const index = e.target.dataset.index;
        const action = e.target.dataset.action;

        if (action === 'edit') {
            modalTitle.textContent = '编辑考勤';
            const record = attendances[index];
            document.getElementById('attendanceCourse').value = record.course;
            document.getElementById('attendanceDate').value = record.date;
            document.getElementById('attendanceStudentId').value = record.studentId;
            document.getElementById('attendanceStatus').value = record.status;
            editingAttendanceIndex = index;
            attendanceModal.style.display = 'block';
        } else if (action === 'delete') {
            if (confirm('确定要删除该考勤记录吗？')) {
                attendances.splice(index, 1);
                localStorage.setItem('attendances', JSON.stringify(attendances));
                renderAttendances();
            }
        }
    });

    // 关闭模态框
    document.getElementById('cancelBtn').addEventListener('click', function () {
        attendanceModal.style.display = 'none';
    });


    document.addEventListener('DOMContentLoaded', function () {
        // 加载用户信息
        loadUserInfo();

        const attendances = JSON.parse(localStorage.getItem('attendances') || '[]');
        const attendanceTableBody = document.getElementById('attendanceTableBody');
    });


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

    renderAttendances();
});