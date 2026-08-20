const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');

async function seedSupabase() {
  console.log('----------------------------------------------------');
  console.log('🌱 SEEDING SUPABASE POSTGRESQL DATABASE');
  console.log('----------------------------------------------------');

  try {
    // 1. Create Default Department
    let departmentId = null;
    const { data: existingDept } = await supabase
      .from('departments')
      .select('id')
      .eq('code', 'CSE')
      .maybeSingle();

    if (existingDept) {
      departmentId = existingDept.id;
      console.log('✅ Department "Computer Science & Engineering" exists (ID:', departmentId, ')');
    } else {
      const { data: newDept, error: deptError } = await supabase
        .from('departments')
        .insert({
          name: 'Computer Science & Engineering',
          code: 'CSE',
        })
        .select()
        .single();

      if (!deptError && newDept) {
        departmentId = newDept.id;
        console.log('✅ Department "Computer Science & Engineering" created (ID:', departmentId, ')');
      } else {
        console.warn('Department creation error:', deptError?.message);
      }
    }

    // 2. Hash Password for Demo Accounts
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('CampusLearn@123', salt);

    const demoUsers = [
      {
        name: 'Institute Administrator',
        email: 'admin@campuslearn.edu',
        password_hash: passwordHash,
        role: 'admin',
        employee_id: 'ADM-CENTRAL-01',
        department_id: departmentId,
      },
      {
        name: 'Prof. Rajesh Kulkarni',
        email: 'hod@campuslearn.edu',
        password_hash: passwordHash,
        role: 'hod',
        employee_id: 'HOD-CS-01',
        department_id: departmentId,
      },
      {
        name: 'Dr. Priya Ramanathan',
        email: 'faculty@campuslearn.edu',
        password_hash: passwordHash,
        role: 'faculty',
        employee_id: 'FAC-2018-09',
        department_id: departmentId,
      },
      {
        name: 'Aarav Sharma',
        email: 'student@campuslearn.edu',
        password_hash: passwordHash,
        role: 'student',
        roll_number: 'CS2024-042',
        semester: 6,
        department_id: departmentId,
      },
    ];

    const userIds = {};

    for (const u of demoUsers) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', u.email)
        .maybeSingle();

      if (existingUser) {
        userIds[u.email] = existingUser.id;
        console.log(`✅ User ${u.email} already exists (ID: ${existingUser.id})`);
      } else {
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert(u)
          .select()
          .single();

        if (!userError && newUser) {
          userIds[u.email] = newUser.id;
          console.log(`✅ User ${u.email} created (ID: ${newUser.id})`);
        } else {
          console.warn(`User ${u.email} insert warning:`, userError?.message);
        }
      }
    }

    // 3. Create Sample Courses
    const facultyId = userIds['faculty@campuslearn.edu'];
    const studentId = userIds['student@campuslearn.edu'];

    if (facultyId) {
      const coursesData = [
        {
          title: 'Data Structures & Algorithms',
          code: 'CS301',
          description: 'Comprehensive study of core algorithms, trees, graphs, and dynamic programming.',
          instructor_id: facultyId,
          department_id: departmentId,
          semester: 6,
          credits: 4,
          category: 'Core',
        },
        {
          title: 'Database Management Systems',
          code: 'CS302',
          description: 'Relational algebra, SQL, indexing, transaction processing, and Supabase integration.',
          instructor_id: facultyId,
          department_id: departmentId,
          semester: 6,
          credits: 4,
          category: 'Core',
        },
        {
          title: 'Operating Systems',
          code: 'CS303',
          description: 'Process control, memory management, virtual storage, and file systems.',
          instructor_id: facultyId,
          department_id: departmentId,
          semester: 6,
          credits: 3,
          category: 'Core',
        },
        {
          title: 'Software Engineering',
          code: 'CS304',
          description: 'Agile methodologies, system design, pair programming, and automated CI/CD pipelines.',
          instructor_id: facultyId,
          department_id: departmentId,
          semester: 6,
          credits: 3,
          category: 'Elective',
        },
      ];

      for (const c of coursesData) {
        const { data: existingCourse } = await supabase
          .from('courses')
          .select('id')
          .eq('code', c.code)
          .maybeSingle();

        let courseId = existingCourse ? existingCourse.id : null;

        if (!existingCourse) {
          const { data: newCourse, error: cErr } = await supabase
            .from('courses')
            .insert(c)
            .select()
            .single();
          if (newCourse) {
            courseId = newCourse.id;
            console.log(`✅ Course ${c.code} (${c.title}) created.`);
          }
        } else {
          console.log(`✅ Course ${c.code} already exists.`);
        }

        // Enroll Student in Course
        if (courseId && studentId) {
          await supabase
            .from('course_enrollments')
            .upsert({ course_id: courseId, student_id: studentId }, { onConflict: 'course_id,student_id' });
        }
      }
    }

    // 4. Sample Announcement
    const adminId = userIds['admin@campuslearn.edu'];
    if (adminId) {
      await supabase
        .from('announcements')
        .insert({
          title: '🚀 Welcome to CampusLearn (Supabase Edition)',
          content: 'CampusLearn backend is now powered by Supabase PostgreSQL! Access courses, assignments, and attendance on Web & Mobile.',
          author_id: adminId,
          department_id: departmentId,
          is_important: true,
          target_role: 'all',
        });
      console.log('✅ Initial Announcement posted.');
    }

    console.log('\n🎉 SUPABASE DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  }
}

seedSupabase();
