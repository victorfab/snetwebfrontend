import { Injectable } from "@angular/core";
import * as _ from "lodash";
import packageInfo from "../../../package.json";
import { Tag, TagEvent } from "../interfaces/tagging.interface";
import { SessionStorageService } from "./../services/tdd/session-storage.service";
import { Router } from "@angular/router";

/**
 * Window interface for the TypeScript compiler
 */
declare global {
  interface Window {
    ga: any;
    utag_data: any;
    dataLayer: any[];
    utag: any;
    MSStream: any;
  }
}

/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */
function getMobileOperatingSystem() {
  let userAgent = navigator.userAgent || navigator.vendor;
  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) return "Windows Phone";
  if (/android/i.test(userAgent)) return "Android";
  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";
  return "web";
}

/**
 * Tagging:
 *
 * @class TaggingService
 */
@Injectable()
export class TaggingService {

  private tagModel: Tag = {
    tag_tipoSitio: "Privado",
    tag_idiomaPagina: "Espanol",
    tag_canalBanco: "Aclaraciones",
    tag_section: "aclaraciones", //section*
    tag_subsection1: "", //subsection1*
    tag_subsection2: "",
    tag_subsection3: "",
    tag_titulo: "", //pagename
    tag_url: "", //URL amigable
    tag_versionApp: packageInfo.version, // Se debe colocar la versión de la aplicacion.
    tag_marcaDispositivo: [], // Se colocar la marca del dispositivo.
    tag_Sistema_operativo: [""], // Se debe colocar el user id homologado.
    tag_tipoDispositivo: ["Movil"], // Se debe colocar el user id homologado.
    tag_userId: [""], // Se debe colocar el user id homologado.
    tag_aclaracion: [""],
    tag_tipoDeTarjeta: [""],
    tag_procedencia: [""],
    tag_proceso: [],
    tag_tipoUsuario: "",
    event: "pageview",
    tag_entorno: ""
  };

  constructor(private storage: SessionStorageService,
              private router: Router) {
    this.tagModel.tag_Sistema_operativo = [getMobileOperatingSystem()];
  }

  /**
   * This will track a view change
   * @param {Partial<Tags>} tags - The updated tag values
   * @void
   */
  public view(tags: Partial<Tag>): void {
    this.tagModel.tag_entorno = localStorage.getItem('enviroment');

    if (window.dataLayer && window.dataLayer instanceof Array) {
      if (this.tagModel.tag_aclaracion.length === 0 && tags.tag_aclaracion) {
        this.tagModel.tag_aclaracion = [
          tags.tag_aclaracion != null ? tags.tag_aclaracion[0] : "",
        ];
      }
      const toSave = this.toUnderScore({ ...this.tagModel, ...tags });


      window.dataLayer.push(toSave);
      return;
    }

    console.log("GTM Unavailable");
  }

  /**
   * This will track an event
   * @param {TagEvent} event - The tag event
   * @void
   */
  public link(event: TagEvent): void {
    if (window.dataLayer && window.dataLayer instanceof Array) {
      window.dataLayer.push(this.toUnderScore(event));
      return;
    }

    console.log("GTM Unavailable");
  }

  public setDevicefeInfo() {
    this.tagModel.tag_Sistema_operativo = [getMobileOperatingSystem()];
  }

  public setvaluesWelcome(
    subsection: string,
    titulo: string,
    userId: string,
    tipoDeTarjeta: string,
    canalProcedencia: string
  ) {
    tipoDeTarjeta = tipoDeTarjeta.toLowerCase().replace(/ /g, "_");
    this.tagModel.tag_subsection1 = subsection;
    this.tagModel.tag_titulo = titulo; // titulo.replace(/\//g,'|')
    this.tagModel.tag_url = titulo;
    this.tagModel.tag_userId = [userId];
    this.tagModel.tag_tipoDeTarjeta = [tipoDeTarjeta?.replace(
      " ",
      ""
    )];
    this.tagModel.tag_procedencia = [canalProcedencia];
    this.setDevicefeInfo();
    this.storage.saveInLocal("tagData", this.tagModel);
  }

  public setvalues(subsection: string, titulo: string, flujo?: string) {
    this.tagModel = this.storage.getFromLocal("tagData") || this.tagModel;
    this.tagModel.tag_subsection1 = subsection;
    this.tagModel.tag_titulo = titulo.replace(/\//g,'|');
    this.tagModel.tag_url = "/" + titulo;
    if (this.tagModel.tag_aclaracion && this.tagModel.tag_aclaracion[0] === "" && flujo) {
      this.tagModel.tag_aclaracion[0] = flujo != null ? flujo : "";
      this.tagModel.tag_proceso.push(this.tagModel.tag_aclaracion[0]);
    }
    this.storage.saveInLocal("tagData", this.tagModel);
  }

  public getvalues(): Tag {
    let utag_Data = this.storage.getFromLocal("tagData");
    return utag_Data;
  }

  public toUnderScore(tags: any): any {
    try {
      const newObj = _.cloneDeep(tags);
      const keys = Object.keys(newObj);
      const reg = new RegExp(" ", "g");
      keys.forEach((k) => {
        if (typeof newObj[k] === "string") {
          newObj[k] = this.removeAccents(_.replace(newObj[k], reg, "_"));
        } else if (newObj[k] instanceof Array) {
          newObj[k].forEach((value, index) => {
            newObj[k][index] = this.removeAccents(_.replace(value, reg, "_"));
          });
        }
      });
      return newObj;
    } catch (error) {
      console.log(error);
      return tags;
    }
  }

  public removeAccents(input: string): string {
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  public typeClarificationTDD(): string {
    let viewQuestions = this.storage.getFromLocal("viewQuestions");
    let path: string = "";
    let url: string = "";
    url = this.router.url === '/summaryTDD' ? 'resumen_tdd': 'comprobante_tdd';
    if (viewQuestions[0].value === 'SÍ') {
       return path = viewQuestions[1].value === 'SÍ' ? 'aclaraciones/' + url + '/con_interaccion_en_comercio': 'aclaraciones/' + url + '/sin_interaccion_en_comercio';
    } else {
      return path = 'aclaraciones/' + url + '/no_tiene_su_tarjeta';
    }
  }

  public typeClarificationTDC(): string {
    const questions = this.storage.getFromLocal('questionsTDC');
    console.log(questions);
    let path: string = "";
    let url: string = "";
    url = url = this.router.url === '/summary' ? 'resumen_tdc': 'comprobante_tdc';
    if (questions.hasCard === '1') {
      return path = questions.haveContact === '1' ? 'aclaraciones/' + url + '/con_interaccion_en_comercio':
                    questions.haveContact === '2' ? 'aclaraciones/' + url + '/sin_interaccion_en_comercio': '';
    } else if (questions.hasCard === '2'){
      return path = 'aclaraciones/' + url + '/no_tiene_su_tarjeta';
    }
  }
}
