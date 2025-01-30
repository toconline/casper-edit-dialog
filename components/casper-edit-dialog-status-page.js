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

        --icon-height: clamp(3.5rem, 7vw, 5rem);
        --icon-top-offset: calc(var(--icon-height) / 2.5);
        --frame-after-size: 1.2rem;
        --state-color-rgb: var(--status-blue-rgb);
        --self-close-transition-duration: 5000ms;

        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f5f4f4;
        color: var(--primary-text-color);
      }

      :host([state="error"]),
      :host([state="fatal-error"]) {
        --state-color-rgb: var(--status-red-rgb);
      }

      :host([state="success"]) {
        --state-color-rgb: var(--status-green-rgb);
      }

      :host([state="connecting"]),
      :host([state="connected"]) {
        --state-color-rgb: var(--status-blue-rgb);
      }

      [hidden] {
        display: none !important;
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
        display: flex;
        flex-direction: column;
        position: relative;
        border-radius: var(--radius-primary, 8px);
        padding: 0.625rem;
        background: radial-gradient(#ffffff 80%, #f5f4f4);
        box-shadow: 0 5px 21px 3px rgba(0, 0, 0, 0.19);
        /* 3rem for breathing space */
        width: max(100% - 3rem, 50vw);
        max-width: 35rem;
        height: 32.5vh;
        /* 1rem for breathing space */
        max-height: min(100% - var(--icon-top-offset) - var(--frame-after-size) - 1rem, 15.75rem);
      }

      .status-page__frame::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translate(-50%, 50%);
        width: 78%;
        height: var(--frame-after-size);
        background-color: rgb(var(--state-color-rgb));
        border-radius: var(--radius-primary, 8px);
        z-index: -1;
        transition: background-color 0.3s;
      }

      .status-page__icon-container {
        width: var(--icon-height);
        height: var(--icon-height);
        background-color: #FFF;
        border-radius: 50%;
        position: relative;
        top: calc(var(--icon-top-offset) * -1);
        margin-bottom: calc(var(--icon-top-offset) * -1 + 1rem);
        box-shadow: 0px 2px 20px 3px rgba(var(--state-color-rgb), 0.4);
        align-self: center;
        flex-shrink: 0;
        transition: box-shadow 0.3s;
      }

      .status-page__icon {
        width: 100%;
        height: 100%;
        --casper-timed-status-icon-check: /static/icons/check;
        --casper-timed-status-icon-error: /static/icons/error;
        --casper-timed-status-progress-color: var(--primary-color);
        --casper-timed-status-countdown-color: rgba(0, 0, 0, 0.1);
      }

      .status-page__message {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-grow: 1;
        overflow: auto;
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
        border-top-left-radius: calc(var(--radius-primary, 8px) - 2px);
        border-bottom-left-radius: calc(var(--radius-primary, 8px) - 2px);
        background: transparent;
        border: solid 1px rgb(var(--state-color-rgb));
        border-right-color: rgba(var(--state-color-rgb), 0);
        box-sizing: border-box;
        opacity: 0;
      }

      :host([self-close="true"]) .status-page__button::before {
        opacity: 1;
        width: 100%;
        border-right-color: rgba(var(--state-color-rgb), 1);
        border-top-right-radius: calc(var(--radius-primary, 8px) - 2px);
        border-bottom-right-radius: calc(var(--radius-primary, 8px) - 2px);
        transition: width var(--self-close-transition-duration) linear, border-right-color 150ms ease-out calc(var(--self-close-transition-duration) - 150ms), border-radius 1000ms linear calc(var(--self-close-transition-duration) - 1000ms);
      }

      .status-page__button-text {
        /* Needed to fix the stacking context */
        position: relative;
      }
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
    this._selfClose = false;
  }



  //***************************************************************************************//
  //                                ~~~ LIT life cycle ~~~                                 //
  //***************************************************************************************//

  render () {
    return html`
      <div class="status-page__frame">
        <div class="status-page__icon-container">
          <casper-timed-status
            id="status"
            class="status-page__icon"
            state=${this.state === 'fatal-error' ? 'error' : this.state}
            progress=${this.progress}
            ?no-reset
            timeout=${this.timeout}>
          </casper-timed-status>
        </div>
        <div class="status-page__message">
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
    this.state = undefined;
    this.progress = undefined;
    this._selfClose = false;
    this.clearText();
    this.clearCustom();
  }

  setSelfCloseStyles (value) {
    this.style.setProperty('--self-close-transition-duration', `${value}ms`);
    this._selfClose = true;
  }


  showNotificationStatus (notification, state = '') {
    this._selfClose = false;
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
    
        if (notification.message || notification.response?.body?.message || notification.message?.[0]) {
          this.description = this.editDialog.i18n.apply(this.editDialog, notification.message || [notification.response?.body?.message] || notification.message?.[0]);
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
    this._selfClose = false;
    this.clearText();
    this.clearCustom();
    this.state = options.state;

    if (Object.hasOwn(options, 'title')) this.title = options.title;
    if (Object.hasOwn(options, 'description')) this.description = options.description;

    this._setStateDefaultValues();

    if (Object.hasOwn(options, 'hide_button')) this._hideButton = options.hide_button;
    if (Object.hasOwn(options, 'self_close_duration')) {
      await this.updateComplete;
      this.setSelfCloseStyles(options.self_close_duration);
    }

    if (Object.hasOwn(options, 'timeout')) this.timeout = options.timeout;
  }

  /**
   *
   * @param {Number} count
   * @param {Boolean} forced
   */
  setProgressCount (count, forced = false, timeout) {
    if (count !== this.progress || forced) {
      this.state = 'connecting';
      this.progress = count;
      if (timeout) this.timeout = timeout;

      this._setStateDefaultValues();
    }
  }

  /**
   * Updates the progress display
   *
   * @param {Number} index  not used here, since we only have one bar. kept for backwards compatibility
   * @param {String} description smaller text to display
   * @param {Number} progress integer value between 0 and 100
   * @param {String} title bigger text to display
   */
  updateProgress (index = null, description = '', progress, title = 'Em progresso...') {
    this.state = 'connected';
    this.progress = progress;
    this.title = title;
    this.description = description;

    this._setStateDefaultValues();
  }



  //***************************************************************************************//
  //                              ~~~ Private methods  ~~~                                 //
  //***************************************************************************************//

  _setStateDefaultValues () {
    switch (this.state) {
      case 'connecting':
        if (!this.title) this.title = 'Em fila de espera...';
        if (!this.description) this.description = 'Por favor aguarde.';
        this._hideButton = true;
        break;

      case 'connected':
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

      case 'fatal-error':
        if (!this.title) this.title = 'Erro!';
        if (!this.description) this.description = 'Por favor contacte o suporte técnico.';
        this._hideButton = true;
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
