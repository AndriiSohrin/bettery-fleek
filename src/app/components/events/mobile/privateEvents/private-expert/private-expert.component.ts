import {Component, EventEmitter, Input, OnInit, Output, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import _ from 'lodash';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../app.state';
import Contract from '../../../../../contract/contract';
import {PostService} from '../../../../../services/post.service';
import {Subscription} from 'rxjs';
import {PrivEventMobile} from '../../../../../models/PrivEventMobile.model';
import {User} from '../../../../../models/User.model';

@Component({
  selector: 'app-private-expert',
  templateUrl: './private-expert.component.html',
  styleUrls: ['./private-expert.component.sass']
})
export class PrivateExpertComponent implements OnInit, OnDestroy {
  answerForm: FormGroup;
  @Input() allTime: any;
  @Input() data: PrivEventMobile;
  @Input() ifTimeValid: boolean;
  @Output() changed = new EventEmitter<boolean>();
  @Output() changed2 = new EventEmitter<boolean>();
  @Output() back = new EventEmitter<boolean>();
  spinnerLoading = false;
  confirm: boolean;
  formValid: boolean;
  errorMessage = undefined;
  userSub: Subscription;
  postSub: Subscription;
  userData: User;
  date: string | number;
  month: string | number;
  year: string | number;
  hour: string | number;
  minutes: string | number;
  answerIndex: number;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private postService: PostService,
  ) {
    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length != 0) {
        this.userData = x[0];
      }
    });

    this.answerForm = formBuilder.group({
      answer: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.calculateDate();
  }

  isConfirm() {
    const timeNow = Number((Date.now() / 1000).toFixed(0));
    if (this.data.endTime - timeNow > 0) {
      this.ifTimeValid = false;
    } else {
      this.ifTimeValid = true;
    }
  }

  isConfirm2(answerForm: any) {
    if (answerForm.status === 'INVALID') {
      this.formValid = true;
      return;
    }
    const index = _.findIndex(this.data.answers, (el => {
      return el === answerForm.value.answer;
    }));
    this.answerIndex = index;
    this.sendToBlockchain(index);
  }

  get f() {
    return this.answerForm.controls;
  }

  async sendToBlockchain(answer) {
    this.spinnerLoading = true;
    let id = this.data.id;
    let wallet = this.userData.wallet;
    let verifier = this.userData.verifier;
    let contract = new Contract();
    let contr = await contract.privateEventContract();
    let validator = await contr.methods.timeAnswerValidation(id).call();
    switch (Number(validator)) {
      case 2:
        try {
          let transaction = await contract.validateOnPrivateEvent(id, answer, wallet, verifier);
          if (transaction.transactionHash !== undefined) {
            this.sendToDb(transaction.transactionHash, answer);
          }
        } catch (error) {
          this.spinnerLoading = false;
          console.log(error);
        }
        break;
      case 1:
        this.spinnerLoading = false;
        this.errorMessage = 'Event not started yeat.';
        break;
      case 0:
        this.spinnerLoading = false;
        this.errorMessage = 'Time for validation started yeat';
        break;
    }
  }

  sendToDb(txHash, answer) {
    let data = {
      eventId: this.data.id,
      date: new Date(),
      answer: this.answerForm.value.answer,
      answerNumber: answer,
      transactionHash: txHash,
      from: this.userData._id,
    };
    this.postSub = this.postService.post('privateEvents/validate', data).subscribe(async () => {
      this.spinnerLoading = false;
      this.errorMessage = undefined;
      this.confirm = true;
    }, (err) => {
      this.spinnerLoading = false;
      console.log(err);
    });
  }

  change(increased: any) {
    this.changed.emit(increased);
  }

  change2(increased: any) {
    this.changed2.emit(increased);
  }

  backPrev(increased: any) {
    this.back.emit(increased);
  }

  calculateDate() {
    let endTime = new Date(this.data.endTime * 1000);
    this.date = endTime.getDate() >= 10 ? endTime.getDate() : '0' + endTime.getDate();
    let month = endTime.getMonth();
    var monthtext = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    this.month = monthtext[month];
    this.year = endTime.getFullYear();
    this.hour = endTime.getHours() >= 10 ? endTime.getHours() : '0' + endTime.getHours();
    this.minutes = endTime.getMinutes() >= 10 ? endTime.getMinutes() : '0' + endTime.getMinutes();
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
  }
}
