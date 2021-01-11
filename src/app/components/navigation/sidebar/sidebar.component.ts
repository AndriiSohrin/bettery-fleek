import {Component, DoCheck, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements OnInit, DoCheck {
  display: boolean;
  scrollTop: number;
  currentPath

  constructor() {
  }

  ngOnInit(): void {
    this.detectPath();
  }

  ngDoCheck() {
    this.detectPath();
  }

  detectPath() {
    this.currentPath = window.location.pathname;
    if (this.currentPath === '/' || this.currentPath === '/tokensale' || this.currentPath.includes('create-event') || this.currentPath.includes('public_event') ||
      this.currentPath.includes('private_event')) {
      this.display = false;
    } else {
      this.display = true;
    }
  }

  @HostListener('window:scroll', ['$event'])
  listenScroll() {
    if (this.display) {
      this.scrollTop = document.documentElement.scrollTop;
    }
  }

  sidebarTopPosition() {
    if (document.documentElement.scrollTop < 87) {
      return {'top': (87 - this.scrollTop) + 'px'};
    } else {
      return {'top': 0};
    }
  }


  detectPathForActive(str: string) {
    if (this.currentPath === '/' + str) {
      return true;
    } else {
      return false;
    }
  }
}
