# iforgotthings · in NCU

中央大學校園失物招領系統。此 repository 同時容納前端與後端專案。

## 目錄

- [`frontend/`](frontend/)：React 前端，包含原始碼、靜態資源、套件設定、部署範本與預覽截圖。
- `backend/`：預留給 Flask 後端，目前尚未建立。

## 啟動前端

在 repository 根目錄執行：

```sh
cd frontend
npm install
npm run dev
```

打包時在 `frontend/` 執行 `npm run build`，產物位於 `frontend/dist/`。

預設使用示範資料。Flask API 連接方式、環境變數及部署設定請參閱 [`frontend/README.md`](frontend/README.md)。
