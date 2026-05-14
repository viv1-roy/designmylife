# DesignMyLife - Frontend

React-based frontend for the DesignMyLife platform.

## 🚀 Features

- **Authentication** - Login/Register with JWT
- **Dashboard** - Overview of goals, habits, tasks, and system health
- **Responsive Design** - Built with Tailwind CSS
- **Modern UI** - Clean, intuitive interface

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running

## ⚙️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (use `.env.example` as template):
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗 Project Structure

```
client/
├── public/              # Static assets
├── src/
│   ├── api/            # API client & services
│   ├── components/     # React components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Technologies

- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Vite** - Build tool
- **Lucide React** - Icon library

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | Backend API URL | Yes |

## 📱 Pages

- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration
- **Dashboard** (`/dashboard`) - Main dashboard (Protected)

## 🔒 Authentication

The app uses JWT tokens stored in localStorage. Protected routes automatically redirect to login if not authenticated.

## 🎯 Future Enhancements

- Goals management page
- Habits tracking page
- Task planner page
- Life simulation interface
- File upload/management
- Charts and analytics
- Dark mode

## 📄 License

MIT License
