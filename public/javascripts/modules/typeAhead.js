import axios from "axios";
import dompurify from "dompurify";

function searchResultsHTML(stores) {
  const html = stores
    .map(store => {
      return `
            <a href="/stores/${store.slug}" class="search__result">
            <strong>${store.name}</strong></a>
        `;
    })
    .join("");
  return dompurify.sanitize(html);
}

function typeAhead(search) {
  // search element is the input. Guard pattern
  if (!search) return;
  const searchInput = search.querySelector('input[name="search"]');
  if (!searchInput) return;
  const searchResults = search.querySelector("div.search__results");
  if (!searchResults) return;

  // on is a blingjs shortcut for addEventListener("input"...)
  searchInput.on("input", function() {
    // dont try to query an empty search
    if (!this.value) {
      searchResults.style.display = "none";
      return;
    }
    searchResults.style.display = "block";
    searchResults.innerHTML = "";
    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = searchResultsHTML(res.data);
          return;
        }
        // tell them nothing came back;
        searchResults.innerHTML = dompurify.sanitize(
          `<div class="search__result">No Results for ${
            this.value
          } found!</div>`
        );
      })
      .catch(e => {
        console.error("typeAhead failure:", e);
      });
  });

  searchInput.on("keyup", e => {
    const triggers = {
      38: "UP",
      40: "DOWN",
      13: "ENTER",
      27: "ESC"
    };
    const key = e.keyCode;

    if (!triggers[key]) return; // bye

    const activeClass = "search__result--active";
    const current = searchResults.querySelector(`.${activeClass}`);
    const items = searchResults.querySelectorAll(`.search__result`);

    //handle enter
    if (triggers[key] === "ENTER") {
      if (current && current.href) window.location.href = current.href;
      return;
    }

    //BONUS: handle escape
    if (triggers[key] === "ESC" && current) {
      current.classList.remove(activeClass);
      searchResults.style.display = "none";
      return;
    }

    // handle up and down
    let next;
    if (triggers[key] === "DOWN" && current) {
      // go to the next item or start from top
      next = current.nextElementSibling || items[0];
    } else if (triggers[key] === "DOWN") {
      next = items[0];
    } else if (triggers[key] === "UP" && current) {
      // go to the next item or start from end
      next = current.previousElementSibling || items[items.length - 1];
    } else if (triggers[key] === "UP") {
      next = items[items.length - 1];
    }
    // change the selected classes
    next.classList.add(activeClass);
    if (current) {
      current.classList.remove(activeClass);
    }
  });
}

export default typeAhead;
