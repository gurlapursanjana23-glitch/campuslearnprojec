const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/response');
const Attendance = require('../models/Attendance');
const AttendanceAlert = require('../models/AttendanceAlert');
const AttendanceRule = require('../models/AttendanceRule');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Course = require('../models/Course');

const REQUIRED_PCT = 75; // default threshold

// Helper: compute attendance percentage for a student in a course
async function getStudentAttendance(studentId, courseId) {
  const records = await Attendance.find({ course: courseId }).lean();
  let total = 0, present = 0;
  for (const r of records) {
    const entry = r.records.find(rec => String(rec.student) === String(studentId));
    if (entry) {
      total++;
      if (entry.status === 'present') present++;
    }
  }
  // Return 0% when no records exist — student hasn't been in any recorded class yet
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, absent: total - present, pct };
}

// ── GET /api/attendance-extra/risk ─────────────────────────────────────────
exports.getRisk = asyncHandler(async (req, res) => {
  const student = req.user._id;

  // Get all courses for this student (from Attendance records)
  const courses = await Course.find({ enrolledStudents: student }, '_id title subjectCode').lean();

  // Get thresholds
  const rule = await AttendanceRule.findOne().lean();
  const required = rule?.requiredPercentage || REQUIRED_PCT;

  const riskData = await Promise.all(courses.map(async (course) => {
    const { total, present, absent, pct } = await getStudentAttendance(student, course._id);
    const classesNeeded = pct < required
      ? Math.ceil((required * total - present * 100) / (100 - required))
      : 0;
    const canMiss = pct >= required
      ? Math.floor((present * 100 - required * total) / required)
      : 0;

    let risk = 'SAFE';
    if (pct < 70) risk = 'CRITICAL';
    else if (pct < required) risk = 'SHORTAGE RISK';
    else if (pct < 85) risk = 'WARNING';

    return {
      courseId: course._id,
      title: course.title,
      subjectCode: course.subjectCode,
      total, present, absent, pct, required,
      risk, classesNeeded, canMiss,
    };
  }));

  successResponse(res, 200, 'Risk data fetched', { riskData, required });
});

// ── GET /api/attendance-extra/shortage ─────────────────────────────────────
exports.getShortage = asyncHandler(async (req, res) => {
  // For faculty/HOD: get all students below threshold in their courses
  const rule = await AttendanceRule.findOne().lean();
  const required = rule?.requiredPercentage || REQUIRED_PCT;

  const students = await User.find({ role: 'student' }, '_id name email rollNumber').lean();
  const courses = await Course.find({}, '_id title').lean();

  const shortage = [];
  for (const student of students.slice(0, 50)) { // Limit for performance
    for (const course of courses.slice(0, 10)) {
      const { pct, total, present } = await getStudentAttendance(student._id, course._id);
      if (total > 0 && pct < required) {
        shortage.push({
          student: { _id: student._id, name: student.name, email: student.email, rollNumber: student.rollNumber },
          course: { _id: course._id, title: course.title },
          pct, total, present, required,
          classesNeeded: Math.ceil((required * total - present * 100) / (100 - required)),
        });
      }
    }
  }

  successResponse(res, 200, 'Shortage data fetched', shortage);
});

// ── GET /api/attendance-extra/prediction ───────────────────────────────────
exports.getPrediction = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  if (!courseId) return errorResponse(res, 400, 'courseId is required');

  const rule = await AttendanceRule.findOne().lean();
  const required = rule?.requiredPercentage || REQUIRED_PCT;
  const { total, present, pct } = await getStudentAttendance(req.user._id, courseId);

  const predictions = [];
  for (let futureClasses = 0; futureClasses <= 20; futureClasses++) {
    const newPct = ((present + futureClasses) / (total + futureClasses)) * 100;
    if (newPct >= required) {
      predictions.push({ futureClasses, projectedPct: Math.round(newPct) });
      if (predictions.length >= 5) break;
    }
  }

  successResponse(res, 200, 'Prediction fetched', { currentPct: pct, total, present, required, predictions });
});

// ── GET /api/attendance-extra/alerts ───────────────────────────────────────
exports.getAlerts = asyncHandler(async (req, res) => {
  const alerts = await AttendanceAlert.find({ student: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  successResponse(res, 200, 'Alerts fetched', alerts);
});

// ── POST /api/attendance-extra/alerts/send ─────────────────────────────────
exports.sendAlerts = asyncHandler(async (req, res) => {
  // Send attendance shortage alerts ONLY to students who are actually below threshold
  const rule = await AttendanceRule.findOne().lean();
  const required = rule?.requiredPercentage || REQUIRED_PCT;

  // Get all students
  const students = await User.find({ role: 'student' }, '_id name').lean();

  // Get courses that have actual attendance records (to avoid false 0% for students not yet enrolled)
  const courses = await Course.find({}, '_id title').lean();

  let sent = 0;
  for (const student of students) {
    for (const course of courses) {
      const { pct, total, present } = await getStudentAttendance(student._id, course._id);

      // Only alert if the student has actual attendance records AND is below threshold
      // Students with total === 0 have no attendance records for this course — skip them
      if (total > 0 && pct < required) {
        const needed = Math.ceil((required * total - present * 100) / (100 - required));
        const alertLevel = pct < 70 ? 'CRITICAL' : 'WARNING';

        // Create in-app notification for the at-risk student
        await Notification.create({
          recipient: student._id,
          title: `⚠️ Attendance ${alertLevel}: ${course.title}`,
          message: `Your attendance in ${course.title} is ${pct}% — below the required ${required}%. You need to attend ${needed} more class${needed !== 1 ? 'es' : ''} to avoid shortage.`,
          type: 'attendance',
          isRead: false,
        });

        // Also save an AttendanceAlert record
        await AttendanceAlert.create({
          student: student._id,
          subject: course.title,
          currentPercentage: pct,
          requiredPercentage: required,
          riskLevel: pct < 70 ? 'CRITICAL' : pct < required ? 'SHORTAGE RISK' : 'WARNING',
          message: `Attend ${needed} more class${needed !== 1 ? 'es' : ''} to reach ${required}%`,
          isRead: false,
        });

        sent++;
      }
    }
  }

  successResponse(res, 200, `Sent ${sent} attendance alerts to at-risk students only`);
});
