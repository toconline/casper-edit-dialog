import { LitElement, html, css } from 'lit';
import '@cloudware-casper/casper-icons/casper-icon.js';


class CasperToastLit extends LitElement {
  static properties = {
    _text: {
      type: String
    },
    _showDialog: {
      type: Boolean,
      attribute: 'show-dialog',
      reflect: true
    },
    transitionDuration: {
      type: Number
    }
  };

  static styles = css`
    :host {
      --toast-background-color: var(--primary-color);

      position: fixed;
      bottom: 1rem;
      left: 1rem;
      width: calc(100% - 2rem);
      opacity: 0;
      transition: opacity var(--transition-duration, 300);
      pointer-events: none;
    }

    :host([show-dialog]) {
      opacity: 1;
      pointer-events: auto;
    }

    .toast {
      position: static;
      box-sizing: border-box;
      width: 100%;
      padding: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #FFF;
      background-color: var(--toast-background-color);
      box-shadow: rgba(0, 0, 0, 15%) 0 5px 20px;
      border: none;
      border-radius: 4px;
      align-items: center;
      gap: 1rem;

      // Its default display of 'none' while closed would ruin the transition, so we also set it as 'flex'
      display: flex;
    }

    .toast[open] {
      display: flex;
    }

    .toast__text {
      flex-grow: 1;
    }

    .toast__close {
      flex-shrink: 0;
      cursor: pointer;
    }
  `;

  
  constructor () {
    super();

    this._text = '';
    this._toastDuration = 5000;
    this._showDialog = false;

    this.transitionDuration = 300;
  }

  render () {
    return html`
      <dialog id="toast" class="toast">
        <div class="toast__text">${this._text}</div>
        <casper-icon class="toast__close" icon="fa-solid:times-circle" @click=${this.close.bind(this)}></casper-icon>
      </dialog>
    `;
  }

  willUpdate (changedProperties) {
    if (changedProperties.has('transitionDuration')) {
      this.style.setProperty('--transition-duration', `${this.transitionDuration}ms`);
    }
  }

  firstUpdated () {
    this._toastEl = this.shadowRoot.getElementById('toast');
  }

  open (options) {
    if (options.text) this._text = options.text;
    if (options.duration) this._toastDuration = options.duration;
    if (options.backgroundColor) this.style.setProperty('--toast-background-color', options.backgroundColor);

    this._toastEl.show();
    this._showDialog = true;

    setTimeout(() => {
      this.close();
    }, this._toastDuration);
  }

  close () {
    this._showDialog = false;

    setTimeout(() => {
      this._toastEl.close();
    }, this.transitionDuration);
  }

  isOpen () {
    return this._toastEl.open;
  }
}

customElements.define('casper-toast-lit', CasperToastLit);