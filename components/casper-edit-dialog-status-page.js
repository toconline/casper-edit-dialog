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
    title: { 
      type: String 
    },
    description: { 
      type: String 
    },
    _custom: {
      type: String
    },
    _hideButton: {
      type: Boolean
    },
    _selfClose: {
      type: String,
      reflect: true,
      attribute: 'self-close'
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
        --self-close-transition-duration: 4s;

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

      :host([state="connecting"]),
      :host([state="connected"]) {
        --state-color-rgb: var(--status-blue-rgb);
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
        border-radius: var(--radius-primary, 8px);
        padding: 0.625rem;
        background: radial-gradient(#ffffff 80%, #f5f4f4);
        box-shadow: 0 5px 21px 3px rgba(0, 0, 0, 0.19);
      }

      .status-page__icon-container {
        --icon-top: calc(var(--icon-height) / 2.5 * -1);

        background-color: #FFF;
        border-radius: 50%;
        position: relative;
        top: var(--icon-top);
        margin-bottom: calc(var(--icon-top) + 1rem);
        box-shadow: 0px 2px 20px 3px rgba(var(--state-color-rgb), 0.4);
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
        flex-grow: 1;
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
        position: relative;
      }

      .status-page__button:hover {
        cursor: pointer;
        color: var(--primary-color);
        border-color: var(--primary-color);
      }

      .status-page__button::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        height: 100%;
        width: 0;
        border-top-left-radius: calc(var(--radius-primary, 8px) - 3px);
        border-bottom-left-radius: calc(var(--radius-primary, 8px) - 3px);
        background: transparent;
        border: solid 1px rgb(var(--state-color-rgb));
        border-right-color: rgba(var(--state-color-rgb), 0);
        box-sizing: border-box;
      }

      :host([self-close]) .status-page__button::before {
        width: 100%;
        border-right-color: rgba(var(--state-color-rgb), 1);
        border-top-right-radius: calc(var(--radius-primary, 8px) - 3px);
        border-bottom-right-radius: calc(var(--radius-primary, 8px) - 3px);
        transition: width var(--self-close-transition-duration), border-right-color 0.15s linear calc(var(--self-close-transition-duration) - 0.15s), border-radius 1s linear calc(var(--self-close-transition-duration) - 1s);
      }

      .status-page__button-text {
        /* Needed to fix the stacking context */
        position: relative;
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
    this.title  = '';
    this.description  = '';

    this._hideButton = true;
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
                <h1 class="status-page__title">${this.title}</h1>
                ${this.description ? html`<p class="status-page__description">${this.description}</p>` : ''}
            `}
          </div>
          <button class="status-page__button" ?hidden=${this._hideButton} @click=${this.editDialog.hideStatusAndProgress.bind(this.editDialog)}><span class="status-page__button-text">Continuar</span></button>
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
    this._hideButton = true;
  }

  clearText () {
    this.title  = '';
    this.description  = '';
  }

  resetValues () {
    this.state    = undefined;
    this.progress = undefined;
    this.clearText();
    this.clearCustom();
  }

  selfClose (value) {
    this.style.setProperty('--self-close-transition-duration', `${value}s`);
    this._selfClose = true;
  }


  showNotificationStatus (notification, state = '') {
    this.clearText();
    this.clearCustom();
    this.state = state;

    if (notification) {
      if (notification.custom === true) {
        this.setCustom(notification.message[0]);
      } else {
        if (notification.response?.title) {
          this.title = notification.response.title;
        } else if (notification.title) {
          this.title = this.editDialog.i18n.apply(this.editDialog, notification.title);
        }
    
        if (notification.message || notification.response?.body?.message) {
          this.description = this.editDialog.i18n.apply(this.editDialog, notification.message || [notification.response?.body?.message]);
        }
      }
    } else {
      this.state = 'error';
    }

    this._setStateDefaultValues();
  }

  /**
   * Shows a customizable status page
   *
   * @param {Object} options Available options include: state, title, description, hide_button, self_close_duration
   */
  async showFreeStatus (options) {
    this.clearText();
    this.clearCustom();
    this.state = options.state;

    if (Object.hasOwn(options, 'title')) this.title = options.title;
    if (Object.hasOwn(options, 'description')) this.description = options.description;

    this._setStateDefaultValues();

    if (Object.hasOwn(options, 'hide_button')) this._hideButton = options.hide_button;
    if (Object.hasOwn(options, 'self_close_duration')) {
      await this.updateComplete;
      this.selfClose(options.self_close_duration);
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
   * Updates the progress display
   *
   * @param {Number} index  not used here we only have one bar
   * @param {String} description smaller text to display
   * @param {Number} progress integer value between 0 and 100
   * @param {String} title bigger text to display
   */
  updateProgress (index = null, description = '', progress, title = 'Em progresso...' ) {
    this.state = 'connected';
    this.progress = progress;
    this.title = title;
    this.description = description;
  }

  showResponse (response) {
    this.state = 'success';

    if (response.custom) {
      this.setCustom(response.message[0]);
    } else {
      this.clearCustom();
      this.title = response.message[0];
    }
  }



  //***************************************************************************************//
  //                              ~~~ Private methods  ~~~                                 //
  //***************************************************************************************//

  _setStateDefaultValues () {
    switch (this.state) {
      case 'connecting':
        if (!this.title) this.title = 'Em progresso...';
        if (!this.description) this.description = 'A realizar ação, por favor aguarde.';
        this._hideButton = true;
        break;

      case 'success':
        if (!this.title) this.title = 'Sucesso!';
        if (!this.description) this.description = 'A ação foi concluída com sucesso.';
        this._hideButton = false;
        break;
    
      case 'error':
        if (!this.title) this.title = 'Erro!';
        if (!this.description) this.description = 'Por favor contacte o suporte técnico.';
        this._hideButton = false;
        break;

      default:
        this.title = '';
        this.description = '';
        this._hideButton = true;
        break;
    }
  }
}

customElements.define('casper-edit-dialog-status-page', CasperEditDialogStatusPage);