'use strict';

const header = document.querySelector('.header');
const mapPopup = document.querySelector('#map');
const nearbyBtn = document.querySelector('.btn__nearby');
const map = L.map('map').setView([37.5642135, 127.0016985], 11);
const cluster = L.markerClusterGroup();
const sidebar = document.querySelector('.sidebar');

let row;

const sidebarClose = () => {
  sidebar.addEventListener('click', function (e) {
    if (e.target.classList.contains('close')) {
      sidebar.classList.add('hidden');
      mapPopup.classList.add('map-active');
      setTimeout(() => sidebar.classList.add('disabled'), 200);
    }
  });
};

const renderMark = (library, cluster) => {
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

const mapSetView = (lat, lng, zoomScale) => {
  map.setView(lat, lng, zoomScale, {
    animate: true,
    pan: {
      duration: 1
    }
  });
};

const nearbyBtnClick = async (position) => {
  // Reverse geocoding
  // let { latitude } = position.coords;
  // let { longitude } = position.coords;

  let latitude = 37.5485156;
  let longitude = 126.96857219999998;

  nearbyBtn.innerHTML = '';
  nearbyBtn.insertAdjacentHTML('beforeend', '<div class="loader"></div>');

  const res = await fetch(
    `https://geocode.xyz/${latitude},${longitude}?geoit=json`
  );

  // if (!res.ok) {
  //   throw new Error('Something went wrong');
  // }

  const json = await res.json();
  if (!json.region.includes('Seoul')) {
    alert(
      `${json.city}의 데이터는 존재하지 않습니다. \n오직 서울시 도서관의 데이터만 가지고 있습니다. 😭`
    );
  }

  if (latitude && longitude) {
    mapSetView([latitude, longitude], 15);
    nearbyBtn.innerHTML = '';
    nearbyBtn.insertAdjacentHTML(
      'beforeend',
      '<i class="far fa-compass"></i>주변 도서관 찾기'
    );
  }
};

const resizeObserver = new ResizeObserver(() => {
  map.invalidateSize();
});

const createHTMLElement = (data) => {
  //TODO: 이용자격 글자수 25자 넘으면 truncate => eclipse button
  sidebar.innerHTML = '';
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
  sidebar.insertAdjacentHTML('beforeend', html);
};

const libAPIFetch = async () => {
  const res = await fetch(
    'http://openapi.seoul.go.kr:8088/5a51676c6a64756434367a44666f47/json/SeoulPublicLibraryInfo/1/187'
  );

  const json = await res.json();
  row = json.SeoulPublicLibraryInfo.row;

  // 마크 랜더링 함수 호출
  row.map((lib) => renderMark(lib, cluster));

  // after all the markers have been added to the cluster, add the cluster to the map
  map.addLayer(cluster);

  // MAP POPUP EVENT 맵 팝업 이벤트
  mapPopupEvent();
};

const mapPopupEvent = () => {
  mapPopup.addEventListener('click', function (e) {
    if (!e.target.closest('.leaflet-popup-content-wrapper')) return;
    const selectedName = e.target.closest('.leaflet-popup-content-wrapper')
      .innerText;
    const selectedLibData = row.find((row) => row.LBRRY_NAME === selectedName);

    createHTMLElement(selectedLibData);

    mapSetView([selectedLibData.XCNTS, selectedLibData.YDNTS], 15);

    sidebar.classList.add('display');
    sidebar.classList.add('slideIn');
    setTimeout(() => sidebar.classList.remove('slideIn'), 1000);
    sidebar.classList.remove('hidden');
    sidebar.classList.remove('disabled');
  });
};

const openSidebar = () => {
  sidebar.classList.toggle('display');
  sidebar.classList.toggle('slideIn');
  sidebar.classList.toggle('hidden');
  sidebar.classList.toggle('disabled');
};

function init() {
  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  sidebarClose();

  nearbyBtn.addEventListener('click', function () {
    navigator.geolocation.getCurrentPosition(
      (position) => nearbyBtnClick(position),
      (err) =>
        alert(`ERROR(${err.code}): ${err.message}: Could not get your position`)
    );
  });

  document
    .querySelector('.fa-bars')
    .addEventListener('click', () => openSidebar());

  resizeObserver.observe(mapPopup);

  libAPIFetch();
}

init();
