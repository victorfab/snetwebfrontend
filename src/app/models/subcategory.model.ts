/**
 * Subcategory object used in the preloader component.
 *
 * @export
 * @class SubcategoryModel
 */
export class SubcategoryModel {
  public category = '';
  public subcategory = '';

  /**
   * Creates an instance of SubcategoryModel.
   * @param {string} _category
   * @param {string} _subcategory
   * @memberof SubcategoryModel
   */
  constructor(_category: string, _subcategory: string) {
    this.category     = _category;
    this.subcategory  = _subcategory;
  }
}
