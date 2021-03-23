import {Component} from '@angular/core';
import {Router} from '@angular/router';

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

  constructor(private router: Router) {
  }


  detectPath() {
    // const href = window.location.pathname;
    const href = this.router.routerState.snapshot.url;
    if (href === '/create-event' || href.includes('/private_event') || href.includes('/public_event')) {
      return {
        'background': '#242521'
      };
    } else {
      return;
    }
  }

}
