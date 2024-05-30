import { AlertType } from "../enums/alert-type.enum";

export interface AlertConfig {
  title: string;
  text: string;
  type: AlertType;
  icon?: string;
}
