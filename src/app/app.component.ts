import {Component} from '@angular/core';

declare global {
  interface Window {
    web3: any;
    biconomy: any
  }
}

window.web3 = window.web3 || {};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'Quiz';

  constructor() {
  }


  detectPath() {
    const href = window.location.pathname;
    if (href === '/create-event' || href.includes('/private_event') || href.includes('/public_event')) {
      return {
        'background': '#242521'
      };
    } else {
      return;
    }
  }

}
