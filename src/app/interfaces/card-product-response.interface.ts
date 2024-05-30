export interface CardProductResponse {
  rqUID: string;
  cardRec: CardRec[];
  status: Status;
  recCtrlOut: RecCtrlOut;
}

export interface RecCtrlOut {
  cursor?: any;
  subseqRec: boolean;
}

export interface Status {
  severity: string;
  serverStatusCode?: any;
  statusDesc: string;
  additionalStatus: AdditionalStatus[];
  statusCode: string;
}

export interface AdditionalStatus {
  addServerStatusCode?: any;
  addStatusCode: string;
  addSeverity: string;
  addStatusDesc: string;
}

export interface CardRec {
  cardStatus: CardStatus;
  cardInfo: CardInfo;
}

export interface CardInfo {
  intAPR?: any;
  previousExpirationDt?: any;
  expDt: string;
  cardEmbossCode: string;
  cardNum: string;
  cardCategoryCode: string;
  cardTrnLimit: CardTrnLimit[];
  acctRef: AcctRef;
  curCode: CurCode;
  closeStmtDt?: any;
  brand: string;
  noRenewInd?: any;
  directDebitInd?: any;
  partyCardRelType: string;
  seqNum: number;
  directDebitData?: any;
  cardSeqNum?: any;
  cardSubType: string;
  cardType: string;
  cardMagData?: any;
  cardCategoryDesc: string;
  cardPeriodData?: any;
  cardEmbossName: string;
  previousCardNum?: any;
  openDt?: any;
  cardSubTypeCode: string;
  fiData?: any;
  partyKeys: PartyKeys;
  desc: string;
}

export interface PartyKeys {
  partyId: string;
}

export interface CurCode {
  curCodeValue: string;
  curCodeType: string;
}

export interface AcctRef {
  acctId: string;
  acctInfo: AcctInfo;
}

export interface AcctInfo {
  creditAcctData?: any;
  openDt: string;
  productIdent: string;
  fiData: FiData;
  relAcctKeys?: any;
  curCode?: any;
  countSeqNum?: any;
  subProductIdent: string;
  closeStmtDt?: any;
  clabe?: any;
  acctBal: AcctBal[];
  desc?: any;
}

export interface AcctBal {
  curAmt: CurAmt;
  balType: BalType;
}

export interface BalType {
  balTypeValues: string;
}

export interface FiData {
  fiIdent: string;
  branchIdent: string;
}

export interface CardTrnLimit {
  trnType: TrnType;
  curAmt: CurAmt;
  limitType: string;
  limitCount?: any;
  trnSrc?: any;
}

export interface CurAmt {
  amt: string;
  amtType?: any;
  curCode?: any;
}

export interface TrnType {
  trnTypeValue: string;
}

export interface CardStatus {
  issueStatusCode: string;
  blockCode: BlockCode;
  enrollBlockStatusCode: string;
  enrollBlockClosedDt?: any;
  enrollBlockOpenDt?: any;
}

export interface BlockCode {
  blockReasonCode: string;
  blockReason?: any;
  blockOperInd: boolean;
  blockDt?: any;
  desc?: any;
  blockRevInd: boolean;
}
