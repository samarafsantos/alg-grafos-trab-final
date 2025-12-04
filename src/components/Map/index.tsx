import {
  MapContainer,
  Marker,
  Polyline,
  Tooltip,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "./style.css";

type LatLng = [number, number];

interface MarkerData {
  coords: LatLng;
  waveHeight: number;
}

interface PathNodeWithWaveHeight {
  coords: LatLng;
  waveHeight: number;
}

// Helper function to get color based on wave height
function getWaveColor(hs: number): string {
  // Wave height typically ranges from 0 to 5+ meters
  // Green (calm) -> Yellow -> Orange -> Red (intense)
  if (hs < 0.5) return "#22c55e"; // Green - calm
  if (hs < 1.0) return "#84cc16"; // Light green
  if (hs < 1.5) return "#eab308"; // Yellow
  if (hs < 2.0) return "#f97316"; // Orange
  if (hs < 3.0) return "#ef4444"; // Red
  return "#dc2626"; // Dark red - very intense
}

async function fetchPath(
  origin: LatLng,
  destination: LatLng
): Promise<PathNodeWithWaveHeight[]> {
  const [lat_o, lon_o] = origin;
  const [lat_d, lon_d] = destination;

  const url = `http://localhost:8000/path?lat_o=${lat_o}&lon_o=${lon_o}&lat_d=${lat_d}&lon_d=${lon_d}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.path.map((node: any) => ({
    coords: [node.lat, node.lon] as LatLng,
    waveHeight: node.hs,
  }));
}

function MapController({
  origin,
  destination,
  shouldFit,
  data,
}: {
  origin: LatLng | null;
  destination: LatLng | null;
  shouldFit: boolean;
  data: MarkerData[];
}) {
  const map = useMap();

  useEffect(() => {
    if (data && data.length > 0) {
      // Center on first marker on initial load
      map.setView(data[0].coords);
    }
  }, []);

  useEffect(() => {
    if (origin && destination && shouldFit) {
      const bounds = L.latLngBounds([origin, destination]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [origin, destination, shouldFit, map]);

  return null;
}

export default function MapChart({ data }: any) {
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [path, setPath] = useState<PathNodeWithWaveHeight[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldFitBounds, setShouldFitBounds] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMarkerClick = (coords: LatLng, e: L.LeafletMouseEvent) => {
    e.originalEvent.stopPropagation();

    if (!origin) {
      setOrigin(coords);
      setShouldFitBounds(false);
      setError(null);
    } else if (!destination) {
      setDestination(coords);
      setShouldFitBounds(true);
    } else {
      setOrigin(coords);
      setDestination(null);
      setPath([]);
      setShouldFitBounds(false);
      setError(null);
    }
  };

  const handleReset = () => {
    setOrigin(null);
    setDestination(null);
    setPath([]);
    setLoading(false);
    setShouldFitBounds(false);
    setError(null);
  };

  useEffect(() => {
    if (!origin || !destination) return;

    const loadPath = async () => {
      setLoading(true);
      setError(null);
      try {
        const pathData = await fetchPath(origin, destination);
        setPath(pathData);
      } catch (error) {
        console.error("Failed to load path:", error);
        setError("Failed to calculate route. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadPath();
  }, [origin, destination]);

  // Helper function to check if a coordinate is in the path
  const isInPath = (coords: LatLng): boolean => {
    return path.some(
      (pathNode) =>
        pathNode.coords[0] === coords[0] && pathNode.coords[1] === coords[1]
    );
  };

  const distance =
    origin && destination
      ? Math.sqrt(
          Math.pow(destination[0] - origin[0], 2) +
            Math.pow(destination[1] - origin[1], 2)
        ).toFixed(4)
      : null;

  if (!data || data.length === 0) {
    return <div>No map data available</div>;
  }

  return (
    <div className="map-wrapper">
      <div className="map-controls">
        <div className="control-panel">
          <div className="status-section">
            <h3>🗺️ Route Planner</h3>
            <div className="status-items">
              <div className="status-item">
                <span className="status-label">Origin:</span>
                <span className="status-value">
                  {origin
                    ? `${origin[0].toFixed(4)}, ${origin[1].toFixed(4)}`
                    : "Not selected"}
                </span>
                <span className="status-indicator origin"></span>
              </div>
              <div className="status-item">
                <span className="status-label">Destination:</span>
                <span className="status-value">
                  {destination
                    ? `${destination[0].toFixed(4)}, ${destination[1].toFixed(
                        4
                      )}`
                    : "Not selected"}
                </span>
                <span className="status-indicator destination"></span>
              </div>
              {distance && (
                <div className="status-item distance">
                  <span className="status-label">Distance:</span>
                  <span className="status-value">{distance} units</span>
                </div>
              )}
              {path.length > 0 && (
                <div className="status-item distance">
                  <span className="status-label">Path Points:</span>
                  <span className="status-value">{path.length}</span>
                </div>
              )}
            </div>
          </div>

          <div className="button-section">
            <button
              className="btn btn-reset"
              onClick={handleReset}
              disabled={!origin && !destination}
            >
              🔄 Reset Route
            </button>
          </div>

          {loading && (
            <div className="loading-badge">
              <div className="mini-spinner"></div>
              Calculating route...
            </div>
          )}

          {error && <div className="error-badge">⚠️ {error}</div>}
        </div>

        <div className="legend">
          <h4>Legend</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-dot origin"></div>
              <span>Origin Point</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot destination"></div>
              <span>Destination Point</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot path"></div>
              <span>Path Points</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot default"></div>
              <span>Available Points</span>
            </div>
          </div>
        </div>

        {path.length > 0 && (
          <div className="legend wave-legend">
            <h4>Wave Height</h4>
            <div className="wave-gradient">
              <div className="wave-scale">
                <span style={{ color: "#22c55e" }}>● Calm (&lt;0.5m)</span>
                <span style={{ color: "#84cc16" }}>● Light (0.5-1m)</span>
                <span style={{ color: "#eab308" }}>● Moderate (1-1.5m)</span>
                <span style={{ color: "#f97316" }}>● Rough (1.5-2m)</span>
                <span style={{ color: "#ef4444" }}>● High (2-3m)</span>
                <span style={{ color: "#dc2626" }}>● Very High (&gt;3m)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <MapContainer
        center={data[0].coords}
        zoom={7}
        scrollWheelZoom
        className="map-container"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          origin={origin}
          destination={destination}
          shouldFit={shouldFitBounds}
          data={data}
        />

        {data.map((marker: MarkerData, idx: number) => {
          const coords = marker.coords;
          const waveHeight = marker.waveHeight;
          const isOrigin =
            origin && origin[0] === coords[0] && origin[1] === coords[1];
          const isDestination =
            destination &&
            destination[0] === coords[0] &&
            destination[1] === coords[1];
          const isOnPath = !isOrigin && !isDestination && isInPath(coords);

          return (
            <Marker
              key={idx}
              position={coords}
              eventHandlers={{
                click: (e) => handleMarkerClick(coords, e),
              }}
              icon={L.icon({
                iconUrl: isOrigin
                  ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : isDestination
                  ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  : isOnPath
                  ? "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                  : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                iconSize: [32, 32],
              })}
            >
              <Tooltip direction="top" offset={[0, -16]} opacity={0.9}>
                <div style={{ textAlign: "center", minWidth: "140px" }}>
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "0.95em",
                    }}
                  >
                    📍 Location
                  </strong>
                  <div
                    style={{
                      fontSize: "0.8em",
                      color: "#555",
                      marginBottom: "8px",
                      fontFamily: "monospace",
                    }}
                  >
                    Lat: {coords[0].toFixed(5)}
                    <br />
                    Lon: {coords[1].toFixed(5)}
                  </div>
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.95em",
                    }}
                  >
                    🌊 Wave Height
                  </strong>
                  <div
                    style={{
                      fontSize: "1.3em",
                      color: getWaveColor(waveHeight),
                      fontWeight: "bold",
                      marginBottom: "4px",
                    }}
                  >
                    {waveHeight.toFixed(2)}m
                  </div>
                  <div style={{ fontSize: "0.8em", color: "#666" }}>
                    {waveHeight < 0.5
                      ? "Calm"
                      : waveHeight < 1.0
                      ? "Light"
                      : waveHeight < 1.5
                      ? "Moderate"
                      : waveHeight < 2.0
                      ? "Rough"
                      : waveHeight < 3.0
                      ? "High"
                      : "Very High"}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {path.length > 0 && (
          <Polyline
            color="#667eea"
            positions={path.map((p) => p.coords)}
            lineJoin="round"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
}
