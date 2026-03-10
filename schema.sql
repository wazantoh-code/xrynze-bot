-- ==========================================
--  TABEL PENGGUNA DAN GRUP
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    username TEXT,
    language_code TEXT,
    is_bot INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chats (
    chat_id INTEGER PRIMARY KEY,
    title TEXT,
    type TEXT,
    username TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
--  TABEL FILTERS
-- ==========================================
CREATE TABLE IF NOT EXISTS filters (
    chat_id INTEGER,
    keyword TEXT,
    reply_text TEXT,
    file_type TEXT,
    file_id TEXT,
    buttons TEXT,
    has_markdown INTEGER DEFAULT 1,
    PRIMARY KEY (chat_id, keyword)
);

-- ==========================================
--  TABEL WELCOME/GREETINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS welcome_settings (
    chat_id INTEGER PRIMARY KEY,
    should_welcome INTEGER DEFAULT 1,
    welcome_text TEXT,
    welcome_type TEXT DEFAULT 'text',
    welcome_content TEXT,
    welcome_buttons TEXT,
    should_goodbye INTEGER DEFAULT 1,
    goodbye_text TEXT,
    goodbye_type TEXT DEFAULT 'text',
    goodbye_buttons TEXT,
    clean_welcome INTEGER DEFAULT 0,
    welcome_mutes TEXT DEFAULT 'off',
    clean_service INTEGER DEFAULT 0,
    last_welcome_msg_id INTEGER
);

CREATE TABLE IF NOT EXISTS verification (
    chat_id INTEGER,
    user_id INTEGER,
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chat_id, user_id)
);

-- ==========================================
--  TABEL WARNS (PERINGATAN)
-- ==========================================
CREATE TABLE IF NOT EXISTS warn_settings (
    chat_id INTEGER PRIMARY KEY,
    warn_limit INTEGER DEFAULT 3,
    soft_warn INTEGER DEFAULT 1  -- 1 = kick, 0 = ban
);

CREATE TABLE IF NOT EXISTS warns (
    chat_id INTEGER,
    user_id INTEGER,
    reason TEXT,
    warned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE INDEX IF NOT EXISTS idx_warns_chat_user ON warns(chat_id, user_id);

CREATE TABLE IF NOT EXISTS warn_filters (
    chat_id INTEGER,
    keyword TEXT,
    reply_text TEXT,
    PRIMARY KEY (chat_id, keyword)
);

-- ==========================================
--  TABEL NOTES (CATATAN)
-- ==========================================
CREATE TABLE IF NOT EXISTS notes (
    chat_id INTEGER,
    name TEXT,
    value TEXT,
    msgtype TEXT DEFAULT 'text',
    file_id TEXT,
    buttons TEXT,
    PRIMARY KEY (chat_id, name)
);

-- ==========================================
--  TABEL RULES (ATURAN)
-- ==========================================
CREATE TABLE IF NOT EXISTS rules (
    chat_id INTEGER PRIMARY KEY,
    rules_text TEXT
);

-- ==========================================
--  TABEL TOPICS (FORUM)
-- ==========================================
CREATE TABLE IF NOT EXISTS action_topics (
    chat_id INTEGER PRIMARY KEY,
    topic_id INTEGER,
    topic_name TEXT
);
