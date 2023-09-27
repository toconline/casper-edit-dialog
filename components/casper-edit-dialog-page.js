import { LitElement, css } from 'lit';
import { mediaQueriesBreakpoints } from './casper-edit-dialog-constants.js';
import { CasperUiHelper } from './casper-ui-helper.js';


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

    /* <hr> element */
    .ced-page__content-separator {
      border: none;
      border-bottom: dotted 2px #d3d3d3;
      width: 100%;
    }

    casper-tabbed-items {
      --header-top-offset: calc(var(--ced-page-padding) * -1);

      /* This is the same value used for the paper-input, needed so that there is still breathing space when an input's error message is shown */
      padding: 8px 0;
    }

    casper-address {
      --ca-item-min-width: var(--item-min-width);
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
    :host([layout="grid"]) .ced-page__content-separator,
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

    :host([layout="flex"]) > *:not(.ced-page__heading, .ced-page__content-separator) {
      width: calc((100% - var(--column-gap) * 2) / 3 );
      min-width: var(--item-min-width);
      max-width: 100%;
      flex-grow: 1;
    }

    @media (max-width: ${mediaQueriesBreakpoints.tablet}) {
      :host([layout="grid"]) > *:not(.ced-page__heading, .ced-page__content-separator, .ced-page__span-all, .ced-page__span-2, casper-tabbed-items) {
        grid-column: auto !important;
      }

      :host([layout="grid"]) .ced-page__span-2 {
        grid-column: 1 / -1 !important;
      }
    }
  `;

  constructor () {
    super();

    this._uiHelper = new CasperUiHelper();

    this.layout = 'grid';
  }



  //***************************************************************************************//
  //                              ~~~ Public methods  ~~~                                  //
  //***************************************************************************************//

  async validate () {
    let isPageValid = true;

    const requiredValidations = this._uiHelper.validateRequiredFields(this.shadowRoot);
    const otherValidations = await this._validate();

    if (!requiredValidations || !otherValidations) isPageValid = false;

    return isPageValid;
  }

  /** This receives an array of elements, whose error messages will be cleared by the editDialog. 
    * By default, elements with the "required" attribute are already taken care of.
    */
  handleFieldsErrorMessageClear (elementsArr) {
    for (const element of elementsArr) {
      this._uiHelper.addErrorMessageClearListener(element);
    }
  }

  async load (data) {
    await this.beforeLoad(data);

    // If resource is not defined then use main resource
    if (!this._resourceName) this._resourceName = this.editDialog.rootResource();
    // If relationship name is not defined then use resource name
    if (!this._relationshipName) this._relationshipName = this._resourceName;

    if (this.isCreate()) return;

    for (const elem of this.shadowRoot.querySelectorAll('[binding]')) {
      const binding = elem.getAttribute('binding');
      const relAttribute = elem.getAttribute('relationshipAttribute');

      let value;
      if (binding === '..') {
        value = data;
      } else if (data[binding]) {
        // set attribute from binding key
        value = data[binding];
      } else if (data.relationships) {
        // check for attribute within relationships
        // check within previously loaded element
        if (data.relationships[this._relationshipName]?.elements?.[0]) {
          // using page type attribute
          value = data.relationships[this._relationshipName].elements[0][relAttribute] ?? data.relationships[this._relationshipName].elements[0][binding];
        } else if (data.relationships[binding]?.elements?.[0]) {
          // using element binding
          value = data.relationships[binding].elements[0][relAttribute] ?? data.relationships[binding].elements[0][binding];
        } else {
          let resource, id, relationship;
          // data does not contain relationship data loaded into element
          // attempt to get relationship data via broker
          // use page type attribute to get relationship resource and id
          if (data.relationships[this._relationshipName]?.data) {
            if (Array.isArray(data.relationships[this._relationshipName].data)) {
              // only load first entry by default if array
              resource = data.relationships[this._relationshipName].data[0].type;
              id = data.relationships[this._relationshipName].data[0].id;
            } else {
              resource = data.relationships[this._relationshipName].data.type;
              id = data.relationships[this._relationshipName].data.id;
            }
            this._resourceName = resource;
            relationship = this._relationshipName;
          } else {
            // use binding to get id and type from relationships
            if (data.relationships[binding]?.data) {
              if (Array.isArray(data.relationships[binding].data)) {
                // only load first entry by default if array
                resource = data.relationships[binding].data[0].type;
                id = data.relationships[binding].data[0].id;
              } else {
                resource = data.relationships[binding].data.type;
                id = data.relationships[binding].data.id;
              }
              relationship = binding;
            }
          }
          if (resource && id) {
            const response = await app.broker.get(`${resource}/${id}`, 10000);
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

  async checkBindings (bindedElements, data) {
    for (const elem of bindedElements) {
      let hasNewValue, elemValue;
      const binding = elem.getAttribute('binding');
      const relAttribute = elem.getAttribute('relationshipAttribute');
      const initialValue = this.isCreate() ? null : await this._getValue(binding, relAttribute, data);
      switch (elem.tagName.toLowerCase()) {
        case 'paper-checkbox':
          hasNewValue = elem.checked != (initialValue || false);
          if (hasNewValue) console.log(elem)
          break;
        case 'casper-address':
          const address = elem.getAddressData();
          for (const key in address) {
            if (!hasNewValue) {
              const addrValue = address[key] || null;
              const dataValue = await this._getValue(key, relAttribute, data) || null;
              hasNewValue = addrValue != dataValue;
            }
          }
          if (hasNewValue) console.log(elem)
          break;
        case 'paper-input':
        default:
          elemValue = elem.value ?? null;
          if (elem.getAttribute('multi-selection') && elemValue) elemValue = elemValue.split(','); // casper-select multi-selection
          if (elemValue || initialValue) {
            hasNewValue = elemValue != initialValue;
          }
          break;
      }

      if (hasNewValue) {
        console.log(initialValue)
        console.log(elemValue)
        console.log(elem);
        return true;
      }
    }
    return false;
  }

  async hasUnsavedChanges () {
    let unsavedChanges = false;
    unsavedChanges = await this.checkBindings(this.shadowRoot.querySelectorAll('[binding]'), this.editDialog.data);
    if (!unsavedChanges) {
      const tabbedItems = this.shadowRoot.querySelectorAll('casper-tabbed-items');
      for (let i = 0; i < tabbedItems.length; i++) {
        const cti = tabbedItems[i];
        const tabs = cti._contentEl.querySelectorAll('.content__item');
        if (tabs.length !== (this.editDialog.data?.relationships?.[cti.relationshipName]?.elements?.length || 0)) unsavedChanges = true;
        for (let idx = 0; idx < tabs.length; idx++) {
          const tab = tabs[idx];
          if (!unsavedChanges) unsavedChanges = await this.checkBindings(tab.querySelectorAll('[binding]'), this.editDialog.data?.relationships?.[cti.relationshipName]?.elements?.[idx]);
        }
      }
    }
    return unsavedChanges;
  }

  isCreate () {
    return this.editDialog.getDialogAction() === 'create';
  }

  async save (saveData, data) {
    const request = this.isCreate() ? 'post' : 'patch';
    if (this.isCreate()) data = { relationships: {} };

    this.beforeSave(saveData, data);

    for (const elem of this.shadowRoot.querySelectorAll('[binding]')) {
      let elemValue, newValue;
      const binding = elem.getAttribute('binding');
      const relAttribute = elem.getAttribute('relationshipAttribute');
      const initialValue = this.isCreate() ? null : await this._getValue(binding, relAttribute, data);

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
        let resource = data.relationships?.[binding]?.data?.type || this._resourceName;
        let id = data.relationships?.[binding]?.data?.id ?? (data.relationships?.[this._relationshipName]?.data?.id ?? data.id);
        let attribute = relAttribute ?? binding;
        
        if (!saveData[request][this._relationshipName]) saveData[request][this._relationshipName] = {payloads: []};
        let resourceIndex = saveData[request][this._relationshipName].payloads.findIndex(e => e.urn.includes(resource));
        if (resourceIndex === -1) {
          resourceIndex = (saveData[request][this._relationshipName].payloads.push({
            urn: `${resource}${this.isCreate() ? '' : `/${id}`}`,
            payload: {
              data: {
                type: resource,
                attributes: {}
              }
            }
          }))-1;
          if (this.isCreate && request === 'post' && this._relationshipForeignKey) {
            saveData[request][this._relationshipName].payloads[resourceIndex].delayField = this._relationshipForeignKey;
            saveData[request][this._relationshipName].payloads[resourceIndex].payload.data.attributes[this._relationshipForeignKey] = 'delay';
          }
          if (request === 'patch') {
            saveData[request][this._relationshipName].payloads[resourceIndex].payload.data.id = id;
          }
        }

        saveData[request][this._relationshipName].payloads[resourceIndex].payload.data.attributes[attribute] = newValue;
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

  /* --- Labels --- */

  disableLabel (index) {
    this.editDialog.disableLabel(index);
  }

  enableLabel (index) {
    this.editDialog.enableLabel(index);
  }

  disableLabelsList () {
    this.editDialog.disableLabelsList();
  }

  enableLabelsList () {
    this.editDialog.enableLabelsList();
  }

  /* --- Previous button --- */

  disablePrevious () {
    this.editDialog.disablePrevious();
  }

  enablePrevious () {
    this.editDialog.enablePrevious();
  }

  hidePrevious () {
    this.editDialog.hidePrevious();
  }

  showPrevious () {
    this.editDialog.showPrevious();
  }

  changePreviousButtonToText (text) {
    this.editDialog.changePreviousButtonToText(text);
  }

  changePreviousButtonToIcon (icon = 'fa-light:arrow-left') {
    this.editDialog.changePreviousButtonToIcon(icon);
  }

  /* --- Next button --- */

  disableNext () {
    this.editDialog.disableNext();
  }

  enableNext () {
    this.editDialog.enableNext();
  }

  hideNext () {
    this.editDialog.hideNext();
  }

  showNext () {
    this.editDialog.showNext();
  }

  changeNextButtonToText (text) {
    this.editDialog.changeNextButtonToText(text);
  }

  changeNextButtonToIcon (icon = 'fa-light:arrow-right') {
    this.editDialog.changeNextButtonToIcon(icon);
  }

  /* --- All actions --- */

  disableAllActions () {
    this.editDialog.disableAllActions();
  }

  enableAllActions () {
    this.editDialog.enableAllActions();
  }

  openToast (text, type, duration, forced) {
    this.editDialog.openToast(text, type, duration, forced);
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

  async afterSave (saveData, data) {
    return;
  }

  //***************************************************************************************//
  //                              ~~~ Private methods  ~~~                                 //
  //***************************************************************************************//

  async _getValue (binding, relAttribute, data) {
    if (data === undefined) return;
    let value = null;

    if (data[binding] != null) {
      // set attribute from key
      value = data[binding];
    } else if (data.relationships) {
      // only load first entry by default
      if (data.relationships[this._relationshipName]) {
        value = data.relationships[this._relationshipName].elements?.[0][binding];
      } else {
        if (data.relationships.hasOwnProperty(binding)) {
          if (relAttribute && (data.relationships[binding]?.elements?.[0]?.[relAttribute] != null)) {
            value = data.relationships[binding].elements[0][relAttribute];
          } else if (data.relationships[binding]?.elements?.[0]?.[binding] != null) {
            value = data.relationships[binding].elements[0][binding];
          } else if (data?.relationships?.[binding]?.data?.id){
            try {
              const response = await app.broker.get(`${data.relationships[binding].data.type}/${data.relationships[binding].data.id}`, 10000);
              value = response.data[binding] ? response.data[binding] : response.data[relAttribute];
            } catch (error) {
              console.error(error); 
            } finally {
              if (value == undefined || value == null) {
                value = data.relationships[binding].data.id;
              }
            }
          }
        }
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
      case 'casper-address':
        elem.setValues(value);
        break;
      case 'paper-input':
      default:
        elem.value = value;
        break;
    }
  }

  _validate () {
    console.warn('A _validate method should be defined for the page.');
    return true;
  }
}