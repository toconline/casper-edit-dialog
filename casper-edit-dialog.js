import { html, css, LitElement } from 'lit';

export class CasperEditDialog extends LitElement {
  static properties = {
    _title: {
      type: String
    },
    _pages: {
      type: Array
    },
    _activeIndex: {
      type: Number
    }
  };

  static styles = css`
    :host {
      --ced-vertical-padding: 10px;
      --ced-horizontal-padding: 20px;
    }

    * {
      box-sizing: border-box;
    }

    .edit-dialog {
      max-width: 90vw;
      max-height: 90vh;
      background-color: var(--primary-color);
      box-shadow: rgba(0, 0, 0, 15%) 0 5px 20px;
      border: none;
      padding: 0;
      border-radius: 10px;
      overflow: hidden;
      display: grid;
      grid-template-areas: 
        "labels header"
        "labels page"
        "labels footer";
      grid-template-columns: 13.75rem calc(100% - 13.75rem);
    }

    .edit-dialog::backdrop {
      background-color: rgba(204, 204, 204, 65%);
    }

    .edit-dialog__labels-list {
      grid-area: labels;
      margin: 0;

      padding: 10px;
      color: #FFF;
      list-style-type: none;
      box-shadow: rgba(0, 0, 0, 0.06) -15px -7px 10px inset;
      padding-top: 90px;
    }

    .edit-dialog__label {
      display: flex;
      align-items: center;
      padding: 0.4rem 1rem;
      opacity: 0.6;
      cursor: pointer;
      transition: opacity 0.5s;
      margin-bottom: 10px;
      position: relative;
    }

    .edit-dialog__label[active] {
      opacity: 1;
      pointer-events: none;
    }

    .edit-dialog__label-number {
      flex-shrink: 0;
      margin-right: 10px;
      background: transparent;
      border: solid 1px rgba(216, 242, 242, 0.66);
      width: 30px;
      height: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .edit-dialog__label[active] .edit-dialog__label-number {
      background: rgba(216, 242, 242, 0.33);
      border: none;
    }

    .edit-dialog__label-text {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .edit-dialog__label::after {
      content: "";
      display: block;
      height: 20px;
      width: 20px;
      background-color: #FFF;
      position: absolute;
      top: 50%;
      right: -10px;
      clip-path: polygon(0% 0%, 100% 100%, 0% 100%);
      transform: translate(50%, -50%) rotate(45deg);
      border-radius: 0 0 0 0.2rem;
      opacity: 0;
      transition: opacity 0.5s;
    }

    .edit-dialog__label[active]::after {
      opacity: 1;
    }

    .edit-dialog > *:not(.edit-dialog__labels-list) {
      padding: var(--ced-vertical-padding) var(--ced-horizontal-padding);
      background-color: #FFF;
    }

    .edit-dialog__header {
      grid-area: header;
      font-size: 18px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1em;
      position: relative;
      z-index: 1;
      background-color: #FFF;
      border-top-left-radius: 6px;
    }

    .edit-dialog__header-text {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-top: 16px;
      flex-grow: 1;
      border-bottom: solid 1px var(--primary-color);
    }

    .edit-dialog__header-text > * {
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .edit-dialog__title {
      font-size: 1em;
      font-weight: 700;
    }

    .edit-dialog__subtitle {
      font-size: 14px;
      font-weight: 400;
      color: grey;
    }

    .edit-dialog__close {
      background: transparent;
      color: inherit;
      border: none;
      padding: 0;
      flex-shrink: 0;
      z-index: 4;
      width: 1.388em;
      height: 1.388em;
      transition: background-color 1s;
    }

    .edit-dialog__close:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .edit-dialog__content-wrapper {
      grid-area: page;
      position: relative;
    }

    .edit-dialog__pages-container {
      width: 800px;
      height: 418px;
      overflow: hidden;

      display: flex;
      justify-content: center;
      align-items: stretch;
      position: relative;

      padding: 20px;
      border-radius: 6px;
    }

    .edit-dialog__pages-container > * {
      position: absolute;
      opacity: 0;
      pointer-events: none;
      flex-grow: 1;
    }

    .edit-dialog__pages-container > *[active] {
      position: relative;
      opacity: 1;
      pointer-events: auto;
    }

    .edit-dialog__status-page {
      position: absolute;
      top: var(--ced-vertical-padding);
      left: var(--ced-horizontal-padding);
      width: calc(100% - 2 * var(--ced-horizontal-padding));
      height: calc(100% - 2 * var(--ced-vertical-padding));
      border-radius: 6px;
    }

    .edit-dialog__status-page[hidden] {
      opacity: 0;
      display: none;
    }

    .edit-dialog__footer {
      grid-area: footer;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      box-shadow: rgba(0, 0, 0, 0.05) 0px -4px 12px;
      border-top: solid 1px rgba(0, 0, 0, 0.05);
      z-index: 20;
      border-bottom-left-radius: 6px;
    }

    .edit-dialog__button {
      background-color: var(--button-primary-color);
      border: 2px solid var(--button-primary-color);
      color: #FFF;
      padding: 10px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      -webkit-font-smoothing: antialiased;
      outline: none;
      transition: background-color 0.5s, color 0.5s;
    }

    .edit-dialog__button.reverse {
      background-color: #FFF;
      color: var(--button-primary-color);
    }

    .edit-dialog__button:hover {
      cursor: pointer;
      background-color: var(--light-primary-color);
      color: var(--button-primary-color);
      transition: background-color 1s, color 0.5s;
    }

    .edit-dialog__button[disabled] {
      color: #FFF;
      background-color: #e0e0e0;
      border: 2px solid #e0e0e0;
      pointer-events: none;
    }
  `;

