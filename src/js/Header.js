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
    Header.burger.addEventListener('click', () => {
      if (!Sidebar.container.classList.contains('display')) {
        console.log('엽니다');
        Sidebar.openSidebar();
      } else if (Sidebar.container.classList.contains('display')) {
        Sidebar.closeSidebar();
      }
    });
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
      Sidebar.createResultElement(data);
      if (!data.length === 0) {
        console.log(data);
        Sidebar.selectResultElement();
      }

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
      threshold: 1.0,
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
}

export default Header;
