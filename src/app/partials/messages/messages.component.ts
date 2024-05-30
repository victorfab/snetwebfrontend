import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { MessageType } from "../../enums/message-type.enum";

@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesComponent implements OnDestroy {
  @Input() messageType: MessageType = MessageType.TDD_MESSAGE;
  @Input() additional = null;
  @Output() return: EventEmitter<void> = new EventEmitter();

  public messageTypes = MessageType;

  constructor() {
    this.updateView();
  }

  public returnClick(): void {
    this.return.emit();
  }

  /**
   * Will delete the blank space at the bottom of the app
   * when this component is rendered
   * @param {boolean} destroy - tells to method if the execution is on destroy event
   */
  private updateView(destroy = false): void {
    const spacer = document.getElementById("footer-space") as HTMLDivElement;

    if (spacer) {
      spacer.classList.toggle("body-footer-spacer");
    }

    const movementList = document.getElementById(
      "movementList"
    ) as HTMLDivElement;
    if (movementList) {
      movementList.style.paddingBottom = destroy ? "100px" : "0";
    }
  }

  ngOnDestroy(): void {
    this.updateView(true);
  }
}
