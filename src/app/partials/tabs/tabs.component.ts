import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { SessionStorageService } from "angular-web-storage";
import { TabOptions } from "../../enums/tab.enum";
import { TaggingService } from "../../services/tagging.service";

@Component({
  selector: "app-tabs",
  templateUrl: "./tabs.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent implements OnInit {
  @Output() optionChanged: EventEmitter<TabOptions> = new EventEmitter();
  @Input() set selected(option: TabOptions) {
    this.selectedTab = option;
    this.session.set("tab", this.selectedTab);
  }
  @Input() toDisable = null;

  public tabOptions = TabOptions;

  public selectedTab: TabOptions = TabOptions.CONSUMER;

  constructor(
    private ts: TaggingService,
    private session: SessionStorageService
  ) {
    this.session.set("tab", this.selectedTab);
  }

  ngOnInit(): void {}

  public selectTab(option: TabOptions) {
    this.selectedTab = option;
    this.tagTabs(option);
    this.optionChanged.emit(option);
  }

  public get isConsumerTab(): boolean {
    return this.selectedTab === this.tabOptions.CONSUMER;
  }

  public get isAtmTab(): boolean {
    return this.selectedTab === this.tabOptions.ATM;
  }

  public get isCashbackTab(): boolean {
    return this.selectedTab === this.tabOptions.CASHBACK;
  }

  public tagTabs(option: TabOptions) {
    switch (option) {
      case this.tabOptions.CONSUMER:
        this.ts.link({
          event: "aclaraciones",
          interaction_action: "consumos",
          interaction_category: "consumos_tab",
          interaction_label: "Consumos",
        });
        break;
      case this.tabOptions.ATM:
        this.ts.link({
          event: "aclaraciones",
          interaction_action: "atm",
          interaction_category: "atm_tab",
          interaction_label: "ATM",
        });
        break;
      case this.tabOptions.CASHBACK:
        this.ts.link({
          event: "aclaraciones",
          interaction_action: "cashback",
          interaction_category: "cashback_tab",
          interaction_label: "Cashback",
        });
        break;
    }
  }
}
