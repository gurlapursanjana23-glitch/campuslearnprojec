const { supabase } = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

// ─── @desc    Get all courses (with search, filter, pagination)
// ─── @route   GET /api/courses
// ─── @access  Public/Private
exports.getCourses = async (req, res, next) => {
  try {
    const { search, department, semester, faculty, enrolled, page = 1, limit = 12 } = req.query;

    let query = supabase
      .from('courses')
      .select('*, instructor:users(id, name, avatar), department:departments(id, name, code)', { count: 'exact' });

    if (search) {
      query = query.or(`title.ilike.%${search}%,code.ilike.%${search}%`);
    }
    if (department) {
      query = query.eq('department_id', department);
    }
    if (semester) {
      query = query.eq('semester', parseInt(semester));
    }
    if (faculty) {
      query = query.eq('instructor_id', faculty);
    } else if (req.user && req.user.role === 'faculty') {
      query = query.eq('instructor_id', req.user.id);
    }

    if (!req.user || req.user.role === 'student') {
      query = query.eq('is_published', true).eq('is_approved', true);
      if (req.user && req.user.semester) {
        query = query.eq('semester', req.user.semester);
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data: courses, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Supabase getCourses error:', error);
      return errorResponse(res, 500, 'Failed to fetch courses.');
    }

    const formattedCourses = (courses || []).map((c) => ({
      ...c,
      _id: c.id,
      faculty: c.instructor,
    }));

    paginatedResponse(res, formattedCourses, pageNum, limitNum, count || 0, 'Courses fetched successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get single course by ID
// ─── @route   GET /api/courses/:id
// ─── @access  Public/Private
exports.getCourse = async (req, res, next) => {
  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select('*, instructor:users(id, name, avatar), department:departments(id, name, code)')
      .eq('id', req.params.id)
      .single();

    if (error || !course) {
      return errorResponse(res, 404, 'Course not found.');
    }

    course._id = course.id;
    course.faculty = course.instructor;

    successResponse(res, 200, 'Course fetched successfully.', course);
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Create course
// ─── @route   POST /api/courses
// ─── @access  Private (Faculty/HOD/Admin)
exports.createCourse = async (req, res, next) => {
  try {
    const { title, code, description, department, semester, credits, category } = req.body;

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title,
        code,
        description,
        department_id: department || null,
        instructor_id: req.user.id,
        semester: semester || 1,
        credits: credits || 3,
        category: category || 'Core',
        is_published: true,
        is_approved: true,
      })
      .select('*, instructor:users(id, name, avatar), department:departments(id, name, code)')
      .single();

    if (error || !course) {
      console.error('Supabase createCourse error:', error);
      return errorResponse(res, 400, 'Failed to create course. Code may already exist.');
    }

    course._id = course.id;
    course.faculty = course.instructor;

    successResponse(res, 201, 'Course created successfully.', course);
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update course
// ─── @route   PUT /api/courses/:id
// ─── @access  Private (Faculty/HOD/Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    const { data: course, error } = await supabase
      .from('courses')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*, instructor:users(id, name, avatar), department:departments(id, name, code)')
      .single();

    if (error || !course) {
      return errorResponse(res, 404, 'Course not found or update failed.');
    }

    course._id = course.id;
    course.faculty = course.instructor;

    successResponse(res, 200, 'Course updated successfully.', course);
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Delete course
// ─── @route   DELETE /api/courses/:id
// ─── @access  Private (Faculty owner / Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return errorResponse(res, 400, 'Failed to delete course.');
    }

    successResponse(res, 200, 'Course deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Enroll in course
// ─── @route   POST /api/courses/:id/enroll
// ─── @access  Private (Student)
exports.enrollCourse = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        course_id: req.params.id,
        student_id: req.user.id,
      })
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Already enrolled in this course or invalid course.');
    }

    successResponse(res, 200, 'Successfully enrolled in course!', data);
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Approve course (HOD/Admin)
// ─── @route   PATCH /api/courses/:id/approve
// ─── @access  Private (HOD/Admin)
exports.approveCourse = async (req, res, next) => {
  try {
    const { data: course } = await supabase
      .from('courses')
      .update({ is_approved: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (course) course._id = course.id;

    successResponse(res, 200, 'Course approved successfully.', course);
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get enrolled students in a course
// ─── @route   GET /api/courses/:id/students
// ─── @access  Private (Faculty/HOD/Admin)
exports.getEnrolledStudents = async (req, res, next) => {
  try {
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('*, student:users(id, name, email, roll_number, avatar)')
      .eq('course_id', req.params.id);

    const students = (enrollments || []).map((e) => ({
      ...e.student,
      _id: e.student.id,
      enrolledAt: e.enrolled_at,
    }));

    successResponse(res, 200, 'Enrolled students fetched successfully.', students);
  } catch (error) {
    next(error);
  }
};

exports.getCourseStudents = exports.getEnrolledStudents;

