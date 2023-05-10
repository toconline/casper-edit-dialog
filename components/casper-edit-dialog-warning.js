import { LitElement, html, css } from 'lit';


class CasperEditDialogWarning extends LitElement {
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

    .ced-warning {
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

    .ced-warning::backdrop {
      background-color: rgba(204, 204, 204, 65%);
    }

    .ced-warning__text {
      padding: 1.875rem var(--ccd-horizontal-padding);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ced-warning__title {
      font-size: 1.125rem;
      margin: 0;
      color: #000;
    }

    .ced-warning__message {
      font-size: 1rem;
      line-height: 1.3em;
      margin: 0;
      color: #808080;
    }

    .ced-warning__actions {
      padding: 0.625rem var(--ccd-horizontal-padding);
      display: flex;
      justify-content: flex-end;
      gap: 0.375rem;
    }

    .edit-dialog__button {
      color: #FFF;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.714em;
      border-radius: 1.428em;
      outline: none;
      text-transform: uppercase;

      min-width: 60px;
      cursor: pointer;
      font-family: inherit;
    }

    .ced-warning[type="regular"] .edit-dialog__button {
      background-color: var(--button-primary-color);
      border: 1.5px solid var(--button-primary-color);
    }

    .ced-warning[type="warning"] .edit-dialog__button {
      background-color: var(--error-color-soft);
      border: 1.5px solid var(--error-color-soft);
    }

    .ced-warning[type="warning"] .edit-dialog__button:hover {
      background-color: var(--error-color-soft-hover);
      border: 1.5px solid var(--error-color-soft-hover);
    }

    .ced-warning[type] .edit-dialog__button.reverse,
    .ced-warning[type] .edit-dialog__button.reverse:hover {
      background-color: transparent;
    }

    .ced-warning[type="regular"] .edit-dialog__button.reverse {
      color: var(--button-primary-color);
    }

    .ced-warning[type="warning"] .edit-dialog__button.reverse {
      color: var(--error-color-soft);
    }

    .ced-warning[type="warning"] .edit-dialog__button.reverse:hover {
      color: var(--error-color-soft-hover);
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

    this._type = 'regular';
    this._title = '';
    this._message = '';
    this._accept = 'Sim';
    this._reject = 'Cancelar';
  }

  render () {
    return html`
      <dialog id="editDialogWarning" class="ced-warning" type=${this._type}>
        <div class="ced-warning__text">
          <h1 class="ced-warning__title">${this._title}</h1>
          <p class="ced-warning__message">${this._message}</p>
        </div>
    
        <div class="ced-warning__actions">
          <button class="edit-dialog__button reverse" @click=${this.close.bind(this)}>${this._reject}</button>
          <button class="edit-dialog__button" @click=${this.confirm.bind(this)}>${this._accept}</button>
        </div>
      </dialog>
    `;
  }

  firstUpdated () {
    this._warningEl = this.shadowRoot.getElementById('editDialogWarning');
  }

  open (options) {
    this._options = options;
    if (this._options.type) this._type = this._options.type;
    if (this._options.title) this._title = this._options.title;
    if (this._options.message) this._message = this._options.message;
    if (this._options.accept) this._accept = this._options.accept;
    if (this._options.reject) this._reject = this._options.reject;
    if (this._options.width) this.style.setProperty('--ccd-width', this._options.width);

    this._warningEl.showModal();
  }

  close () {
    this._warningEl.close();
  }

  confirm () {
    this.close();

    if (this._options.hasOwnProperty('accept_callback')) this._options.accept_callback();
  }
}

customElements.define('casper-edit-dialog-warning', CasperEditDialogWarning);