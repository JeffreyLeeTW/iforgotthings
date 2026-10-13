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

```bash
apt install -y python3-venv postgresql git
sudo -u postgres psql -c "CREATE USER lostfound WITH PASSWORD '你的密碼';"
sudo -u postgres psql -c "CREATE DATABASE lostfound OWNER lostfound;"

cd /opt && git clone https://github.com/nfkgu6630/iforgotthings.git && cd iforgotthings/backend
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 編輯 .env：填密碼、換一組 SECRET_KEY
flask --app app init-db
flask --app app seed-db

gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

之後從同網段的瀏覽器打開 `http://<容器 IP>:5000`。

## 常用指令

| 指令 | 作用 |
| --- | --- |
| `flask --app app init-db` | 建立資料表（已存在不會覆蓋） |
| `flask --app app seed-db` | **清空**所有資料並重灌測試資料 |
| `python app.py` | 開發模式啟動（127.0.0.1:5000） |
