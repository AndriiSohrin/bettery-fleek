import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {GetService} from '../../../../services/get.service';
import {PostService} from '../../../../services/post.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../app.state';
import maticInit from '../../../../contract/maticInit.js';
import Contract from '../../../../contract/contract';
import {ClipboardService} from 'ngx-clipboard'
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {InfoModalComponent} from '../../../share/info-modal/info-modal.component'
import {ErrorLimitModalComponent} from '../../../share/error-limit-modal/error-limit-modal.component';
import {environment} from '../../../../../environments/environment';
import {User} from '../../../../models/User.model';

@Component({
  selector: 'private-event-desktop',
  templateUrl: './private-event-desktop.component.html',
  styleUrls: ['./private-event-desktop.component.sass']
})
export class PrivateEventDesktopComponent implements OnInit, OnDestroy {
  @Input() formData;
  @Output() goBack = new EventEmitter();
  spinner: boolean = false;
  host: User[];
  created = false;
  eventData: any;
  day: number | string;
  hour: number | string;
  minutes: number | string;
  seconds: number | string;
  userSub: Subscription;
  idSub: Subscription;
  postSub: Subscription;
  createSub: Subscription;
  spinnerLoading: boolean = false;

  constructor(
    private getSevice: GetService,
    private postService: PostService,
    private store: Store<AppState>,
    private _clipboardService: ClipboardService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.userSub = this.store.select("user").subscribe((x: User[]) => {
      if (x.length != 0) {
        this.host = x;
      }
    });
  }

  ngOnInit(): void {
  }

  cancel() {
    this.goBack.next();
  }

  generateID() {
    let data = {
      id: this.host[0]._id,
      prodDev: environment.production
    }
    return this.postService.post("privateEvents/createId", data)
  }

  getStartTime() {
    return Number((Date.now() / 1000).toFixed(0));
  }

  getEndTime() {
    // return Number((this.formData.privateEndTime.date / 1000).toFixed(0));
    return Number(((Date.now() + this.formData.privateEndTime.date) / 1000).toFixed(0));
  }

  createEvent() {
    this.spinnerLoading = true;
    let id = this.generateID()
    this.idSub = id.subscribe((x: any) => {
      this.sendToContract(x._id);
    }, (err) => {
      this.modalService.open(ErrorLimitModalComponent, {centered: true});
      this.spinnerLoading = false;
      console.log(err)
    })
  }

  async sendToContract(id) {
    this.spinner = true;
    let matic = new maticInit(this.host[0].verifier);
    let userWallet = await matic.getUserAccount()
    let startTime = this.getStartTime();
    let endTime = this.getEndTime();
    let winner = this.formData.winner;
    let loser = this.formData.losers;
    let questionQuantity = this.formData.answers.length;
    // TO DO
    let correctAnswerSetter = userWallet


    try {
      let contract = new Contract()
      let sendToContract = await contract.createPrivateEvent(id, startTime, endTime, winner, loser, questionQuantity, correctAnswerSetter, userWallet, this.host[0].verifier);
      if (sendToContract.transactionHash !== undefined) {
        this.setToDb(id, sendToContract.transactionHash);
      }

    } catch (err) {
      this.spinnerLoading = false;
      console.log(err);
      this.deleteEvent(id);
    }
  }

  deleteEvent(id) {
    let data = {
      id: id
    }
    this.postSub = this.postService.post("delete_event_id", data)
      .subscribe(() => {
          this.spinner = false;
        },
        (err) => {
          console.log("from delete wallet")
          console.log(err)
        })
  }

  setToDb(id, transactionHash) {

    this.eventData = {
      _id: id,
      host: this.host[0]._id,
      status: "deployed",
      answers: this.formData.answers.map((x) => {
        return x.name
      }),
      question: this.formData.question,
      startTime: this.getStartTime(),
      endTime: this.getEndTime(),
      transactionHash: transactionHash,
      winner: this.formData.winner,
      loser: this.formData.losers,
      roomName: this.formData.roomName,
      roomColor: this.formData.roomColor,
      whichRoom: this.formData.whichRoom,
      roomId: this.formData.roomId
    }

    this.createSub = this.postService.post("privateEvents/createEvent", this.eventData)
      .subscribe(
        () => {
          this.spinnerLoading = false;
          this.calculateDate();
          this.spinner = false;
          this.created = true;

          this.modalService.dismissAll();
        },
        (err) => {
          console.log("set qestion error");
          console.log(err);
        })
  }

  calculateDate() {
    let startDate = new Date();
    let endTime = new Date(this.eventData.endTime * 1000);
    var diffMs = (endTime.getTime() - startDate.getTime());
    this.day = Math.floor(Math.abs(diffMs / 86400000));
    let hour = Math.floor(Math.abs((diffMs % 86400000) / 3600000));
    let minutes = Math.floor(Math.abs(((diffMs % 86400000) % 3600000) / 60000));
    let second = Math.round(Math.abs((((diffMs % 86400000) % 3600000) % 60000) / 1000));

    this.hour = Number(hour) > 9 ? hour : "0" + hour;
    this.minutes = Number(minutes) > 9 ? minutes : "0" + minutes;
    if (second === 60) {
      this.seconds = "00"
    } else {
      this.seconds = second > 9 ? second : "0" + second;

    }


    setTimeout(() => {
      this.calculateDate()
    }, 1000);
  }

  // TO DO
  modalAboutExpert() {
    const modalRef = this.modalService.open(InfoModalComponent, {centered: true});
    modalRef.componentInstance.name = '- Actually, no need to! Bettery is smart and secure enough to take care of your event. You can join to bet as a Player or become an Expert to validate the result after Players. Enjoy!';
    modalRef.componentInstance.boldName = 'How to manage your event';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.idSub) {
      this.idSub.unsubscribe();
    }
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
    if (this.createSub) {
      this.createSub.unsubscribe();
    }
  }
}

