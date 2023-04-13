import { LitElement, css } from 'lit';


export class CasperEditDialogPage extends LitElement {
  static styles = css`
    :host {
      display: grid;
      column-gap: 12px;
      row-gap: 6px;
    }

    h3 {
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