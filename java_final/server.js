// server.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use('/api', router);

// 数据库连接
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'mydata'
});



app.get('/api/certificate', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM certificates');
        res.json(rows);
    } catch (error) {
        console.error('获取证书数据出错:', error);
        res.status(500).json({ message: '获取证书数据失败', error: error.message });
    }
});

// 测试数据库连接
app.post('/api/test-connection', async (req, res) => {
  const { host, port, user, password, database } = req.body;

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    });

    // 成功连接
    res.json({ success: true, message: '连接成功' });
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    res.json({
      success: false,
      message: `连接失败: ${error.message}`,
      error: error.code
    });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.get('/api/certificate', async (req, res) => {
  try {
    console.log('正在查询证书和学生数据...');
    const [rows] = await pool.query(`
      SELECT c.id, c.student_id, c.name, c.issue_date, c.description, 
             s.name as student_name, s.id as student_db_id
      FROM certificates c
      LEFT JOIN students s ON c.student_id = s.id
    `);

    console.log('查询结果:', JSON.stringify(rows.slice(0, 2)));
    res.json(rows);
  } catch (error) {
    console.error('获取证书数据出错:', error);
    res.status(500).json({ message: '获取证书数据失败', error: error.message });
  }
});


app.get('/api/diagnose/students', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT * FROM students LIMIT 10');
    const [certificates] = await pool.query('SELECT * FROM certificates LIMIT 10');
    res.json({
      students: students,
      certificates: certificates,
      message: '诊断信息获取成功'
    });
  } catch (error) {
    res.status(500).json({ message: '诊断失败', error: error.message });
  }
});

