'use strict';
import Map from './Map.js';
import Header from './Header.js';

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
    Sidebar.container.classList.remove('slideIn');
    Sidebar.container.classList.remove('display');
    Map.container.classList.add('map-active');
    setTimeout(() => Sidebar.container.classList.add('disabled'), 200);
  }

  // Open the sidebar
  static openSidebar() {
    Sidebar.container.classList.add('display');
    Sidebar.container.classList.add('slideIn');
    Sidebar.container.classList.remove('hidden');
    Sidebar.container.classList.remove('disabled');
  }

  // Re-render sidebar container with different data.
  static createHTMLElement(data) {
    //TODO: 이용자격 글자수 25자 넘으면 truncate => eclipse button
    Sidebar.container.innerHTML = '';
    Header.searchText.value = '';
    const html = `
        <div class="close">&#10005;</div>
        <li class="lib-list__col lib__name--big"><i class="fas fa-location-arrow"></i>${
          data.LBRRY_NAME || '도서관 정보 오류'
        }</li>

        <ul class="lib-list padding--medium lib-list--background">
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
        <a class="lib-list__col lib--href text--gray"><label>층별안내: </label>${
          data.FLOOR_DC || '층별안내 정보 없음'
        }</a>
        <li class="lib-list__col lib--href text--gray"><label>찾아오시는 길: </label>${
          data.TFCMN || '찾아오시는 길 정보 없음'
        }</li>

        <li class="lib-list__col text--gray"><label>이용자격: </label>${
          data.MBER_SBSCRB_RQISIT || '이용자격 정보 없음'
        }</li>
        <a class="lib-list__col lib--href text--gray" href="${
          data.HMPG_URL
        }"><label>홈페이지: </label>${data.HMPG_URL || '홈페이지 정보 없음'}</a>

        </ul>

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

  // Search libraries
  static initSearch() {
    this.container.innerHTML = '';
    const html = `        
      <div class="close">&#10005;</div>
      <!-- SEARCH Libraries -->
      <li class="lib-list__col lib__name--big">검색결과</li>
      <ul id="search-result">
      <div class="lib-divider"></div>
      </ul>`;
    this.container.insertAdjacentHTML('beforeend', html);
  }

  static createResultElement(data) {
    this.initSearch();
    const searchList = document.querySelector('#search-result');
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
      const searchLibraryName = e.target.closest('#search-result > li > a')
        .innerText;
      if (searchLibraryName !== '결과없음') {
        const data = await Map.libAPIFetch();
        const selectedLibrary = data.filter(
          (data) => data.LBRRY_NAME === searchLibraryName
        );
        // console.log(selectedLibrary[0].XCNTS, selectedLibrary[0].YDNTS);
        Map.mapSetView(
          [selectedLibrary[0].XCNTS, selectedLibrary[0].YDNTS],
          15
        );
      }
    });
  }
}

export default Sidebar;
