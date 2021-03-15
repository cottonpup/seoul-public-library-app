'use strict';

import Sidebar from './Sidebar.js';
import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@6.4.6/dist/fuse.esm.js';
import Map from './Map.js';

class Header {
  static container = document.querySelector('.header');
  static nearbyBtn = document.querySelector('.btn__nearby');
  static burger = document.querySelector('.fa-bars');
  static searchText = document.querySelector(
    'body > header > div > input[type=text]'
  );

  // Called once on App.init()
  static init() {
    // Open sidebar when clicking burger
    Header.burger.addEventListener('click', Sidebar.openSidebar);
    Header.search();
  }

  static async search() {
    let pattern = '';
    let flag = true;
    let data = null;
    this.searchText.addEventListener('input', (e) => {
      pattern = e.target.value;
      // console.log(pattern);
      data = fuse.search(pattern);
      console.log(data);
      // if (pattern) console.log(fuse.search(pattern));
      this.createHTMLElement(data);
      if (pattern.length >= 1 && flag) {
        Sidebar.openSidebar();
        flag = false;
      } else if (pattern.length <= 0) {
        flag = true;
        Sidebar.closeSidebar();
      }
    });

    const options = {
      includeScore: true,
      // isCaseSensitive: false,
      // shouldSort: true,
      // includeMatches: false,
      // findAllMatches: false,
      // minMatchCharLength: 1,
      // location: 0,
      threshold: 0.3,
      // distance: 100,
      // useExtendedSearch: false,
      // ignoreLocation: false,
      // ignoreFieldNorm: false,
      keys: ['LBRRY_NAME']
    };
    const list = await Map.libAPIFetch();
    // console.log(list);
    const fuse = new Fuse(list, options);

    // Change the pattern

    if (pattern) return fuse.search(pattern);
  }

  static createHTMLElement(data) {
    Sidebar.searchList.innerHTML = '';
    const divider = `<div class="lib-divider"></div>`;
    Sidebar.searchList.insertAdjacentHTML('beforeend', divider);
    if (data.length >= 1) {
      data.map((data) => {
        const html = `
        </div><li><a href="#">${data.item.LBRRY_NAME}</a></li>`;
        Sidebar.searchList.insertAdjacentHTML('beforeend', html);
      });
    } else if (data.length === 0) {
      console.log('데이터 없음');
      const html = `
      </div><li><a href="#">결과없음</a></li>`;
      Sidebar.searchList.insertAdjacentHTML('beforeend', html);
    }
  }
}

export default Header;
