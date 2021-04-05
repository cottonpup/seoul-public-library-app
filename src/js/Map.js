'use strict';
import Sidebar from './Sidebar.js';

class Map {
  static container = document.querySelector('#map'); // MAP CONTAINER BOX
  // Init default view for map
  static driver = L.map('map').setView([37.5642135, 127.0016985], 11); // Real MAP
  // Init cluster library
  static cluster = L.markerClusterGroup();
  // Obeserver
  static resizeObserver = new ResizeObserver(() => {
    Map.driver.invalidateSize();
  });

  static cachedLibraries = new globalThis.Map();

  // Called once on App.init()
  static initMarkerHandler(row) {
    Map.container.style.zIndex = '399';
    Map.container.addEventListener('click', function (e) {
      const selectedLibraryData = Sidebar.selectedLibraryData(e, row);
      if (!selectedLibraryData) return;

      Sidebar.createHTMLElement(selectedLibraryData);

      Map.mapSetView(
        [selectedLibraryData.XCNTS, selectedLibraryData.YDNTS],
        15
      );

      Sidebar.openSidebar();
    });
  }

  static renderMark(library) {
    const marker = L.marker([library.XCNTS, library.YDNTS]);
    marker
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: true,
          closeOnClick: true,
          className: `popup`
        })
      )
      .setPopupContent(`<b>${library.LBRRY_NAME}</b><br>클릭하여 자세히 보기`);

    Map.cachedLibraries.set(library.LBRRY_NAME, {
      marker: marker,
      coordinates: [library.XCNTS, library.YDNTS]
    });

    // adding the markers to the cluster
    Map.cluster.addLayer(marker);
  }

  static mapSetView(lat, lng, zoomScale) {
    Map.driver.setView(lat, lng, zoomScale, {
      // Check if this options make it slow
      animate: true,
      pan: {
        duration: 1
      }
    });
  }

  static async nearbyBtnClick(position) {
    // Reverse geocoding
    try {
      // let { latitude } = position.coords;
      // let { longitude } = position.coords;
      let latitude = 37.5485156;
      let longitude = 126.96857219999998;
      console.time('nearbyBtnClick time');
      const res = await fetch(
        `https://geocode.xyz/${latitude},${longitude}?geoit=json`
      );
      const json = await res.json();
      console.timeLog('nearbyBtnClick time');
      console.log(json);

      if (json)
        if (!json.region.includes('Seoul')) {
          alert(
            `${json.city}의 데이터는 존재하지 않습니다. \n오직 서울시 도서관의 데이터만 가지고 있습니다. 😭`
          );
        }

      Map.mapSetView([latitude, longitude], 15);
      Header.nearbyBtn.innerHTML = '';
      Header.nearbyBtn.insertAdjacentHTML(
        'beforeend',
        '<i class="far fa-compass"></i>주변 도서관 찾기'
      );
    } catch (error) {
      console.error(error.message);
    }
  }

  static async libAPIFetch() {
    const res = await fetch(`/api/library`);
    const row = await res.json();
    return row;
  }
}

export default Map;
