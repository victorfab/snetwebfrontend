import { Component, OnInit, Inject } from '@angular/core';

import { DataService } from '../../services/data.service';
import { DataProxyService } from '../../services/data-proxy.service';

import { ResponseModel } from './../../models/';

/**
 * Open the Modal Window that shows the quality rating view
 *
 * @class QualityRatingComponent
 */
@Component({
    selector: 'quality-rating',
    templateUrl: './quality-rating.component.html',
    providers: [
        DataService
    ]
})
export class QualityRatingComponent implements OnInit {
    protected comments = '';
    protected formRating = undefined;
    private responseModel: ResponseModel;
    /**
     *Creates an instance of QualityRatingComponent.
    * @param {DataService} dataService
    * @param {DataProxyService} dataProxyService
    * @param {*} moment
    * @memberof QualityRatingComponent
    */
    constructor(
        private dataService: DataService,
        private dataProxyService: DataProxyService,
        @Inject('moment') private moment
    ) { }

    /**
     * Angular Lifecycle hook: When the component it is initialized
     *
     * @returns {void}
     */
    public ngOnInit(): void {
        this.responseModel = this.dataProxyService.getResponseDAO();
    }

    /**
     * Make a request to the endpoint
     *
     * @returns {void}
     * @memberof QualityRatingComponent
     */
    public onSubmit(): void {
        const params = {
            date: this.moment().format('YYYY-MM-DD HH:mm:ss'),
            comment: this.comments,
            folio: this.getFolio(),
            stars: this.formRating,
            buc: 12345678
        };
        this.dataService
            .restRequest(
                '/score/save',
                'POST',
                params,
                'rating',
                this.dataProxyService.getAccessToken()
            )
            .subscribe(
                (response) => this.exitApp(),
                (error) => this.exitApp()
            );
    }

    /**
     *
     *
     * @private
     * @memberof QualityRatingComponent
     */
    private exitApp(): void {
        this.dataProxyService.cleanData();
    }

    /**
     *
     *
     * @private
     * @returns {string}
     * @memberof QualityRatingComponent
     */
    private getFolio(): string {
        let folios: Array<string> = [];
        const international = this.responseModel.getInternationalFolio();
        const national = this.responseModel.getNationalFolio();
        if (international) {
            folios.push(international);
        }
        if (national) {
            folios.push(national);
        }
        return folios.join();
    }
}
