import { LitElement, html, css } from 'lit';


class CasperConfirmationDialog extends LitElement {
  static properties = {
    _title: {
      type: String
    },
    _message: {
      type: String
    },
    _type: {
      type: String
    },
    _accept: {
      type: String
    },
    _reject: {
      type: String
    },
  };

  static styles = css`
    :host {
      --ccd-width: 27.5rem;
      --ccd-horizontal-padding: 1.25rem;
    }

    .confirmation-dialog {
      width: var(--ccd-width);
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      background-color: #FFF;
      box-shadow: rgba(0, 0, 0, 15%) 0 5px 20px;
      border: none;
      border-radius: var(--radius-primary, 8px);
      padding: 0;
      overflow: hidden;
    }

    .confirmation-dialog::backdrop {
      background-color: rgba(204, 204, 204, 65%);
    }

    .confirmation-dialog__text {
      padding: 1.875rem var(--ccd-horizontal-padding);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .confirmation-dialog__title {
      font-size: 1.125rem;
      margin: 0;
      color: #000;
    }

    .confirmation-dialog__message {
      font-size: 1rem;
      line-height: 1.3em;
      margin: 0;
      color: #808080;
    }

    .confirmation-dialog__actions {
      padding: 0.625rem var(--ccd-horizontal-padding);
      display: flex;
      justify-content: flex-end;
      gap: 0.375rem;
      background-color: #f8f8f8;
    }

    .edit-dialog__button {
      font-family: inherit;
      color: #FFF;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.714em 1em;
      border-radius: 1.428em;
      outline: none;
      text-transform: uppercase;
      cursor: pointer;
    }

    .confirmation-dialog[type="regular"] .edit-dialog__button {
      background-color: var(--button-primary-color);
      border: 1.5px solid var(--button-primary-color);
    }

    .confirmation-dialog[type="regular"] .edit-dialog__button:hover {
      background-color: var(--light-primary-color);
      color: var(--button-primary-color);
    }

    .confirmation-dialog[type="warning"] .edit-dialog__button {
      background-color: var(--error-color-soft);
      border: 1.5px solid var(--error-color-soft);
    }

    .confirmation-dialog[type="warning"] .edit-dialog__button:hover {
      background-color: var(--error-color-soft-hover);
      border: 1.5px solid var(--error-color-soft-hover);
    }

    .confirmation-dialog[type] .edit-dialog__button[type="secondary"],
    .confirmation-dialog[type] .edit-dialog__button[type="secondary"]:hover {
      background-color: transparent;
    }

    .confirmation-dialog[type="regular"] .edit-dialog__button[type="secondary"] {
      color: var(--button-primary-color);
    }

    .confirmation-dialog[type="warning"] .edit-dialog__button[type="secondary"] {
      color: #808080;
      border-color: #a9a9a9;
    }

    .confirmation-dialog[type="warning"] .edit-dialog__button[type="secondary"]:hover {
      color: #707070;
      border-color: #808080;
    }

    .edit-dialog__button[disabled] {
      color: #FFF;
      background-color: #e0e0e0;
      border: 1.5px solid #e0e0e0;
      pointer-events: none;
    }
  `;

  
  constructor () {
    super();

    window.confirmationDialog = this;

    this._type = 'regular';
    this._title = '';
    this._message = '';
    this._accept = 'Sim';
    this._reject = 'Cancelar';
  }

  render () {
    return html`
      <dialog id="confirmationDialog" class="confirmation-dialog" type=${this._type}>
        <div class="confirmation-dialog__text">
          <h1 class="confirmation-dialog__title">${this._title}</h1>
          <p class="confirmation-dialog__message">${this._message}</p>
        </div>
    
        <div class="confirmation-dialog__actions">
          <button class="edit-dialog__button" type="secondary" @click=${this.close.bind(this)}>${this._reject}</button>
          <button class="edit-dialog__button" @click=${this.confirm.bind(this)}>${this._accept}</button>
        </div>
      </dialog>
    `;
  }

  firstUpdated () {
    this._confirmationDialogEl = this.shadowRoot.getElementById('confirmationDialog');
  }

  open (options) {
    this._options = options;
    if (this._options.type) this._type = this._options.type;
    if (this._options.title) this._title = this._options.title;
    if (this._options.message) this._message = this._options.message;
    if (this._options.accept) this._accept = this._options.accept;
    if (this._options.reject) this._reject = this._options.reject;
    if (this._options.width) this.style.setProperty('--ccd-width', this._options.width);

    this._confirmationDialogEl.showModal();
  }

  close () {
    this._confirmationDialogEl.close();
  }

  confirm () {
    this.close();

    if (this._options.hasOwnProperty('accept_callback')) this._options.accept_callback();
  }
}

customElements.define('casper-confirmation-dialog', CasperConfirmationDialog);