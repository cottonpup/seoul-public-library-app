'use strict';

import Header from './Header.js';
import Sidebar from './Sidebar.js';
import Map from './Map.js';

class App {
  constructor() {}

  // Map init. Sidebar init. nearbyBtn init. Fetch map data.
  async init() {
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(Map.driver);

    Sidebar.init();

    Header.nearbyBtn.addEventListener('click', function () {
      Header.nearbyBtn.innerHTML = '';
      Header.nearbyBtn.insertAdjacentHTML(
        'beforeend',
        '<div class="loader"></div>'
      );

      navigator.geolocation.getCurrentPosition(
        (position) => {
          Map.nearbyBtnClick(position);
          Header.nearbyBtn.innerHTML = '';
          Header.nearbyBtn.insertAdjacentHTML(
            'beforeend',
            '<i class="far fa-compass"></i>주변 도서관 찾기'
          );
        },
        (err) =>
          alert(
            `ERROR(${err.code}): ${err.message}: Could not get your position`
          )
      );
    });

    // [R]
    Header.init();

    Map.resizeObserver.observe(Map.container);

    const row = await Map.libAPIFetch();

    row.map((lib) => Map.renderMark(lib, Map.cluster));

    // after all the markers have been added to the cluster, add the cluster to the map
    Map.driver.addLayer(Map.cluster);

    // MAP POPUP EVENT 맵 팝업 이벤트
    Map.initMarkerHandler(row);
  }
}

const app = new App();

app.init();
