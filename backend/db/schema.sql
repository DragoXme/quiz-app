-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mobile VARCHAR(15),
    created_at TIMESTAMP DEFAULT NOW()
);

-- OTP TABLE (for forgot password)
CREATE TABLE IF NOT EXISTS otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('mcq_single', 'mcq_multiple', 'fill_blank')),
    question_text TEXT,
    question_image_url TEXT,
    solution_text TEXT,
    solution_image_url TEXT,
    is_starred BOOLEAN DEFAULT FALSE,
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    unattempted_count INTEGER DEFAULT 0,
    min_time INTEGER DEFAULT NULL,
    max_time INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- OPTIONS TABLE (for MCQ questions)
CREATE TABLE IF NOT EXISTS options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT,
    option_image_url TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    position INTEGER NOT NULL
);

-- FILL IN THE BLANK ANSWERS TABLE
CREATE TABLE IF NOT EXISTS fill_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    correct_answer TEXT NOT NULL
);

-- TAGS TABLE
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL
);

-- QUESTION TAGS (many to many)
CREATE TABLE IF NOT EXISTS question_tags (
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

-- CONTESTS TABLE
CREATE TABLE IF NOT EXISTS contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL,
    total_time INTEGER NOT NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE
);

-- CONTEST QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS contest_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    chosen_answer TEXT,
    time_spent INTEGER DEFAULT 0,
    is_correct BOOLEAN DEFAULT FALSE,
    is_attempted BOOLEAN DEFAULT FALSE,
    prev_min_time INTEGER,
    prev_max_time INTEGER
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_question_id ON question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag_id ON question_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_contest_questions_contest_id ON contest_questions(contest_id);
CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);