// 添加学生
app.post('/api/students', async (req, res) => {
  try {
    const student = req.body;
    const [result] = await pool.query(
      'INSERT INTO students (id, name, gender, age, grade, major) VALUES (?, ?, ?, ?, ?, ?)',
      [student.id, student.name, student.gender, student.age, student.grade, student.major]
    );
    res.json({ success: true, id: student.id, message: '学生添加成功' });
  } catch (error) {
    console.error('添加学生失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新学生
app.put('/api/students/:id', async (req, res) => {
  try {
    const student = req.body;
    await pool.query(
      'UPDATE students SET name=?, gender=?, age=?, grade=?, major=? WHERE id=?',
      [student.name, student.gender, student.age, student.grade, student.major, req.params.id]
    );
    res.json({ success: true, message: '学生信息已更新' });
  } catch (error) {
    console.error('更新学生失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    // 先检查学生是否存在
    const [students] = await pool.query('SELECT * FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该学生'
      });
    }

    // 删除学生成绩数据
    await pool.query('DELETE FROM grades WHERE student_id = ?', [studentId]);

    // 删除学生证书数据
    await pool.query('DELETE FROM certificates WHERE student_id = ?', [studentId]);

    // 删除学生记录
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [studentId]);

    res.json({
      success: true,
      message: '学生删除成功',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('删除学生出错:', error);
    res.status(500).json({
      success: false,
      message: '删除学生失败',
      error: error.message
    });
  }
});


app.post('/api/certificate', async (req, res) => {
  try {
    const { id, student_id, name, issue_date, issuer } = req.body;
    console.log('接收到的证书数据:', req.body);

    // 先检查学生是否存在
    const [students] = await pool.query('SELECT id, name FROM students WHERE id = ?', [student_id]);
    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: `未找到ID为${student_id}的学生`
      });
    }

    // 如果是更新
    if (id) {
      const [result] = await pool.query(
        'UPDATE certificates SET student_id = ?, name = ?, issue_date = ?, issuer = ? WHERE id = ?',
        [student_id, name, issue_date, issuer, id]
      );

      return res.json({
        success: true,
        message: '证书更新成功',
        studentName: students[0].name
      });
    }
    // 如果是新增
    else {
      const [result] = await pool.query(
        'INSERT INTO certificates (student_id, name, issue_date, issuer) VALUES (?, ?, ?, ?)',
        [student_id, name, issue_date, issuer]
      );

      return res.json({
        success: true,
        id: result.insertId,
        message: '证书添加成功',
        studentName: students[0].name
      });
    }
  } catch (error) {
    console.error('保存证书出错:', error);
    res.status(500).json({ success: false, message: '保存证书失败', error: error.message });
  }
});

// 删除证书
app.delete('/api/certificate/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM certificates WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '未找到该证书' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('删除证书出错:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 同步数据到数据库
app.post('/api/sync-data', async (req, res) => {
  const { config, options, data } = req.body;
  const results = { success: false, details: {} };

  let connection;
  try {
    // 连接数据库
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });

    // 开始事务
    await connection.beginTransaction();

    // 如果选择清空现有数据
    if (options.clearExistingData) {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');

      if (options.syncGrades) {
        await connection.query('TRUNCATE TABLE grades');
        results.details.grades = { cleared: true };
      }

      if (options.syncCertificates) {
        await connection.query('TRUNCATE TABLE certificates');
        results.details.certificates = { cleared: true };
      }

      if (options.syncCourses) {
        await connection.query('TRUNCATE TABLE courses');
        results.details.courses = { cleared: true };
      }

      if (options.syncStudents) {
        await connection.query('TRUNCATE TABLE students');
        results.details.students = { cleared: true };
      }

      if (options.syncTeachers) {
        await connection.query('TRUNCATE TABLE teachers');
        results.details.teachers = { cleared: true };
      }

      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    // 同步数据
    if (options.syncStudents && data.students && data.students.length > 0) {
      const insertedCount = await syncStudents(connection, data.students);
      results.details.students = { inserted: insertedCount };
    }

    if (options.syncTeachers && data.teachers && data.teachers.length > 0) {
      const insertedCount = await syncTeachers(connection, data.teachers);
      results.details.teachers = { inserted: insertedCount };
    }

    if (options.syncCourses && data.courses && data.courses.length > 0) {
      const insertedCount = await syncCourses(connection, data.courses);
      results.details.courses = { inserted: insertedCount };
    }

    if (options.syncGrades && data.grades && data.grades.length > 0) {
      const insertedCount = await syncGrades(connection, data.grades);
      results.details.grades = {
        ...(results.details.grades || {}),
        inserted: insertedCount
      };
    }

    if (options.syncCertificates && data.certificates && data.certificates.length > 0) {
      const insertedCount = await syncCertificates(connection, data.certificates);
      results.details.certificates = {
        ...(results.details.certificates || {}),
        inserted: insertedCount
      };
    }

    // 提交事务
    await connection.commit();
    results.success = true;
    results.message = '数据同步成功';

  } catch (error) {
    console.error('同步数据失败:', error);

    // 回滚事务
    if (connection) {
      await connection.rollback();
    }

    results.success = false;
    results.message = `同步失败: ${error.message}`;
    results.error = error.code;
  } finally {
    if (connection) {
      connection.end();
    }

    res.json(results);
  }
});

// 导入数据的API
app.post('/api/import-data', async (req, res) => {
    try {
        const data = JSON.parse(req.file.buffer.toString());
        const conn = await pool.getConnection();

        // 开始事务
        await conn.beginTransaction();

        try {
            // 清空表（可选）
            await conn.query('SET FOREIGN_KEY_CHECKS = 0');
            await conn.query('TRUNCATE TABLE grades');
            await conn.query('TRUNCATE TABLE certificates');
            await conn.query('TRUNCATE TABLE courses');
            await conn.query('TRUNCATE TABLE students');
            await conn.query('TRUNCATE TABLE teachers');
            await conn.query('TRUNCATE TABLE users');
            await conn.query('SET FOREIGN_KEY_CHECKS = 1');

            // 导入用户数据
            for (const user of data.users) {
                await conn.query(
                    'INSERT INTO users (id, username, password, role, name) VALUES (?, ?, ?, ?, ?)',
                    [user.id, user.username, user.password, user.role, user.name]
                );
            }

            // 导入学生数据
            for (const student of data.students) {
                await conn.query(
                    'INSERT INTO students (id, name, gender, age, grade, major) VALUES (?, ?, ?, ?, ?, ?)',
                    [student.id, student.name, student.gender, student.age, student.grade, student.major]
                );
            }

            // 导入教师数据
            for (const teacher of data.teachers) {
                await conn.query(
                    'INSERT INTO teachers (id, name, title, department) VALUES (?, ?, ?, ?)',
                    [teacher.id, teacher.name, teacher.title, teacher.department]
                );
            }

            // 导入课程数据
            for (const course of data.courses) {
                await conn.query(
                    'INSERT INTO courses (id, name, credit, hours, teacher_id, description) VALUES (?, ?, ?, ?, ?, ?)',
                    [course.id, course.name, course.credit, course.hours, course.teacherId, course.description]
                );
            }

            // 导入成绩数据
            for (const grade of data.grades) {
                await conn.query(
                    'INSERT INTO grades (student_id, course_id, semester, score, record_date, comments) VALUES (?, ?, ?, ?, ?, ?)',
                    [grade.studentId, grade.courseId, grade.semester, grade.score, grade.recordDate, grade.comments]
                );
            }

            // 导入证书数据
            for (const cert of data.certificates) {
                await conn.query(
                    'INSERT INTO certificates (student_id, name, issue_date, expire_date, issuer, description) VALUES (?, ?, ?, ?, ?, ?)',
                    [cert.studentId, cert.name, cert.issueDate, cert.expireDate, cert.issuer, cert.description]
                );
            }

            // 提交事务
            await conn.commit();
            res.json({ success: true, message: '数据导入成功' });
        } catch (error) {
            // 回滚事务
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error('导入数据失败:', error);
        res.status(500).json({ success: false, message: '导入数据失败', error: error.message });
    }
});

// API路由
app.get('/api/students', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM students');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/teachers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM teachers');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取所有课程
app.get('/api/courses', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM courses');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 添加课程
app.post('/api/courses', async (req, res) => {
    try {
        const course = req.body;
        await pool.query(
            'INSERT INTO courses (id, name, type, credit, teacher_id, semester) VALUES (?, ?, ?, ?, ?, ?)',
            [course.id, course.courseName, course.type, course.credit, course.teacher, course.semester]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新课程
app.put('/api/courses/:id', async (req, res) => {
    try {
        const course = req.body;
        console.log('收到更新课程请求:', course);

        // 只使用数据库中存在的字段
        await pool.query(
            'UPDATE courses SET name=?, type=?, credit=?, teacher_id=?, semester=? WHERE id=?',
            [
                course.courseName || course.name,
                course.courseType || course.type,
                parseInt(course.credit) || 0,
                course.teacher,
                course.semester,
                req.params.id
            ]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('更新课程错误:', error);
        res.status(500).json({ error: error.message });
    }
});

// 删除课程
app.delete('/api/courses/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sync-courses', async (req, res) => {
    try {
        const { courses } = req.body;
        console.log('收到同步请求，课程数量:', courses.length);

        let successCount = 0;

        for (const course of courses) {
            const courseId = course.courseId || course.id;

            // 修改参数和SQL语句以匹配数据库结构
            const params = [
                courseId,
                course.courseName || course.name,
                parseInt(course.credit || 0),
                0, // hours值设为默认0
                course.teacher || '',
                course.description || ''
            ];

            await pool.query(
                'REPLACE INTO courses (id, name, credit, hours, teacher_id, description) VALUES (?, ?, ?, ?, ?, ?)',
                params
            );
            successCount++;
        }

        res.json({ success: true, count: successCount });
    } catch (error) {
        console.error('同步课程错误:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 添加成绩API端点
app.post('/api/grades', async (req, res) => {
  try {
    const { studentId, courseId, semester, score} = req.body;

    // 验证必要字段
    if (!studentId || !courseId || !semester || score === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要字段'
      });
    }

    // 检查学生和课程是否存在
    const [studentCheck] = await pool.query('SELECT * FROM students WHERE id = ?', [studentId]);
    const [courseCheck] = await pool.query('SELECT * FROM courses WHERE id = ?', [courseId]);

    if (studentCheck.length === 0 || courseCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: '学生或课程不存在'
      });
    }

    // 插入新成绩记录
    const [result] = await pool.query(
      'INSERT INTO grades (student_id, course_id, semester, score) VALUES (?, ?, ?, ?)',
      [studentId, courseId, semester, score ]
    );

    // 获取新插入的成绩记录，使用LEFT JOIN以防关联失败
    const [newGrade] = await pool.query(`
      SELECT g.*, s.name as studentName, c.name as courseName 
      FROM grades g
      LEFT JOIN students s ON g.student_id = s.id
      LEFT JOIN courses c ON g.course_id = c.id
      WHERE g.id = ?
    `, [result.insertId]);

    res.json({
      success: true,
      message: '成绩添加成功',
      grade: newGrade.length > 0 ? newGrade[0] : {
        id: result.insertId,
        student_id: studentId,
        course_id: courseId,
        semester: semester,
        score: score,
      }
    });
  } catch (error) {
    console.error('添加成绩出错:', error);
    res.status(500).json({
      success: false,
      message: '添加成绩失败',
      error: error.message
    });
  }
});

// 获取所有成绩记录
app.get('/api/grades', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT g.*, 
             s.name AS student_name, 
             c.name AS course_name
      FROM grades g
      LEFT JOIN students s ON g.student_id = s.id
      LEFT JOIN courses c ON g.course_id = c.id
      ORDER BY g.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('获取成绩数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取成绩数据失败',
      error: error.message
    });
  }
});

// 更新成绩
app.put('/api/grades/:id', async (req, res) => {
  try {
    const gradeId = req.params.id;
    const { studentId, courseId, semester, score, comments } = req.body;

    // 验证必要字段
    if (!studentId || !courseId || !semester || score === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要字段'
      });
    }

    // 检查成绩是否存在
    const [grade] = await pool.query('SELECT * FROM grades WHERE id = ?', [gradeId]);

    if (grade.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该成绩记录'
      });
    }

    // 更新成绩记录
    await pool.query(
      'UPDATE grades SET student_id = ?, course_id = ?, semester = ?, score = ? WHERE id = ?',
      [studentId, courseId, semester, score, gradeId]
    );

    // 获取更新后的成绩记录
    const [updatedGrade] = await pool.query(`
      SELECT g.*, s.name as studentName, c.name as courseName 
      FROM grades g
      LEFT JOIN students s ON g.student_id = s.id
      LEFT JOIN courses c ON g.course_id = c.id
      WHERE g.id = ?
    `, [gradeId]);

    res.json({
      success: true,
      message: '成绩更新成功',
      grade: updatedGrade[0]
    });
  } catch (error) {
    console.error('更新成绩时出错:', error);
    res.status(500).json({
      success: false,
      message: '更新成绩失败',
      error: error.message
    });
  }
});


// 删除成绩
app.delete('/api/grades/:id', async (req, res) => {
    try {
        const gradeId = req.params.id;

        // 检查成绩是否存在
        const [grade] = await pool.query('SELECT * FROM grades WHERE id = ?', [gradeId]);

        if (grade.length === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到该成绩记录'
            });
        }

        // 删除成绩记录
        await pool.query('DELETE FROM grades WHERE id = ?', [gradeId]);

        res.json({
            success: true,
            message: '成绩删除成功'
        });
    } catch (error) {
        console.error('删除成绩时出错:', error);
        res.status(500).json({
            success: false,
            message: '删除成绩失败',
            error: error.message
        });
    }
});


