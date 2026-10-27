-- Users

DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    username TEXT NOT NULL UNIQUE, 
    lowercase_username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_changed_at TEXT,

    created_at TEXT NOT NULL,
    last_activity TEXT NOT NULL, 
    last_login TEXT, 
    token_revoked_at TEXT,

    display_name TEXT,
    description TEXT, 
    pfp_url TEXT, 
    pinned_article_id INTEGER DEFAULT NULL
);

DROP TABLE IF EXISTS follows;
CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id)
);

DROP TABLE IF EXISTS favorites;
CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);



-- Articles

DROP TABLE IF EXISTS articles;
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_modified TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    prev_img TEXT DEFAULT NULL,
    prev_img_caption TEXT DEFAULT NULL
);

DROP TABLE IF EXISTS edit_history;
CREATE TABLE IF NOT EXISTS edit_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    editor_user_id INTEGER NOT NULL,
    edit_date TEXT NOT NULL,

    new_content TEXT NOT NULL,
    old_content TEXT NOT NULL,
    edit_summary TEXT DEFAULT NULL,

    FOREIGN KEY (article_id) REFERENCES articles(id)
);



-- User and article comments
DROP TABLE IF EXISTS comments;
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin_type TEXT NOT NULL,
    origin_id TEXT NOT NULL,
    commenter TEXT NOT NULL,
    created_at TEXT NOT NULL,
    content TEXT NOT NULL,
    reply_to INTEGER,
    FOREIGN KEY (reply_to) REFERENCES comments(id)
)