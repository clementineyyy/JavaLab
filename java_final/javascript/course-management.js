document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据
    let courses = JSON.parse(localStorage.getItem('courses') || '[]');
    let needsUpdate = false;

    courses.forEach(course => {
        if (!course.semester) {
            course.semester = "2023-2024-1"; // 设置默认学期
            needsUpdate = true;
        }
    });

    if (needsUpdate) {
        localStorage.setItem('courses', JSON.stringify(courses));
        console.log("已修复课程数据中缺失的学期信息");
    }

    initializeDefaultCourses();
    loadCourses();

    // 当前用户身份验证
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.username) {
        window.location.href = 'index.html';
        return;
    }

    // 检查用户权限
    if (currentUser.role !== 'teacher' && currentUser.role !== 'admin') {
        alert('您没有访问此页面的权限');
        window.location.href = 'dashboard.html';
        return;
    }

    let filteredCourses = [];
    let currentPage = 1;
    const itemsPerPage = 10;

    // 初始化界面
    renderCourseTable();
    setupEventListeners();

    // 分页显示课程数据
    function renderCourseTable() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const displayedCourses = filteredCourses.slice(startIndex, endIndex);
        const tableBody = document.getElementById('courseTableBody');

        tableBody.innerHTML = '';

        if (displayedCourses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="no-data">没有找到符合条件的课程</td></tr>`;
            return;
        }

        displayedCourses.forEach(course => {
            const semesterDisplay = getSemesterDisplay(course.semester);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.courseId}</td>
                <td>${course.courseName}</td>
                <td>${course.courseType}</td>
                <td>${course.credit}</td>
                <td>${course.teacher}</td>
                <td>${semesterDisplay}</td>
                <td>
                        <button class="btn btn-sm btn-primary" onclick="editCourse('${course.id || course.courseId}')">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCourse('${course.id || course.courseId}')">删除</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // 更新分页信息
        const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
        document.getElementById('currentPage').textContent = currentPage;
        document.getElementById('totalPages').textContent = totalPages;

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const courseId = this.getAttribute('data-id');
                editCourse(courseId); // 调用已定义的editCourse函数
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const courseId = btn.dataset.id;
                const courseName = btn.dataset.name;
                showDeleteConfirmation(courseId, courseName);
            });
        });
    }

    // 设置事件监听
    function setupEventListeners() {
        // 搜索按钮
        document.getElementById('searchBtn').addEventListener('click', function() {
            const courseId = document.getElementById('courseId').value.trim().toLowerCase();
            const courseName = document.getElementById('courseName').value.trim().toLowerCase();
            const courseType = document.getElementById('courseType').value;
            const courseCredit = document.getElementById('courseCredit').value;

            filteredCourses = courses.filter(course => {
                return (!courseId || course.id.toLowerCase().includes(courseId)) &&
                    (!courseName || course.name.toLowerCase().includes(courseName)) &&
                    (!courseType || course.type === courseType) &&
                    (!courseCredit || course.credit.toString() === courseCredit);
            });

            currentPage = 1;
            renderCourseTable();
        });

        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', function() {
            document.getElementById('courseId').value = '';
            document.getElementById('courseName').value = '';
            document.getElementById('courseType').value = '';
            document.getElementById('courseCredit').value = '';

            filteredCourses = [...courses];
            currentPage = 1;
            renderCourseTable();
        });


        document.getElementById('addCourseBtn').addEventListener('click', function() {
            document.querySelector('.modal-header h2').textContent = '添加课程';

            document.getElementById('courseForm').reset();

            document.getElementById('courseModal').style.display = 'flex';
        });

        // 关闭模态框
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });

        // 保存课程按钮
        document.getElementById('saveCourseBtn').addEventListener('click', function() {
            const editId = document.getElementById('editCourseId').value;
            const courseId = document.getElementById('formCourseId').value;
            const courseName = document.getElementById('formCourseName').value;
            const courseType = document.getElementById('formCourseType').value;
            const credit = document.getElementById('formCredit').value;
            const teacher = document.getElementById('formTeacher').value;
            const semester = document.getElementById('formSemester').value;

            // 验证必填字段
            if(!courseId || !courseName || !teacher) {
                alert('请填写必填字段');
                return;
            }


            let courses = JSON.parse(localStorage.getItem('courses') || '[]');
            if (courses.length === 0) {
                localStorage.setItem('courses', JSON.stringify(courses));
            }

            if(editId) { // 编辑现有课程
                const index = courses.findIndex(c => c.id === editId);
                if(index !== -1) {
                    courses[index] = {
                        id: editId,
                        courseId,
                        courseName,
                        courseType,
                        credit,
                        teacher,
                        semester,
                    };
                }
            } else { // 添加新课程
                const newId = courseId;
                courses.push({
                    id: newId,
                    courseId,
                    courseName,
                    courseType,
                    credit,
                    teacher,
                    semester,
                });
            }

            // 保存数据并刷新表格
            localStorage.setItem('courses', JSON.stringify(courses));
            document.getElementById('courseModal').style.display = 'none';
            loadCourses();
        });

        // 关闭模态框按钮
        document.querySelectorAll('.modal-close, #cancelBtn').forEach(el => {
            el.addEventListener('click', () => {
                document.getElementById('courseModal').style.display = 'none';
            });
        });

        document.querySelectorAll('#closeConfirmModal, #cancelDeleteBtn').forEach(el => {
            el.addEventListener('click', () => {
                document.getElementById('confirmModal').style.display = 'none';
            });
        });

        // 分页控制
        document.querySelector('[data-page="prev"]').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCourseTable();
            }
        });

        document.querySelector('[data-page="next"]').addEventListener('click', () => {
            const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderCourseTable();
            }
        });

        // 退出登录
        document.getElementById('logoutBtn').addEventListener('click', function() {
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }


function editCourse(courseId) {
    // 根据课程 ID 查找课程并填充到模态框中
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = courses.find(c => c.id === courseId);
    if (course) {
        document.getElementById('modalTitle').textContent = '编辑课程';
        document.getElementById('formCourseId').value = course.courseId;
        document.getElementById('formCourseName').value = course.courseName;
        document.getElementById('formCourseType').value = course.courseType;
        document.getElementById('formCredit').value = course.credit;
        document.getElementById('formTeacher').value = course.teacher;
        document.getElementById('formSemester').value = course.semester;
        document.getElementById('formDescription').value = course.description;
        document.getElementById('editCourseId').value = course.id;
        document.getElementById('courseModal').style.display = 'block';
    }
}

    function showDeleteConfirmation(courseId, courseName) {
        document.getElementById('deleteCourseId').textContent = courseId;
        document.getElementById('deleteCourseName').textContent = courseName;
        document.getElementById('confirmModal').style.display = 'flex';

        document.getElementById('confirmDeleteBtn').onclick = async () => {
            await deleteCourse(courseId);
        };
    }

    // 删除课程
    function deleteCourse(courseId) {
        courses = courses.filter(course => course.id !== courseId);
        filteredCourses = filteredCourses.filter(course => course.id !== courseId);

        localStorage.setItem('courses', JSON.stringify(courses));
        document.getElementById('confirmModal').style.display = 'none';

        const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }

        renderCourseTable();
        showNotification('课程已删除', 'success');
    }


    function showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

   // 将学期编码转换为显示文本
    function getSemesterDisplay(semesterCode) {
        // 防空值检查
        if (!semesterCode) {
            return "未设置学期";
        }

        try {
            const parts = semesterCode.split('-');
            if (parts.length < 3) {
                return semesterCode; // 返回原值
            }

            const year = parts[0];
            const nextYear = parts[1];
            const term = parts[2];

            return `${year}-${nextYear}学年第${term}学期`;
        } catch (error) {
            console.warn("学期格式转换出错:", error);
            return semesterCode || "未知学期";
        }
    }
});