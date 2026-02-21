# FleetOps™ - Intelligent Fleet Intelligence Platform

## 🚀 Quick Start

This is a complete enterprise SaaS application for fleet management built with React, TypeScript, and Tailwind CSS.

### Features

**Public Landing Page**
- Full-screen cinematic hero section
- Transparent-to-solid navbar on scroll
- Features showcase
- Enterprise statistics
- Customer testimonials
- Professional footer

**Authentication**
- Clean login page
- Mock authentication system
- Protected routes

**Dashboard Application**
- Real-time fleet tracking with Google Maps
- Vehicle management
- Driver management
- Dispatch & route planning
- Maintenance scheduling
- Fuel analytics
- Comprehensive analytics dashboard

## 📋 Demo Credentials

You can log in with any email and password. For example:
- **Email:** demo@fleetops.com
- **Password:** (any password)

## 🗺️ Google Maps Setup (Optional)

To enable the real-time tracking map:

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Create a `.env` file in the root directory
3. Add your API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

The application will work without the API key, but the tracking map will show a placeholder message.

## 🎨 Design System

- **Typography:** Inter font family
- **Colors:** 
  - Primary: Indigo (#6366f1)
  - Success: Green (#10b981)
  - Warning: Orange (#f59e0b)
  - Error: Red (#ef4444)
- **Style:** Clean, modern enterprise aesthetic
- **Spacing:** Generous whitespace for premium feel
- **Animations:** Smooth Motion animations

## 📱 Pages

### Public
- `/` - Landing page
- `/login` - Login page

### Authenticated App
- `/app/dashboard` - Main dashboard with stats and charts
- `/app/tracking` - Live vehicle tracking map
- `/app/vehicles` - Vehicle management
- `/app/drivers` - Driver management
- `/app/dispatch` - Route and dispatch management
- `/app/maintenance` - Maintenance scheduling
- `/app/fuel` - Fuel consumption analytics
- `/app/analytics` - Comprehensive performance analytics

## 🔧 Technical Stack

- **Framework:** React 18 with TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Animations:** Motion (formerly Framer Motion)
- **Icons:** Lucide React
- **HTTP:** Axios
- **Maps:** Google Maps JavaScript API

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── layouts/
│   │   └── AppLayout.tsx
│   ├── pages/
│   │   ├── public/
│   │   │   ├── LandingPage.tsx
│   │   │   └── LoginPage.tsx
│   │   └── app/
│   │       ├── DashboardPage.tsx
│   │       ├── TrackingPage.tsx
│   │       ├── VehiclesPage.tsx
│   │       ├── DriversPage.tsx
│   │       ├── DispatchPage.tsx
│   │       ├── MaintenancePage.tsx
│   │       ├── FuelPage.tsx
│   │       └── AnalyticsPage.tsx
│   ├── routes.ts
│   └── App.tsx
└── styles/
    ├── fonts.css
    ├── index.css
    ├── tailwind.css
    └── theme.css
```

## 🎯 Key Features

1. **Responsive Design** - Works on desktop, tablet, and mobile
2. **Protected Routes** - Authentication required for app pages
3. **Real-time Updates** - Mock live updates for fleet tracking
4. **Data Visualization** - Multiple chart types for analytics
5. **Professional UI** - Enterprise-grade design quality
6. **Smooth Animations** - Motion-powered transitions
7. **Dark Mode Ready** - Theme system supports dark mode

## 💡 Customization

### Changing Colors
Edit `/src/styles/theme.css` to customize the color scheme.

### Adding New Pages
1. Create page component in `/src/app/pages/app/`
2. Add route in `/src/app/routes.ts`
3. Add navigation link in `/src/app/layouts/AppLayout.tsx`

### Mock Data
All data is currently mocked. Replace mock data with real API calls by:
1. Update the API endpoints in each page
2. Replace mock responses with axios calls
3. Add error handling and loading states

## 🚀 Deployment

This application is built with Vite and can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

Build command: `npm run build`

## 📄 License

Enterprise SaaS Template - All rights reserved.

---

Built with ❤️ for modern fleet management operations.
