const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true, trim: true },
  marks: { type: Number, required: true },
  totalMarks: { type: Number, default: 100 },
  grade: { type: String, required: true },
  examType: { type: String, enum: ['mid-term', 'final', 'unit-test'], required: true },
  academicYear: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);
