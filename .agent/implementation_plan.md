# Daily AI Digest Feature - Implementation Plan

Implementasi fitur Daily Digest dengan Google Gemini Grounding untuk berita real-time dan push notification.

## User Review Required

> [!IMPORTANT]
> **Package Migration**: Backend akan menambah `@google/genai` untuk Grounding (tetap pertahankan package lama untuk chat).

> [!WARNING]  
> **Dev Build Required**: Push notification tidak bisa di Expo Go. Perlu `npx expo run:android` untuk dev build.

> [!CAUTION]
> **Scheduler**: Dengan `node-schedule`, jobs hilang jika server restart. Untuk production, gunakan BullMQ + Redis.

---

## Proposed Changes

### Backend - Core Services

#### [MODIFY] [package.json](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/backend/package.json)
Tambah: `@google/genai`, `node-schedule`, `expo-server-sdk`

---

#### [NEW] [services/geminiGrounding.js](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/backend/services/geminiGrounding.js)
Service Gemini dengan Google Grounding untuk generate digest berita real-time.

---

#### [NEW] [services/scheduler.js](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/backend/services/scheduler.js)
Job scheduler - cek tiap menit, trigger Gemini, kirim notification, simpan history.

---

#### [NEW] [services/pushNotification.js](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/backend/services/pushNotification.js)
Push notification dengan Expo Server SDK.

---

#### [NEW] [data/digestStore.js](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/backend/data/digestStore.js)
In-memory store untuk settings dan history (production pakai database).

---

#### [MODIFY] [server.js](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/backend/server.js)
Endpoints baru:
- `POST /api/digest/settings` - Simpan setting
- `GET /api/digest/settings` - Ambil setting
- `POST /api/push/register` - Register push token
- `GET /api/digest/history` - List history
- `GET /api/digest/:id` - Detail digest
- `POST /api/test-digest` - Manual trigger

---

### Mobile App - New Files

#### [NEW] [app/(tabs)/digest.tsx](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/app/(tabs)/digest.tsx)
Tab baru - Digest History list dengan iOS-style UI.

---

#### [NEW] [app/digest/[id].tsx](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/app/digest/[id].tsx)
Halaman detail digest dengan konten dan sumber berita.

---

#### [NEW] [app/digest-settings.tsx](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/app/digest-settings.tsx)
Pengaturan: time picker, topic selector, custom prompt, toggle.

---

#### [NEW] [components/TimePicker.tsx](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/components/TimePicker.tsx)
Time picker dengan `@react-native-community/datetimepicker`.

---

#### [NEW] [components/TopicSelector.tsx](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/components/TopicSelector.tsx)
Multi-select chips: Teknologi, Bisnis, Olahraga, Hiburan, Sains, Politik.

---

#### [NEW] [components/DigestCard.tsx](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/components/DigestCard.tsx)
Card component untuk history list.

---

### Mobile App - Modifications

#### [MODIFY] [package.json](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/package.json)
Tambah: `expo-notifications`, `expo-device`, `@react-native-community/datetimepicker`

---

#### [MODIFY] [app.json](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/app.json)
Tambah plugin `expo-notifications` dan Android notification API config.

---

#### [MODIFY] [app/(tabs)/_layout.tsx](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/app/(tabs)/_layout.tsx)
Tambah tab Digest dengan icon newspaper.

---

#### [MODIFY] [app/_layout.tsx](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/app/_layout.tsx)
Setup notification handlers dan push token registration.

---

#### [MODIFY] [app/(tabs)/profile.tsx](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/app/(tabs)/profile.tsx)
Tambah menu "Daily Digest" navigasi ke settings.

---

#### [NEW] [services/digestApi.ts](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/services/digestApi.ts)
API service untuk digest endpoints.

---

#### [NEW] [services/notifications.ts](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/services/notifications.ts)
Notification service: permissions, token, registration.

---

#### [MODIFY] [config/config.ts](file:///d:/Danile/SMK/PKL/TUGAS/ChatAI/config/config.ts)
Tambah endpoint constants untuk digest APIs.

---

## Verification Plan

### Test Gemini Grounding
```bash
curl -X POST http://localhost:3001/api/test-digest \
  -H "Content-Type: application/json" \
  -d '{"topic": "Teknologi", "customPrompt": "Berita AI terbaru"}'
```

### Test Push Notification
1. Build dev app: `npx expo run:android`
2. Buka app, izinkan notifikasi
3. Trigger: `curl -X POST http://localhost:3001/api/test-digest -d '{"sendNotification": true}'`

### Full Flow Test
1. Set digest di Settings → Daily Digest
2. Pilih waktu 2 menit dari sekarang
3. Tunggu notification
4. Tap → buka digest detail
5. Cek History tab
