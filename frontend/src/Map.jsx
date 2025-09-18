import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN;
const initialCenter = [0, 0];
const poiMarkers = [];


function initMap(container) {
  return new mapboxgl.Map({
    container,
    style: "mapbox://styles/mapbox/streets-v11",
    center: initialCenter,
    zoom: 15,
  });
}

async function fetchCenterCoordinates(searchQuery) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    searchQuery
  )}.json?access_token=${mapboxgl.accessToken}`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.features && json.features.length > 0) {
    return json.features[0].center;
  }

  throw new Error("No coordinates found");
}

function getPOIData(map) {
  const canvas = map.getCanvas();
  const topLeft = [0, 0];
  const bottomRight = [canvas.width, canvas.height]; 

  return map.queryRenderedFeatures([topLeft, bottomRight], {
    layers: ["poi-label"],
  });
}

function fetchDescription(name, searchQuery, setDescription, coords) {
  const promptt = `Write two clearly separated paragraphs about ${name} in ${searchQuery}, coordinates {${coords}}.

Paragraph 1: Describe the place and its significance in a concise way.

Paragraph 2: Provide a brief history or background.

Avoid coordinates and formatting.`;

  const url = `http://localhost:5000/generate?prompt=${encodeURIComponent(promptt)}`;
  setDescription("Loading description...");
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      var description = data.response;
      description += `\n\nYou can find images of <a href="https://www.google.com/search?q=${encodeURIComponent(name)}
      &tbm=isch" target="_blank" rel="noopener noreferrer">${name}</a> here.`;

      setDescription(description);
    })
    .catch((error) => {
      console.error("Error fetching description:", error);
    });
}

function addPOIMarkers(map, poiFeatures, searchQuery, setDescription, poiColorMap) {
  for (const feature of poiFeatures) {

    if (feature.properties.type === "Place Of Worship" && feature.properties.name?.toLowerCase().includes("troita")) {
      continue; 
    }

    const type  = feature.properties.type;
    const color = poiColorMap[type];
    if (!color) continue;

    const marker = new mapboxgl.Marker({ color })
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);

    const [long, lat] = feature.geometry.coordinates;
    const coords = [lat, long];
    const el = marker.getElement();
    el.style.cursor = "pointer";
    el.addEventListener("click", () => {
      fetchDescription(feature.properties.name, searchQuery, setDescription, coords);
    });

    poiMarkers.push(marker);
  }
}

function loadPOIs(map, searchQuery, setDescription, poiColorMap) {
  for (const marker of poiMarkers) {
    marker.remove();
  }
  poiMarkers.length = 0;

  const pois = getPOIData(map);
  addPOIMarkers(map, pois, searchQuery, setDescription, poiColorMap);
}

function Map({ searchQuery, setDescription, colorMap }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const searchDone = useRef(false);

  useEffect(() => {
    if (!map.current) {
      map.current = initMap(mapContainer.current);
      map.current.scrollZoom.disable();
      map.current.doubleClickZoom.disable();
      map.current.keyboard.disable();

      map.current.on("dragend", () => {
        loadPOIs(map.current, searchQuery, setDescription, colorMap);
      });
    }
  }, [searchQuery, setDescription, colorMap]);

  useEffect(() => {
    if (!searchQuery || !map.current) return;

    fetchCenterCoordinates(searchQuery)
      .then((center) => {
        map.current.setCenter(center);
        searchDone.current = true;
        map.current.once("idle", () => {
          loadPOIs(map.current, searchQuery,setDescription, colorMap);
        });
      })
      .catch((err) => console.error(err));
  }, [searchQuery, setDescription, colorMap]);

  return <div ref={mapContainer} className="map" />;
}

export default Map;
