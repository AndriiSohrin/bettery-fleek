import {Component, OnInit, Input, EventEmitter, Output, OnChanges, OnDestroy, Inject, AfterViewInit} from '@angular/core';
import {User} from '../../../models/User.model';
import {Answer} from '../../../models/Answer.model';
import Web3 from 'web3';
import Contract from '../../../contract/contract';
import * as CoinsActios from '../../../actions/coins.actions';
import * as UserActions from '../../../actions/user.actions';
import {PostService} from '../../../services/post.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../app.state';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import web3Obj from '../../../helpers/torus';
import maticInit from '../../../contract/maticInit.js';
import {QuizErrorsComponent} from './quiz-errors/quiz-errors.component';
import {Subscription} from 'rxjs';
import {Event} from '../../../models/Event.model';
import {Coins} from '../../../models/Coins.model';
import {ClipboardService} from 'ngx-clipboard';
import {PageScrollService} from 'ngx-page-scroll-core';

@Component({
  selector: 'quiz-template',
  templateUrl: './quiz-template.component.html',
  styleUrls: ['./quiz-template.component.sass']
})
export class QuizTemplateComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  faCheck = faCheck;
  allUserData: User = undefined;
  amount: number;
  torusSub: Subscription;
  answerSub: Subscription;
  validSub: Subscription;
  updateSub: Subscription;
  openIndex: number = null;
  joinPlayer: boolean = false;
  becomeExpert: boolean = false;
  details: boolean = true;
  letsBet: boolean = false;
  viewEventFinishInfo: boolean = false;
  copyLinkFlag: boolean;

  @Input() joinRoom: boolean;
  @Input() index: number;

  constructor(
    private postService: PostService,
    private store: Store<AppState>,
    private modalService: NgbModal,
    private _clipboardService: ClipboardService,
    private pageScrollService: PageScrollService,
  ) {
  }


  @Input() question: Event;
  @Input('userData') userData: User;
  @Input() myAnswers: Answer;
  @Input() coinInfo: Coins;
  @Input() fromComponent: string;

  @Output() callGetData = new EventEmitter();
  @Output() commentIdEmmit = new EventEmitter<number>();

  ngOnInit() {
    this.allUserData = this.userData;
  }

  scrollTo() {
    const idAnchor = sessionStorage.getItem('eventId');
    if (idAnchor) {
      console.log('scroll work');
      this.pageScrollService.scroll({
        document,
        scrollTarget: '#' + idAnchor,
        scrollOffset: 110
      });
    }
    sessionStorage.removeItem('eventId');
  }

  ngAfterViewInit(): void {
    this.scrollTo();
  }

  ngOnChanges(changes) {
    if (changes['userData'] !== undefined) {
      let currentValue = changes['userData'].currentValue;
      if (this.allUserData === undefined || currentValue._id !== this.allUserData._id) {
        this.allUserData = this.userData;
      }
    }
  }

  makeAnswer(i) {
    this.myAnswers.answer = i;
  }

  avgBet(q) {
    let amount = 0;
    if (q.parcipiantAnswers == undefined) {
      return amount;
    } else {
      q.parcipiantAnswers.forEach(e => {
        amount = amount + e.amount;
      });
    }
    return amount;
  }

  biggestWin() {
    let loserPool = 0;
    let biggest = 0;
    let winnerPool = 0;
    let totalPart = this.question.parcipiantAnswers;
    let finalAnswer = this.question.finalAnswer;
    if (totalPart != undefined) {
      for (let i = 0; i < totalPart.length; i++) {
        // get loser pool
        if (totalPart[i].answer != finalAnswer) {
          loserPool += totalPart[i].amount;
        }
        // get winner pool
        if (totalPart[i].answer == finalAnswer) {
          winnerPool += totalPart[i].amount;
        }
        // fing biggest win
        if (totalPart[i].amount > biggest && totalPart[i].answer == finalAnswer) {
          biggest = totalPart[i].amount;
        }
      }
      let percent = this.getPercent(loserPool, 90);
      return (biggest + ((percent * biggest) / winnerPool)).toFixed(2);
    } else {
      return 0;
    }

  }

  letsCalcalteWinner(from, amount) {
    let loserPool = 0;
    let winnerPool = 0;
    let pool = 0;
    if (this.question.parcipiantAnswers != undefined) {
      this.question.parcipiantAnswers.forEach(x => {

        pool = pool + Number(x.amount);

        if (x.answer != this.question.finalAnswer) {
          loserPool = loserPool + Number(x.amount);
        }
      });
    }
    winnerPool = pool - loserPool;
    if (from == 'validator') {
      let validators = 0;
      for (let i = 0; i < this.question.validatorsAnswers.length; i++) {
        if (this.question.validatorsAnswers[i].answer == this.question.finalAnswer) {
          validators++;
        }
      }
      return (this.getPercent(loserPool, 5) / validators).toFixed(2);
    } else if (from == 'player') {
      return (amount + ((this.getPercent(loserPool, 90) * amount) / winnerPool)).toFixed(2);
    } else if (from == 'host') {
      return this.getPercent(loserPool, 3).toFixed(2);
    }
  }

  actionDetected(data) {
    if (this.userData != undefined) {
      if (data.host.id === this.userData._id) {
        return 'You earned';
      } else if (this.myAnswers.from == 'validator') {
        return 'You earned';
      } else {
        return 'You won';
      }
    } else {
      return;
    }
  }

  playerAward(data) {
    if (this.userData != undefined) {
      if (data.host.id === this.userData._id) {
        return (Number(this.letsCalcalteWinner('player', this.myAnswers.betAmount)) + Number(this.letsCalcalteWinner('host', 0))) + ' BET';
      } else if (this.myAnswers.from == 'validator') {
        return this.letsCalcalteWinner('validator', 0) + ' BET';
      } else {
        return this.letsCalcalteWinner('player', this.myAnswers.betAmount) + ' BET';
      }
    } else {
      return;
    }
  }

  getWinnerColor(data) {
    if (this.userData != undefined) {
      if (data.host.id === this.userData._id) {
        return {'color': '#F7971E'};
      } else if (this.myAnswers.from == 'validator') {
        return {'color': '#A134FF'};
      } else {
        return {'color': '#10C9C9'};
      }
    } else {
      return;
    }
  }

  getPool(data) {
    let pool = 0;
    if (data.parcipiantAnswers !== undefined) {
      data.parcipiantAnswers.forEach(x => {
        pool = pool + Number(x.amount);
      });
      return pool;
    } else {
      return 0;
    }
  }

  getPercent(from, percent) {
    return (from * percent) / 100;
  }

  betEvent(event) {
    event.event_id = this.question.id;
    this.setToNetwork(event, this.question);
  }

  validateEvent(event) {
    event.event_id = this.question.id;
    this.setToNetworkValidation(event, this.question);
  }


  async setAnswer(dataAnswer, from) {
    let answer = this.myAnswers;
    if (this.allUserData != undefined) {
      if (answer.answer === undefined) {
        let modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
        modalRef.componentInstance.errType = 'error';
        modalRef.componentInstance.title = 'Choose anwer';
        modalRef.componentInstance.description = 'Choose at leas one answer';
        modalRef.componentInstance.nameButton = 'fine';
      } else {
        if (from === 'validate') {
          this.setToNetworkValidation(answer, dataAnswer);
        } else {
          if (Number(answer.amount) <= 0) {
            const modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
            modalRef.componentInstance.errType = 'error';
            modalRef.componentInstance.title = 'Low amount';
            modalRef.componentInstance.description = 'Amount must be bigger than 0';
            modalRef.componentInstance.nameButton = 'fine';
          } else {
            this.setToNetwork(answer, dataAnswer);
          }
        }
      }
    } else {
      try {
        await web3Obj.initialize();
        this.setTorusInfoToDB();
      } catch (error) {
        await web3Obj.torus.cleanUp();
        console.error(error);
      }
    }
  }

  async setTorusInfoToDB() {
    const userInfo = await web3Obj.torus.getUserInfo('');
    const userWallet = (await web3Obj.web3.eth.getAccounts())[0];
    const data: object = {
      _id: null,
      wallet: userWallet,
      nickName: userInfo.name,
      email: userInfo.email,
      avatar: userInfo.profileImage,
      verifier: userInfo.verifier,
      verifierId: userInfo.verifierId,
    };
    this.torusSub = this.postService.post('user/torus_regist', data)
      .subscribe(
        (x: any) => {
          this.addUser(
            x.email,
            x.nickName,
            x.wallet,
            x.listHostEvents,
            x.listParticipantEvents,
            x.listValidatorEvents,
            x.historyTransaction,
            x.avatar,
            x._id,
            x.verifier
          );
        }, (err) => {
          console.log(err);
          let modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
          modalRef.componentInstance.errType = 'error';
          modalRef.componentInstance.title = 'Unknown Error';
          modalRef.componentInstance.customMessage = String(err);
          modalRef.componentInstance.description = 'Report this unknown error to get 1 BET token!';
          modalRef.componentInstance.nameButton = 'report error';
        });
  }

  addUser(
    email: string,
    nickName: string,
    wallet: string,
    listHostEvents: object,
    listParticipantEvents: object,
    listValidatorEvents: object,
    historyTransaction: object,
    color: string,
    _id: number,
    verifier: string
  ) {

    this.store.dispatch(new UserActions.AddUser({
      _id: _id,
      email: email,
      nickName: nickName,
      wallet: wallet,
      listHostEvents: listHostEvents,
      listParticipantEvents: listParticipantEvents,
      listValidatorEvents: listValidatorEvents,
      historyTransaction: historyTransaction,
      avatar: color,
      verifier: verifier
    }));
  }

  async setToNetwork(answer, dataAnswer) {
    let balance;

    if (dataAnswer.currencyType === 'ether') {
      balance = this.coinInfo.loomBalance;
    } else {
      balance = this.coinInfo.tokenBalance;
    }

    if (Number(balance) < Number(answer.amount)) {
      let modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
      modalRef.componentInstance.errType = 'error';
      modalRef.componentInstance.title = 'Insufficient BET';
      modalRef.componentInstance.description = 'You don\'t have enough BET tokens to make this bet. Please lower your bet or get more BET tokens by:';
      modalRef.componentInstance.editionDescription = ['- Hosting a successful event', '- Validating event results as an Expert', '- Giving others topics to host events as an Advisor'];
      modalRef.componentInstance.nameButton = 'fine';
    } else {
      let web3 = new Web3();
      let contract = new Contract();
      var _question_id = dataAnswer.id;
      var _whichAnswer = answer.answer;
      var _money = web3.utils.toWei(String(answer.amount), 'ether');
      let contr = await contract.publicEventContract();
      let validator = await contr.methods.setTimeAnswer(_question_id).call();
      if (Number(validator) === 0) {
        if (dataAnswer.currencyType === 'ether') {
          await contract.approveWETHToken(this.allUserData.wallet, _money, this.allUserData.verifier);
        } else {
          await contract.approveBETToken(this.allUserData.wallet, _money, this.allUserData.verifier);
        }
        let sendToContract = await contract.participateOnPublicEvent(_question_id, _whichAnswer, _money, this.allUserData.wallet, this.allUserData.verifier);
        if (sendToContract.transactionHash !== undefined) {
          this.setToDB(answer, sendToContract.transactionHash, dataAnswer.currencyType);
        }
      } else if (Number(validator) === 1) {
        let modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
        modalRef.componentInstance.errType = 'time';
        modalRef.componentInstance.title = 'Event not start';
        modalRef.componentInstance.customMessage = 'Betting time for this event is not start.';
        modalRef.componentInstance.description = 'Player can join when event is start.';
        modalRef.componentInstance.nameButton = 'fine';
      } else if (Number(validator) === 2) {
        let modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
        modalRef.componentInstance.errType = 'time';
        modalRef.componentInstance.title = 'Betting time’s over';
        modalRef.componentInstance.customMessage = 'Betting time for this event is over.';
        modalRef.componentInstance.description = 'No more Players can join now.';
        modalRef.componentInstance.nameButton = 'fine';
      }
    }
  }

  setToDB(answer, transactionHash, currencyType) {
    let data = {
      event_id: answer.event_id,
      date: new Date(),
      answer: answer.answer,
      transactionHash: transactionHash,
      userId: this.userData._id,
      currencyType: currencyType,
      amount: Number(answer.amount)
    };
    this.answerSub = this.postService.post('publicEvents/participate', data).subscribe(async () => {
        this.myAnswers.answered = true;
        this.updateUser();
        this.callGetData.next();
        this.updateBalance();
      },
      (err) => {
        console.log(err);
        let modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
        modalRef.componentInstance.errType = 'error';
        modalRef.componentInstance.title = 'Unknown Error';
        modalRef.componentInstance.customMessage = String(err);
        modalRef.componentInstance.description = 'Report this unknown error to get 1 BET token!';
        modalRef.componentInstance.nameButton = 'report error';
      });
  }

  async setToNetworkValidation(answer, dataAnswer) {

    let contract = new Contract();
    var _question_id = dataAnswer.id;
    var _whichAnswer = answer.answer;
    let contr = await contract.publicEventContract();
    let validator = await contr.methods.setTimeValidator(_question_id).call();

    if (Number(validator) == 0) {
      let sendToContract = await contract.validateOnPublicEvent(_question_id, _whichAnswer, this.allUserData.wallet, this.allUserData.verifier);
      this.setToDBValidation(answer, dataAnswer, sendToContract.transactionHash);
    } else if (Number(validator) == 1) {
      let modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
      modalRef.componentInstance.errType = 'time';
      modalRef.componentInstance.title = 'Validation time’s not start';
      modalRef.componentInstance.customMessage = 'Validation time for this event not start';
      modalRef.componentInstance.description = 'Expert can join when validating time is start';
      modalRef.componentInstance.nameButton = 'fine';
    } else if (Number(validator) == 2) {
      let modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
      modalRef.componentInstance.errType = 'time';
      modalRef.componentInstance.title = 'Validation time’s over';
      modalRef.componentInstance.customMessage = 'Validation time for this event is over, ';
      modalRef.componentInstance.description = 'No more Experts can join now.';
      modalRef.componentInstance.nameButton = 'fine';
    } else if (Number(validator) == 3) {
      let modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
      modalRef.componentInstance.errType = 'error';
      modalRef.componentInstance.title = 'You participated in this event.';
      modalRef.componentInstance.customMessage = 'You have been like the participant in this event. ';
      modalRef.componentInstance.description = 'The participant can\'t be the Experts.';
      modalRef.componentInstance.nameButton = 'fine';
    }
  }

  setToDBValidation(answer, dataAnswer, transactionHash) {
    let data = {
      event_id: answer.event_id,
      date: new Date(),
      answer: answer.answer,
      transactionHash: transactionHash,
      userId: this.userData._id,
      currencyType: dataAnswer.currencyType,
      validated: dataAnswer.validated + 1
    };
    this.validSub = this.postService.post('publicEvents/validate', data).subscribe(async () => {
        this.myAnswers.answered = true;
        this.callGetData.next();
        this.updateBalance();
      },
      (err) => {
        console.log(err);
        let modalRef = this.modalService.open(QuizErrorsComponent, {centered: true});
        modalRef.componentInstance.errType = 'error';
        modalRef.componentInstance.title = 'Unknown Error';
        modalRef.componentInstance.customMessage = String(err);
        modalRef.componentInstance.description = 'Report this unknown error to get 1 BET token!';
        modalRef.componentInstance.nameButton = 'report error';
      });
  }

  async updateBalance() {
    let web3 = new Web3(this.allUserData.verifier === 'metamask' ? window.web3.currentProvider : web3Obj.torus.provider);
    let mainBalance = await web3.eth.getBalance(this.userData.wallet);

    let matic = new maticInit(this.allUserData.verifier);
    let MTXToken = await matic.getMTXBalance();
    let TokenBalance = await matic.getERC20Balance();

    let maticTokenBalanceToEth = web3.utils.fromWei(MTXToken, 'ether');
    let mainEther = web3.utils.fromWei(mainBalance, 'ether');
    let tokBal = web3.utils.fromWei(TokenBalance, 'ether');

    this.store.dispatch(new CoinsActios.UpdateCoins({
      loomBalance: maticTokenBalanceToEth,
      mainNetBalance: mainEther,
      tokenBalance: tokBal
    }));
    this.coinInfo.loomBalance = maticTokenBalanceToEth;
    this.coinInfo.tokenBalance = tokBal;
  }

  updateUser() {
    let data = {
      id: this.allUserData._id
    };
    this.updateSub = this.postService.post('user/getUserById', data)
      .subscribe(
        (currentUser: User) => {
          this.store.dispatch(new UserActions.UpdateUser({
            _id: currentUser._id,
            email: currentUser.email,
            nickName: currentUser.nickName,
            wallet: currentUser.wallet,
            listHostEvents: currentUser.listHostEvents,
            listParticipantEvents: currentUser.listParticipantEvents,
            listValidatorEvents: currentUser.listValidatorEvents,
            historyTransaction: currentUser.historyTransaction,
            avatar: currentUser.avatar,
            verifier: currentUser.verifier
          }));
        });
  }

  finalAnswerGuard(question) {
    if (question.finalAnswer !== null || question.status == 'reverted') {
      return true;
    } else if (this.myAnswers.answer != undefined && this.myAnswers.answered) {
      return true;
    } else {
      return false;
    }
  }

  timeValidating(question) {
    const timeNow = Number((Date.now() / 1000).toFixed(0));
    return question.endTime - timeNow > 0;
  }

  cardColorBackGround(data) {
    if (data.finalAnswer !== null) {
      if (this.userData != undefined) {
        if (data.host.id === this.userData._id) {
          return {'background': 'rgb(255, 248, 206)'};
        } else {
          return this.backgroundColorEventFinish(data);
        }
      } else {
        return this.backgroundColorEventFinish(data);
      }
    } else if (data.status == 'reverted') {
      return {'background': '#F4F4F4'};
    } else {
      return {'background': '#E6FFF2'};
    }
  }

  backgroundColorEventFinish(data) {
    if (data.finalAnswer != this.myAnswers.answer && this.myAnswers.answer != undefined) {
      return {'background': '#FFEDED'};
    } else {
      return {'background': '#F4F4F4'};
    }
  }

  eventFinishDate(data) {
    let d = new Date(Number(data.eventEnd) * 1000);
    return `${d.getDate()}/${Number(d.getMonth()) + 1}/${d.getFullYear()}`;
  }

  colorForRoom() {
    if (this.question) {
      return {
        'background': this.question.room.color
      };
    } else {
      return;
    }
  }

  getCommentById(id: any) {
    this.commentIdEmmit.emit(id);
  }

  getValidatorsAmount(q) {
    return q.validatorsAnswers == undefined ? 0 : q.validatorsAnswers.length;
  }

  calculatedJoiner(a, b) {
    if (a !== undefined && b !== undefined) {
      return a.length + b.length;
    }
    if (a === undefined && b !== undefined) {
      return b.length;
    }
    if (a !== undefined && b === undefined) {
      return a.length;
    }
    if (a === undefined && b === undefined) {
      return 0;
    }
  }

  openDetails() {
    if (this.openIndex == this.index) {
      this.openIndex = null;
    } else {
      this.openIndex = this.index;
    }
  }


  cancel() {
    this.details = false;
    this.joinPlayer = false;
    this.becomeExpert = false;
  }

  continue() {
    this.letsBet = true;
    this.details = false;
  }

  joinAsPlayer() {
    this.joinPlayer = true;
    this.details = true;
  }

  becomeValidator() {
    this.becomeExpert = true;
    this.details = true;
  }

  goToInfo() {
    this.letsBet = false;
    this.details = true;
  }

  viewDetails() {
    if (this.question.status != 'reverted') {
      if (this.openIndex == this.index) {
        this.openIndex = null;
        this.viewEventFinishInfo = false;
      } else {
        this.openIndex = this.index;
        this.viewEventFinishInfo = true;
      }
    }
  }

  roomCardBottom() {
    if (this.openIndex != this.index) {
      return {
        'border-top-left-radius': '0px',
        'border-top-right-radius': '20px',
        'border-bottom-left-radius': '0px',
        'border-bottom-right-radius': '20px',
      };
    } else {
      return {
        'border-top-left-radius': '0px',
        'border-top-right-radius': '20px',
        'border-bottom-left-radius': '20px',
        'border-bottom-right-radius': '20px',
      };
    }
  }

  copyToClickBoard(eventId) {
    this.copyLinkFlag = true;
    const href = window.location.hostname;
    const path = href === 'localhost' ? 'http://localhost:4200' : href;
    this._clipboardService.copy(`${path}/public_event/${eventId}`);
    setTimeout(() => {
      this.copyLinkFlag = false;
    }, 500);
  }

  ngOnDestroy() {
    if (this.torusSub) {
      this.torusSub.unsubscribe();
    }
    if (this.answerSub) {
      this.answerSub.unsubscribe();
    }
    if (this.validSub) {
      this.validSub.unsubscribe();
    }
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
  }
}
