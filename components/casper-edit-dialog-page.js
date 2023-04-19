import { LitElement, css } from 'lit';


export class CasperEditDialogPage extends LitElement {
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

  load (data) {
    for (const elem of this.shadowRoot.querySelectorAll('[binding]')) {
      const binding = elem.getAttribute('binding');

      console.log(elem.tagName.toLowerCase());
      console.log(`binding to ${binding} = ${data[binding]} type: ${typeof data[binding]}`);
      switch (typeof data[binding]) {
        case 'boolean':
          elem.checked = data[binding];
          break;
        default:
          elem.value = data[binding];
          break;
      }
    }
  }

  save (patch, data) {
    for (const elem of this.shadowRoot.querySelectorAll('[binding]')) {
      const binding = elem.getAttribute('binding')
      if ( elem.value != data[binding] ) {
        switch (typeof data[binding]) {
          case 'boolean':
            patch.set(binding, elem.checked);
            break;
          default:
            patch.set(binding, elem.value);
            break;
        }
      }
    }
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
}