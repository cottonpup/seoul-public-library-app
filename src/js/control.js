'use strict';

const header = document.querySelector('.header');
const mapDiv = document.querySelector('#map');
const nearbyBtn = document.querySelector('.btn__search');
const map = L.map('map').setView([37.5642135, 127.0016985], 11);
const cluster = L.markerClusterGroup();

/////////////////////////////////////////////////////////////////////////////
// SIDEBAR 사이드 바
const sidebar = document.querySelector('.sidebar');
sidebar.addEventListener('click', function (e) {
  if (e.target.classList.contains('close')) {
    sidebar.classList.add('hidden');
    mapDiv.classList.add('map-active');
    setTimeout(() => sidebar.classList.add('disabled'), 400);
  }
});

/////////////////////////////////////////////////////////////////////////////
// RENDER MARK 마크 랜더링
const renderMark = function (library, cluster) {
  const marker = L.marker([library.XCNTS, library.YDNTS]);
  marker
    // .addTo(map) // this line is making duplicates
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
  cluster.addLayer(marker);
};

/////////////////////////////////////////////////////////////////////////////
// MAP SETVIEW ANIMATION 맵 SetView 애니메이션
const mapSetView = function (lat, lng, zoomScale) {
  map.setView(lat, lng, zoomScale, {
    animate: true,
    pan: {
      duration: 1
    }
  });
};

/////////////////////////////////////////////////////////////////////////////
// NEARBY LIBRARY CLICK EVENT 주변 도서관 찾기 이벤트
const nearbyBtnClick = function (position) {
  // Reverse geocoding
  // 너무 빨리해도 오류가 뜸
  let { latitude } = position.coords;
  let { longitude } = position.coords;

  console.log(latitude, longitude);

  fetch(`https://geocode.xyz/${latitude},${longitude}?geoit=json`)
    .then((resGeo) => {
      if (!resGeo.ok) {
        alert('천천히 다시 시도해보세요!');
        throw new Error('Problem getting location data');
      }
      return resGeo.json();
    })
    .then((dataGeo) => {
      if (!dataGeo.region.includes('Seoul')) {
        alert(
          `${dataGeo.city}의 데이터는 존재하지 않습니다. \n오직 서울시 도서관의 데이터만 가지고 있습니다. 😭`
        );
        return;
      }
      mapSetView([latitude, longitude], 15);
    });
};

/////////////////////////////////////////////////////////////////////////////
// RESIZE OBSERVER EVENT
const resizeObserver = new ResizeObserver(() => {
  map.invalidateSize();
});

/////////////////////////////////////////////////////////////////////////////
const createHTMLElement = function (data) {
  //TODO: 이용자격 글자수 25자 넘으면 truncate => eclipse button
  sidebar.innerHTML = '';
  const html = `
          <div class="close">&#10005;</div>
          <h1 class="sidebar__title text--big border-bottom--black">도서관 정보</h1>
          <ul class="lib-list">
          <li class="lib-list__col lib__name--big"><i class="fas fa-location-arrow"></i>${
            data.LBRRY_NAME || '도서관 정보 오류'
          }</li>
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
          }"><label>홈페이지: </label>${
    data.HMPG_URL || '홈페이지 정보 없음'
  }</a>
          </ul>
          <img class="reading-girl__svg" src="/src/svg/schoolbooks-monochrome.svg" alt="family">
          `;
  sidebar.insertAdjacentHTML('beforeend', html);
};

/////////////////////////////////////////////////////////////////////////////
const libAPIFetch = function () {
  fetch(
    'http://openapi.seoul.go.kr:8088/5a51676c6a64756434367a44666f47/json/SeoulPublicLibraryInfo/1/187'
  )
    .then((res) => {
      // console.log(res);
      return res.json();
    })
    .then((data) => {
      const { row } = data.SeoulPublicLibraryInfo;

      // 마크 랜더링 함수 호출
      row.map((lib) => renderMark(lib, cluster));

      // after all the markers have been added to the cluster, add the cluster to the map
      map.addLayer(cluster);

      /////////////////////////////////////////////////////////////////////////////
      // MAP POPUP EVENT 맵 팝업 이벤트
      mapDiv.addEventListener('click', function (e) {
        if (!e.target.closest('.leaflet-popup-content-wrapper')) return;
        const selectedName = e.target.closest('.leaflet-popup-content-wrapper')
          .innerText;
        const selectedLibData = row.find(
          (row) => row.LBRRY_NAME === selectedName
        );

        createHTMLElement(selectedLibData);

        sidebar.classList.add('display');
        sidebar.classList.add('slideIn');
        setTimeout(() => sidebar.classList.remove('slideIn'), 1000);
        sidebar.classList.remove('hidden');
        sidebar.classList.remove('disabled');

        mapSetView([selectedLibData.XCNTS, selectedLibData.YDNTS], 15);
      });
    });
};

/////////////////////////////////////////////////////////////////////////////
// MAP CALLBACK 맵 콜백
// TODO: async await 으로 리팩토링하기
function init() {
  // TILELAYER
  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // NEARBYBTN
  if (navigator.geolocation) {
    nearbyBtn.addEventListener('click', function () {
      navigator.geolocation.getCurrentPosition(
        (position) => nearbyBtnClick(position),
        (err) =>
          alert(
            `ERROR(${err.code}): ${err.message}: Could not get your position`
          )
      );
    });
  }

  // RESIZE OBSERVER EVENT
  resizeObserver.observe(mapDiv);

  libAPIFetch();
}

/////////////////////////////////////////////////////////////////////////////
// map 구현하기
init();

/////////////////////////////////////////////////////////////////////////////////////
// TODO: 검색창 구현
