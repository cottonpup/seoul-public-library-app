'use strict';
import Map from './Map.js';

class Sidebar {
  static container = document.querySelector('.sidebar');
  static searchList = document.querySelector('#search-result');

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

export default Sidebar;
