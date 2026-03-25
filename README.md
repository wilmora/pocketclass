# 🎓 Pocketclass — Online Learning Marketplace

A modern online learning marketplace where instructors sell courses and live training sessions, and students browse, purchase, and learn — built with Next.js and TypeScript.

---

## 🖥️ Prerequisites

Before running this project, make sure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18 or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | v9 or higher (comes with Node.js) | Included with Node.js |
| **Git** | Any recent version | [git-scm.com](https://git-scm.com/) |

### How to check if you have them:

Open a terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
node --version
# Should show v18.x.x or higher

npm --version
# Should show 9.x.x or higher

git --version
# Should show git version 2.x.x
```

> **Don't have Node.js?** Download the **LTS** version from [nodejs.org](https://nodejs.org/). The installer will also install npm automatically.

---

## 🚀 Getting Started

### Step 1: Clone the repository

```bash
git clone https://github.com/wilmora/pocketclass.git
```

### Step 2: Navigate into the project folder

```bash
cd pocketclass
```

### Step 3: Install dependencies

```bash
npm install
```

> This will download all required packages. It may take 1–2 minutes depending on your internet speed.

### Step 4: Start the development server

```bash
npm run dev
```

### Step 5: Open in your browser

Once the server starts, you'll see output like:

```
▲ Next.js 16.2.1 (Turbopack)
- Local:    http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## 🔑 Demo Login

This MVP uses mock authentication. On the **Login** page, you can switch between three roles:

| Role | What you can see |
|------|-----------------|
| **Student** | Student dashboard, enrolled courses, lesson viewer, messaging |
| **Instructor** | Instructor dashboard, course creation wizard, revenue stats |
| **Admin** | Admin panel with user management, course oversight, payment logs |

Just click the role tabs on the login page, enter any email/password, and click "Sign In".

---

## 📁 Project Structure

```
pocketclass/
├── src/
│   ├── app/                    # All pages (Next.js App Router)
│   │   ├── page.tsx            # Landing page
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── courses/            # Course catalog, detail, lesson viewer
│   │   ├── sessions/           # Live sessions listing
│   │   ├── instructors/        # Instructor directory & profiles
│   │   ├── messages/           # Messaging / chat
│   │   ├── student/            # Student dashboard
│   │   ├── instructor/         # Instructor dashboard & course creation
│   │   └── admin/              # Admin panel
│   ├── components/             # Reusable components (Header, Footer)
│   ├── lib/                    # Auth context & mock data
│   ├── types/                  # TypeScript type definitions
│   └── styles/                 # Global CSS design system
├── package.json
└── tsconfig.json
```

---

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Run production server |

---

## 🌐 Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Vanilla CSS with CSS custom properties
- **Icons:** Lucide React
- **Fonts:** Inter + Outfit (Google Fonts)

---

## 💡 Troubleshooting

### "npm install" fails
- Make sure Node.js v18+ is installed: `node --version`
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

### Port 3000 is already in use
- The app will automatically try port 3001. Check the terminal output for the correct URL.
- Or stop whatever is using port 3000 and try again.

### Page shows blank or errors
- Make sure you ran `npm install` before `npm run dev`
- Try stopping the server (Ctrl+C) and restarting with `npm run dev`

---

## 📄 License

This project is proprietary. All rights reserved.
