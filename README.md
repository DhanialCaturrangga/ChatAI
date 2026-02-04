# Chat AI - React Native Application

A beautiful and modern Chat AI mobile application built with React Native and Expo. This is a UI-only demonstration with 3 main pages: Conversation List, Chat Detail, and Profile.

![React Native](https://img.shields.io/badge/React_Native-0.81.5-blue)
![Expo](https://img.shields.io/badge/Expo-54.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## ✨ Features

### Core Features (100 points)
- ✅ **Conversation List Page** (20 pts)
  - Header with "New Chat" button
  - List items with avatar, title, preview message, and timestamp
  - Tap to navigate to Chat Detail
  - Pull to refresh functionality

- ✅ **Chat Detail Page** (25 pts)
  - Header with back button
  - Chat bubbles (AI on left, User on right)
  - Timestamp on each message
  - Input field with Send button
  - Empty state for new conversations

- ✅ **Profile Page** (15 pts)
  - Avatar + name + email display
  - Statistics section (chats, topics, plan)
  - 12+ menu items with icons
  - Arrow indicators (>) for clickable menus
  - Grouped sections (Preferences, Account, Support)

- ✅ **Navigation** (10 pts)
  - Bottom tab: Chats and Profile
  - Stack navigation: List → Chat Detail → Back

- ✅ **Consistent Styling** (15 pts)
  - Modern, clean design
  - Cohesive color palette
  - Responsive layout

### Bonus Features (+20 extra)
- ✅ **Dark Mode Toggle** (+5 pts) - Switch between light and dark themes
- ✅ **Send Animation** (+5 pts) - Smooth spring animation when sending messages
- ✅ **Typing Indicator** (+5 pts) - Animated dots showing AI is "typing"
- ✅ **Pull to Refresh** (+5 pts) - Refresh conversation list

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/ChatAI.git
cd ChatAI
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Open in browser (localhost):
```bash
npx expo start --web
```

Or press `w` after running `npx expo start` to open in web browser.

### Running on Mobile

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan QR code with Expo Go app

## 📱 Screens

### 1. Conversation List
The home screen showing all your conversations with the AI. Features:
- Beautiful card-style conversation items
- Real-time timestamp formatting
- Avatar emojis for visual distinction
- New Chat button in header

### 2. Chat Detail
Interactive chat interface with:
- Message bubbles with different colors for AI and User
- Keyboard-aware layout
- Auto-scroll to latest messages
- Simulated AI responses

### 3. Profile
User profile with comprehensive settings:
- Profile header with avatar and stats
- Dark mode toggle switch
- Notification, language, and appearance settings
- Account management options
- Support and help center links
- Logout option

## 🎨 Design

The app uses a modern, clean design system with:
- **Primary Color**: Indigo (#6366F1)
- **Light Theme**: Clean white backgrounds with subtle grays
- **Dark Theme**: Deep dark backgrounds with proper contrast
- **Typography**: System fonts with proper weight hierarchy

## 📁 Project Structure

```
ChatAI/
├── app/
│   ├── _layout.tsx          # Root layout with ThemeProvider
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigator
│   │   ├── index.tsx        # Conversation List
│   │   └── profile.tsx      # Profile page
│   └── chat/
│       └── [id].tsx         # Chat Detail (dynamic route)
├── components/
│   ├── ConversationItem.tsx # List item component
│   ├── ChatBubble.tsx       # Message bubble
│   ├── ProfileMenuItem.tsx  # Settings menu item
│   └── TypingIndicator.tsx  # Animated typing dots
├── constants/
│   └── Colors.ts            # Color palette
├── context/
│   └── ThemeContext.tsx     # Theme/Dark mode context
├── data/
│   └── mockData.ts          # Mock conversations & messages
└── assets/                  # Images and icons
```

## 🛠 Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tools
- **Expo Router** - File-based navigation
- **TypeScript** - Type-safe JavaScript
- **React Native Reanimated** - Smooth animations

## 📝 Notes

- This is a **UI-only** application without a real backend
- AI responses are simulated with random pre-defined messages
- Dark mode preference is stored in memory (resets on app restart)

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Made with ❤️ using React Native and Expo
