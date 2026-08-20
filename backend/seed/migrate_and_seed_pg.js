const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.SUPABASE_DB_URL || 'postgresql://postgresueb2VyRJaS2P9XyK@db.jyfxpmlrkftpbxkbxfef.supabase.co:5432/postgres';

async function migrateAndSeed() {
  console.log('----------------------------------------------------');
  console.log('⚡ CONNECTING DIRECTLY TO SUPABASE POSTGRESQL DATABASE');
  console.log('----------------------------------------------------');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL server.');

    // 1. Run SQL Migration Schema
    const sqlPath = path.join(__dirname, '../supabase/migrations/02_full_supabase_schema.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Executing 02_full_supabase_schema.sql migration...');
    await client.query(sqlScript);
    console.log('✅ All Supabase PostgreSQL tables & indexes created successfully!');

    // 2. Create Default Department
    const deptResult = await client.query(
      `INSERT INTO public.departments (name, code)
       VALUES ('Computer Science & Engineering', 'CSE')
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
       RETURNING id;`
    );
    const departmentId = deptResult.rows[0].id;
    console.log('✅ Department CSE created/updated (ID:', departmentId, ')');

    // 3. Create Default Users
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
      const userRes = await client.query(
        `INSERT INTO public.users (name, email, password_hash, role, employee_id, roll_number, semester, department_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, email;`,
        [u.name, u.email, u.password_hash, u.role, u.employee_id || null, u.roll_number || null, u.semester || 1, u.department_id]
      );
      const row = userRes.rows[0];
      userIds[u.email] = row.id;
      console.log(`✅ User ${u.email} active (ID: ${row.id})`);
    }

    // 4. Create Sample Courses
    const facultyId = userIds['faculty@campuslearn.edu'];
    const studentId = userIds['student@campuslearn.edu'];

    if (facultyId) {
      const coursesData = [
        {
          title: 'Data Structures & Algorithms',
          code: 'CS301',
          description: 'Comprehensive study of core algorithms, trees, graphs, and dynamic programming.',
          semester: 6,
          credits: 4,
          category: 'Core',
        },
        {
          title: 'Database Management Systems',
          code: 'CS302',
          description: 'Relational algebra, SQL, indexing, transaction processing, and Supabase integration.',
          semester: 6,
          credits: 4,
          category: 'Core',
        },
        {
          title: 'Operating Systems',
          code: 'CS303',
          description: 'Process control, memory management, virtual storage, and file systems.',
          semester: 6,
          credits: 3,
          category: 'Core',
        },
        {
          title: 'Software Engineering',
          code: 'CS304',
          description: 'Agile methodologies, system design, pair programming, and automated CI/CD pipelines.',
          semester: 6,
          credits: 3,
          category: 'Elective',
        },
      ];

      for (const c of coursesData) {
        const cRes = await client.query(
          `INSERT INTO public.courses (title, code, description, instructor_id, department_id, semester, credits, category, is_published, is_approved)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true)
           ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title
           RETURNING id;`,
          [c.title, c.code, c.description, facultyId, departmentId, c.semester, c.credits, c.category]
        );
        const cId = cRes.rows[0].id;
        console.log(`✅ Course ${c.code} (${c.title}) active.`);

        if (studentId) {
          await client.query(
            `INSERT INTO public.course_enrollments (course_id, student_id)
             VALUES ($1, $2)
             ON CONFLICT (course_id, student_id) DO NOTHING;`,
            [cId, studentId]
          );
        }
      }
    }

    // 5. Initial Announcement
    const adminId = userIds['admin@campuslearn.edu'];
    if (adminId) {
      await client.query(
        `INSERT INTO public.announcements (title, content, author_id, department_id, is_important, target_role)
         VALUES ($1, $2, $3, $4, true, 'all');`,
        [
          '🚀 Welcome to CampusLearn (Supabase PostgreSQL Edition)',
          'CampusLearn backend is now fully powered by Supabase PostgreSQL! All courses, assignments, and attendance are synced across Web & Mobile.',
          adminId,
          departmentId,
        ]
      );
      console.log('✅ Initial Announcement created.');
    }

    console.log('\n----------------------------------------------------');
    console.log('🎉 FULL SUPABASE MIGRATION & SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('❌ Migration/Seeding error:', err);
  } finally {
    await client.end();
  }
}

migrateAndSeed();
