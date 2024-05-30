import { Component, OnInit, inject } from '@angular/core';
import { TaggingService } from '../../services/tagging.service';
import { DataProxyService } from '../../services/data-proxy.service';
import * as md5 from "blueimp-md5";
import { NavigationService } from '../../services/navigation.service/navigation.service';

@Component({
  selector: 'app-warning-cancellation',
  templateUrl: './warning-cancellation.component.html'
})
export class WarningCancellationComponent implements OnInit {

  private taggingService = inject(TaggingService);
  private dataProxyService = inject(DataProxyService);
  private navigationService = inject(NavigationService);

  constructor() { }

  ngOnInit(): void {
    this.setDataLayer();
  }

  exit(){
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "aclaraciones_cargos",
      interaction_action: 'No_es_el_monto_acordado',
      interaction_label: 'Salir',
    });
    this.navigationService.goToRoot();
  }

  call(){
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "aclaraciones_cargos",
      interaction_action: 'No_es_el_monto_acordado',
      interaction_label: 'Llamar',
    });
  }

  public setDataLayer(): void {
    const userID = md5(this.dataProxyService.getBuc(), "mx-aclaraciones-cs");

    const channel = this.dataProxyService.getChannel();
    let section = "santander_supermovil";
    if (channel !== "default") {
      section = "santander_superwallet";
    }

    this.taggingService.view({
      tag_subsection1: "aclaraciones",
      tag_titulo: "warning-cancellation",
      tag_url: "/warning-cancellation",
      tag_userId: userID,
      tag_tipoDeTarjeta: [
        this.dataProxyService.getCreditCardFullData().cardDesc,
      ],
      tag_procedencia: [section],
    });
  }

}
