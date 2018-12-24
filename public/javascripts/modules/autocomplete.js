function autocomplete(input, latInput, longInput) {
  if (!input) {
    return;
  }

//   const dropdown = new google.maps.places.Autocomplete(input);
  // const dropdown = new google.maps.places.Autocomplete(input);
    // input.bef
  //if someone hits enter on the address field
  input.on('keydown', (e) => {
    if (e.keycode === 13) {
      e.preventDefault();
    }
  })
}

export default autocomplete;


// this is an idea i have if the google maps thing is a pain
const fakeDropdown = `<div
  class="pac-container hdpi"
  style="width: 343px; position: absolute; left: 70px; top: 740px;"
>
  <div class="pac-item">
    <span class="pac-icon pac-icon-marker" />
    <span class="pac-item-query">
      <span class="pac-matched">Chi</span>cago
    </span>
    <span>IL, USA</span>
  </div>
  <div class="pac-item">
    <span class="pac-icon pac-icon-marker" />
    <span class="pac-item-query">
      <span class="pac-matched">Chi</span>cago Heights
    </span>
    <span>IL, USA</span>
  </div>
  <div class="pac-item">
    <span class="pac-icon pac-icon-marker" />
    <span class="pac-item-query">
      <span class="pac-matched">Chi</span>natown
    </span>
    <span>Chicago, IL, USA</span>
  </div>
  <div class="pac-item">
    <span class="pac-icon pac-icon-marker" />
    <span class="pac-item-query">
      <span class="pac-matched">Chi</span>cago Ridge
    </span>
    <span>IL, USA</span>
  </div>
  <div class="pac-item">
    <span class="pac-icon pac-icon-marker" />
    <span class="pac-item-query">
      <span class="pac-matched">Chi</span>cago Loop
    </span>
    <span>Chicago, IL, USA</span>
  </div>
</div>;
`;
