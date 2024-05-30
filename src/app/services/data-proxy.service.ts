import { Injectable, Output, EventEmitter } from '@angular/core';
import {
  UserModel,
  QuestionsModel,
  MoveModel,
  StateModel,
  LoaderModel,
  SubcategoryModel,
  CreditCardFullDataModel,
  ResponseModel,
  MotiveModel
} from '../models';
import * as _ from 'lodash';

import { ConstantsService } from './constants.service';

/**
 * DataProxyService that mantains all the app info
 * guarda en sesion la informacion usada en la aplicacion
 *
 * @class DataProxyService
 */
@Injectable({
  providedIn: 'root'
})
export class DataProxyService {

  @Output() questionsStatusService: EventEmitter<string>;

  public chanel = 'default';
  public noLock = false;
  public dummyMode = false;
  public creditCardFullData: CreditCardFullDataModel = null;
  public accessToken = '';
  public rawData: any = {};
  public userData: UserModel = null;
  public categories: string[] = [];
  public subcategories: SubcategoryModel[] = [];
  public states: StateModel[] = [];
  public transactions: any = {};
  public responseDAO: ResponseModel;
  public questions: QuestionsModel = new QuestionsModel();
  // Working with concurrent selected data
  public dataSource: MoveModel[] = [];
  // Show selected data on menu on selection data pressed
  public dataSelected: MoveModel[] = [];
  public loader: LoaderModel;
  public ccData: any = {};
  public enviroment = '';
  public motive: MotiveModel = null;
  public idToken = '';
  public pan = '';
  public buc = '';
  public oldCard = '';

  /**
   * Creates an instance of DataProxyService.
   * @param {ConstantsService} constantsService
   * @memberof DataProxyService
   */
  constructor(
    public constantsService: ConstantsService
  ) {
  }

  /**
   * returns the chanel of the app
   *
   * @returns
   * @memberof DataProxyService
   */
  public getChannel() {
    return this.chanel;
  }

  /**
   * Set the chanel that allows the app
   *
   * @param {string} v
   * @memberof DataProxyService
   */
  public setChannel(v: string): void {
    this.chanel = v;
  }

  /**
   * Get the lock card flag
   *
   * @returns
   * @memberof DataProxyService
   */
  public getNoLock() {
    return this.noLock;
  }


  /**
   * set the lock card flag
   *
   * @param {boolean} v
   * @memberof DataProxyService
   */
  public setNoLock(v: boolean): void {
    this.noLock = v;
  }

  /**
   * Get the Token
   *
   *
   * @returns
   * @memberof DataProxyService
   */
  public getIdToken() {
    return this.idToken;
  }

  /**
   * Set the token
   *
   *
   *
   * @param {string} v
   * @memberof DataProxyService
   */
  public setIdToken(v: string): void {
    this.idToken = v;
  }

  /**
   * Get the PAN
   *
   *
   * @returns
   * @memberof DataProxyService
   */
  public getPan() {
    return this.pan;
  }

  /**
   * Set the PAN
   *
   *
   * @param {string} v
   * @memberof DataProxyService
   */
  public setPan(v: string): void {
    this.pan = v;
  }

  /**
   * Get the BUC
   *
   *
   * @returns
   * @memberof DataProxyService
   */
  public getBuc() {
    return this.buc;
  }

  /**
   * Set the BUC
   *
   *
   * @param {string} v
   * @memberof DataProxyService
   */
  public setBuc(v: string): void {
    this.buc = v;
  }

  /**
   * Get the dummy mode
   *
   *
   * @returns
   * @memberof DataProxyService
   */
  public getDummyMode() {
    return this.dummyMode;
  }

  /**
   * Set the dummy mode
   *
   *
   * @param {boolean} v
   * @memberof DataProxyService
   */
  public setDummyMode(v: boolean): void {
    this.dummyMode = v;
  }

  /**
   * Get the access token
   *
   *
   * @returns
   * @memberof DataProxyService
   */
  public getAccessToken() {
    return this.accessToken;
  }

  /**
   * Set the access token
   *
   *
   * @param {string} v
   * @memberof DataProxyService
   */
  public setAccessToken(v: string): void {
    this.accessToken = v;
  }

  /**
   * Get the CC Data
   *
   *
   * @returns
   * @memberof DataProxyService
   */
  public getCCData() {
    return this.ccData;
  }

  /**
   * Set the CC Data
   *
   *
   * @param {*} v
   * @memberof DataProxyService
   */
  public setCCData(v): void {
    this.ccData = v;
    this.setCreditCardFullData(v);
  }

