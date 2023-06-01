import { LitElement, css } from 'lit';
import { mediaQueriesBreakpoints } from '../casper-edit-dialog.js';


export class CasperEditDialogPage extends LitElement {
  static properties = {
    type: {
      type: String
    },
    layout: {
      type: String,
      reflect: true
    }
  };

  static styles = css`
    :host {
      --item-min-width: 14.5rem;
      --heading-margin-top: 1.7em;
      --heading-margin-bottom: 1.2em;
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


    /* GRID VERSION */

    :host([layout="grid"]) {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--item-min-width), 1fr));
      grid-auto-rows: minmax(min-content, max-content);
      align-content: start;
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

  validate () {
    console.warn('A validate method should be defined for the page.');
    return true;
  }

  async load (data) {
    if (!this.__type) this.__type = this.getRootNode().host._options.root_dialog;
    if (!data) return;

    await this.beforeLoad(data);

    for (const elem of this.shadowRoot.querySelectorAll('[binding]')) {
      const binding = elem.getAttribute('binding');
      const relAttribute = elem.dataset.relationshipAttribute;
      let route, id, value, relationship;

      if (data[binding]) {
        // set attribute from key
        value = data[binding];
      } else if (data.relationships) {
        if (data.relationships[this.__type]?.element) {
          value = data.relationships[this.__type].element[relAttribute] ?? data.relationships[this.__type].element[binding];
        } else if (data.relationships[binding]?.element) {
          value = data.relationships[binding].element[relAttribute] ?? data.relationships[binding].element[binding];
        } else {
          // only load first entry by default
          if (this.__type && data.relationships[this.__type]?.data) {
            if (Array.isArray(data.relationships[this.__type].data)) {
              route = data.relationships[this.__type].data[0].type;
              id = data.relationships[this.__type].data[0].id;
            } else {
              route = data.relationships[this.__type].data.type;
              id = data.relationships[this.__type].data.id;
            }

            relationship = this.__type;
          } else {
            Object.keys(data.relationships).forEach((key) => {
              if (key == binding && data.relationships[key]?.data) {
                if (Array.isArray(data.relationships[key].data)) {
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
            data.relationships[relationship].element = {};

            if (response.data) {
              data.relationships[relationship].element = response.data;

              value = relAttribute ? response.data[relAttribute] : response.data[binding];
            }
          }
        }
      }

      if (value) {
        this._setValue(elem, value, data);
      }
    }

    this.afterLoad(data);
  }

  hasUnsavedChanges (data) {
    const isNew = data ? false : true;

    for (const elem of this.shadowRoot.querySelectorAll('[binding]')) {
      let hasNewValue;
      const binding = elem.getAttribute('binding');
      const relAttribute = elem.dataset.relationshipAttribute;
      const initialValue = isNew ? null : this._getValue(binding, relAttribute, data);

      switch (elem.tagName.toLowerCase()) {
        case 'paper-checkbox':
          hasNewValue = elem.checked != (initialValue || false);
          break;
        case 'paper-input':
        default:
          hasNewValue = elem.value != (initialValue || false);
          break;
      }

      if (hasNewValue) return true;
    }

    return false;
  }

  save (saveData, data) {
    const isNew = data ? false : true;
    const request = isNew ? 'post' : 'patch';
    if (isNew) data = { relationships: {} };

    this.beforeSave(saveData, data, isNew);

    for (const elem of this.shadowRoot.querySelectorAll('[binding]')) {
      let newValue;
      const binding = elem.getAttribute('binding');
      const relAttribute = elem.dataset.relationshipAttribute;
      const initialValue = isNew ? null : this._getValue(binding, relAttribute, data);

      switch (elem.tagName.toLowerCase()) {
        case 'paper-checkbox':
          newValue = elem.checked !== initialValue ? elem.checked : null;
          break;
        case 'paper-input':
        default:
          newValue = elem.value !== initialValue ? elem.value : null;
          break;
      }

      if (newValue !== undefined && newValue !== null) {
        let type = data.relationships[binding]?.data?.type ?? (data.relationships[this.__type]?.data?.type ?? this.__type);
        let id = data.relationships[binding]?.data?.id ?? (data.relationships[this.__type]?.data?.id ?? data.id);
        let attribute = relAttribute ?? binding;

        if (!saveData[request][type]) {
          saveData[request][type] = {
            payloads: [{
              urn: `${type}${!isNew ? '/' + id : ''}`,
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

    this.afterSave(saveData, data, isNew);
  }

  showStatusPage (response) {
    this.editDialog.showStatusPage(response);
  }

  hideStatusPage () {
    this.editDialog.hideStatusPage();
  }

  close () {
    this.editDialog.close();
  }

  async beforeLoad (data) {
    return;
  }

  afterLoad (data) {
    return;
  }

  beforeSave (saveData, data, isNew = false) {
    return;
  }

  afterSave (saveData, data, isNew = false) {
    return;
  }

  _getValue (binding, relAttribute, data) {
    let value;

    if (data[binding]) {
      // set attribute from key
      value = data[binding];
    } else if (data.relationships) {
      // only load first entry by default
      if (this.__type && data.relationships[this.__type]) {
        value = data.relationships[this.__type].element[binding];
      } else {
        Object.keys(data.relationships).forEach((key) => {
          if (key == binding) {
            if (relAttribute && data.relationships[binding]?.element?.[relAttribute]) {
              value = data.relationships[binding].element[relAttribute];
            } else if (data.relationships[binding]?.element?.[binding]) {
              value = data.relationships[binding].element[binding];
            }
          }
        });
      }
    }

    return value || null;
  }

  _setValue (elem, value, data = null) {
    switch (elem.tagName.toLowerCase()) {
      case 'paper-checkbox':
        elem.checked = value;
        break;
      case 'paper-input':
      default:
        elem.value = value;
        break;
    }
  }
}