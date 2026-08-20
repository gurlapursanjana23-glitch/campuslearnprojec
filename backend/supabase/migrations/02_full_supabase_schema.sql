-- CampusLearn - Complete Supabase PostgreSQL Migration Schema

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    hod_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'hod', 'admin')),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    roll_number TEXT,
    employee_id TEXT,
    semester INTEGER DEFAULT 1,
    year INTEGER DEFAULT 1,
    avatar TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT TRUE,
    streak INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign key for HOD in departments
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS fk_departments_hod;
ALTER TABLE public.departments ADD CONSTRAINT fk_departments_hod FOREIGN KEY (hod_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 4. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    instructor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    semester INTEGER DEFAULT 1,
    credits INTEGER DEFAULT 3,
    category TEXT DEFAULT 'Core',
    thumbnail TEXT DEFAULT 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    is_published BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3,2) DEFAULT 4.8,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. COURSE ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    progress NUMERIC(5,2) DEFAULT 0.0,
    UNIQUE(course_id, student_id)
);

-- 6. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    due_date TIMESTAMPTZ NOT NULL,
    max_marks INTEGER DEFAULT 100,
    file_attachment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    file_url TEXT,
    text_content TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    marks NUMERIC(5,2),
    feedback TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
    UNIQUE(assignment_id, student_id)
);

-- 8. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id, student_id, date)
);

-- 9. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    is_important BOOLEAN DEFAULT FALSE,
    target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all', 'student', 'faculty', 'hod')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    duration_minutes INTEGER DEFAULT 30,
    total_points INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. QUIZ RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    total_marks INTEGER NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. USER SESSIONS TABLE (1-Web + 1-Mobile policy enforcer)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('web', 'mobile')),
    session_id TEXT NOT NULL UNIQUE,
    device_info TEXT DEFAULT 'Unknown Device',
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_courses_code ON public.courses(code);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_course ON public.attendance(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_platform ON public.user_sessions(user_id, platform);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- PERMISSIVE RLS POLICIES (Backend Service Role handles security checks)
CREATE POLICY "Allow service role full access departments" ON public.departments FOR ALL USING (true);
CREATE POLICY "Allow service role full access users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow service role full access courses" ON public.courses FOR ALL USING (true);
CREATE POLICY "Allow service role full access enrollments" ON public.course_enrollments FOR ALL USING (true);
CREATE POLICY "Allow service role full access assignments" ON public.assignments FOR ALL USING (true);
CREATE POLICY "Allow service role full access submissions" ON public.submissions FOR ALL USING (true);
CREATE POLICY "Allow service role full access attendance" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Allow service role full access announcements" ON public.announcements FOR ALL USING (true);
CREATE POLICY "Allow service role full access quizzes" ON public.quizzes FOR ALL USING (true);
CREATE POLICY "Allow service role full access quiz_results" ON public.quiz_results FOR ALL USING (true);
CREATE POLICY "Allow service role full access user_sessions" ON public.user_sessions FOR ALL USING (true);
