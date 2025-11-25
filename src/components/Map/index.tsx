import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "./style.css";

type LatLng = [number, number];

// mocks api call
async function mockFetchPath(
  origin: LatLng,
  destination: LatLng
): Promise<LatLng[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        origin,
        [(origin[0] + destination[0]) / 2, (origin[1] + destination[1]) / 2],
        destination,
      ]);
    }, 800);
  });
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
  data: LatLng[];
}) {
  const map = useMap();

  useEffect(() => {
    if (data && data.length > 0) {
      // Center on first marker on initial load
      map.setView(data[0]);
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
  const [path, setPath] = useState<LatLng[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldFitBounds, setShouldFitBounds] = useState(false);

  const handleMarkerClick = (coords: LatLng, e: L.LeafletMouseEvent) => {
    e.originalEvent.stopPropagation();

    if (!origin) {
      setOrigin(coords);
      setShouldFitBounds(false);
    } else if (!destination) {
      setDestination(coords);
      setShouldFitBounds(true);
    } else {
      setOrigin(coords);
      setDestination(null);
      setPath([]);
      setShouldFitBounds(false);
    }
  };

  const handleReset = () => {
    setOrigin(null);
    setDestination(null);
    setPath([]);
    setLoading(false);
    setShouldFitBounds(false);
  };

  useEffect(() => {
    if (!origin || !destination) return;

    const loadPath = async () => {
      setLoading(true);
      try {
        const data = await mockFetchPath(origin, destination);
        setPath(data);
      } catch (error) {
        console.error("Failed to load path:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPath();
  }, [origin, destination]);

  const distance =
    origin && destination
      ? Math.sqrt(
          Math.pow(destination[0] - origin[0], 2) +
            Math.pow(destination[1] - origin[1], 2)
        ).toFixed(4)
      : null;

  return (
    data &&
    data.length !== 0 && (
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
                <div className="legend-dot default"></div>
                <span>Available Points</span>
              </div>
            </div>
          </div>
        </div>

        <MapContainer
          center={data[0]}
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

          {data.map((coords: LatLng, idx: number) => (
            <Marker
              key={idx}
              position={coords}
              eventHandlers={{
                click: (e) => handleMarkerClick(coords, e),
              }}
              icon={L.icon({
                iconUrl:
                  origin === coords
                    ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    : destination === coords
                    ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                iconSize: [32, 32],
              })}
            />
          ))}

          {path.length > 0 && (
            <Polyline
              color="#667eea"
              positions={path}
              lineJoin="round"
              weight={4}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>
    )
  );
}