  /**
   * Set the Credit Card full data
   * parsea el objeto recibido al modelo ccdata
   * que es lo que la aplicacion necesita
   *
   * @param {*} v
   * @memberof DataProxyService
   */
  public setCreditCardFullData(v: any): void {
    if (!_.isUndefined(v.cardRec)) {
      this.creditCardFullData = new CreditCardFullDataModel(
        v.cardRec.cardInfo.cardNum,
        v.cardRec.cardInfo.partyKeys.partyId,
        v.cardRec.cardInfo.acctRef.acctId,
        v.cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
        v.cardRec.cardInfo.brand,
        v.cardRec.cardInfo.cardEmbossName,
        // this.getBalance('OUTSTANDING'),
        parseFloat(v.cardRec.cardInfo.acctRef.acctInfo.acctBal[0].curAmt.amt),
        this.getBalance('MINPAYMENT'),
        v.cardRec.cardInfo.closeStmtDt,
        v.cardRec.cardInfo.cardType,
        this.getLimit('MAX'),
        v.cardRec.cardInfo.acctRef.acctInfo.desc,
        v.cardRec.cardInfo.acctRef.acctInfo.productIdent
      );
    }
  }

  /**
   * Get the Credit Card full data
   * regresa la informacion de la tarjeta en base a los datos de sesion
   * hace es casteo a el modelo de ccdata
   *
   * @returns {CreditCardFullDataModel}
   * @memberof DataProxyService
   */
  public getCreditCardFullData(): CreditCardFullDataModel {
    if (this.getCCData()) {
      const v: any = this.getCCData();
      if (!Object.keys(v).length) {
        return null;
      }
      const ret: CreditCardFullDataModel = new CreditCardFullDataModel(
        v.cardRec.cardInfo.cardNum,
        v.cardRec.cardInfo.partyKeys.partyId,
        v.cardRec.cardInfo.acctRef.acctId,
        v.cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
        v.cardRec.cardInfo.brand,
        v.cardRec.cardInfo.cardEmbossName,
        // this.getBalance('OUTSTANDING'),
        parseFloat(v.cardRec.cardInfo.acctRef.acctInfo.acctBal[0].curAmt.amt),
        this.getBalance('MINPAYMENT'),
        v.cardRec.cardInfo.closeStmDt,
        v.cardRec.cardInfo.cardType,
        this.getLimit('MAX'),
        v.cardRec.cardInfo.acctRef.acctInfo.desc,
        v.cardRec.cardInfo.acctRef.acctInfo.productIdent
      );
      this.creditCardFullData = ret;
      return ret;
    } else {
      return null;
    }
  }

  /**
   * calcula el limite de credito en base a los datos de sesion
   * el tipo es el campo a buscar
   * returns the credit limit
   *
   * @param {string} type
   * @returns {number}
   * @memberof DataProxyService
   */
  public getLimit(type: string): number {
    let res = 0;
    const full: any = this.getCCData();
    const v: any = full.cardRec.cardInfo.cardTrnLimit;
    _.forEach(v, (item: any) => {
      if (item.limitType.toUpperCase() === type) {
        res = parseFloat(item.curAmt.amt);
      }
    });
    return res;
  }

  /**
   * Set the user data
   * guarda los datos del usuario
   *
   *
   * @param {UserModel} v
   * @memberof DataProxyService
   */
  public setUserData(v: UserModel): void {
    this.userData = v;
  }

  /**
   * Get the user data
   *
   *
   *
   * @returns {*}
   * @memberof DataProxyService
   */
  public getUserData(): any {
    return this.userData;
  }

  /**
   * Get the user extracts
   *
   *
   *
   * @returns {*}
   * @memberof DataProxyService
   */
  public getUserExtracts(): any {
    return this.userData.extracts;
  }

  /**
   * Set raw data
   *
   *
   * @param {*} v
   * @memberof DataProxyService
   */
  public setRawData(v): void {
    this.rawData = v;
  }

  /**
   * set the datasource
   *
   * @param {Array<MoveModel>} v
   * @memberof DataProxyService
   */
  public setDataSource(v: MoveModel[]): void {
    this.dataSource = v;
  }

  /**
   * returns the selected moves
   *
   * @returns {*}
   * @memberof DataProxyService
   */
  public getDataSelected(): any {
    if (!this.dataSource) {
      return null;
    } else {
      return this.dataSource;
    }
  }

  /**
   * set the states of the rest service
   *
   * @param {Array<StateModel>} v
   * @memberof DataProxyService
   */
  public setStates(v: StateModel[]): void {
    this.states = v;
  }

  /**
   * returns the states array of the rest service
   *
   * @returns
   * @memberof DataProxyService
   */
  public getStates() {
    return this.states;
  }

  /**
   * returns the id of the state selected
   *
   * @param {string} desc
   * @returns {number}
   * @memberof DataProxyService
   */
  public getStateID(desc: string): number {
    let ret: StateModel = null;
    _.each(this.getStates(), (o: StateModel) => {
      if (o.nombre.toLowerCase() === desc.toLowerCase()) {
        ret = o;
      }
    });
    return ret.clave;
  }

  /**
   *
   * returns the categories catalog
   *
   * @returns
   * @memberof DataProxyService
   */
  public getCategories() {
    return this.categories;
  }

