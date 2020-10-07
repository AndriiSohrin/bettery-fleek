import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {NgxTypedJsComponent} from 'ngx-typed-js';
import {Store} from '@ngrx/store';

import {createEventAction} from '../../actions/newEvent.actions';
import {environment} from '../../../environments/environment';
import * as EN from '../../../assets/locale/en.json';
import * as VN from '../../../assets/locale/vn.json';
import {PostService} from '../../services/post.service';


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedLanguage: string;
  languages: { id: string, title: string }[] = [];
  translateSub: Subscription;
  active: boolean;
  newCreateEvent = '';
  switchLang = 'en';
  topQuestions = EN.HEADER.TOP_QUESTIONS;
  scrollHideMenu: boolean;
  styleHideMenu = true;
  flagMenu = false;
  dropDownSwitch: boolean;
  eventSub: Subscription;
  eventData;

  @ViewChild(NgxTypedJsComponent, {static: true}) typed: NgxTypedJsComponent;

  constructor(
    private modalService: NgbModal,
    private translateService: TranslateService,
    private store: Store<any>,
    private postService: PostService
  ) {
  }

  ngOnInit() {
    this.translateService.use(environment.defaultLocale);
    this.selectedLanguage = environment.defaultLocale;
    this.translate();
    this.scrollMenuSetting();

    this.getEventFromServer();
  }

  changeLocale() {
    this.translateService.use(this.selectedLanguage);
    console.log(this.selectedLanguage);

    if (this.selectedLanguage === 'vn') {
      this.switchLang = 'vn';
      this.topQuestions = VN.HEADER.TOP_QUESTIONS;
    }
    if (this.selectedLanguage === 'en') {
      this.switchLang = 'en';
      this.topQuestions = EN.HEADER.TOP_QUESTIONS;
    }
  }

  translate(): void {
    this.translateSub = this.translateService.get(environment.locales.map(x => `LANGUAGES.${x.toUpperCase()}`))
      .subscribe(translations => {
        this.languages = environment.locales.map(x => {
          return {
            id: x,
            title: translations[`LANGUAGES.${x.toUpperCase()}`],
          };
        });
      });
  }

  open(content) {
    this.modalService.open(content, {centered: true, size: 'lg'});
  }

  clickMain($event) {
    if (this.newCreateEvent.trim().length <= 0) {
      this.active = $event.target.className === 'typing' || $event.target.id === 'newEvent';
    }
  }

  sendEvent() {
    const data = this.newCreateEvent;
    this.store.dispatch(createEventAction({data}));
  }

  scrollMenuSetting(): void {
    let prevScrollpos = window.pageYOffset;
    window.onscroll = () => {
      if (this.flagMenu) {
        return;
      }
      const currentScrollPos = window.pageYOffset;
      prevScrollpos > currentScrollPos ? this.scrollHideMenu = false : this.scrollHideMenu = true;
      prevScrollpos = currentScrollPos;
      if (currentScrollPos === 0 || currentScrollPos < 0) {
        this.styleHideMenu = true;
        this.scrollHideMenu = false;
      } else {
        this.styleHideMenu = false;
      }
    };
  }

  dropDown() {
    this.dropDownSwitch = !this.dropDownSwitch;
  }

  getEventFromServer() {
    const email = {
      email: 'voroshilovmax90@gmail.com'
    };
    this.eventSub = this.postService.post('bettery_event', email)
      .subscribe((x: any) => {
        this.eventData = x;
      }, (err) => {
        console.log(err);
      });
  }

  ngOnDestroy() {
    if (this.translateSub) {
      this.translateSub.unsubscribe();
    }
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
  }

  styleHideMen() {
    this.flagMenu = true;
    this.scrollHideMenu = true;
    setTimeout(() => {
      this.flagMenu = false;
    }, 1000);
  }
}

