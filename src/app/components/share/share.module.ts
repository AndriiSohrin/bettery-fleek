import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerLoadingComponent } from './spinner-loading/spinner-loading.component';
import { InfoModalComponent } from './info-modal/info-modal.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { CommentComponent } from './comment/comment.component';
import { FormsModule } from '@angular/forms';
import { TimeAgoPipe } from './comment/pipe/time-ago.pipe';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { MetaMaskModalComponent } from './meta-mask-modal/meta-mask-modal.component';
import { ErrorLimitModalComponent } from './error-limit-modal/error-limit-modal.component';
import { QuizTemplateComponent } from './quiz-template/quiz-template.component';
import { TimeComponent } from './quiz-template/time/time.component';
import { QuizErrorsComponent } from './quiz-template/quiz-errors/quiz-errors.component';
import { PreRegistrationModalComponent } from './pre-registration-modal/pre-registration-modal.component';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    SpinnerLoadingComponent,
    InfoModalComponent,
    WelcomePageComponent,
    CommentComponent,
    TimeAgoPipe,
    MetaMaskModalComponent,
    ErrorLimitModalComponent,
    QuizTemplateComponent,
    TimeComponent,
    QuizErrorsComponent,
    PreRegistrationModalComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        NgxPageScrollModule,
        RouterModule,
    ],
    exports: [
        SpinnerLoadingComponent,
        CommentComponent,
        QuizTemplateComponent,
        TimeComponent,
        PreRegistrationModalComponent
    ]
})

export class ShareModule { }
