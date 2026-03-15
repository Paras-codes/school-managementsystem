const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const { authenticateToken, isParent } = require('../middleware/auth');

router.use(authenticateToken, isParent);

router.get('/dashboard', async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentId);
    res.render('parent/dashboard', { title: 'Parent Dashboard', student, user: req.user });
  } catch (err) {
    res.render('parent/dashboard', { title: 'Parent Dashboard', student: null, user: req.user });
  }
});

router.get('/results', async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentId);
    const results = await Result.find({ student: req.user.studentId }).sort({ createdAt: -1 });
    res.render('parent/results', { title: 'Results', student, results });
  } catch (err) {
    res.render('parent/results', { title: 'Results', student: null, results: [] });
  }
});

router.get('/attendance', async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentId);
    const query = { student: req.user.studentId };
    const dateFilter = {};
    if (req.query.from) dateFilter.$gte = new Date(req.query.from);
    if (req.query.to) {
      const to = new Date(req.query.to);
      to.setHours(23, 59, 59, 999);
      dateFilter.$lte = to;
    }
    if (Object.keys(dateFilter).length > 0) query.date = dateFilter;
    const records = await Attendance.find(query).sort({ date: -1 });
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    res.render('parent/attendance', {
      title: 'Attendance',
      student,
      records,
      presentCount,
      absentCount,
      lateCount,
      from: req.query.from || '',
      to: req.query.to || ''
    });
  } catch (err) {
    res.render('parent/attendance', { title: 'Attendance', student: null, records: [], presentCount: 0, absentCount: 0, lateCount: 0, from: '', to: '' });
  }
});

module.exports = router;
