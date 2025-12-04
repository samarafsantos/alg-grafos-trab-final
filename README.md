# 🗺️ Maritime Route Planner

A React + TypeScript application for visualizing maritime routes with wave height data. This application allows users to select origin and destination points on an interactive map and calculates the optimal path considering wave conditions.

## ✨ Features

- **Interactive Map**: Visualize maritime locations with markers on an OpenStreetMap-based map
- **Route Planning**: Click markers to select origin and destination points
- **Wave Height Visualization**:
  - Color-coded tooltips showing wave height at each location
  - Wave conditions (Calm, Light, Moderate, Rough, High, Very High)
  - Detailed coordinate information (latitude/longitude)
- **Path Calculation**: Real-time route calculation via backend API
- **Visual Feedback**:
  - Green marker for origin point
  - Blue marker for destination point
  - Yellow markers for intermediate path points
  - Purple polyline connecting the path

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.19.0 or v22.12.0+)
- npm
- Backend API running on `localhost:8000` with the following endpoints:
  - `GET /markers?limit={number}` - Returns available maritime points
  - `GET /path?lat_o={lat}&lon_o={lon}&lat_d={lat}&lon_d={lon}` - Calculates optimal path

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Building for Production

```bash
npm run build
npm run preview
```

## 🛠️ Technology Stack

- **React** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Leaflet** - Interactive map library
- **React-Leaflet** - React bindings for Leaflet

## 📋 API Integration

The application expects the backend API to return data in the following formats:

### Markers Endpoint

```json
{
  "items": [
    {
      "lat": -23.15625,
      "lon": -43.15625,
      "hs": 0.895
    }
  ]
}
```

### Path Endpoint

```json
{
  "origin": { "lat": -23.15625, "lon": -43.15625 },
  "destination": { "lat": -23.25, "lon": -43.15625 },
  "path": [
    { "node": 183, "lat": -23.15625, "lon": -43.15625, "hs": 0.895 },
    { "node": 182, "lat": -23.15625, "lon": -43.25, "hs": 0.89 }
  ],
  "num_points": 2
}
```

## 🎨 Usage

1. Wait for the map to load maritime points
2. Click on any marker to set it as the **origin** (turns green)
3. Click on another marker to set it as the **destination** (turns blue)
4. The application will automatically calculate and display the optimal path
5. Hover over any marker to see wave height and location details
6. Click "Reset Route" to clear and start over

## 📄 License

This project is part of a university assignment for Algorithm and Graph Theory course.
