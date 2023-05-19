import { LitElement, html, css } from 'lit';


class CasperButtonLit extends LitElement {
  static properties = {
    _text: {
      type: String
    }
  };

  static styles = css`
    :host {
      --button-font-size: 0.75rem;
    }

    .button {
      font-family: inherit;
      color: #FFF;
      font-size: var(--button-font-size);
      font-weight: 600;
      padding: 0.714em 1em;
      border-radius: 1.428em;
      outline: none;
      text-transform: uppercase;
      cursor: pointer;
    }

     .button[theme="regular"] {
      background-color: var(--button-primary-color);
      border: 1.5px solid var(--button-primary-color);
    }

    .button[theme="regular"]:hover {
      background-color: var(--light-primary-color);
      color: var(--button-primary-color);
    }

    .button[theme="warning"] {
      background-color: var(--error-color-soft);
      border: 1.5px solid var(--error-color-soft);
    }

    .button[theme="warning"]:hover {
      background-color: var(--error-color-soft-hover);
      border: 1.5px solid var(--error-color-soft-hover);
    }

    .button[theme][type="secondary"],
    .button[theme][type="secondary"]:hover {
      background-color: transparent;
    }

    .button[theme="regular"][type="secondary"] {
      color: var(--button-primary-color);
    }

    .button[theme="warning"][type="secondary"] {
      color: #808080;
      border-color: #a9a9a9;
    }

    .button[theme="warning"][type="secondary"]:hover {
      color: #707070;
      border-color: #808080;
    }

    .button[disabled] {
      color: #FFF !important;
      background-color: #e0e0e0 !important;
      border: 1.5px solid #e0e0e0 !important;
      pointer-events: none !important;
    }
  `;

  constructor () {
    super();

    this._theme = 'regular';
    this._type = 'primary';
    this._text = '';
  }

  render () {
    return html`
      <button class="button" type=${this._type} theme=${this._theme}>
        ${this._text}
      </button>
    `;
  }

  firstUpdated () {
    this._buttonEl = this.shadowRoot.querySelector('.button');
  }
}

customElements.define('casper-button-lit', CasperButtonLit);