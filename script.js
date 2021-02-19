'use strict';

const sidebar = document.querySelector('.sidebar');
const header = document.querySelector('.header');
const mapDiv = document.querySelector('#map');

sidebar.addEventListener('click', function (e) {
  if (e.target.classList.contains('close')) {
    sidebar.classList.add('hidden');
    mapDiv.classList.add('map-active');
    setTimeout(() => sidebar.classList.add('disabled'), 400);
  }
});

// map 구현하기
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      // 북위 37.5642135° 동경 127.0016985°
      const map = L.map('map').setView([37.5642135, 127.0016985], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const renderMark = function (library) {
        L.marker([library.XCNTS, library.YDNTS])
          .addTo(map)
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
      };

      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });

      resizeObserver.observe(mapDiv);
      // map.addEventListener('click', this._moveToPopup.bind(this));

      fetch(
        'http://openapi.seoul.go.kr:8088/5a51676c6a64756434367a44666f47/json/SeoulPublicLibraryInfo/1/187/'
      )
        .then((res) => {
          // console.log(res);
          return res.json();
        })
        .then((data) => {
          const { row } = data.SeoulPublicLibraryInfo;

          // 마크 랜더링 함수 호출
          row.map((lib) => renderMark(lib));

          // 호출..
          mapDiv.addEventListener('click', function (e) {
            if (!e.target.closest('.leaflet-popup-content-wrapper')) return;
            const selectedName = e.target.closest(
              '.leaflet-popup-content-wrapper'
            ).innerText;
            const selectedLibData = row.find(
              (row) => row.LBRRY_NAME === selectedName
            );

            sidebar.innerHTML = '';

            const html = `
            <div class="close">&#10005;</div>
            <h1 class="sidebar__title text--big">도서관 정보</h1>
            <ul class="lib-list">
            <li class="lib-list__col lib__name--big"><i class="fas fa-location-arrow"></i>${
              selectedLibData.LBRRY_NAME || '도서관 정보 오류'
            }</li>
            <li class="lib-list__col text--gray"><label>주소: </label>${
              selectedLibData.ADRES || '주소 정보 없음'
            }</li>
            <li class="lib-list__col text--gray"><label>운영시간: </label>${
              selectedLibData.OP_TIME || '운영시간 정보 없음'
            }</li>
            <li class="lib-list__col text--gray"><label>휴관일: </label>${
              selectedLibData.FDRM_CLOSE_DATE || '휴관일 정보 없음'
            }</li>
            <li class="lib-list__col text--gray><label>문의처: </label>${
              selectedLibData.FXNUM || '문의처 정보 없음'
            }</li>
            <li class="lib-list__col text--gray"><label>이용자격: </label>${
              selectedLibData.MBER_SBSCRB_RQISIT || '이용제한 정보 없음'
            }</li>
            <a class="lib-list__col lib--href text--gray" href="${
              selectedLibData.HMPG_URL
            }"><label>홈페이지: </label>${
              selectedLibData.HMPG_URL || '홈페이지 정보 없음'
            }</a>
            </ul>
            <img class="reading-girl__svg" src="schoolbooks-monochrome.svg" alt="family">
            `;
            sidebar.insertAdjacentHTML('beforeend', html);

            console.log(selectedName);
            console.log(selectedLibData);

            sidebar.classList.add('display');
            sidebar.classList.add('slideIn');
            setTimeout(() => sidebar.classList.remove('slideIn'), 1000);
            sidebar.classList.remove('hidden');
            sidebar.classList.remove('disabled');

            map.setView([selectedLibData.XCNTS, selectedLibData.YDNTS], 13, {
              animate: true,
              pan: {
                duration: 1
              }
            });
          });
        });
    },
    function (err) {
      alert(`ERROR(${err.code}): ${err.message}: Could not get your position`);
    }
  );
