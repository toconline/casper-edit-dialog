import { LitElement, css } from 'lit';
import { mediaQueriesBreakpoints } from './casper-edit-dialog-constants.js';


export class CasperEditDialogPage extends LitElement {
  static properties = {
    type: {
      type: String
    },
    isNew: {
      type: Boolean,
      reflect: true
    },
    layout: {
      type: String,
      reflect: true
    }
  };

  static styles = css`
    :host {
      --item-min-width: 14.5rem;
      --heading-margin-top: 1.6em;
      --heading-margin-bottom: 1.1em;
      --column-gap: 1.25rem;

      row-gap: 0.625rem;
      column-gap: var(--column-gap);
    }

    .ced-page__heading {
      font-size: 1rem;
      font-weight: 600;
      padding: 0.625em;
      border-radius: 4px;
      margin: var(--heading-margin-top) 0 var(--heading-margin-bottom) 0;
      background-color: #efefef;
      color: var(--primary-color);
    }

    .ced-page__heading:first-child {
      margin-top: 0;
    }

    casper-tabbed-items {
      --header-before-height: var(--ced-page-padding);
    }

    paper-checkbox[invalid] {
      --paper-checkbox-label-color: var(--paper-checkbox-error-color, var(--error-color));
    }

    /* GRID VERSION */

    :host([layout="grid"]) {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--item-min-width), 1fr));
      grid-auto-rows: minmax(min-content, max-content);
      align-content: start;
    }

    :host([layout="grid"]) paper-checkbox {
      justify-self: flex-start;
    }

    :host([layout="grid"]) .ced-page__heading,
    :host([layout="grid"]) .ced-page__span-all,
    :host([layout="grid"]) casper-tabbed-items {
      grid-column: 1 / -1;
    }

    :host([layout="grid"]) .ced-page__span-2 {
      grid-column: span 2;
    }


    /* FLEXBOX VERSION */

    :host([layout="flex"]) {
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
    }

    :host([layout="flex"]) .ced-page__heading {
      width: 100%;
    }

    :host([layout="flex"]) > *:not(.ced-page__heading) {
      width: calc((100% - var(--column-gap) * 2) / 3 );
      min-width: var(--item-min-width);
      max-width: 100%;
      flex-grow: 1;
    }

    @media (max-width: ${mediaQueriesBreakpoints.tablet}) {
      :host([layout="grid"]) > *:not(.ced-page__heading, .ced-page__span-all, .ced-page__span-2, casper-tabbed-items) {
        grid-column: auto !important;
      }

      :host([layout="grid"]) .ced-page__span-2 {
        grid-column: 1 / -1 !important;
      }
    }
  `;

  constructor () {
    super();

    this.layout = 'grid';
  }



  //***************************************************************************************//
  //                              ~~~ Public methods  ~~~                                  //
  //***************************************************************************************//

  validate () {
    let isPageValid = true;

    const requiredValidations = this.validateRequiredFields();
    const otherValidations = this._validate();

    if (!requiredValidations || !otherValidations) isPageValid = false;

    const allTabbedItems = this.shadowRoot.querySelectorAll('casper-tabbed-items');
    for (const tabbedItems of allTabbedItems) {
      const isValid = tabbedItems.validate();
      if (!isValid) isPageValid = false;
    }

    return isPageValid;
  }