  /**
   * set the categories catalog
   *
   * @param {*} v
   * @memberof DataProxyService
   */
  public setCategories(v: any) {
    if (!this.categories) {
      this.categories = [];
      _.each(v.content, (item: any) => {
        const title: string = item.categoryrn.Name.toString();
        if (title.lastIndexOf('.') !== title.length) {
          this.categories.push(title);
        }
      });
    }
  }

  /**
   * returns the subcategories catalog
   *
   * @returns
   * @memberof DataProxyService
   */
  public getSubcategories() {
    return this.subcategories;
  }

  /**
   * format and set the subcategories
   *
   * @param {*} v
   * @memberof DataProxyService
   */
  public setSubcategories(v: any) {
    if (!this.subcategories) {
      this.subcategories = [];
      _.each(v.content, (item: any) => {
        const subcat: SubcategoryModel = item.subcategoryrn;
        const title: string = subcat.category;
        if (title.lastIndexOf('.') !== title.length) {
          this.subcategories.push(subcat);
        }
      });
    }
  }

  /**
   * set the selected data
   *
   * @param {Array<MoveModel>} v
   * @memberof DataProxyService
   */
  public dataSourceSelected(v: MoveModel[]) {
    this.dataSource = v;
  }

  /**
   * if the data exists returns the length
   *
   * @returns
   * @memberof DataProxyService
   */
  public getSelectedCount() {
    if (this.dataSource) {
      return this.dataSource.length;
    } else {
      return 0;
    }
  }

  /**
   * returns the array of questions solved
   *
   *
   * @returns
   * @memberof DataProxyService
   */
  public getQuestions() {
    return this.questions;
  }

  /**
   * set questions solved
   *
   * @param {QuestionsModel} v
   * @memberof DataProxyService
   */
  public setQuestions(v: QuestionsModel) {
    this.questions = v;
  }

  /**
   * returns the loader flag
   *
   * @returns {LoaderModel}
   * @memberof DataProxyService
   */
  public getLoader(): LoaderModel {
    return this.loader;
  }

  /**
   * set the loader flag
   *
   * @param {LoaderModel} loader
   * @memberof DataProxyService
   */
  public setLoader(loader: LoaderModel): void {
    this.loader = loader;
  }

  /**
   * returns the status of the emmiter event in questions
   *
   * @returns {EventEmitter<string>}
   * @memberof DataProxyService
   */
  public getQuestionsStatusService(): EventEmitter<string> {
    if (!this.questionsStatusService) {
      this.questionsStatusService = new EventEmitter(true);
    }
    return this.questionsStatusService;
  }

  /**
   * set the initial status of the response
   *
   * @param {*} v
   * @memberof DataProxyService
   */
  public setResponseDAO(v): void {
    this.responseDAO = v;
  }

  /**
   * returns the actual status of the response
   *
   * @returns {ResponseModel}
   * @memberof DataProxyService
   */
  public getResponseDAO(): ResponseModel {
    if (!this.responseDAO) {
      this.responseDAO = new ResponseModel();
    }
    return this.responseDAO;
  }

  /**
   * removes all the persistence
   *
   *
   * @memberof DataProxyService
   */
  public cleanData() {
    /*this.persistenceService.remove('dataSource');
    this.persistenceService.remove('dataSelected');
    this.persistenceService.remove('questions');
    this.persistenceService.remove('userData');*/
    this.dataSource = null;
    this.dataSelected = null;
    this.questions = null;
  }

  /**
   * returns the enviroment where is the app
   *
   * @returns
   * @memberof DataProxyService
   */
  public getEnviroment() {
    return this.enviroment;
  }

  /**
   * set the app enviroment where is running
   *
   * @param {*} enviroment
   * @memberof DataProxyService
   */
  public setEnviroment(enviroment) {
    console.log('setEnviroment ' + enviroment);
    this.enviroment = enviroment;
  }

  /**
   * Get the old card or the locked card
   *
   *
   * @returns {string}
   * @memberof DataProxyService
   */
  public getOldCard(): string {
    return this.oldCard;
  }

  /**
   * Set the locked card
   *
   *
   *
   * @param {string} v
   * @memberof DataProxyService
   */
  public setOldCard(v: string): void {
    const l: number = v.length;
    this.oldCard = v.substring(l - 4, l);
  }

  /**
   * returns the cbalance rule
   *
   * @private
   * @param {string} type
   * @returns {number}
   * @memberof DataProxyService
   */
  private getBalance(type: string): number {
    let res = 0;
    const full: any = this.getCCData();
    const v: any = full.cardRec.cardInfo.acctRef.acctInfo.acctBal;
    _.forEach(v, (item: any) => {
      if (item.balType) {
        if (item.balType.balTypeValues.toUpperCase() === type) {
          res = parseFloat(item.curAmt.amt);
        }
      }

    });
    return res;
  }
}
