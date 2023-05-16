import { LitElement, html, css } from 'lit';
import '@cloudware-casper/casper-icons/casper-icon.js';


class CasperTabbedItems extends LitElement {
  static properties = {
    renderItem: {
      type: Function
    },
    items: {
      type: Array
    },
    allowNewItems: {
      type: Boolean
    },
    _activeIndex: {
      type: Number
    }
  };

  static styles = css`
    :host {
      --grid-item-min-width: 15.625rem;
      --border-radius: 6px;
    }

    .header {
      --tab-vertical-padding: 0.31em;

      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-bottom: 0.75rem;
    }

    .header__tab,
    .header__add {
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      border: none;
      cursor: pointer;
      color: var(--primary-color);
    }

    .header__tab {
      border-radius: var(--border-radius);
      padding: var(--tab-vertical-padding) 1em;
      background-color: transparent;
      border: solid 1px var(--primary-color);
    }

    .header__tab[active] {
      background: var(--primary-color);
      color: #FFF;
      pointer-events: none;
    }

    .header__add {
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--tab-vertical-padding);
      background-color: #8db4ba40;
    }

    .header__add[disabled] {
      pointer-events: none;
      background-color: var(--disabled-background-color);
      color: var(--disabled-text-color);
    }

    .header__add-icon {
      font-size: 1rem;
      width: 1em;
      height: 1em;
    }

    .content__item {
      display: none;
      grid-row-gap: 0.625rem;
      grid-column-gap: 1.25rem;
      grid-template-columns: repeat(auto-fit, minmax(var(--grid-item-min-width), 1fr));
      box-shadow: rgb(255, 255, 255) 0px 6px 25px -13px, rgba(0, 0, 0, 0.03) 0px -6px 14px;
      padding: 15px;
      border: solid 1.5px #8db4ba40;
      border-radius: var(--border-radius);
      padding-top: 5px;
    }

    .content__item[active] {
      display: grid;
    }
  `;

  constructor () {
    super();

    this.items = [];
    this.allowNewItems = true;
    this._activeIndex = 0;
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.addNewItem) this.allowNewItems = false;
  }

  render () {
    return html`
      <div class="header">
        ${(this.items.length > 0)
          ? this.items.map((item, index) => html`<button class="header__tab" ?active=${index === this._activeIndex} .index=${index} @click=${this.activateItem.bind(this, index)}>${item.title}</button>`)
          : ''}

        <button class="header__add" @click=${this._addNewItem} ?disabled=${!this.allowNewItems}>
          <casper-icon class="header__add-icon" icon="fa-light:plus"></casper-icon>
        </button>
      </div>

      <div class="content">
        ${(this.items.length > 0)
        ? this.items.map((item, index) => this._renderItem(item, index))
        : ''}
      </div>
    `;
  }

  firstUpdated () {
    this._headerEl = this.shadowRoot.querySelector('.header');
    this._contentEl = this.shadowRoot.querySelector('.content');
  }

  activateItem (newIndex) {
    if (+newIndex === +this._activeIndex) return;

    this._activeIndex = +newIndex;
  }

  _renderItem (item, index) {
    return html`
      <div class="content__item" item-id=${item.id ? item.id : ''} ?active=${+index === +this._activeIndex}>
        ${this.renderItem(item)}
      </div>
    `;
  }

  _addNewItem () {
    this.addNewItem();
    this.activateItem(this.items.length);
  }
}

customElements.define('casper-tabbed-items', CasperTabbedItems);