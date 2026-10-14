"""展示用測試資料，執行方式：flask --app app seed-db

測試帳號是符合規則的虛構中央大學學號，密碼都是 password123：
115501012（王小明）、114423025（陳大文）、113250031（林美美）。
"""

from datetime import timedelta

from werkzeug.security import generate_password_hash

TEST_PASSWORD = "password123"

# (代稱, 帳號＝學號, 顯示名稱, 聯絡方式)
USERS = [
    ("alice", "115501012", "王小明", "Line: alice_ncu"),
    ("bob", "114423025", "陳大文", "email: bob@example.com"),
    ("carol", "113250031", "林美美", "0912-345-678"),
]

# (發文者代稱, title, category, description, found_location, 幾小時前拾獲,
#  storage_location, contact, status)
POSTS = [
    ("alice", "藍色保溫水壺", "bottle_umbrella", "象印牌，杯身有貓咪貼紙",
     "工程五館 E5-101", 3, "已交到學務處", None, "open"),
    ("alice", "黑色長夾", "wallet", "內有學生證，姓名開頭為張",
     "圖書館 2 樓自習區", 20, "圖書館櫃檯", None, "open"),
    ("bob", "AirPods Pro 充電盒", "electronics", "白色，盒蓋有刮痕，沒有耳機",
     "大講堂 A 區第 3 排", 28, None, None, "open"),
    ("bob", "機車鑰匙", "key", "Yamaha 鑰匙，掛著皮卡丘吊飾",
     "男一舍機車停車場", 50, "男一舍宿舍管理室", None, "open"),
    ("carol", "灰色連帽外套", "clothing", "UNIQLO，M 號，口袋有一包面紙",
     "中大湖畔長椅", 72, None, "Line: carol_lake", "open"),
    ("carol", "線性代數課本", "stationery", "內頁有螢光筆畫記，封面寫 108 級",
     "科學二館 S2-203", 96, "系辦公室", None, "open"),
    ("alice", "學生證", "id_card", "資管系學生證",
     "松苑餐廳", 120, None, None, "returned"),
    ("bob", "折疊傘", "bottle_umbrella", "深藍色，傘柄有破損",
     "總圖門口傘架", 150, None, None, "open"),
]


def seed(db):
    db.execute("TRUNCATE posts, users RESTART IDENTITY CASCADE")

    password_hash = generate_password_hash(TEST_PASSWORD)
    user_ids = {}
    for key, username, display_name, contact in USERS:
        row = db.execute(
            """INSERT INTO users (username, password_hash, display_name, contact)
               VALUES (%s, %s, %s, %s) RETURNING id""",
            (username, password_hash, display_name, contact),
        ).fetchone()
        user_ids[key] = row["id"]

    # 用資料庫的時間（APP_TIMEZONE），不用系統時間：容器的系統時區通常是 UTC
    now = db.execute("SELECT LOCALTIMESTAMP(0) AS now").fetchone()["now"]
    for (key, title, category, description, found_location, hours_ago,
         storage_location, contact, status) in POSTS:
        found_at = now - timedelta(hours=hours_ago)
        # 已歸還的貼文假設拾獲一天後歸還
        returned_at = found_at + timedelta(days=1) if status == "returned" else None
        db.execute(
            """INSERT INTO posts (user_id, title, category, description, found_location,
                                  found_at, storage_location, contact, status, returned_at)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (user_ids[key], title, category, description, found_location,
             found_at, storage_location, contact, status, returned_at),
        )

    db.commit()
