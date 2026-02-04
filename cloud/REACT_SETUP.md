# React Dashboard Setup

The dashboard is now built with **React + Vite + Tailwind CSS** for a modern, professional UI.

## 🚀 Quick Start

### Development Mode
```bash
npm run dev
```
This starts Vite dev server on port 3000 with hot reload.

### Production Build
```bash
npm run build
```
This builds the React app to the `public` directory.

### Start Server
```bash
npm start
```
This starts the Express server on port 4000, serving the built React app.

## 📁 Project Structure

```
cloud/
├── src/
│   ├── components/        # React components
│   │   ├── TopNav.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Machines.jsx
│   │   ├── Alerts.jsx
│   │   ├── Packages.jsx
│   │   ├── Analytics.jsx
│   │   ├── MetricCard.jsx
│   │   ├── ActivityFeed.jsx
│   │   └── RecentAlerts.jsx
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # React entry point
│   ├── index.css         # Tailwind CSS
│   └── index.html        # HTML template
├── public/               # Built files (generated)
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json
```

## 🎨 Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Beautiful charts via react-chartjs-2
- **Font Awesome** - Icons

## 🔧 Development

The app uses:
- React Hooks (useState, useEffect, useMemo)
- Component-based architecture
- Real-time WebSocket updates
- Responsive design with Tailwind

## 📦 Build Process

1. `npm run build` - Builds React app to `public/`
2. Server serves static files from `public/`
3. API endpoints remain at `/alerts`, `/machines`, etc.

## 🎯 Features

- Modern, responsive UI
- Real-time updates via WebSocket
- Interactive charts and visualizations
- Search and filtering
- Professional design system