  /* Validates fields which have the "required" attribute. */
  validateRequiredFields () {
    let isPageValid = true;
    const requiredFields = this.shadowRoot.querySelectorAll('[required]');

    for (const element of requiredFields) {
      this._addErrorMessageClearListener(element);

      const nodeName = element.nodeName.toLowerCase();
      const message = 'Campo obrigatório.';

      switch (nodeName) {
        case 'casper-select-lit':
          if (element.value === undefined) {
            element.searchInput.invalid = true;
            element.error = message;
            isPageValid = false;
          }
          break;

        case 'casper-select':
          if (!element.value) {
            if (element.multiSelection) {
              const paperInputContainer = element.shadowRoot.querySelector('paper-input-container');
              if (paperInputContainer) paperInputContainer.invalid = true;
            } else {
              element.searchInput.invalid = true;
              element.searchInput.errorMessage = message;
            }
            
            isPageValid = false;
          }
          break;

        case 'casper-date-picker':
          if (!element.value) {
            element.invalid = true;
            element.requiredErrorMessage = message;
            element.__errorMessage = message;
            isPageValid = false;
          }
          break;

        case 'paper-checkbox':
          if (!element.checked) {
            element.invalid = true;
            isPageValid = false;
          }
          break;
      
        case 'paper-input':
          if (element.value?.toString()?.trim() === '') {
            element.invalid = true;
            element.errorMessage = message;
            isPageValid = false;
          }
          break;

        default:
          break;
      }
    }

    return isPageValid;
  }

  /* Event listener which is fired when the user interacts with an invalid field. This will clear the error message. */
  clearFieldErrorMessage (element) {
    if (!element) return;
    const nodeName = element.nodeName.toLowerCase();

    switch (nodeName) {
      case 'casper-select-lit':
        if (element.searchInput?.invalid) {
          element.searchInput.invalid = false;
          element.error = ''; 
        }
        break;

      case 'casper-select':
        if (element.multiSelection) {
          const paperInputContainer = element.shadowRoot.querySelector('paper-input-container');
          if (paperInputContainer?.invalid) paperInputContainer.invalid = false;
        } else {
          if (element.searchInput?.invalid) {
            element.searchInput.invalid = false;
            element.searchInput.errorMessage = '';
          }
        }
        break;

      case 'casper-date-picker':
        if (element.invalid) {
          element.invalid = false;
          element.__errorMessage = '';
        }
        break;

      case 'paper-checkbox':
        if (element.invalid) {
          element.invalid = false;
        }
        break;

      case 'paper-input':
        if (element.invalid) {
          element.invalid = false;
          element.errorMessage = ''; 
        }
        break;

      default:
        break;
    }
  }

  /** This receives an array of elements, whose error messages will be cleared by the editDialog. 
    * By default, elements with the "required" attribute are already taken care of.
    */
  handleFieldsErrorMessageClear (elementsArr) {
    for (const element of elementsArr) {
      this._addErrorMessageClearListener(element);
    }
  }

  async load (data) {
    await this.beforeLoad(data);

    if (!this.__type) this.__type = this.editDialog.rootObjectType();
    if (this.isCreate()) return;

    for (const elem of this.shadowRoot.querySelectorAll('[binding]')) {
      const binding = elem.getAttribute('binding');
      //  const relType = elem.dataset.relationshipType; might implement later
      const relAttribute = elem.dataset.relationshipAttribute;
      let route, id, value, relationship;

      if (data[binding]) {
        // set attribute from binding key
        value = data[binding];
      } else if (data.relationships) {
        // check for attribute within relationships
        // check within previously loaded element
        if (data.relationships[this.__type]?.elements?.[0]) {
          // using page type attribute
          value = data.relationships[this.__type].elements[0][relAttribute] ?? data.relationships[this.__type].elements[0][binding];
        } else if (data.relationships[binding]?.elements?.[0]) {
          // using element binding
          value = data.relationships[binding].elements[0][relAttribute] ?? data.relationships[binding].elements[0][binding];
        } else {
          // data does not contain relationship data loaded into element
          // attempt to get relationship data via broker
          // use page type attribute to get relationship route and id
          if (this.__type && data.relationships[this.__type]?.data) {
            if (Array.isArray(data.relationships[this.__type].data)) {
              // only load first entry by default if array
              route = data.relationships[this.__type].data[0].type;
              id = data.relationships[this.__type].data[0].id;
            } else {
              route = data.relationships[this.__type].data.type;
              id = data.relationships[this.__type].data.id;
            }

            relationship = this.__type;
          } else {
            // cycle relationships looking for a match with binding in order to get route and id
            Object.keys(data.relationships).forEach((key) => {
              // if key matches binding, retrieve route and id from first entry
              if (key == binding && data.relationships[key]?.data) {
                if (Array.isArray(data.relationships[key].data)) {
                  // only load first entry by default if array
                  route = data.relationships[key].data[0].type;
                  id = data.relationships[key].data[0].id;
                } else {
                  route = data.relationships[key].data.type;
                  id = data.relationships[key].data.id;
                }

                relationship = binding;
              }
            });
          }

          if (route && id) {
            const response = await app.broker.get(`${route}/${id}`, 10000);
            data.relationships[relationship].elements = [{}];

            if (response.data) {
              data.relationships[relationship].elements[0] = response.data;

              value = relAttribute ? response.data[relAttribute] : response.data[binding];
            }
          }
        }
      }

      if (value) {
        value = this.onLoad(value, elem, data);
        this._setValue(elem, value);
      }
    }

    this.afterLoad(data);
  }

