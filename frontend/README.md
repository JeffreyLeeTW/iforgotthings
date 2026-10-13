# iforgotthings · in NCU

中央大學校園失物招領的獨立 **React 前端**。使用 React 19、Vite、CSS 與 Lucide 圖示，透過 HTTP API 連接 Flask；PostgreSQL 由後端管理。

## 本機啟動

以下指令皆於 `frontend/` 目錄執行；若目前位於 repository 根目錄，請先執行 `cd frontend`。

```sh
npm install
npm run dev
```

開啟終端顯示的網址（預設 http://localhost:5173）。預設為示範模式：內建虛構物品、自製 SVG 插畫，可註冊虛構帳號測試刊登、編輯、上傳照片、歸還與刪除。示範資料只存於記憶體，重新整理後重置，沒有預設帳密。請勿輸入真實密碼或聯絡資料。

## 連接 Flask

複製 `.env.example` 為 `.env.local`，修改後重新啟動 Vite。以下為同一台機器執行 Flask 的範例，請將 `API_TARGET` 改成你的後端實際位址與 port：

```dotenv
VITE_DATA_MODE=api
API_TARGET=http://127.0.0.1:5000
```

`5000` 是文件的預設 port，仍需向後端確認。`.env.local` 已被 Git 忽略；實際內網位址與環境設定請留在本機，不要改寫要提交的 `.env.example`。`API_TARGET` 僅供開發代理使用，不會作為 `VITE_` 變數暴露給瀏覽器。

本機需先連上 Tailscale，才能讓開發代理連到後端內網。前端始終使用相對網址 `/api` 與 `/uploads`，開發期間由 Vite 代理到 `API_TARGET`。登入依 Flask session cookie，不儲存 token。API 模式連線失敗會顯示錯誤與重試，不會偷偷切換成假資料。

API 依據《校園失物招領系統 API 文件》（2026-10-13）：四支 auth API、五支 posts API、multipart 照片上傳，分類與狀態代碼均保留原定義。照片支援 JPEG、PNG、WebP，最多 5 MB。搜尋依文件送出 `q`，正式搜尋仍需後端實作該選做功能。

## 前端部署至 Debian LXC

```sh
# 先確定 .env.local 中 VITE_DATA_MODE=api
npm run build
```

把 `dist/` 內容部署至前端容器 `/var/www/iforgotthings`，使用 Nginx 提供靜態檔案。`deploy/nginx.conf` 中的 `127.0.0.1:5000` 只是範例；前後端分開容器時，請先複製成已被 Git 忽略的 `deploy/nginx.local.conf`，再把兩處 `proxy_pass` 都改成 Flask 後端的實際位址與 port，將這份設定安裝到伺服器。Nginx 不會讀取 `.env.local` 或 `API_TARGET`。瀏覽器只存取前端同一個 origin，保留 session cookie，不需在前端寫跨來源帳密設定。正式 HTTPS 終止點與 Flask cookie 設定由部署端配置。

此專案沒有連入 PVE、修改容器或部署至伺服器。也可由 Flask 提供 `dist/` 的靜態檔案，但 React 與 Flask 仍為各自獨立的前後端專案。

## 功能

- 免登入瀏覽、關鍵字搜尋、八類篩選、待認領／已歸還狀態。
- 詳情獨立請求，訪客可讀取拾獲地點、時間、保管地點及聯絡方式。
- 登入、註冊、登出；登入後可查看自己的刊登。
- 刊登、照片預覽與上傳、修改、標記已歸還／重新開放、刪除確認。
- 手機版、鍵盤焦點、原生 dialog 焦點管理、載入／空結果／失敗狀態。

## 設計

以校園拾獲便條為主視覺，不以數據或儀表板主導。內容左對齊；桌面四欄失物、手機兩欄，手機分類可橫向捲動。

色彩：校園深藍 `#233D72`、紙白 `#FBFCFE`、便條黃 `#F4D76E`、霧藍 `#EEF2F7`、次要文字灰藍 `#748094`、分隔線 `#E2E7EE`。字體為 DM Sans 搭配 Noto Sans TC（Google Fonts，離線時回退至系統字體）。首頁插畫集中視覺個性，其餘介面保持安靜，優先呈現物品、地點及時間。示範插畫不會用來偽裝真實物品照片；API 資料缺照片時顯示「尚未提供照片」。

## 專案結構

```text
src/App.jsx       畫面與操作流程
src/api.js        API client 與明確區分的記憶體示範模式
src/ItemArt.jsx   示範物品 SVG 插畫
src/styles.css    視覺與響應式樣式
deploy/nginx.conf 前端容器的 Nginx 設定範本
```
