const { supabase } = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

// ─── @desc    Get all assignments (filtered by course / student)
// ─── @route   GET /api/assignments
// ─── @access  Private
exports.getAssignments = async (req, res, next) => {
  try {
    const { courseId, page = 1, limit = 10 } = req.query;

    let query = supabase
      .from('assignments')
      .select('*, course:courses(id, title, code), instructor:users(id, name)', { count: 'exact' });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data: assignments, count, error } = await query
      .order('due_date', { ascending: true })
      .range(from, to);

    if (error) {
      return errorResponse(res, 500, 'Failed to fetch assignments.');
    }

    const formattedAssignments = (assignments || []).map((a) => ({
      ...a,
      _id: a.id,
      dueDate: a.due_date,
      maxMarks: a.max_marks,
    }));

    paginatedResponse(res, formattedAssignments, pageNum, limitNum, count || 0, 'Assignments fetched successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Create assignment
// ─── @route   POST /api/assignments
// ─── @access  Private (Faculty)
exports.createAssignment = async (req, res, next) => {
  try {
    const { title, description, courseId, dueDate, maxMarks, fileAttachment } = req.body;

    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert({
        title,
        description,
        course_id: courseId,
        instructor_id: req.user.id,
        due_date: new Date(dueDate).toISOString(),
        max_marks: maxMarks || 100,
        file_attachment: fileAttachment || null,
      })
      .select('*, course:courses(id, title, code)')
      .single();

    if (error || !assignment) {
      console.error('Supabase createAssignment error:', error);
      return errorResponse(res, 400, 'Failed to create assignment.');
    }

    assignment._id = assignment.id;
    assignment.dueDate = assignment.due_date;

    successResponse(res, 201, 'Assignment created successfully.', assignment);
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Submit assignment
// ─── @route   POST /api/assignments/:id/submit
// ─── @access  Private (Student)
exports.submitAssignment = async (req, res, next) => {
  try {
    const { fileUrl, textContent } = req.body;

    const { data: submission, error } = await supabase
      .from('submissions')
      .upsert({
        assignment_id: req.params.id,
        student_id: req.user.id,
        file_url: fileUrl || null,
        text_content: textContent || null,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
      })
      .select()
      .single();

    if (error || !submission) {
      return errorResponse(res, 400, 'Failed to submit assignment.');
    }

    submission._id = submission.id;

    successResponse(res, 200, 'Assignment submitted successfully!', submission);
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get submissions for an assignment
// ─── @route   GET /api/assignments/:id/submissions
// ─── @access  Private (Faculty/HOD/Admin)
exports.getSubmissions = async (req, res, next) => {
  try {
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('*, student:users(id, name, email, roll_number, avatar)')
      .eq('assignment_id', req.params.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      return errorResponse(res, 500, 'Failed to fetch submissions.');
    }

    const formatted = (submissions || []).map((s) => ({
      ...s,
      _id: s.id,
      student: s.student ? { ...s.student, _id: s.student.id } : null,
    }));

    successResponse(res, 200, 'Submissions fetched successfully.', formatted);
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update assignment
// ─── @route   PUT /api/assignments/:id
// ─── @access  Private (Faculty)
exports.updateAssignment = async (req, res, next) => {
  try {
    const { data: assignment, error } = await supabase
      .from('assignments')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !assignment) {
      return errorResponse(res, 404, 'Assignment not found or update failed.');
    }

    assignment._id = assignment.id;
    successResponse(res, 200, 'Assignment updated successfully.', assignment);
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Delete assignment
// ─── @route   DELETE /api/assignments/:id
// ─── @access  Private (Faculty)
exports.deleteAssignment = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return errorResponse(res, 400, 'Failed to delete assignment.');
    }

    successResponse(res, 200, 'Assignment deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Grade submission
// ─── @route   PUT /api/assignments/submissions/:submissionId/grade
// ─── @access  Private (Faculty)
exports.gradeSubmission = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;

    const { data: submission, error } = await supabase
      .from('submissions')
      .update({
        marks: parseFloat(marks),
        feedback,
        status: 'graded',
      })
      .eq('id', req.params.submissionId || req.params.id)
      .select()
      .single();

    if (error || !submission) {
      return errorResponse(res, 400, 'Failed to grade submission.');
    }

    submission._id = submission.id;

    successResponse(res, 200, 'Submission graded successfully.', submission);
  } catch (error) {
    next(error);
  }
};
