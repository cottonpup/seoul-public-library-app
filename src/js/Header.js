'use strict';

import Sidebar from './Sidebar.js';
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

export default Header;
