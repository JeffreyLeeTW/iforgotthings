# 校園失物招領系統 後端

Flask + PostgreSQL。API 規格見組內的「校園失物招領系統 API 文件」。

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `app.py` | 全部 API（帳號 4 支、貼文 5 支、照片上傳 1 支） |
| `schema.sql` | PostgreSQL 建表語法 |
| `seed.py` | 展示用測試資料（3 個帳號、8 篇貼文，密碼皆為 `password123`） |
| `requirements.txt` | Python 套件 |
| `.env.example` | 環境變數範本，複製成 `.env` 後填值 |
| `smoke_test.py` | 自動測試全部 API（**會清空資料庫**並重灌測試資料） |
| `uploads/` | 上傳的照片，**備份時要一起備份** |

前端檔案放在 repo 根目錄的 `frontend/` 資料夾，後端會一併提供：`frontend/index.html` 就是首頁，
前端呼叫 API 一律用相對路徑 `/api/...`。

## 本機開發（Windows）

1. 建立資料庫（只需做一次）：

   ```
   psql -U postgres
   CREATE USER lostfound WITH PASSWORD '你的密碼';
   CREATE DATABASE lostfound OWNER lostfound;
   \q
   ```

2. 在 `backend/` 資料夾安裝套件：

   ```
   cd backend
   py -3.13 -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. 複製 `.env.example` 成 `.env`，把 `DATABASE_URL` 裡的 `your-password` 換成第 1 步的密碼。

4. 建表、灌測試資料、啟動：

   ```
   flask --app app init-db
   flask --app app seed-db
   python app.py
   ```

   打開 http://127.0.0.1:5000/api/posts 看到 JSON 就成功了。

## 部署到 PVE 容器（Debian 13）

以 root 在容器主控台執行（PVE 容器通常沒有 `sudo`，所以用 `runuser`）。

1. 安裝套件，確認 PostgreSQL 狀態是 `online`：

   ```bash
   apt install -y python3-venv postgresql git curl
   pg_lsclusters
   ```

2. 建立帳號與資料庫。**一定要指定 UTF8**：容器沒設 locale 時，PostgreSQL 預設會建成
   `SQL_ASCII`，存不了中文（`init-db` 會檢查並提示）。

   ```bash
   runuser -u postgres -- psql -c "CREATE USER lostfound WITH PASSWORD '你的密碼';"
   runuser -u postgres -- psql -c "CREATE DATABASE lostfound OWNER lostfound ENCODING 'UTF8' LC_COLLATE 'C.UTF-8' LC_CTYPE 'C.UTF-8' TEMPLATE template0;"
   runuser -u postgres -- psql -l   # lostfound 的 Encoding 欄要是 UTF8
   ```

3. 下載程式碼並安裝 Python 套件：

   ```bash
   cd /opt && git clone https://github.com/nfkgu6630/iforgotthings.git
   cd /opt/iforgotthings/backend
   python3 -m venv .venv && . .venv/bin/activate
   pip install -r requirements.txt
   ```

4. 產生 `.env`（先把 `你的密碼` 換成第 2 步的密碼，再整段貼上）：

   ```bash
   SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
   cat > .env <<EOF
   SECRET_KEY=$SECRET
   DATABASE_URL=postgresql://lostfound:你的密碼@localhost:5432/lostfound
   APP_TIMEZONE=Asia/Taipei
   EOF
   ```

   資料庫放在另一台容器時，把 `localhost` 換成那台的 IP；那台的 PostgreSQL 要設定
   `listen_addresses` 與 `pg_hba.conf`，允許這台容器連入。

5. 建表、灌測試資料、跑自動測試（應顯示 `33/33 checks passed`）：

   ```bash
   flask --app app init-db
   flask --app app seed-db --yes
   python smoke_test.py
   ```

6. 啟動：

   ```bash
   gunicorn -w 2 -b 0.0.0.0:5000 app:app
   ```

   之後從同網段的瀏覽器打開 `http://<容器 IP>:5000`。

## 常用指令

| 指令 | 作用 |
| --- | --- |
| `flask --app app init-db` | 建立資料表（已存在不會覆蓋） |
| `flask --app app seed-db` | **清空**所有資料並重灌測試資料 |
| `python app.py` | 開發模式啟動（127.0.0.1:5000） |
