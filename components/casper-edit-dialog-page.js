import { LitElement } from 'lit';


export class CasperEditDialogPage extends LitElement {
  validate () {
    throw 'Error! A validate method must be defined for the page.';
  }

  save () {
    throw 'Error! A save method must be defined for the page.';
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