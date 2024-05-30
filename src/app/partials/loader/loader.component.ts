import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoaderModel } from './../../models/loader.model';
import { DataProxyService } from '../../services/data-proxy.service';
/**
 *Modal extend to customize the text
 *
 * @export
 * @class LoaderComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html'
})
export class LoaderComponent implements OnInit, OnDestroy {
  public status: LoaderModel;
  public message: string;
/**
 *Creates an instance of LoaderComponent.
 * @param {DataProxyService} dataProxyService
 * @memberof LoaderComponent
 */
constructor(
    private dataProxyService: DataProxyService
  ) {}
/**
 *
 *
 * @memberof LoaderComponent
 */
public ngOnInit() {
    this.status = this.dataProxyService.getLoader();
    if (this.status) {
      this.message = this.status.getMessage();
    } else {
      this.status = new LoaderModel();
      this.dataProxyService.setLoader(this.status);
    }
  }

  public ngOnDestroy() {
  }
}
