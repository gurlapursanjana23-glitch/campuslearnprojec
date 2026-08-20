const { supabase } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// ─── @desc    Mark attendance for multiple students
// ─── @route   POST /api/attendance
// ─── @access  Private (Faculty)
exports.markAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body; // records: [{ studentId, status, remarks }]

    if (!courseId || !date || !Array.isArray(records)) {
      return errorResponse(res, 400, 'Please provide courseId, date, and attendance records.');
    }

    const attendanceRows = records.map((r) => ({
      course_id: courseId,
      student_id: r.studentId,
      marked_by: req.user.id,
      date,
      status: r.status || 'present',
      remarks: r.remarks || null,
    }));

    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendanceRows, { onConflict: 'course_id,student_id,date' })
      .select();

    if (error) {
      console.error('Supabase markAttendance error:', error);
      return errorResponse(res, 400, 'Failed to mark attendance.');
    }

    successResponse(res, 200, 'Attendance marked successfully!', data);
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get attendance records for a course
// ─── @route   GET /api/attendance
// ─── @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { courseId, date } = req.query;

    let query = supabase
      .from('attendance')
      .select('*, student:users(id, name, roll_number, avatar), course:courses(id, title, code)');

    if (courseId) query = query.eq('course_id', courseId);
    if (date) query = query.eq('date', date);

    const { data: records, error } = await query.order('date', { ascending: false });

    if (error) {
      return errorResponse(res, 500, 'Failed to fetch attendance records.');
    }

    const formatted = (records || []).map((r) => ({
      ...r,
      _id: r.id,
      student: r.student ? { ...r.student, _id: r.student.id } : null,
    }));

    successResponse(res, 200, 'Attendance records fetched successfully.', formatted);
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get current student's personal attendance summary
// ─── @route   GET /api/attendance/my-attendance
// ─── @access  Private (Student)
exports.getMyAttendance = async (req, res, next) => {
  try {
    const { data: records, error } = await supabase
      .from('attendance')
      .select('*, course:courses(id, title, code)')
      .eq('student_id', req.user.id);

    if (error) {
      return errorResponse(res, 500, 'Failed to fetch personal attendance.');
    }

    const total = records ? records.length : 0;
    const presentCount = records ? records.filter((r) => r.status === 'present').length : 0;
    const percentage = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 100;

    successResponse(res, 200, 'Personal attendance fetched successfully.', {
      totalClasses: total,
      presentClasses: presentCount,
      percentage: parseFloat(percentage),
      records: (records || []).map((r) => ({ ...r, _id: r.id })),
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update single attendance record
// ─── @route   PUT /api/attendance/:id
// ─── @access  Private (Faculty)
exports.updateAttendance = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const { data: record, error } = await supabase
      .from('attendance')
      .update({ status, remarks })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !record) {
      return errorResponse(res, 400, 'Failed to update attendance record.');
    }

    record._id = record.id;
    successResponse(res, 200, 'Attendance record updated successfully.', record);
  } catch (error) {
    next(error);
  }
};
