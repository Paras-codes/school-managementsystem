const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { JWT_SECRET } = require('../middleware/auth');

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login', error: req.query.error || null, success: req.query.success || null });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.redirect('/auth/login?error=Invalid+email+or+password');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.redirect('/auth/login?error=Invalid+email+or+password');

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    if (user.role === 'admin') return res.redirect('/admin/dashboard');
    return res.redirect('/parent/dashboard');
  } catch (err) {
    return res.redirect('/auth/login?error=Something+went+wrong');
  }
});

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register', error: req.query.error || null, success: req.query.success || null });
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, rollNumber } = req.body;

    const student = await Student.findOne({ rollNumber: rollNumber.trim() });
    if (!student) return res.redirect('/auth/register?error=No+student+found+with+that+roll+number');

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.redirect('/auth/register?error=Email+already+registered');

    await User.create({ name, email, password, role: 'parent', studentId: student._id });

    return res.redirect('/auth/login?success=Registration+successful!+Please+log+in.');
  } catch (err) {
    return res.redirect('/auth/register?error=Something+went+wrong');
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;
