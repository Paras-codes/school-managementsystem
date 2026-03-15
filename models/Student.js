const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rollNumber: { type: String, required: true, unique: true, trim: true },
  class: { type: String, required: true },
  section: { type: String, trim: true },
  dateOfBirth: { type: Date },
  address: { type: String },
  parentName: { type: String },
  parentEmail: { type: String, lowercase: true, trim: true },
  enrollmentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', StudentSchema);
