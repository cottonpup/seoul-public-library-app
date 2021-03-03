'use strict';

/**
 * Topics:
 *
 * Sidebar (UI)
 * Header(UI. Bars, NearbyBtn)
 *
 * Map
 *
 * Classes:
 * 1) SidebarComponent
 * 2) HeaderComponent
 * 3) MapComponent
 * 4) App
 */

class Header {
  static container = document.querySelector('.header');
  static nearbyBtn = document.querySelector('.btn__nearby');
  static burger = document.querySelector('.fa-bars');

  // Called once on App.init()
  static init() {
    // Open sidebar when clicking burger
    Header.burger.addEventListener('click', Sidebar.openSidebar);
  }
}

class Sidebar {
  static container = document.querySelector('.sidebar');

  // Called once on App.init()
  static init() {
    // Close sidebar when you click close (X) button
    Sidebar.container.addEventListener('click', function (e) {
      if (e.target.classList.contains('close')) Sidebar.closeSidebar();
    });
  }

  // Close the sidebar
  static closeSidebar() {
    Sidebar.container.classList.add('hidden');
    Map.container.classList.add('map-active');
    setTimeout(() => Sidebar.container.classList.add('disabled'), 200);
  }

  // Open the sidebar
  static openSidebar() {
    Sidebar.container.classList.toggle('display');
    Sidebar.container.classList.toggle('slideIn');
    Sidebar.container.classList.toggle('hidden');
    Sidebar.container.classList.toggle('disabled');
  }

  // Re-render sidebar container with different data.
  static createHTMLElement(data) {
    //TODO: 이용자격 글자수 25자 넘으면 truncate => eclipse button
    Sidebar.container.innerHTML = '';
    const html = `
      <div class="close">&#10005;</div>
      <li class="lib-list__col lib__name--big"><i class="fas fa-location-arrow"></i>${
        data.LBRRY_NAME || '도서관 정보 오류'
      }</li>
      <div class="lib-divider"></div>
      <ul class="lib-list padding--medium">
      <li class="lib-list__col text--gray"><label>주소: </label>${
        data.ADRES || '주소 정보 없음'
      }</li>
      <li class="lib-list__col text--gray"><label>운영시간: </label>${
        data.OP_TIME || '운영시간 정보 없음'
      }</li>
      <li class="lib-list__col text--gray"><label>휴관일: </label>${
        data.FDRM_CLOSE_DATE || '휴관일 정보 없음'
      }</li>
      <li class="lib-list__col text--gray><label>문의처: </label>${
        data.FXNUM || '문의처 정보 없음'
      }</li>
      <li class="lib-list__col text--gray"><label>이용자격: </label>${
        data.MBER_SBSCRB_RQISIT || '이용자격 정보 없음'
      }</li>
      <a class="lib-list__col lib--href text--gray" href="${
        data.HMPG_URL
      }"><label>홈페이지: </label>${data.HMPG_URL || '홈페이지 정보 없음'}</a>
      </ul>
      <div class="lib-divider"></div>
      <img class="reading-girl__svg" src="/src/svg/schoolbooks-monochrome.svg" alt="family">
    `;
    Sidebar.container.insertAdjacentHTML('beforeend', html);
  }

  static selectedLibraryData(e, row) {
    const popup = e.target.closest('.leaflet-popup-content-wrapper');
    if (!popup) return;
    const selectedLibraryName = popup.innerText;
    const selectedLibraryData = row.find(
      (row) => row.LBRRY_NAME === selectedLibraryName
    );
    return selectedLibraryData;
  }
}

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

  // Called once on App.init()
  static initMarkerHandler(row) {
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
      .setPopupContent(`${library.LBRRY_NAME}`);

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
      const res = await fetch(
        `https://geocode.xyz/${latitude},${longitude}?geoit=json`
      );
      const json = await res.json();
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
    const res = await fetch(
      'http://openapi.seoul.go.kr:8088/5a51676c6a64756434367a44666f47/json/SeoulPublicLibraryInfo/1/187'
    );
    const json = await res.json();
    return json.SeoulPublicLibraryInfo.row;
  }
}

class App {
  // Map init. Sidebar init. nearbyBtn init. Fetch map data.
  static async init() {
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
        (position) => Map.nearbyBtnClick(position),
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

App.init();
