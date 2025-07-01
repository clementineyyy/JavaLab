// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// 导入路由
const studentsRouter = require('./routes/students');
const gradesRouter = require('./routes/grades');
const coursesRouter = require('./routes/courses');

// 初始化数据库
const db = require('./db/database');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// API路由
app.use('/api/students', studentsRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/courses', coursesRouter);

// 提供静态文件(前端)
app.use(express.static(path.join(__dirname, '../java_final')));

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('数据库已初始化');
});