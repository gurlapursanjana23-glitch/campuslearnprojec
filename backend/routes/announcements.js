const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');
const { protect, authorize } = require('../middleware/auth');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    let query = supabase
      .from('announcements')
      .select('*, author:users(id, name, avatar, role), department:departments(id, name)', { count: 'exact' });

    if (req.user.role === 'student') {
      query = query.in('target_role', ['all', 'student']);
    } else if (req.user.role === 'faculty') {
      query = query.in('target_role', ['all', 'faculty']);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data: announcements, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Supabase announcements error:', error);
      return errorResponse(res, 500, 'Failed to fetch announcements.');
    }

    const formatted = (announcements || []).map((a) => ({
      ...a,
      _id: a.id,
      author: a.author ? { ...a.author, _id: a.author.id } : null,
    }));

    paginatedResponse(res, formatted, pageNum, limitNum, count || 0, 'Announcements fetched successfully.');
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, authorize('faculty', 'hod', 'admin'), async (req, res, next) => {
  try {
    const { title, content, isImportant, targetRole, departmentId } = req.body;

    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        author_id: req.user.id,
        department_id: departmentId || null,
        is_important: isImportant || false,
        target_role: targetRole || 'all',
      })
      .select('*, author:users(id, name, avatar, role)')
      .single();

    if (error || !announcement) {
      console.error('Supabase create announcement error:', error);
      return errorResponse(res, 400, 'Failed to create announcement.');
    }

    announcement._id = announcement.id;
    successResponse(res, 201, 'Announcement posted.', announcement);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, authorize('faculty', 'hod', 'admin'), async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return errorResponse(res, 400, 'Failed to delete announcement.');
    }

    successResponse(res, 200, 'Announcement deleted.');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
