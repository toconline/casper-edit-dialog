import { LitElement, css } from 'lit';


export class CasperEditDialogPage extends LitElement {
  static properties = {
    _type: {
      type: String
    }
  };

  static styles = css`
    :host {
      --grid-item-min-width: 15.625rem;
      --grid-section-title-margin-top: 1.666em;
      --grid-section-title-margin-bottom: 1.111em;

      display: grid;
      grid-row-gap: 0.625rem;
      grid-column-gap: 1.25rem;
      grid-template-columns: repeat(auto-fit, minmax(var(--grid-item-min-width), 1fr));
    }

    .casper-edit-dialog-page__section-title {
      grid-column: 1 / -1;
      font-size: 1rem;
      font-weight: 600;
      padding: 0.625em;
      border-radius: 0.25em;
      margin: var(--grid-section-title-margin-top) 0 var(--grid-section-title-margin-bottom) 0;
      background: var(--light-primary-color);
      color: var(--primary-color);
    }
  `;

  validate () {
    console.warn('A validate method should be defined for the page.')
    return true;
  }

  async load (data) {
    this.beforeLoad(data);

    for (const elem of this.shadowRoot.querySelectorAll('[binding]')) {
      const binding = elem.getAttribute('binding');
      const relAttribute = elem.dataset.relationshipAttribute;
      let route, id, value, relationship;

      if (data[binding]) {
        // set attribute from key
        value = data[binding];
      } else if (data.relationships) {
        // only load first entry by default
        if (this._type && data.relationships[this._type]?.data) {
          if (Array.isArray(data.relationships[this._type].data)) {
            route = data.relationships[this._type].data[0].type;
            id = data.relationships[this._type].data[0].id;
          } else {
            route = data.relationships[this._type].data.type;
            id = data.relationships[this._type].data.id;
          }

          relationship = this._type;
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

      if (value) {
        this._setValue(elem, value, data);
      }
    }

    this.afterLoad(data);
  }

  save (saveData, data, request = 'patch') {
    this.beforeSave(saveData, data, request);

    for (const elem of this.shadowRoot.querySelectorAll('[binding]')) {
      let newValue;
      const binding = elem.getAttribute('binding');
      const relAttribute = elem.dataset.relationshipAttribute;
      const initialValue = this._getValue(binding, relAttribute, data);

      switch (elem.tagName.toLowerCase()) {
        case 'paper-checkbox':
          newValue = elem.checked !== initialValue ? elem.checked : null;
          break;
        case 'paper-input':
        default:
          newValue = elem.value !== initialValue ? elem.value : null;
          break;
      }

      if (newValue) {
        let type = this._type;
        let id = data.id;
        let attribute = binding;

        if (relAttribute) {
          type = data.relationships[binding]?.data.type ?? data.relationships[this._type]?.data.type;
          id = data.relationships[binding]?.data.id ?? data.relationships[this._type]?.data.id;
          attribute = relAttribute;
        }

        if (!saveData[request][type]) {
          saveData[request][type] = {
            payloads: [{
              urn: `${type}/${id}`,
              payload: {
                data: {
                  type: type,
                  id: id,
                  attributes: {}
                }
              }
            }]
          }
        }

        saveData[request][type].payloads[0].payload.data.attributes[attribute] = newValue;
      }
    }

    this.afterSave(saveData, data, request);
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

  beforeLoad (data) {
    return;
  }

  afterLoad (data) {
    return;
  }

  beforeSave (saveData, data, request) {
    return;
  }

  afterSave (saveData, data, request) {
    return;
  }

  _getValue (binding, relAttribute, data) {
    let value;

    if (data[binding]) {
      // set attribute from key
      value = data[binding];
    } else if (data.relationships) {
      // only load first entry by default
      if (this._type && data.relationships[this._type]) {
        value = data.relationships[this._type].element[binding];
      } else {
        Object.keys(data.relationships).forEach((key) => {
          if (key == binding) {
            value = relAttribute ? data.relationships[binding].element[relAttribute] : data.relationships[binding].element[binding]
          }
        });
      }
    }

    return value;
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