'use strict';
import Map from './Map.js';
import Header from './Header.js';

class Sidebar {
  static container = document.querySelector('.map-box__sidebar');

  // Called once on App.init()
  static init() {
    // Close sidebar when you click close (X) button
    Sidebar.container.addEventListener('click', function (e) {
      if (e.target.classList.contains('map-box__close')) Sidebar.closeSidebar();
    });
  }

  // Close the sidebar
  static closeSidebar() {
    Sidebar.container.classList.add('map-box__sidebar--hidden');
    Sidebar.container.classList.remove('map-box__sidebar--slideIn');
    Sidebar.container.classList.remove('map-box__sidebar--display');
    Map.container.classList.add('map-active');
    setTimeout(
      () => Sidebar.container.classList.add('map-box__sidebar--disabled'),
      200
    );
  }

  // Open the sidebar
  static openSidebar() {
    Sidebar.container.classList.add('map-box__sidebar--display');
    Sidebar.container.classList.add('map-box__sidebar--slideIn');
    Sidebar.container.classList.remove('map-box__sidebar--hidden');
    Sidebar.container.classList.remove('map-box__sidebar--disabled');
  }

  // Re-render sidebar container with different data.
  static createHTMLElement(data) {
    //TODO: 이용자격 글자수 25자 넘으면 truncate => eclipse button
    // TODO: lib-list padding--medium lib-list--background ===> map-box__list
    Sidebar.container.innerHTML = '';
    Header.searchText.value = '';
    const html = `
        <div class="map-box__close">&#10005;</div>
        <li class="map-box__result map-box__title"><i class="fas fa-location-arrow"></i>${
          data.LBRRY_NAME || '도서관 정보 오류'
        }</li>
        <ul class="map-box__list">
        <li><label>주소: </label>${data.ADRES || '주소 정보 없음'}</li>
        <li><label>운영시간: </label>${
          data.OP_TIME || '운영시간 정보 없음'
        }</li>
      
        <li><label>휴관일: </label>${
          data.FDRM_CLOSE_DATE || '휴관일 정보 없음'
        }</li>
        
        <li><label>문의처: </label>${data.FXNUM || '문의처 정보 없음'}</li>
        <li><label>층별안내: </label>${
          data.FLOOR_DC || '층별안내 정보 없음'
        }</li>
        <li><label>찾아오시는 길: </label>${
          data.TFCMN || '찾아오시는 길 정보 없음'
        }</li>
        <li><label>이용자격: </label>${
          data.MBER_SBSCRB_RQISIT || '이용자격 정보 없음'
        }</li>
        <li 
        class="map-box__list--link"
        onClick="location.href='${data.HMPG_URL}';"><label>홈페이지: </label>${
      data.HMPG_URL || '홈페이지 정보 없음'
    }</li>
        </ul>
      `;
    Sidebar.container.insertAdjacentHTML('beforeend', html);
  }

  static selectedLibraryData(e, row) {
    const popup = e.target.closest('.leaflet-popup-content-wrapper');
    if (!popup) return;
    const selectedLibraryName = popup.innerText.split(/\r?\n/)[0];
    console.log(selectedLibraryName);
    const selectedLibraryData = row.find(
      (row) => row.LBRRY_NAME === selectedLibraryName
    );
    return selectedLibraryData;
  }

  // Search libraries
  static initSearch() {
    this.container.innerHTML = '';
    const html = `        
      <div class="map-box__close">&#10005;</div>
      <!-- SEARCH Libraries -->
      <li class="map-box__result">검색결과</li>
      <ul class="map-box__list">
      <div class="lib-divider"></div>
      </ul>`;
    this.container.insertAdjacentHTML('beforeend', html);
  }

  static createResultElement(data) {
    this.initSearch();
    const searchList = document.querySelector('.map-box__list');
    if (data.length >= 1) {
      searchList.innerHTML = '';
      data.map((data) => {
        const html = `
          <li><a href="#">${data.item.LBRRY_NAME}</a></li>`;
        searchList.insertAdjacentHTML('beforeend', html);
      });
    } else if (data.length === 0) {
      searchList.innerHTML = '';
      console.log('데이터 없음');
      const html = `
        <li><a href="#">결과없음</a></li>`;
      searchList.insertAdjacentHTML('beforeend', html);
    }
  }

  static selectResultElement() {
    this.container.addEventListener('click', async (e) => {
      let searchLibraryName = null;
      searchLibraryName =
        '결과없음' ?? e.target.closest('ul > li > a').innerText;
      console.log(searchLibraryName);
      if (searchLibraryName !== '결과없음') {
        // 1. Get cached Library marker & coords
        const cached = Map.cachedLibraries.get(searchLibraryName);

        // 2. User coords to center the view
        Map.mapSetView(cached.coordinates, 17);
        // 3. use the marker to open popup
        cached.marker.openPopup();
      }
    });
  }
}

export default Sidebar;
