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
        place-items: center;
        justify-items: center;
        background-color: #F5F6FA !important;
        color: #2E3641;
        padding: 60px;
        z-index: 3;
      }

      h1 {
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: 24px;
        letter-spacing: 0px;
        text-align: center;
      }

      h2 {
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        text-align: center;
      }

      h3 {
        font-size: 12px;
        font-style: normal;
        font-weight: 300;
        text-align: center;
      }

      .status-background {
        width: 78px;
        height: 78px;
        top: -39px;
        left: calc(50% - 39px);
        background-color: white;
        position: absolute;
        border-radius: 50%;
      }

      casper-timed-status {
        width: 80px;
        height: 80px;
        position: absolute;
        top: -40px;
        left: calc(50% - 40px);
        --casper-timed-status-progress-color: var(--primary-color);
        --casper-timed-status-icon-check: /static/icons/check;
        --casper-timed-status-icon-error: /static/icons/error;
        --casper-timed-status-icon-timeout: /static/icons/timeout;
      }

      .bordered {
        border: 2px gray solid;
      }

      .frame {
        width: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .status-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: white;
        border-radius: 16px;
        padding: 40px;
        width: 100%;
        box-sizing: border-box;
        overflow: auto;
      }

      .spinner {
        display: flex;
        height: 70px;
      }

      .operations {
        display: flex;
        gap: 20px;
        list-style: none;
        margin: 18px 0 0 0;
        padding: 0;
      }

      .operations li {
        min-width: 280px;
      }

      .operations a {
        color: rgb(46, 54, 65);
        display: flex;
        gap: 10px;
        border: 1px solid #CCCCCC;
        border-radius: 40px;
        padding: 10px 20px;
        text-decoration: none;
        text-transform: uppercase;
        font-size: 12px;
        font-weight: bold;
        align-items: center;
        justify-content: center;
      }

      .operations a:hover {
        background-color: #FEFAFC;
        color: var(--primary-color);
        border-color: var(--primary-color);
      }

      .operations a:hover casper-icon {
        color: var(--primary-color);
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

    setTimeout(() => {
      const safePageData = this.parentElement?.querySelector("safe-page")?.data;
      this.shadowRoot.querySelectorAll('.status-wrapper .operations a').forEach(elem =>
        elem.addEventListener('click', app._boundOperationActions.bind(safePageData))
      );
    }, 1500);

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
      <div class="frame">
        <div class="status-wrapper">
          ${this._custom ? unsafeHTML(this._custom) : html`<h1>${this.message}</h1>`}
        </div>
        <div class="status-background">
        </div>
        <casper-timed-status
          id="status"
          .state=${this.state}
          .progress=${this.progress}
          ?no-reset
          .timeout=${this.timeout}>
        </casper-timed-status>
      </div>
    `;
  }

  firstUpdated () {
    this._status = this.shadowRoot.getElementById('status');
  }
}

customElements.define('casper-edit-dialog-status-page', CasperEditDialogStatusPage);