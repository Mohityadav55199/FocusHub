# ✨ Spotlight — Real-Time Social Media App 🚀

<p align="center">
  <img src="/assets/images/screenshot-for-readme.png" alt="Spotlight App Preview" width="850"/>
</p>

<p align="center">
  A modern, real-time social media application built with <strong>React Native, Expo, Convex, and Clerk</strong>.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a>
</p>

---

## 🌟 Overview

**Spotlight** is a full-stack, real-time social media application designed to work seamlessly across **Android, iOS, and Web** from a single codebase.

The application provides a complete social experience including authentication, posts, likes, comments, follows, bookmarks, notifications, and user profiles — with changes synchronized in real time using **Convex**.

Built with **React Native + Expo**, Spotlight demonstrates how modern cross-platform applications can be developed using TypeScript/JavaScript without writing separate native Android or iOS code.

---

## 🚀 Features

### 🔐 Authentication

* Google authentication with **Clerk**
* Secure session management
* Protected application routes

### 🏠 Home Feed

* Real-time social feed
* Stories section
* Posts with images and captions
* Pull-to-refresh
* Logout functionality

### ❤️ Social Interactions

* Like and unlike posts
* Add and view comments
* Follow and unfollow users
* Real-time interaction updates

### 📑 Bookmarks

* Save posts for later
* Dedicated bookmarks screen
* Easily review saved content

### ➕ Create Posts

* Select images directly from the device
* Add captions
* Upload and publish posts instantly

### 🔔 Notifications

* Like notifications
* Follow notifications
* Comment notifications
* Deep linking to relevant content

### 👤 User Profiles

* Profile information and statistics
* User posts
* Edit-profile modal
* Follow/unfollow functionality

### 🗑️ Post Management

* Delete your own posts
* Confirmation before deletion

### 🎨 UI & Experience

* Custom fonts
* Custom splash screen
* Custom application icon
* Responsive cross-platform UI
* Smooth animations and interactions

---

## 🛠️ Tech Stack

| Technology                  | Purpose                              |
| --------------------------- | ------------------------------------ |
| **React Native**            | Cross-platform mobile application    |
| **Expo**                    | Development and deployment framework |
| **Expo Router**             | File-based navigation                |
| **TypeScript**              | Type-safe application development    |
| **Convex**                  | Real-time backend and database       |
| **Clerk**                   | Authentication and user management   |
| **React Native Components** | UI and interaction                   |
| **Expo Image Picker**       | Image selection and uploads          |

---

## 🧠 Architecture

Spotlight follows a modern full-stack architecture:

```text
┌──────────────────────────────┐
│       React Native + Expo    │
│                              │
│  Home • Posts • Profile      │
│  Notifications • Bookmarks   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│           Clerk              │
│     Authentication & Auth    │
└──────────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│           Convex             │
│                              │
│  Database • Queries •        │
│  Mutations • Real-time Data  │
└──────────────────────────────┘
```

Convex handles the application's backend and real-time data synchronization, while Clerk manages authentication and user sessions.

---

## 📁 Project Structure

```text
Spotlight/
├── app/
│   ├── (auth)/
│   ├── (tabs)/
│   ├── post/
│   └── _layout.tsx
│
├── components/
├── convex/
├── assets/
│   ├── images/
│   └── fonts/
│
├── constants/
├── hooks/
├── lib/
│
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

> The exact structure may vary depending on the current implementation.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_publishable_key>
CONVEX_DEPLOYMENT=<your_deployment_name>
EXPO_PUBLIC_CONVEX_URL=<your_convex_url>
```

### 🔑 Required Services

You'll need accounts/configuration for:

* **Clerk** — authentication
* **Convex** — backend and real-time database

Make sure the environment variables are correctly configured before starting the application.

---

## 🏁 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/spotlight.git
cd spotlight
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env` in the project root and add your Clerk and Convex credentials.

### 4. Start the development server

```bash
npx expo start
```

You can then run the application using:

* 📱 Android device/emulator
* 🍎 iOS simulator/device
* 🌐 Web browser
* 📷 Expo Go

---

## 📱 Running on a Physical Device

After starting Expo:

```bash
npx expo start
```

Scan the displayed QR code using **Expo Go** on your mobile device.

Make sure your computer and mobile device are connected to the same network.

---

## 💡 Key Concepts Demonstrated

Spotlight goes beyond basic UI development and demonstrates several production-oriented concepts:

* Real-time database synchronization
* Authentication and authorization
* Optimistic UI updates
* Backend mutations and queries
* Webhooks
* Deep linking
* Image uploads
* Navigation architecture
* List virtualization
* Lazy loading
* Memoization
* Cross-platform development

These concepts make the project particularly useful for learning modern full-stack and mobile application development.

---

## 🔮 Future Improvements

Potential improvements for future versions include:

* 💬 Real-time direct messaging
* 🎥 Video posts
* 🔎 Advanced user/post search
* 🏷️ Hashtags and trending topics
* 📸 Stories with expiration
* 🌙 Dark mode
* 🔔 Push notifications
* 🛡️ Content moderation
* 📊 User analytics
* 🤖 AI-powered content recommendations

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

### Fork the repository

```bash
git clone https://github.com/YOUR_USERNAME/spotlight.git
cd spotlight
```

Create a new branch:

```bash
git checkout -b feature/your-feature
```

Commit your changes:

```bash
git add .
git commit -m "feat: add your feature"
```

Push the branch:

```bash
git push origin feature/your-feature
```

Then open a Pull Request.

---

## 📄 License

This project is available for educational and personal use.

If you plan to use the project commercially, review the licenses of all third-party dependencies and services used by the application.

---

## ⭐ Support

If you found **Spotlight** useful, consider giving the repository a ⭐ on GitHub.

<p align="center">
  Built with ❤️ using React Native, Expo, Convex & Clerk
</p>