  constructor () {
    super();


    this._state = 'normal';
    this._title = '';
    this._pages = [];
    this._activeIndex = 0;
  }

  connectedCallback() {
    super.connectedCallback();

    this.dispatchEvent(new CustomEvent('casper-edit-dialog-opened', { bubbles: true, composed: true }));
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.dispatchEvent(new CustomEvent('casper-edit-dialog-closed', { bubbles: true, composed: true }));
  }
  

  //***************************************************************************************//
  //                              ~~~ LIT lifecycle  ~~~                                   //
  //***************************************************************************************//

  render () {
    return html`
      <dialog id="editDialog" class="edit-dialog">
        <ol class="edit-dialog__labels-list">
          ${(this._pages.length > 0)
            ? this._pages.map((page, index) => html`
              <li class="edit-dialog__label" ?active=${index === this._activeIndex} .index=${index} @click=${this._labelClickHandler}>
                <span class="edit-dialog__label-number">${index + 1}</span>
                <span class="edit-dialog__label-text">${page?.label}</span>
              </li>
            `)
            : ''}
        </ol>
        
        <div class="edit-dialog__header">
          <hgroup class="edit-dialog__header-text">
            <h1 class="edit-dialog__subtitle">${this._title}</h1>
            ${(this._pages.length > 0)
              ? html`<p class="edit-dialog__title">${this._pages[this._activeIndex].title}</p>`
              : ''
            }
          </hgroup>
      
          <casper-icon-button tooltip="Fechar" class="edit-dialog__close" icon="fa-light:times-circle" @click=${this.close.bind(this)}></casper-icon-button>
        </div>

        <div class="edit-dialog__content-wrapper">
          <div class="edit-dialog__pages-container"></div>
        </div>
      
        <div class="edit-dialog__footer">
          <button class="edit-dialog__button reverse" @click=${this.close.bind(this)}>Cancelar</button>
          <button class="edit-dialog__button" @click=${this._save.bind(this)}>Gravar</button>
        </div>
      </dialog>
    `;
  }
  
  firstUpdated () {
    this._dialogEl = this.shadowRoot.getElementById('editDialog');
    this._contentWrapperEl = this.shadowRoot.querySelector('.edit-dialog__content-wrapper');
    this._pagesContainerEl = this.shadowRoot.querySelector('.edit-dialog__pages-container');

    this._dialogEl.addEventListener('click', (event) => {
      // Only a click on the ::backdrop can generate the 'dialog' nodeName
      if (event?.target?.nodeName === 'DIALOG') {
        this.close();
      }
    });

    // Fired when user presses the 'esc' key
    this._dialogEl.addEventListener('cancel', function (event) {
      if (!event) return;

      // Needed otherwise it would call the dialog's native close method
      event.preventDefault();
      this.close();
    }.bind(this));

    // The casper-select dropdown has to be moved to the stacking context of the top-layer, otherwise it wouldn't be visible
    this.addEventListener('casper-select-opened', function (event) {
      if (!event?.detail?.dropdown) return;

      event.stopPropagation();
      this._contentWrapperEl.appendChild(event.detail.dropdown);
    });
  }

