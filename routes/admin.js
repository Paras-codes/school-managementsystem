const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.use(authenticateToken, isAdmin);

router.get('/dashboard', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const presentToday = await Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'present' });
    const absentToday = await Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'absent' });

    res.render('admin/dashboard', { title: 'Admin Dashboard', totalStudents, presentToday, absentToday, user: req.user });
  } catch (err) {
    res.render('admin/dashboard', { title: 'Admin Dashboard', totalStudents: 0, presentToday: 0, absentToday: 0, user: req.user });
  }
});

router.get('/students', async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { rollNumber: { $regex: search, $options: 'i' } }] }
      : {};
    const students = await Student.find(query).sort({ enrollmentDate: -1 });
    res.render('admin/students', { title: 'Students', students, search, success: req.query.success || null, error: req.query.error || null });
  } catch (err) {
    res.render('admin/students', { title: 'Students', students: [], search: '', success: null, error: err.message });
  }
});

router.get('/students/enroll', (req, res) => {
  res.render('admin/enroll', { title: 'Enroll Student', error: req.query.error || null });
});

router.post('/students/enroll', async (req, res) => {
  try {
    const { name, rollNumber, class: studentClass, section, dateOfBirth, address, parentName, parentEmail } = req.body;
    await Student.create({ name, rollNumber, class: studentClass, section, dateOfBirth, address, parentName, parentEmail });
    res.redirect('/admin/students?success=Student+enrolled+successfully');
  } catch (err) {
    const msg = err.code === 11000 ? 'Roll+number+already+exists' : encodeURIComponent(err.message);
    res.redirect(`/admin/students/enroll?error=${msg}`);
  }
});

router.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.redirect('/admin/students?error=Student+not+found');
    res.render('admin/student_detail', { title: student.name, student });
  } catch (err) {
    res.redirect('/admin/students?error=' + encodeURIComponent(err.message));
  }
});

const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    await Result.deleteMany({ student: req.params.id });
    await Attendance.deleteMany({ student: req.params.id });
    res.redirect('/admin/students?success=Student+deleted+successfully');
  } catch (err) {
    res.redirect('/admin/students?error=' + encodeURIComponent(err.message));
  }
};

router.delete('/students/:id', deleteStudent);
router.post('/students/:id/delete', deleteStudent);

router.get('/students/:id/results', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.redirect('/admin/students?error=Student+not+found');
    const results = await Result.find({ student: req.params.id }).sort({ createdAt: -1 });
    res.render('admin/results', { title: 'Results - ' + student.name, student, results, success: req.query.success || null, error: req.query.error || null });
  } catch (err) {
    res.redirect('/admin/students?error=' + encodeURIComponent(err.message));
  }
});

router.post('/students/:id/results', async (req, res) => {
  try {
    const { subject, marks, totalMarks, grade, examType, academicYear } = req.body;
    await Result.create({ student: req.params.id, subject, marks, totalMarks, grade, examType, academicYear });
    res.redirect(`/admin/students/${req.params.id}/results?success=Result+added+successfully`);
  } catch (err) {
    res.redirect(`/admin/students/${req.params.id}/results?error=` + encodeURIComponent(err.message));
  }
});

router.post('/results/:id/delete', async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    const studentId = result ? result.student : '';
    res.redirect(`/admin/students/${studentId}/results?success=Result+deleted`);
  } catch (err) {
    res.redirect('/admin/students?error=' + encodeURIComponent(err.message));
  }
});

router.get('/students/:id/attendance', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.redirect('/admin/students?error=Student+not+found');
    const records = await Attendance.find({ student: req.params.id }).sort({ date: -1 });
    res.render('admin/attendance', { title: 'Attendance - ' + student.name, student, records, success: req.query.success || null, error: req.query.error || null });
  } catch (err) {
    res.redirect('/admin/students?error=' + encodeURIComponent(err.message));
  }
});

router.post('/students/:id/attendance', async (req, res) => {
  try {
    const { date, status, remarks } = req.body;
    await Attendance.create({ student: req.params.id, date, status, remarks });
    res.redirect(`/admin/students/${req.params.id}/attendance?success=Attendance+marked`);
  } catch (err) {
    res.redirect(`/admin/students/${req.params.id}/attendance?error=` + encodeURIComponent(err.message));
  }
});

module.exports = router;
