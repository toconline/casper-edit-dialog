import { html, css, LitElement } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '@cloudware-casper/casper-timed-status/casper-timed-status.js';


export class CasperEditDialogStatusPage extends LitElement {
  static properties = {
    state: { 
      type: String,
      reflect: true
    },
    progress: { 
      type: Number
    },
    timeout: { 
      type: Number 
    },
    message: { 
      type: String 
    },
    _custom: {
      type: String
    }
  }

  static styles = [
    css`
      :host {
        --status-green-rgb: 71, 174, 76;
        --status-yellow-rgb: 255, 217, 102;
        --status-blue-rgb: 0, 171, 196;
        --status-red-rgb: 233, 68, 95;
        --status-orange-rgb: 243, 145, 42;
        --status-gray-rgb: 78, 77, 77;

        --icon-height: 5rem;
        --state-color-rgb: var(--status-blue-rgb);

        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f5f4f4;
        color: var(--primary-text-color);
      }

      :host([state="error"]) {
        --state-color-rgb: var(--status-red-rgb);
      }

      :host([state="success"]) {
        --state-color-rgb: var(--status-green-rgb);
      }

      * {
        box-sizing: border-box;
      }

      h1, h2, h3 {
        text-align: center;
      }

      h1 {
        font-size: 1.25rem;
        font-weight: 700;
      }

      h2 {
        font-size: 0.875rem;
        font-weight: 500;
      }

      h3 {
        font-size: 0.75rem;
        font-weight: 300;
      }

      .status-page__frame {
        max-height: calc(100% - 5rem);
        max-width: calc(100% - 5rem);
        display: flex;
        flex-direction: column;
        position: relative;
        height: 60%;
        width: 70%;
      }

      .status-page__frame::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translate(-50%, 50%);
        width: 78%;
        height: 1.2rem;
        background-color: rgb(var(--state-color-rgb));
        border-radius: var(--radius-primary, 8px);

        z-index: -1;
      }

      .status-page__message {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        border-radius: var(--radius-primary, 8px);
        padding: 0.625rem;
        background: radial-gradient(#ffffff 80%, #f5f4f4);
        box-shadow: 0 5px 21px 3px rgba(0, 0, 0, 0.19);
      }

      .status-page__icon-container {
        background-color: #FFF;
        border-radius: 50%;
        position: relative;
        top: -2rem;
        margin-bottom: -2rem;
        box-shadow: 0px 2px 20px 3px rgba(var(--state-color-rgb), 0.6);
      }

      .status-page__icon {
        width: var(--icon-height);
        height: var(--icon-height);
        
        --casper-timed-status-icon-check: /static/icons/check;
        --casper-timed-status-icon-error: /static/icons/error;
        --casper-timed-status-progress-color: var(--primary-color);
        --casper-timed-status-countdown-color: rgba(0, 0, 0, 0.1);
      }

      .status-page__text-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: calc(100% - 3rem);
      }

      .status-page__text-container > * {
        margin: 0;
      }

      .status-page__description {
        color: darkgrey;
      }

      .status-page__button {
        background-color: transparent;
        outline: none;
        font-family: inherit;
        font-size: 0.875rem;
        font-weight: 600;
        padding: 0.8em;
        border: solid 1px lightgrey;
        border-radius: calc(var(--radius-primary, 8px) - 2px);
        color: darkgrey;
        text-transform: uppercase;
        align-self: stretch;
        margin-top: 2rem;
        transition: all 0.5s;
      }

      .status-page__button:hover {
        cursor: pointer;
        color: var(--primary-color);
        border-color: var(--primary-color);
      }

      /* .bordered {
        border: 2px gray solid;
      } */

      /* .spinner {
        display: flex;
        height: 4.375rem;
      } */
    `
  ];

  constructor () {
    super();
    this.state    = undefined;
    this.progress = undefined;
    this.timeout  = 25;
    this.message  = '';
  }



  //***************************************************************************************//
  //                                ~~~ LIT life cycle ~~~                                 //
  //***************************************************************************************//

  render () {
    return html`
      <div class="status-page__frame">
        <div class="status-page__message">
          <div class="status-page__icon-container">
            <casper-timed-status
              id="status"
              class="status-page__icon"
              state=${this.state}
              progress=${this.progress}
              ?no-reset
              timeout=${this.timeout}>
            </casper-timed-status>
          </div>
          <div class="status-page__text-container">
            ${this._custom 
              ? unsafeHTML(this._custom) 
              : html`
                <h1 class="status-page__title">${this.message}</h1>
            `}
          </div>
          <button class="status-page__button" @click=${this.editDialog.hideStatusAndProgress.bind(this.editDialog)}>Continuar</button>
        </div>
      </div>
    `;
  }

  firstUpdated (changedProperties) {
    this._timedStatusEl = this.shadowRoot.getElementById('status');
  }



  //***************************************************************************************//
  //                              ~~~ Public methods  ~~~                                  //
  //***************************************************************************************//

  setCustom (custom) {
    this._custom = custom;
  }

  clearCustom () {
    this._custom = undefined;
  }

  resetValues () {
    this.state    = undefined;
    this.progress = undefined;
    this.message  = '';
    this.clearCustom();
  }

  showStatus (notification, state = 'error') {
    if (!notification) {
      this.state = 'error';
      this.message = 'Erro!';
      return;
    }

    this.state = state;

    if (notification.custom === true) {
      this.setCustom(notification.message[0]);
    } else {
      this.clearCustom();
      this.message = this.editDialog.i18n.apply(this.editDialog, notification.message || [notification?.response?.body?.message]);
    }
  }

  /**
   *
   * @param {Number} count
   * @param {Boolean} forced
   */
  setProgressCount (count, forced = false) {
    if (count !== this.progress || forced) {
      this.state = 'connecting';
      this.progress = count;
    }
  }

  /**
   * Update the progress display
   *
   * @param {Number} index  not used here we only have one bar
   * @param {String} message text to display
   * @param {Number} progress integer value between 0 and 100
   */
  updateProgress (index = null, message, progress) {
    this.state    = 'connected';
    this.progress = progress;
    this.message  = message;
  }

  showResponse (response) {
    this.state = 'success';

    if (response.custom) {
      this.setCustom(response.message[0]);
    } else {
      this.clearCustom();
      this.message = response.message[0];
    }
  }
}

customElements.define('casper-edit-dialog-status-page', CasperEditDialogStatusPage);