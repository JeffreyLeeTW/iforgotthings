-- 校園失物招領系統資料表（PostgreSQL）
-- 草稿：欄位以 API 文件「資料模型」為準，組員 3 定稿後以此檔為主。

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(20)  NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    display_name  VARCHAR(50)  NOT NULL,
    contact       VARCHAR(100) NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT LOCALTIMESTAMP(0)
);

CREATE TABLE IF NOT EXISTS posts (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title            VARCHAR(100) NOT NULL,
    category         VARCHAR(30)  NOT NULL CHECK (category IN (
                         'id_card', 'electronics', 'wallet', 'key',
                         'clothing', 'stationery', 'bottle_umbrella', 'other')),
    description      TEXT,
    found_location   VARCHAR(100) NOT NULL,
    found_at         TIMESTAMP    NOT NULL,
    storage_location VARCHAR(100),
    contact          VARCHAR(100),
    image_url        VARCHAR(500),
    status           VARCHAR(10)  NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'returned')),
    created_at       TIMESTAMP    NOT NULL DEFAULT LOCALTIMESTAMP(0),
    updated_at       TIMESTAMP    NOT NULL DEFAULT LOCALTIMESTAMP(0)
);

CREATE INDEX IF NOT EXISTS idx_posts_status_found_at ON posts (status, found_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
