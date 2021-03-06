import { PrivateFormComponent } from './privateEvents/private-form/private-form.component';
import { PrivateExpertComponent } from './privateEvents/private-expert/private-expert.component';
import { BadRequestComponent } from './privateEvents/bad-request/bad-request.component';
import { PrivateEndEventComponent } from './privateEvents/private-end-event/private-end-event.component';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PrivateMainComponent} from './privateEvents/private-main/private-main.component';
import {PublicMainComponent} from './publicEvents/public-main/public-main.component';
import {EventStartComponent} from './publicEvents/event-start/event-start.component';
import {InfoComponent} from './publicEvents/info/info.component';
import {ParticipateComponent} from './publicEvents/participate/participate.component';
import {ValidateComponent} from './publicEvents/validate/validate.component';
import {EventFinishComponent} from './publicEvents/event-finish/event-finish.component';
import {ShareModule} from "../../share/share.module";
import { RevertedPublicComponent } from './publicEvents/reverted-public/reverted-public.component';



@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        FontAwesomeModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            {path: 'private_event/:id', component: PrivateMainComponent},
            {path: 'public_event/:id', component: PublicMainComponent},
        ]),
        ShareModule,
    ],
  exports: [
  ],
  declarations: [
    PrivateMainComponent,
    PublicMainComponent,
    EventStartComponent,
    InfoComponent,
    ParticipateComponent,
    ValidateComponent,
    EventFinishComponent,
    PrivateFormComponent,
    PrivateExpertComponent,
    BadRequestComponent,
    PrivateEndEventComponent,
    RevertedPublicComponent
]
})
export class MobileEventsModule { }