  checkBindings (bindedElements, data) {
    for (const elem of bindedElements) {
      let hasNewValue, elemValue;
      const binding = elem.getAttribute('binding');
      const relAttribute = elem.dataset.relationshipAttribute;
      const initialValue = this.isCreate() ? null : this._getValue(binding, relAttribute, data);
      switch (elem.tagName.toLowerCase()) {
        case 'paper-checkbox':
          hasNewValue = elem.checked != (initialValue || false);
          if (hasNewValue) console.log(elem)
          break;
        case 'paper-input':
        default:
          elemValue = elem.value || null;
          if (elem.getAttribute('multi-selection') && elemValue) elemValue = elemValue.split(','); // casper-select multi-selection
          if (elemValue || initialValue) {
            hasNewValue = elemValue != initialValue;
          }
          break;
        }


      if (hasNewValue) return true;
    }
    return false;
  }

  hasUnsavedChanges () {
    let unsavedChanges = false;
    unsavedChanges = this.checkBindings(this.shadowRoot.querySelectorAll('[binding]'), this.editDialog.data);
    if (!unsavedChanges) {
      this.shadowRoot.querySelectorAll('casper-tabbed-items').forEach((cti) => {
        const tabs = cti._contentEl.querySelectorAll('.content__item');
        if (tabs.length !== (this.editDialog.data?.relationships?.[cti.type]?.elements?.length || 0)) unsavedChanges = true;
        tabs.forEach((tab,idx) => {
          if (!unsavedChanges) unsavedChanges = this.checkBindings(tab.querySelectorAll('[binding]'), this.editDialog.data?.relationships?.[cti.type]?.elements?.[idx]);
        });
      });
    }

    return unsavedChanges;
  }

  isCreate () {
    return this.editDialog.getDialogAction() === 'create';
  }

  save (saveData, data) {
    const request = this.isCreate() ? 'post' : 'patch';
    if (this.isCreate()) data = { relationships: {} };

    this.beforeSave(saveData, data);

    for (const elem of this.shadowRoot.querySelectorAll('[binding]')) {
      let elemValue, newValue;
      const binding = elem.getAttribute('binding');
      const relAttribute = elem.dataset.relationshipAttribute;
      const initialValue = this.isCreate() ? null : this._getValue(binding, relAttribute, data);

      switch (elem.tagName.toLowerCase()) {
        case 'paper-checkbox':
          if (elem.checked !== initialValue) newValue = elem.checked;
          break;
        case 'paper-input':
        default:
          elemValue = elem.value || null;
          if (elemValue !== initialValue) newValue = elemValue;
          break;
      }

      if (newValue !== undefined && initialValue !== newValue) {
        let type = data.relationships[binding]?.data?.type ?? (data.relationships[this.__type]?.data?.type ?? this.__type);
        let id = data.relationships[binding]?.data?.id ?? (data.relationships[this.__type]?.data?.id ?? data.id);
        let attribute = relAttribute ?? binding;

        if (!saveData[request][type]) {
          saveData[request][type] = {
            payloads: [{
              relationship: this.__type,
              urn: `${type}${!this.isCreate() ? '/' + id : ''}`,
              payload: {
                data: {
                  type: type,
                  attributes: {}
                }
              }
            }]
          }

          if (request == 'patch') {
            saveData[request][type]['payloads'][0]['payload']['data']['id'] = id;
          }
        }

        saveData[request][type].payloads[0].payload.data.attributes[attribute] = newValue;
      }
    }

    this.onSave(saveData, data);
  }

