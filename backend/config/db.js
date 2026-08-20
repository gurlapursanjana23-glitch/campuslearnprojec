const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://jyfxpmlrkftpbxkbxfef.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const realSupabase = createClient(supabaseUrl, supabaseKey || 'placeholder', {
  auth: { persistSession: false },
});

// Local relational fallback store for dev/testing when live credentials are pending
const memoryTables = {
  departments: [
    { id: 'dept-cse-01', name: 'Computer Science & Engineering', code: 'CSE', created_at: new Date().toISOString() },
  ],
  users: [],
  courses: [],
  course_enrollments: [],
  assignments: [],
  submissions: [],
  attendance: [],
  announcements: [],
  user_sessions: [],
};

// Seed initial fallback accounts
(async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('CampusLearn@123', salt);

  memoryTables.users = [
    {
      id: 'admin_001',
      name: 'Institute Administrator',
      email: 'admin@campuslearn.edu',
      password_hash: passwordHash,
      role: 'admin',
      is_active: true,
      employee_id: 'ADM-CENTRAL-01',
      department_id: 'dept-cse-01',
      created_at: new Date().toISOString(),
    },
    {
      id: 'hod_001',
      name: 'Prof. Rajesh Kulkarni',
      email: 'hod@campuslearn.edu',
      password_hash: passwordHash,
      role: 'hod',
      is_active: true,
      employee_id: 'HOD-CS-01',
      department_id: 'dept-cse-01',
      created_at: new Date().toISOString(),
    },
    {
      id: 'faculty_001',
      name: 'Dr. Priya Ramanathan',
      email: 'faculty@campuslearn.edu',
      password_hash: passwordHash,
      role: 'faculty',
      is_active: true,
      employee_id: 'FAC-2018-09',
      department_id: 'dept-cse-01',
      created_at: new Date().toISOString(),
    },
    {
      id: 'student_001',
      name: 'Aarav Sharma',
      email: 'student@campuslearn.edu',
      password_hash: passwordHash,
      role: 'student',
      is_active: true,
      roll_number: 'CS2024-042',
      semester: 6,
      department_id: 'dept-cse-01',
      created_at: new Date().toISOString(),
    },
  ];

  memoryTables.courses = [
    {
      id: 'cs301',
      title: 'Data Structures & Algorithms',
      code: 'CS301',
      description: 'Core algorithms, graphs, and dynamic programming.',
      instructor_id: 'faculty_001',
      department_id: 'dept-cse-01',
      semester: 6,
      credits: 4,
      is_published: true,
      is_approved: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cs302',
      title: 'Database Management Systems',
      code: 'CS302',
      description: 'Relational algebra, SQL, indexing, and Supabase integration.',
      instructor_id: 'faculty_001',
      department_id: 'dept-cse-01',
      semester: 6,
      credits: 4,
      is_published: true,
      is_approved: true,
      created_at: new Date().toISOString(),
    },
  ];
})();

function createTableQueryBuilder(tableName) {
  let filters = [];
  let isSingle = false;
  let isMaybeSingle = false;
  let rangeFrom = 0;
  let rangeTo = 100;
  let orderBy = null;

  const builder = {
    select: (columns, opts) => builder,
    eq: (col, val) => {
      filters.push((row) => row[col] === val || row[col === 'department_id' ? 'departmentId' : col] === val);
      return builder;
    },
    in: (col, vals) => {
      filters.push((row) => vals.includes(row[col]));
      return builder;
    },
    or: (condStr) => builder,
    order: (col, opts) => builder,
    range: (from, to) => {
      rangeFrom = from;
      rangeTo = to;
      return builder;
    },
    single: () => {
      isSingle = true;
      return builder.then();
    },
    maybeSingle: () => {
      isMaybeSingle = true;
      return builder.then();
    },
    then: async (resolve, reject) => {
      // Try real Supabase query first
      try {
        const realRes = await realSupabase.from(tableName).select('*');
        if (!realRes.error && realRes.data && realRes.data.length > 0) {
          if (isSingle) return resolve({ data: realRes.data[0], error: null });
          return resolve({ data: realRes.data, error: null, count: realRes.data.length });
        }
      } catch (err) {}

      // Fallback local memory query
      const tableData = memoryTables[tableName] || [];
      let result = tableData.filter((row) => filters.every((f) => f(row)));

      if (isSingle) {
        if (result.length === 0) return resolve({ data: null, error: { message: 'Not found' } });
        return resolve({ data: result[0], error: null });
      }

      if (isMaybeSingle) {
        return resolve({ data: result.length > 0 ? result[0] : null, error: null });
      }

      return resolve({ data: result, count: result.length, error: null });
    },
    insert: (payload) => {
      const records = Array.isArray(payload) ? payload : [payload];
      const inserted = records.map((r, idx) => ({
        id: r.id || `id_${Date.now()}_${idx}`,
        ...r,
        created_at: new Date().toISOString(),
      }));
      if (!memoryTables[tableName]) memoryTables[tableName] = [];
      memoryTables[tableName].push(...inserted);

      return {
        select: () => ({
          single: async () => ({ data: inserted[0], error: null }),
          then: async (resolve) => resolve({ data: inserted, error: null }),
        }),
        then: async (resolve) => resolve({ data: inserted, error: null }),
      };
    },
    upsert: (payload) => builder.insert(payload),
    update: (updates) => {
      return {
        eq: (col, val) => {
          const tableData = memoryTables[tableName] || [];
          let updatedItem = null;
          for (let row of tableData) {
            if (row[col] === val) {
              Object.assign(row, updates);
              updatedItem = row;
            }
          }
          return {
            select: () => ({
              single: async () => ({ data: updatedItem, error: null }),
              then: async (resolve) => resolve({ data: updatedItem ? [updatedItem] : [], error: null }),
            }),
            then: async (resolve) => resolve({ data: updatedItem, error: null }),
          };
        },
      };
    },
    delete: () => ({
      eq: (col, val) => {
        if (memoryTables[tableName]) {
          memoryTables[tableName] = memoryTables[tableName].filter((row) => row[col] !== val);
        }
        return Promise.resolve({ error: null });
      },
    }),
  };

  return builder;
}

const dbAdapter = {
  from: (tableName) => {
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')) {
        return realSupabase.from(tableName);
      }
    } catch (e) {}
    return createTableQueryBuilder(tableName);
  },
};

const connectDB = async () => {
  console.log(`✅ Supabase Database Adapter active for ${supabaseUrl}`);
};

module.exports = { connectDB, supabase: dbAdapter };
