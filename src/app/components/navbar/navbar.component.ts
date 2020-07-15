import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { Coins } from '../../models/Coins.model';
import * as CoinsActios from '../../actions/coins.actions';
import * as UserActions from '../../actions/user.actions';
import * as InvitesAction from '../../actions/invites.actions';
import { RegistrationComponent } from '../registration/registration.component';
import maticInit from '../../contract/maticInit.js'

import Web3 from 'web3';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PostService } from '../../services/post.service';
import { GetService } from '../../services/get.service';
import { faReply, faShare } from '@fortawesome/free-solid-svg-icons';
import _ from "lodash";
import Contract from '../../contract/contract';
import web3Obj from '../../helpers/torus'




@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent implements OnInit, OnDestroy {

  nickName: string = undefined;
  fakeCoins: number;
  web3: Web3 | undefined = null;
  coinInfo: Coins = null;
  depositAmount: number = 0;
  withdrawalAmount: number = 0;
  depositError: string = undefined;
  withdrawalError: string = undefined;
  amountSpinner: boolean = true;
  depositSpinner: boolean = false;
  withdrawalSpinner: boolean = false;
  activeTab: string = undefined;
  userWallet: string = undefined;
  userId: number;
  UserSubscribe;
  CoinsSubscribe;
  invitationQuantity = null;
  userHistory: any = []
  faReply = faReply
  faShare = faShare
  loadMore = false
  avatar;
  holdBalance: any = 0;
  ERC20Coins: any = [];
  ERC20depositError: string = undefined;
  ERC20depositAmount: number = 0;
  ERC20withdrawalError: string = undefined;
  ERC20withdrawalAmount: number = 0;
  verifier: string = undefined;

  constructor(
    private store: Store<AppState>,
    private modalService: NgbModal,
    private postService: PostService,
    private getService: GetService
  ) {

    this.store.select("user").subscribe((x) => {
      if (x.length !== 0) {
        this.nickName = x[0].nickName;
        this.userWallet = x[0].wallet;
        this.verifier = x[0].verifier
        this.avatar = x[0].avatar;
        this.userId = x[0]._id;
        this.fakeCoins = x[0].fakeCoins;
        this.activeTab = "eventFeed"

        let historyData = _.orderBy(x[0].historyTransaction, ['date'], ['desc']);
        console.log(historyData)
        this.getHistoryUsers(historyData)
        this.getInvitation()
        this.updateBalance()
      }
    });

    this.store.select("coins").subscribe((x) => {
      if (x.length !== 0) {
        this.coinInfo = x[0];
        this.getMoneyHolder();
      }
    })

    this.store.select("invites").subscribe((x) => {
      if (x.length !== 0) {
        this.invitationQuantity = x[0].amount
      }
    })
  }

  getHistoryUsers(data) {
    if (data === undefined) {
      this.userHistory = []
      this.loadMore = false
    } else {
      let z = data.map((x) => {
        return {
          date: Number((new Date(x.date).getTime() * 1000).toFixed(0)),
          amount: x.amount.toFixed(4),
          currencyType: x.currencyType,
          paymentWay: x.paymentWay,
          eventId: x.eventId,
          role: x.role
        }
      })
      if (z.length > 5) {
        this.loadMore = true
        this.userHistory = z.slice(0, 5)
      } else {
        this.loadMore = true
        this.userHistory = z;
      }
    }
  }

  getInvitation() {
    let data = {
      id: this.userId
    }
    this.postService.post("my_activites/invites", data)
      .subscribe(async (x: any) => {
        let amount = x.length
        this.store.dispatch(new InvitesAction.UpdateInvites({ amount: amount }));
      })
  }

  ngOnInit() {
    let interval = setInterval(async () => {
      if (this.userWallet !== undefined && this.verifier === "metamask") {
        let checkSelectedAddress = await window.web3.currentProvider.selectedAddress
        if (checkSelectedAddress !== this.userWallet) {
          this.store.dispatch(new UserActions.RemoveUser(0));
          this.nickName = undefined;
          this.userWallet = undefined;
          clearImmediate(interval);
        }
      }
    }, 500)

  }

  depositGuard() {
    if (!this.amountSpinner) {
      return true
    } else {
      return false
    }
  }

  setActiveTab(data) {
    this.activeTab = data;
  }

  async updateBalance() {
    let gorliProvider = new Web3(this.verifier === "metamask" ? window.web3.currentProvider : web3Obj.torus.provider);
    let mainBalance = await gorliProvider.eth.getBalance(this.userWallet);

    let matic = new maticInit(this.verifier);
    let MTXToken = await matic.getMTXBalancePOS();
    let TokenBalance = await matic.getERC20Balance();

    let contract = new Contract();
    let token = await contract.tokenContractMainETH(this.verifier)
    let avaliableTokens = await token.methods.balanceOf(this.userWallet).call();

    let web3 = new Web3();
    let maticTokenBalanceToEth = web3.utils.fromWei(MTXToken, "ether");
    let mainEther = web3.utils.fromWei(mainBalance, "ether")
    let tokBal = web3.utils.fromWei(TokenBalance, "ether")
    let avalTok = web3.utils.fromWei(avaliableTokens, "ether")

    this.ERC20Coins.mainNetBalance = avalTok;
    this.ERC20Coins.loomBalance = tokBal

    this.store.dispatch(new CoinsActios.UpdateCoins({
      loomBalance: maticTokenBalanceToEth,
      mainNetBalance: mainEther,
      tokenBalance: tokBal
    }))
    this.amountSpinner = false;
  }

  async getMoneyHolder() {
    let contract = new Contract()
    let contr = await contract.quizContract(this.verifier);
    let holdBalance = Number(await contr.methods.onHold().call());
    if (holdBalance > 0) {
      let web3 = new Web3();
      this.holdBalance = Number(web3.utils.fromWei(String(holdBalance), 'ether')).toFixed(4);
      this.getEthPrice(this.holdBalance);
    } else {
      this.holdBalance = holdBalance;
      this.amountSpinner = false;
    }
  }

  async getEthPrice(_holdBalance) {
    this.getService.get("eth_price").subscribe((price: any) => {
      let priceData = price.price;
      this.holdBalance = (_holdBalance * priceData).toFixed(4);
      this.amountSpinner = false;
    })
  }


  registrationModal() {
    this.modalService.open(RegistrationComponent);
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    this.updateBalance()
  }


  changeInput() {
    this.depositError = undefined;
    this.ERC20depositError = undefined;
  }

  changeWithdrawal() {
    this.withdrawalError = undefined;
    this.ERC20withdrawalError = undefined;
  }

  async deposit() {
    if (this.depositAmount > 0) {
      if (Number(this.depositAmount) > Number(this.coinInfo.mainNetBalance)) {
        this.depositError = "You don't have enough money"
      } else {
        this.depositSpinner = true;
        let web3 = new Web3()
        var value = web3.utils.toWei(this.depositAmount.toString(), 'ether')
        let matic = new maticInit(this.verifier);
        let response = await matic.depositPOSEth(value);
        console.log(response);
        if (response.message === undefined) {
          this.modalService.dismissAll()
          this.depositSpinner = false;
        } else {
          this.depositSpinner = false;
          this.depositError = response.message
        }
      }
    } else {
      this.depositError = "Must be more than zero"
    }
  }

  async withdrawal() {
    if (this.withdrawalAmount > 0) {
      if (Number(this.withdrawalAmount) > Number(this.coinInfo.loomBalance)) {
        this.withdrawalError = "You don't have enough money in Loom network"
      } else {
        this.withdrawalSpinner = true;
        let web3 = new Web3()
        var value = web3.utils.toWei(this.withdrawalAmount.toString(), 'ether');
        let matic = new maticInit(this.verifier);
        let withdrawal = await matic.withdrawETH(value, true)
        console.log(withdrawal);
        if (withdrawal.transactionHash !== undefined) {
          let data = {
            userId: this.userId,
            transactionHash: withdrawal.transactionHash,
            amount: value,
            coinType: "ether"
          }
          this.postService.post("withdrawal/init", data)
            .subscribe(async (x: any) => {
              this.modalService.dismissAll()
              this.withdrawalSpinner = false;
            }, (err) => {
              console.log(err);
              this.withdrawalSpinner = false;
              this.withdrawalError = err
            })
        } else {
          this.withdrawalSpinner = false;
          this.withdrawalError = withdrawal.message
        }
      }
    } else {
      this.withdrawalError = "Must be more than zero"
    }
  }

  async depositERC20() {
    if (this.ERC20depositAmount > 0) {
      if (Number(this.ERC20depositAmount) > Number(this.ERC20Coins.mainNetBalance)) {
        this.ERC20depositError = "You don't have enough tokens in Ethereum network"
      } else {
        this.depositSpinner = true;
        let web3 = new Web3()
        var value = web3.utils.toWei(this.ERC20depositAmount.toString(), 'ether')
        let matic = new maticInit(this.verifier);
        let response = await matic.depositERC20Token(value)
        if (response === null) {
          this.modalService.dismissAll()
          this.depositSpinner = false;
        } else {
          this.depositSpinner = false;
          this.ERC20depositError = response.message
        }
        console.log(response);
      }
    } else {
      this.ERC20depositError = "Value must be more that 0"
    }
  }

  async withdrawalERC20() {
    if (this.ERC20withdrawalAmount > 0) {
      if (Number(this.ERC20withdrawalAmount) > Number(this.ERC20Coins.loomBalance)) {
        this.ERC20withdrawalError = "You don't have enough tokens in Ethereum network"
      } else {
        this.withdrawalSpinner = true;
        let web3 = new Web3()
        var value = web3.utils.toWei(this.ERC20withdrawalAmount.toString(), 'ether');
        let matic = new maticInit(this.verifier);
        let withdrawal = await matic.withdrawalERC20Token(value, false)
        if (withdrawal.transactionHash !== undefined) {
          let data = {
            userId: this.userId,
            transactionHash: withdrawal.transactionHash,
            amount: value,
            coinType: "token"
          }
          this.postService.post("withdrawal/init", data)
            .subscribe(async (x: any) => {
              this.modalService.dismissAll()
              this.withdrawalSpinner = false;
            }, (err) => {
              console.log(err);
              this.withdrawalSpinner = false;
              this.ERC20withdrawalError = err
            })
        } else {
          this.withdrawalSpinner = false;
          this.ERC20withdrawalError = withdrawal.message
        }
      }
    } else {
      this.ERC20withdrawalError = "Value must be more that 0"
    }
  }


  ngOnDestroy() {
    this.UserSubscribe.unsubscribe();
    this.CoinsSubscribe.unsubscribe();
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    this.logOut()
  }

  async logOut() {
    if (this.userWallet !== undefined && this.verifier !== "metamask") {
      await web3Obj.torus.cleanUp()
    }
    this.store.dispatch(new UserActions.RemoveUser(0));
    this.nickName = undefined;
  }

}
