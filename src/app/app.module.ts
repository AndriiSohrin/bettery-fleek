import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StoreModule } from '@ngrx/store';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';
import { AvatarModule } from 'ngx-avatar';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

import { userReducer } from './reducers/user.reducer';
import { coinsReducer } from './reducers/coins.reducer';
import { createEventReducer } from './reducers/newEvent.reducer';

import { AppComponent } from './app.component';

import { RegistrationComponent } from './components/registration/registration.component';

import { PostService } from './services/post.service';
import { GetService } from './services/get.service';
import { HomeComponent } from './components/home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErcCoinSaleComponent } from './components/erc-coin-sale/erc-coin-sale.component';
import { NumericDirective } from './helpers/numeric';

import { CreateEventModule } from './components/createEvent/createEvent.module';
import { EventsModule } from './components/events/events.module';
import { ShareModule } from './components/share/share.module';
import { LandingFormComponent } from './components/home/landing-form/landing-form.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { SwiperModule } from 'swiper/angular';
import { NavigationModule } from './components/navigation/navigation.module';
import { RoomModule } from './components/rooms/rooms.module';
import { FileauthComponent } from './components/fileauth/fileauth.component';

export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
    return new TranslateHttpLoader(http, './assets/locale/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        RegistrationComponent,
        HomeComponent,
        ErcCoinSaleComponent,
        NumericDirective,
        LandingFormComponent,
        FileauthComponent,
    ],
    imports: [
        SwiperModule,
        ShareModule,
        RecaptchaV3Module,
        AvatarModule,
        ClipboardModule,
        CreateEventModule,
        EventsModule,
        BrowserModule,
        HttpClientModule,
        FontAwesomeModule,
        ReactiveFormsModule,
        NgxTypedJsModule,
        StoreModule.forRoot({
            user: userReducer,
            coins: coinsReducer,
            createEvent: createEventReducer
        }),
        NgbModule,
        FormsModule,
        RouterModule.forRoot([
            { path: '', component: HomeComponent },
            { path: 'tokensale', component: ErcCoinSaleComponent },
            { path: '.well-known/pki-validation/fileauth.txt', component: FileauthComponent }
        ], { scrollPositionRestoration: 'top', useHash: true }),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
            useDefaultLang: false,
        }),
        NgxPageScrollModule,
        NavigationModule,
        RoomModule
    ],
    providers: [
        PostService,
        GetService,
        { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6Lf7m88ZAAAAAPQIjM2Wn9uJhi8QNjt26chDnnlF' },
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
