/**
 * Situation used in the questionarie.
 *
 * @export
 * @class SituationModel
 */
export class SituationModel {
    public key: string;
    public title: string;

    /**
     * Creates an instance of SituationModel.
     * @param {string} [k='']
     * @param {string} [t='']
     * @memberof SituationModel
     */
    constructor(private k = '', private t = '') {
        this.key = k;
        this.title = t;
    }

    /**
     * Get the key.
     *
     * @returns
     * @memberof SituationModel
     */
    public getKey() {
        return this.key;
    }

    /**
     * Get the title.
     *
     * @returns
     * @memberof SituationModel
     */
    public getTitle() {
        return this.title;
    }
}
