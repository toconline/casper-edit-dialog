/* 
 * Copyright (C) 2023 Cloudware S.A. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';


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
    _custom: {
      type: String
    }
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
      overflow: auto;
    }

    .confirmation-dialog__title {
      font-size: 1.125rem;
      margin: 0 0 1rem 0;
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
      min-width: 4.5em;
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

    this.setInitialValues();
  }

  render () {
    return html`
      <dialog id="confirmationDialog" class="confirmation-dialog" type=${this._type}>
        <div class="confirmation-dialog__text">
          ${this._custom 
            ? unsafeHTML(this._custom) 
            : html`
              <h1 class="confirmation-dialog__title">${this._title}</h1>
              <p class="confirmation-dialog__message">${this._message}</p>
            `
          }
        </div>
    
        <div class="confirmation-dialog__actions">
          ${this._reject ? html`<button class="edit-dialog__button" type="secondary" @click=${this.close.bind(this)}>${this._reject}</button>` : ''}
          <button class="edit-dialog__button" @click=${this.confirm.bind(this)} autofocus>${this._accept}</button>
        </div>
      </dialog>
    `;
  }

  firstUpdated () {
    this._confirmationDialogEl = this.shadowRoot.getElementById('confirmationDialog');
    this._confirmationDialogEl.addEventListener('cancel', this._dialogCancelHandler.bind(this));
  }

  setInitialValues () {
    this._type = 'regular';
    this._title = '';
    this._message = '';
    this._accept = 'Sim';
    this._reject = 'Cancelar';
    this._noCancelOnEscKey = false;
    this._custom = undefined;
  }

  open (options) {
    this._options = options;
    if (this._options.type) this._type = this._options.type;
    if (this._options.title) this._title = this._options.title;
    if (this._options.message) this._message = this._options.message;
    if (this._options.accept) this._accept = this._options.accept;
    if (Object.hasOwn(this._options, 'reject')) this._reject = this._options.reject;
    if (Object.hasOwn(this._options, 'no_cancel_on_esc_key')) this._noCancelOnEscKey = this._options.no_cancel_on_esc_key;
    if (this._options.custom) this._custom = this._options.custom;
    if (this._options.width) this.style.setProperty('--ccd-width', this._options.width);

    this._confirmationDialogEl.showModal();
  }

  close () {
    this._confirmationDialogEl.close();

    this.style.removeProperty('--ccd-width');
    this.setInitialValues();
  }

  confirm () {
    this.close();

    if (this._options.hasOwnProperty('accept_callback')) this._options.accept_callback();
  }

  // Fired when user presses the 'esc' key
  _dialogCancelHandler (event) {
    if (!event) return;

    // Needed otherwise it would call the dialog's native close method
    event.preventDefault();
    if (!this._noCancelOnEscKey) this.close();
  }
}

customElements.define('casper-confirmation-dialog', CasperConfirmationDialog);
