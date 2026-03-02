# PsychMedMVP - 個人精神科用藥與情緒管理系統

這是一個專為精神科長期用藥者設計的 MVP (Minimum Viable Product) 應用程式。旨在幫助使用者精確紀錄每日作息、服藥劑量，並視覺化藥物調整與情緒之間的關係，以便在回診時提供給醫師精確的參考資料。

## 🌟 核心功能

- **☀️ 每日紀錄 (Home)**：快速打卡起床、就寢、定時藥物與必要時用藥（PRN），並紀錄每日情緒事件。
- **📈 劑量趨勢 (Trend)**：自動生成藥物劑量調整曲線圖，區分「醫囑」與「自行調整」，方便觀察藥效與穩定度。
- **📅 回診手冊 (History)**：彙整過去的紀錄，自動計算平均睡眠時間，並以時間軸呈現每日細節，方便診間溝通。
- **📚 藥藥寶典 (Database)**：管理個人藥庫，區分服役中、必要時、冷宮區，並紀錄原廠副作用與個人筆記。

## 🛠 技術棧

- **前端框架**：React 18
- **建構工具**：Vite
- **樣式處理**：Tailwind CSS (自定義色系與圓角設計)
- **圖表組件**：Recharts
- **圖示庫**：Lucide React

## 🚀 本地開發環境建立

1. **安裝依賴**：
   ```bash
   npm install
   ```

2. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```

3. **打包生產版本**：
   ```bash
   npm run build
   ```

## 📱 行動端與桌面端輸出

### macOS 應用程式
建議使用 **Tauri** 或 **Capacitor** 進行封裝：
- **Tauri** (推薦)：效能極佳，體積小。
- **Capacitor**：適合網頁開發者快速轉化。

### iOS 應用程式 (免開發者帳號安裝)
1. 安裝 **Capacitor**: `npm install @capacitor/core @capacitor/cli @capacitor/ios`
2. 使用 **Xcode** 打開專案。
3. 在 Xcode 中登入您的 **個人 Apple ID**。
4. 將您的 iPhone 連接至 Mac，並在 **Signing & Capabilities** 選取您的開發團隊。
5. 點擊 **Run** 即可安裝至手機。
   - *註：個人 Apple ID 簽名有效期為 7 天，過期後需重新連接 Xcode 再次運行安裝。*

---
Made with ❤️ for better mental health management.
fu