app.post('/api/grades', async (req, res) => {
  try {
    const { studentId, courseId, semester, score, comments } = req.body;

    // 插入新成绩记录
    const [result] = await pool.query(
      'INSERT INTO grades (student_id, course_id, semester, score) VALUES (?, ?, ?, ?)',
      [studentId, courseId, semester, score]
    );

    // 获取新插入的成绩记录
    const [newGrade] = await pool.query(`
      SELECT g.*, s.name as studentName, c.name as courseName 
      FROM grades g
      JOIN students s ON g.student_id = s.id
      JOIN courses c ON g.course_id = c.id
      WHERE g.id = ?
    `, [result.insertId]);

    res.json({
      success: true,
      message: '成绩添加成功',
      grade: newGrade[0]
    });
  } catch (error) {
    console.error('添加成绩出错:', error);
    res.status(500).json({
      success: false,
      message: '添加成绩失败',
      error: error.message
    });
  }
});

async function syncStudents(connection, students) {
  let insertedCount = 0;

  for (const student of students) {
    const query = `
            INSERT INTO students (id, name, gender, age, grade, major, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            gender = VALUES(gender),
            age = VALUES(age),
            grade = VALUES(grade),
            major = VALUES(major),
            user_id = VALUES(user_id)
        `;

    const params = [
      student.id,
      student.name,
      student.gender || null,
      student.age || null,
      student.grade || null,
      student.major || null,
      student.userId || null
    ];

    const [result] = await connection.execute(query, params);
    if (result.affectedRows > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

// 初始化数据库结构
async function initDatabase() {
  try {
    // 先删除表
    await pool.query('DROP TABLE IF EXISTS courses');

    // 创建表
    await pool.query(`
      CREATE TABLE courses (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        credit INT DEFAULT 0,
        hours INT DEFAULT 0,
        teacher_id VARCHAR(100),
        description TEXT
      )
    `);

    console.log('课程表结构已成功创建');
  } catch (error) {
    console.error('创建表结构失败:', error);
  }
}

// 添加初始化路由
app.get('/api/init-database', async (req, res) => {
  try {
    await initDatabase();
    res.json({ success: true, message: '数据库表结构已成功初始化' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 同步教师数据
async function syncTeachers(connection, teachers) {
  let insertedCount = 0;

  for (const teacher of teachers) {
    const query = `
            INSERT INTO teachers (id, name, title, department, user_id)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            title = VALUES(title),
            department = VALUES(department),
            user_id = VALUES(user_id)
        `;

    const params = [
      teacher.id,
      teacher.name,
      teacher.title || null,
      teacher.department || null,
      teacher.userId || null
    ];

    const [result] = await connection.execute(query, params);
    if (result.affectedRows > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

// 同步课程数据
async function syncCourses(connection, courses) {
  let insertedCount = 0;

  for (const course of courses) {
    const query = `
            INSERT INTO courses (id, name, credit, hours, teacher_id, description)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            credit = VALUES(credit),
            hours = VALUES(hours),
            teacher_id = VALUES(teacher_id),
            description = VALUES(description)
        `;

    const params = [
      course.id || course.courseId,
      course.courseName || course.name,
      course.credit || 0,
      course.hours || 0,
      course.teacherId || null,
      course.description || null
    ];

    const [result] = await connection.execute(query, params);
    if (result.affectedRows > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

// 同步成绩数据
async function syncGrades(connection, grades) {
  let insertedCount = 0;

  for (const grade of grades) {
    const query = `
            INSERT INTO grades (id, student_id, course_id, semester, score, record_date, comments)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            student_id = VALUES(student_id),
            course_id = VALUES(course_id),
            semester = VALUES(semester),
            score = VALUES(score),
            record_date = VALUES(record_date),
            comments = VALUES(comments)
        `;

    const params = [
      grade.id,
      grade.studentId,
      grade.courseId,
      grade.semester || null,
      grade.score || 0,
      grade.recordDate || new Date().toISOString().split('T')[0],
      grade.comments || null
    ];

    const [result] = await connection.execute(query, params);
    if (result.affectedRows > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

// 同步证书数据
async function syncCertificates(connection, certificates) {
  let insertedCount = 0;

  for (const cert of certificates) {
    const query = `
            INSERT INTO certificates (id, student_id, name, issue_date, expire_date, issuer, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            student_id = VALUES(student_id),
            name = VALUES(name),
            issue_date = VALUES(issue_date),
            expire_date = VALUES(expire_date),
            issuer = VALUES(issuer),
            description = VALUES(description)
        `;

    const params = [
      cert.id,
      cert.studentId,
      cert.name,
      cert.issueDate || null,
      cert.expireDate || null,
      cert.issuer || null,
      cert.description || null
    ];

    const [result] = await connection.execute(query, params);
    if (result.affectedRows > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});

