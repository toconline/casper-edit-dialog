import { html, css, LitElement } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '@cloudware-casper/casper-timed-status/casper-timed-status.js';


export class CasperEditDialogStatusPage extends LitElement {
  static properties = {
    state:     { type: String },
    progress:  { type: Number },
    timeout:   { type: Number },
    message:   { type: String }
  }

  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: #efefef;
        color: var(--primary-text-color);
        padding: 3.75rem;

        --icon-height: 5rem;
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
        max-height: calc(100% - (var(--icon-height) / 2));
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .status-page__message {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #FFF;
        border-radius: var(--radius-primary, 8px);
        padding: 2.5rem;
        overflow: auto;
      }

      .status-page__icon-container {
        background-color: #FFF;
        border-radius: 50%;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .status-page__icon {
        width: var(--icon-height);
        height: var(--icon-height);
        
        --casper-timed-status-progress-color: var(--primary-color);
        --casper-timed-status-icon: /static/icons/error;
        --casper-timed-status-icon-check: /static/icons/check;
        --casper-timed-status-icon-error: /static/icons/error;
        --casper-timed-status-icon-timeout: /static/icons/timeout;
      }

      .bordered {
        border: 2px gray solid;
      }

      .spinner {
        display: flex;
        height: 4.375rem;
      }
    `
  ];

  constructor () {
    super();
    this.state    = undefined;
    this.progress = undefined;
    this.timeout  = 25;
    this.message  = '';
  }

  showResponse (response) {
    this.state = 'success';
    if ( response.custom ) {
      this._custom = response.message[0];
    } else {
      this._custom = undefined;
      this.message = response.message[0];
    }

    this.requestUpdate();
  }

  showStatus (notification) {
    this.state = 'error';
  }

  /**
   * Update the progress display
   *
   * @param {Number} index  not used here we only have one bar
   * @param {String} message text to display
   * @param {Number} progress integer value between 0 and 100
   */
  updateProgress (index, message, progress) {
    this.state    = 'connected';
    this.progress = progress;
    this.message  = message;
    this.requestUpdate();
  }

  /**
   *
   * @param {Number} count
   * @param {Boolean} forced
   */
  setProgressCount (count, forced) {
    /* not implemented */
  }

  setCustom (custom) {
    this._custom = custom;
    this.requestUpdate();
  }

  clearCustom () {
    this._custom = undefined;
    this.requestUpdate();
  }

  //***************************************************************************************//
  //                                ~~~ LIT life cycle ~~~                                 //
  //***************************************************************************************//

  render () {
    return html`
      <div class="status-page__frame">
        <div class="status-page__message">
          ${this._custom ? unsafeHTML(this._custom) : html`<h1>${this.message}</h1>`}
        </div>
        <div class="status-page__icon-container">
          <casper-timed-status
            id="status"
            class="status-page__icon"
            .state=${this.state}
            .progress=${this.progress}
            ?no-reset
            .timeout=${this.timeout}>
          </casper-timed-status>
        </div>
      </div>
    `;
  }

  firstUpdated () {
    this._timedStatusEl = this.shadowRoot.getElementById('status');
  }
}

customElements.define('casper-edit-dialog-status-page', CasperEditDialogStatusPage);