  setOptions (options) {
    this._options = options;
  }

  //***************************************************************************************//
  //                              ~~~ Public methods  ~~~                                  //
  //***************************************************************************************//

  async open () {
    this._title = this._options.title;
    try {
      for (const page of this._options.pages) {
        const idx = page.lastIndexOf('/') + 1;
        const module = await import(`/src/${page.slice(0,idx)}${window.app.digest ? `${window.app.digest}.` : ''}${page.slice(idx)}.js`);
        this._pages.push({
          label: module.label, // TODO fallbacks
          title: module.title, // TODO fallbacks
          tag_name: page.slice(idx) // TODO fallbacks
        });
      }
      this.requestUpdate();
    } catch (error) {
      console.error(error);
      return;
    }

    this._createAndActivatePage('0');
    this._dialogEl.showModal();
  }

  close () {
    const allowClose = this._validate();

    if (allowClose) {
      this.parentNode.removeChild(this);
    } else {
      
    }
  }

  async showStatusPage (notification) {
    if (this._state === 'show-status' || !notification) return;


    if (!this._statusPageEl) {
      const statusPageTagName = 'casper-edit-dialog-status-page';
      
      await import(`./components/${statusPageTagName}.js`);

      this._statusPageEl = document.createElement(statusPageTagName);
      this._statusPageEl.classList.add('edit-dialog__status-page');
      this._statusPageEl.hidden = true;
      this._contentWrapperEl.appendChild(this._statusPageEl);
    }

    if (notification.custom === true) {
      this._statusPageEl.setCustom(notification.message[0]);
    } else {
      this._statusPageEl.clearCustom();
      this._statusPageEl.message = notification.message || [notification?.response?.body?.message];
    }

    this._state = 'show-status';
    this._statusPageEl.hidden = false;
  }

  hideStatusPage () {
    if (!this._statusPageEl) return;

    this._statusPageEl.hidden = true;
    this._state = 'normal';
  }



  //***************************************************************************************//
  //                              ~~~ Private methods  ~~~                                 //
  //***************************************************************************************//
  
  async _createAndActivatePage (index) {
    const newPage = document.createElement(this._pages[index].tag_name);
    newPage.setAttribute('name', `page-${index}`);
    newPage.setAttribute('active', '');
    newPage.editDialog = this;

    if ( ! this.data ) {
      try {
        const response = await app.broker.get(this._options.urn, 10000);
        this.data  = response.data;
        this._id   = response.id;
        this._type = response._type;  
      } catch (error) {
        // TODO borrar a pintura
        console.log(error);
      }
    }
    this._pagesContainerEl.appendChild(newPage);
    await newPage.updateComplete;
    newPage.load(this.data);
  }

  _labelClickHandler (event) {
    if (!event?.currentTarget) return;

    const previousIndex = this._activeIndex;
    const newIndex = event.currentTarget.index;

    const previousPage = this._pagesContainerEl.children.namedItem(`page-${previousIndex}`);
    previousPage.removeAttribute('active');

    const currentPage = this._pagesContainerEl.children.namedItem(`page-${newIndex}`);
    if (currentPage) {
      currentPage.setAttribute('active', '');
    } else {
      this._createAndActivatePage(newIndex);
    }

    this._activeIndex = newIndex;
  }

  _validate () {
    let valid = true;

    for (const page of this._pagesContainerEl.children) {
      valid = page.validate(this.data);
      if (!valid) break;
    }

    return valid;
  }

  _save () {
    try {
      for (const page of this._pagesContainerEl.children) {
        page.save(this.data);
      }
      
    } catch (error) {
      console.error(error);
      return;
    }

    this.close();
  }

  
}

customElements.define('casper-edit-dialog', CasperEditDialog);