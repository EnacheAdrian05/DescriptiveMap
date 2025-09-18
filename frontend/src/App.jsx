import {useState} from 'react'
import Map from './Map'
import './App.css';

const poiColorMap = {
  "Attraction":        "#e6194b",
  "Memorial":          "#3cb44b",
  "Museum":            "#4363d8",
  "Park":              "#f58231",
  "Place Of Worship": "#911eb4",
  "Castle":            "#46f0f0",
  "Sauna":             "#f032e6",
  "Ruins":            "#bcf60c",
  "Tower":             "#fabebe",
  "Square":            "#008080",
  "Theatre":           "#9a6324",
  "Hotel":             "#fffac8",
  "Arts Centre":      "#800000",
  "Gallery":           "#808000",
  "Library":           "#000075",
  "Resort":            "#808080",
  "Zoo":               "#000000",
  "Cemetery":         "#ffffff",
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [description, setDescription] = useState('');


  const handleSearch = () => {
    const query = document.querySelector('.search-bar input').value;
    if (query) {
      setSearchQuery(query);
    }
  }

  return (
    <div className="app">
      <div className="search-bar">
        <input type="text" placeholder="Search for a location..." />
        <button id="search" onClick={handleSearch}>Search</button>
      </div>

      {description && 
        <div
          className="description"
          dangerouslySetInnerHTML={{ __html: description.replace(/\n\n/g, "<br/><br/>") }}
        />
      }


      <Map searchQuery={searchQuery} setDescription={setDescription} colorMap={poiColorMap} />
      {searchQuery &&
        <div className="legend">
          <ul>
            {Object.entries(poiColorMap).map(([type, color]) => (
              <li key={type}>
                <span className="legend-color" style={{ backgroundColor: color }} />
                {type}
              </li>
            ))}
          </ul>
      </div>}
    </div>
  )
}

export default App
