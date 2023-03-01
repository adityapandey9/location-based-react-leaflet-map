import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import tileLayer from "./util/tileLayer";
import { ParkMarkerInMapBounds } from './components/parkMarkerInMapBounds';
import './App.css'

const center = [52.22977, 21.01178];

function App() {

  return (
    <div className="grid">
      <main id="section-example">
        <MapContainer
          center={center}
          zoom={18}
          scrollWheelZoom={false}
        >
          <TileLayer {...tileLayer} />

          <ParkMarkerInMapBounds />
        </MapContainer>
      </main>
    </div>
  );
}

export default App;
