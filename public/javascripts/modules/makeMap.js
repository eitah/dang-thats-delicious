import axios from "axios";
import { $, $$ } from "../modules/bling";

const mapOptions = {
  center: { lat: 43.2, lng: -79.8 },
  zoom: 10
};

// hardcoded geospatial defaults required
// navigator.geolocation.getCurrentPosition will work as a todo
function loadPlaces(map, lat = 43.2, lng = -79.8) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`).then(response => {
    const places = response.data;
    if (!places.length) {
      alert("No Places Found");
      return;
    }

    // bounds help us know how far to zoom in.
    // infowindow lets us expose info about each map point.
    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    const markers = places.map(place => {
      const [placeLng, placeLat] = place.location.coordinates;
      const position = { lat: placeLat, lng: placeLng };
      bounds.extend(position); // per marker extend the min zoom of the map
      const marker = new google.maps.Marker({ map, position });
      marker.place = place;
      return marker;
    });

    // after someone clicks on a marker, show the details of the clicked marker
    markers.forEach(marker =>
      marker.addListener("click", function(params) {
        const html = `
          <div class ="popup">
            <a href="/stores/${this.place.slug}">
                <img src="/uploads/${this.place.photo || "store.png"}" alt="${
          this.place.name
        }}" />
                <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `;
        infoWindow.setContent(html);
        infoWindow.open(map, this);
      })
    );

    // zoom the map to fit all the markers perfectly;
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
    // console.log("markers", markers);
  });
}

function makeMap(mapDiv) {
  if (!mapDiv) return;
  const map = new google.maps.Map(mapDiv, mapOptions);
  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  loadPlaces(map);

  // if user chooses an item, map view changes.
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    loadPlaces(
      map,
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );
  });
}

export default makeMap;
