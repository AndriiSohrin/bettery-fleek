export interface PubEventMobile {
  answerAmount: number;
  answers: object[];
  currencyType: string;
  endTime: number;
  eventEnd: number;
  finalAnswer: any;
  host: {
    id: number;
    nickName: string;
    avatat: string;
    wallet: string;
  };
  id: number;
  parcipiantAnswers: ParcipiantAnswers[];
  question: string;
  room: {
    id: number;
    name: string;
    color: string;
    owner: number;
  };
  startTime: number;
  status: string;
  transactionHash: string;
  validatorsAmount: number;
  validatorsAnswers: ValidatorsAnswers[];
}

interface ParcipiantAnswers {
  amount: number;
  answer: number;
  avatar: string;
  date: number;
  transactionHash: string;
  userId: number;
}

interface ValidatorsAnswers {
  answer: number;
  avatar: string;
  date: number;
  transactionHash: string;
  userId: number;
}
