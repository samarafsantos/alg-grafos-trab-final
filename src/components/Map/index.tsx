import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
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

export default function MapChart({ data }: any) {
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [path, setPath] = useState<LatLng[]>([]);

  const handleMarkerClick = (coords: LatLng) => {
    if (!origin) {
      setOrigin(coords);
    } else if (!destination) {
      setDestination(coords);
    } else {
      setOrigin(coords);
      setDestination(null);
      setPath([]);
    }
  };

  useEffect(() => {
    if (!origin || !destination) return;

    const loadPath = async () => {
      const data = await mockFetchPath(origin, destination);
      setPath(data);
    };

    loadPath();
  }, [origin, destination]);

  return (
    data &&
    data.length !== 0 && (
      <MapContainer
        center={[-24.9375, -47.3125]}
        zoom={14}
        scrollWheelZoom
        className="map-container"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data.map((coords, idx) => (
          <Marker
            key={idx}
            position={coords}
            eventHandlers={{
              click: () => handleMarkerClick(coords),
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
          <Polyline color="red" positions={path} lineJoin="round" />
        )}
      </MapContainer>
    )
  );
}
