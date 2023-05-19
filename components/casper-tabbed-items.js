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
    showNewItemsAction: {
      type: Boolean
    },
    allowNewItems: {
      type: Boolean
    },
    showDeleteItemsAction: {
      type: Boolean
    },
    _activeIndex: {
      type: Number
    }
  };

  static styles = css`
    :host {
      --grid-item-min-width: 14.4rem;
      --cti-grey: rgb(179, 179, 179);
      --cti-dark-grey: rgb(149, 149, 149);
      --tab-vertical-padding: 0.25rem;
      --header-before-height: 0;
    }

    button {
      font-family: inherit;
      border: none;
      cursor: pointer;
      background-color: transparent;
    }

    button[hidden] {
      display: none !important;
    }

    .tabbed-items__action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--tab-vertical-padding);
    }

    .tabbed-items__action casper-icon {
      font-size: 1rem;
      width: 1em;
      height: 1em;
    }

    .tabbed-items__action[disabled] {
      pointer-events: none !important;
      background-color: var(--disabled-background-color) !important;
      color: var(--disabled-text-color) !important;
    }

    .header {
      --header-padding-bottom: 0.5rem;

      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding-bottom: var(--header-padding-bottom);
      border-bottom: 1px solid rgb(217, 217, 217);
      position: sticky;
      top: 0;
      background-color: #FFF;
      z-index: 1;
    }

    /* Prevents elements from peeking through while scrolling */
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: var(--header-before-height);
      transform: translateY(-100%);
      background-color: inherit;
    }

    .header__tab {
      position: relative;
      font-size: 0.875rem;
      font-weight: 500;
      padding: var(--tab-vertical-padding) 0.875rem;
      background-color: transparent;
      color: var(--cti-grey);
      transition: color 0.5s ease;
    }

    .header__tab:hover {
      color: var(--cti-dark-grey);
    }

    .header__tab::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: calc(var(--header-padding-bottom) * -1);
      width: 0;
      height: 2.5px;
      transform: translate(-50%, 50%);
      z-index: 1;
      background-color: transparent;
      transition: background-color 0.5s ease, width 0.5s ease;
    }

    .header__tab[active] {
      pointer-events: none;
      color: var(--primary-color);
      font-weight: 600;
    }

    .header__tab[active]::after {
      background-color: var(--primary-color);
      width: 100%;
    }

    .header__add {
      background-color: var(--light-primary-color);
      color: var(--primary-color);
      border-radius: 50%;
      transition: background-color 0.5s ease;
    }

    .header__add:hover {
      background-color: rgba(var(--dark-primary-color-rgb), 0.2);
    }

    .content {
      --item-padding: 0.625rem;

      position: relative;
    }

    .content__item {
      display: none;
      grid-row-gap: 0.625rem;
      grid-column-gap: 1.25rem;
      grid-template-columns: repeat(auto-fit, minmax(var(--grid-item-min-width), 1fr));
      grid-auto-rows: minmax(min-content, max-content);
      align-content: start;
      padding: var(--item-padding);
      /* Space needed so that an input's error message fits */
      padding-bottom: calc(var(--item-padding) * 2);
      border-bottom: 1px solid rgb(217, 217, 217);
    }

    .content__item[active] {
      display: grid;
    }

    .content__delete {
      position: absolute;
      right: 0;
      bottom: var(--item-padding);
      border-radius: 3px;
      gap: 0.3125rem;
      background-color: transparent;
      color: var(--status-red);
      transition: color 0.5s ease, background-color 0.5s ease;
    }

    .content__delete:hover {
      color: var(--error-color);
    }
  `;

  constructor () {
    super();

    this.items = [];
    this.showNewItemsAction = true;
    this.allowNewItems = true;
    this.showDeleteItemsAction = true;
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
          ? this.items.map((item, index) => html`<button class="header__tab" ?active=${index === this._activeIndex} .index=${index} @click=${this.activateItem.bind(this, index)}>${item.title ? item.title : index + 1}</button>`)
          : ''
        }

        ${this.showNewItemsAction
          ? html`
            <button class="header__add tabbed-items__action" @click=${this._addNewItem} ?disabled=${!this.allowNewItems}>
              <casper-icon icon="fa-regular/plus"></casper-icon>
            </button>`
          : ''
        }
      
      </div>

      <div class="content">
        ${(this.items.length > 0)
          ? this.items.map((item, index) => this._renderItem(item, index))
          : ''
        }

        ${this.showDeleteItemsAction 
          ? html`
            <button class="content__delete tabbed-items__action" @click=${this._deleteItem} ?disabled=${!this.items?.[this._activeIndex]?.allow_delete} ?hidden=${!this.items?.[this._activeIndex]?.hasOwnProperty('allow_delete')}>
              <casper-icon icon="fa-regular/trash-alt"></casper-icon>
              Eliminar
            </button>` 
          : ''
        }
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

  _deleteItem () {
    this._headerEl.querySelectorAll('.header__tab')[this.___activeIndex].remove();
    this._contentEl.querySelectorAll('.content__item')[this.___activeIndex].remove();
    if (this._activeIndex > 0) this.activateItem(this._activeIndex - 1);
  }
}

customElements.define('casper-tabbed-items', CasperTabbedItems);