  showStatusPage (response, status) {
    this.editDialog.showStatusPage(response, status);
  }

  hideStatusAndProgress () {
    this.editDialog.hideStatusAndProgress();
  }

  disableLabels () {
    this.editDialog.disableLabels();
  }

  enableLabels () {
    this.editDialog.enableLabels();
  }

  disablePrevious () {
    this.editDialog.disablePrevious();
  }

  enablePrevious () {
    this.editDialog.enablePrevious();
  }

  disableNext () {
    this.editDialog.disableNext();
  }

  enableNext () {
    this.editDialog.enableNext();
  }

  disableAllActions () {
    this.editDialog.disableAllActions();
  }

  enableAllActions () {
    this.editDialog.enableAllActions();
  }

  openToast (text, type, duration) {
    this.editDialog.openToast(text, type, duration);
  }

  close () {
    this.editDialog.close();
  }

  async beforeLoad (data) {
    return;
  }

  onLoad (value, elem, data) {
    return value;
  }

  async afterLoad (data) {
    return;
  }

  beforeSave (saveData, data) {
    return;
  }

  onSave (saveData, data) {
    return;
  }

  afterSave (saveData, data) {
    return;
  }

  //***************************************************************************************//
  //                              ~~~ Private methods  ~~~                                 //
  //***************************************************************************************//

  _getValue (binding, relAttribute, data) {
    let value = null;

    if (data[binding]) {
      // set attribute from key
      value = data[binding];
    } else if (data.relationships) {
      // only load first entry by default
      if (this.__type && data.relationships[this.__type]) {
        value = data.relationships[this.__type].elements?.[0][binding];
      } else {
        Object.keys(data.relationships).forEach((key) => {
          if (key == binding) {
            if (relAttribute && data.relationships[binding]?.elements?.[0]?.[relAttribute]) {
              value = data.relationships[binding].elements[0][relAttribute];
            } else if (data.relationships[binding]?.elements?.[0]?.[binding]) {
              value = data.relationships[binding].elements[0][binding];
            } else if (data?.relationships?.[binding]?.data?.id){
              value = data.relationships[binding].data.id;
            }
          }
        });
      }
    }

    return value;
  }

  _setValue (elem, value) {
    switch (elem.tagName.toLowerCase()) {
      case 'paper-checkbox':
        elem.checked = value;
        break;
      case 'casper-select-lit':
        elem.setValue(value);
        break;
      case 'casper-select':
        if (typeof value !== 'string') value = String(value);
        elem.value = value;
        break;
      case 'paper-input':
      default:
        elem.value = value;
        break;
    }
  }

  /* Adds the necessary event listeners to clear a field's error message. */
  _addErrorMessageClearListener (element) {
    if (!element) return;

    if (!element.hasAttribute('has-clear-listener')) {
      let eventType = 'value-changed';
      const nodeName = element.nodeName.toLowerCase();

      if (nodeName === 'paper-checkbox' || nodeName === 'paper-radio-button') eventType = 'checked-changed';

      element.addEventListener(eventType, (event) => this.clearFieldErrorMessage(event?.currentTarget));
      element.setAttribute('has-clear-listener', '');
    }
  }

  _validate () {
    console.warn('A _validate method should be defined for the page.');
    return true;
  }
}