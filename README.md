# PsychMedMVP 🏥
### 個人精神科用藥與情緒追蹤系統 (Mental Health Tracker)

**PsychMedMVP** 是一款專為精神科長期用藥者設計的輕量級、功能齊全的單頁應用程式 (SPA)。旨在幫助使用者建立精確的用藥行為數據庫，並透過視覺化圖表，在診間為醫師提供最有價值的臨床參考。

---

## ✨ 核心亮點

- **🖥️ 全平台響應式 (Full Responsive)**：
  - **電腦版**：提供專業的儀表板導覽 (Sidebar)，讓您在大螢幕上輕鬆檢視長期趨勢。
  - **手機版**：優化的單手操作導覽 (Bottom Nav)，方便隨時隨地紀錄用藥細節。

- **📊 劑量與情緒聯動 (Trend Analysis)**：
  - 自動計算每日總用藥量（支援精確至 0.25 顆）。
  - 將情緒評分 (1-10) 與藥物劑量疊加，一眼看出藥效與心情的因果關係。

- **⏰ 極簡打卡體驗 (Quick Log)**：
  - **一鍵打卡**：單擊按鈕即可快速紀錄當前起床/就寢時間。
  - **細節編輯**：雙擊或點擊紀錄後，可開啟 Modal 微調時間或劑量細節。

- **📝 診間專屬功能 (Clinic Ready)**：
  - **回診手冊**：彙整歷史紀錄，自動計算週平均睡眠。
  - **一鍵匯出**：將紀錄複製到剪貼簿，診間溝通零障礙。

- **💾 離線與韌性 (Offline-First)**：
  - **資料持久化**：所有資料儲存在 `localStorage`，隱私 100% 保存在本機。
  - **自動修復**：內建 `ErrorBoundary`，遇到資料格式不相容時可一鍵修復。

---

## 🛠 技術架構

- **框架**：`React 18` + `Vite` (高效開發與熱更新)
- **UI 系統**：`Tailwind CSS` (自定義 `rounded-[40px]` 系統與全平台適配)
- **圖示庫**：`Lucide React`
- **數據視覺化**：`Recharts` (處理劑量階梯圖與情緒折線圖)
- **狀態管理**：React Hooks (`useState`, `useEffect`, `useMemo`)

---

## 🚀 快速開始

1. **環境需求**：Node.js (建議 v18 以上)
2. **安裝依賴**：
   ```bash
   npm install
   ```
3. **啟動開發**：
   ```bash
   npm run dev
   ```
4. **構建與部署**：
   ```bash
   npm run build
   ```

---

## 📱 多端支援 (Multi-Platform Support)

本專案已完成全平台的視覺適配：
- **Web App**：支援電腦瀏覽器，提供寬屏數據報表。
- **PWA**：可直接「加入主螢幕」像原生 App 一樣使用。
- **iOS/Android**：已配置 Capacitor，可轉換為原生應用程式。

---
Made with ❤️ for better mental health management.
