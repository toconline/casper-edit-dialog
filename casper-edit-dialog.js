import { html, css, LitElement } from 'lit';
import './components/casper-edit-dialog-warning.js';

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
      --ced-vertical-padding: 0.625rem;
      --ced-horizontal-padding: 1.25rem;
      --ced-background-color: #FFF;
      --ced-border-radius: var(--radius-primary, 8px);
      --ced-labels-max-width: 13.75rem;
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
      border-radius: var(--ced-border-radius);
      overflow: hidden;
      display: grid;
      grid-template-areas: 
        "labels header"
        "labels page"
        "labels footer";
      grid-template-columns: fit-content(var(--ced-labels-max-width)) minmax(calc(100% - var(--ced-labels-max-width)), auto);
      grid-template-rows: min-content 1fr min-content;
    }

    .edit-dialog::backdrop {
      background-color: rgba(204, 204, 204, 65%);
    }

    .edit-dialog__labels-list {
      grid-area: labels;
      list-style-type: none;
      margin: 0;
      padding: 5rem var(--ced-horizontal-padding);
      /* Trick to add shadow beneath the left rounded corners */
      padding-right: calc(var(--ced-border-radius) + var(--ced-horizontal-padding));
      margin-right: calc(var(--ced-border-radius) * -1);
      box-shadow: rgba(0, 0, 0, 6%) calc(-15px - var(--ced-border-radius)) -7px 10px inset;
      color: #FFF;

      --ced-label-number-color-rgb: 255, 255, 255;
      --ced-label-transition-duration: 0.5s;
    }

    .edit-dialog__label {
      position: relative;
      font-size: 1rem;
      margin-bottom: 1.375em;
      display: flex;
      align-items: center;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity var(--ced-label-transition-duration);

      --ced-label-bold: 500;
    }

    .edit-dialog__label:hover {
      opacity: 1;
    }

    .edit-dialog__label[active] {
      opacity: 1;
      font-weight: var(--ced-label-bold);
      pointer-events: none;
    }

    .edit-dialog__label-number {
      flex-shrink: 0;
      width: 1.875em;
      height: 1.875em;
      margin-right: 0.625em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      /* Removes top white-space, centering the number */
      line-height: 0;
      background: transparent;
      border: solid 1px rgba(var(--ced-label-number-color-rgb), 56%);
      transition: all var(--ced-label-transition-duration);
    }

    .edit-dialog__label[active] .edit-dialog__label-number {
      background: rgba(var(--ced-label-number-color-rgb), 28%);
      border: solid 1px transparent;
      box-shadow: rgba(0, 0, 0, 5%) 1px 1px 4px;
      transform: scale(1.1);
    }

    .edit-dialog__label-text {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* Trick to prevent layout shifts when changing the text's font-weight */
    .edit-dialog__label-text::after {
      content: attr(text);
      content: attr(text) / "";
      height: 0;
      visibility: hidden;
      overflow: hidden;
      user-select: none;
      pointer-events: none;
      font-weight: var(--ced-label-bold);
      /* Must be displayed as block so it sits below the parent's text */
      display: block;
    }

    .edit-dialog__label::after {
      content: "";
      position: absolute;
      top: 50%;
      right: calc(var(--ced-horizontal-padding) * -1);
      transform: translate(50%, -50%) rotate(45deg);
      display: block;
      height: 1.25em;
      width: 1.25em;
      clip-path: polygon(0% 0%, 100% 100%, 0% 100%);
      border-radius: 0 0 0 0.2em;
      background-color: var(--ced-background-color);
      opacity: 0;
      transition: opacity var(--ced-label-transition-duration);
    }

    .edit-dialog__label[active]::after {
      opacity: 1;
    }

    .edit-dialog > *:not(.edit-dialog__labels-list) {
      background-color: var(--ced-background-color);
    }

    .edit-dialog__header {
      grid-area: header;
      display: flex;
      flex-direction: column;
      border-top-left-radius: var(--ced-border-radius);
      padding: var(--ced-vertical-padding) var(--ced-horizontal-padding);
      padding-bottom: 0;

      --ced-close-button-width: 1.5625rem;
    }

    .edit-dialog__close {
      align-self: flex-end;
      background-color: transparent;
      color: inherit;
      border: none;
      padding: 0;
      flex-shrink: 0;
      width: var(--ced-close-button-width);
      height: var(--ced-close-button-width);
      transition: all 1s;
    }

    .edit-dialog__close:hover {
      background-color: rgba(0, 0, 0, 0.1);
      transform: scale(1.05);
    }

    .edit-dialog__header-text {
      font-size: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.3125rem;
      padding-bottom: 0.3125rem;
      border-bottom: solid 1px var(--primary-color);
      /* Space reserved to prevent text from colliding with the button */
      padding-right: calc(var(--ced-close-button-width) + 0.625rem);
    }

    .edit-dialog__header-text > * {
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .edit-dialog__general-title:nth-last-child(2) {
      font-size: 0.875em;
      font-weight: 400;
      color: #808080;
    }

    .edit-dialog__general-title:last-child,
    .edit-dialog__page-title {
      font-size: 1.125em;
      font-weight: 700;
      color: #000;
    }


    .edit-dialog__content-wrapper {
      grid-area: page;
      position: relative;
      padding: calc(var(--ced-vertical-padding) * 3) calc(var(--ced-horizontal-padding) * 2);
    }

    .edit-dialog__pages-container {
      width: 800px;
      height: 418px;
      max-width: 100%;
      max-height: 100%;
      overflow: hidden;

      display: flex;
      justify-content: center;
      align-items: flex-start;
      position: relative;
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
      top: calc(var(--ced-vertical-padding) * 3);
      left: calc(var(--ced-horizontal-padding) * 2);
      width: calc(100% - 4 * var(--ced-horizontal-padding));
      height: calc(100% - 6 * var(--ced-vertical-padding));
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
      padding: var(--ced-vertical-padding) var(--ced-horizontal-padding);
      box-shadow: rgba(0, 0, 0, 0.05) 0px -4px 12px;
      border-top: solid 1px rgba(0, 0, 0, 0.05);
      /* Needed so that the shadow displays above the previous sibling */
      z-index: 1;
      border-bottom-left-radius: var(--ced-border-radius);
    }

    .edit-dialog__button {
      background-color: var(--button-primary-color);
      border: 2px solid var(--button-primary-color);
      color: #FFF;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.714em;
      border-radius: 1.428em;
      outline: none;
      transition: all 0.5s;
    }

    .edit-dialog__button.reverse {
      background-color: #FFF;
      color: var(--button-primary-color);
    }

    .edit-dialog__button:hover {
      cursor: pointer;
      background-color: var(--light-primary-color);
      color: var(--button-primary-color);
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
                <span class="edit-dialog__label-text" text=${page.label}>${page.label}</span>
              </li>
            `)
            : ''}
        </ol>
        
        <div class="edit-dialog__header">
          <casper-icon-button tooltip="Fechar" class="edit-dialog__close" icon="fa-light:times-circle" @click=${this.close.bind(this)}></casper-icon-button>

          <hgroup class="edit-dialog__header-text">
            <h1 class="edit-dialog__general-title">${this._title}</h1>
            ${(this._pages.length > 0 && this._pages[this._activeIndex].title)
              ? html`<h2 class="edit-dialog__page-title">${this._pages[this._activeIndex].title}</h2>`
              : ''
            }
          </hgroup>
        </div>

        <div class="edit-dialog__content-wrapper">
          <div class="edit-dialog__pages-container"></div>
        </div>
      
        <div class="edit-dialog__footer">
          <button class="edit-dialog__button reverse" @click=${this.close.bind(this)}>Cancelar</button>
          <button class="edit-dialog__button" @click=${this.save.bind(this)}>Gravar</button>
        </div>
      </dialog>

      <casper-edit-dialog-warning id="warning"></casper-edit-dialog-warning>
    `;
  }
  
  firstUpdated () {
    this._dialogEl = this.shadowRoot.getElementById('editDialog');
    this._contentWrapperEl = this.shadowRoot.querySelector('.edit-dialog__content-wrapper');
    this._pagesContainerEl = this.shadowRoot.querySelector('.edit-dialog__pages-container');
    this._warningEl = this.shadowRoot.getElementById('warning');

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


  //***************************************************************************************//
  //                              ~~~ Public methods  ~~~                                  //
  //***************************************************************************************//

  setOptions (options) {
    this._options = options;
  }

  async open () {
    if (this._options.title) this._title = this._options.title;

    try {
      for (const page of this._options.pages) {
        const idx = page.lastIndexOf('/') + 1;
        const module = await import(`/src/${page.slice(0,idx)}${window.app.digest ? `${window.app.digest}.` : ''}${page.slice(idx)}.js`);
        this._pages.push({
          label: module.label ? module.label : '', 
          title: module.title ? module.title : module.label,
          tag_name: module.tag_name ? module.tag_name : page.slice(idx)
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
    const allowClose = this.validate();

    if (allowClose) {
      this.parentNode.removeChild(this);
    } else {
      
      const options = {
        title: 'Atenção!',
        message: 'Tem a certeza de que pretende fechar o diálogo sem gravar? Todas as alterações feitas serão perdidas.',
        accept_callback: function () {
          this.parentNode.removeChild(this);
        }.bind(this)
      };

      this._warningEl.open(options);
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

    if (!this.data && this._options.urn) {
      try {
        const response = await app.broker.get(this._options.urn, 10000);
        this.data  = response.data;
        this._id   = response.id;
        this._type = response.type;
      } catch (error) {
        // TODO borrar a pintura
        console.log(error);
        
        await this.showStatusPage({ message: ['Erro! Ocorreu um problema ao tentar carregar os dados.'] });
        this._statusPageEl.showStatus();
        return;
      }
    }
    this._pagesContainerEl.appendChild(newPage);
    await newPage.updateComplete;

    if (this._options.urn) {
      newPage.load(this.data);
    } else {
      newPage.load();
    }

    this._pages[index].content = newPage;
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

  validate () {
    let valid = true;

    for (const page of this._pagesContainerEl.children) {
      valid = page.validate(this.data);
      if (!valid) break;
    }

    return valid;
  }

  async save () {
    try {
      const saveData = {
        patch: {}, // patch is the default operation
        post: {} // only filled if specified in overcharged page save to handle it
      };

      // set default type structure if type available
      if ( this._type ) {
        saveData.patch[this._type] = {
          urn: this._options.urn ?? `${this._type}/${this._id}`,
          payloads: [{
            data: {
              type: this._type,
              id: this._id,
              attributes: {}
            }
          }]
        }
      }

      for ( const page of this._pages ) {
        if (page.content !== undefined) {
          page.content.save(saveData, this.data);
        }
      }

      Object.entries(saveData).forEach(([operation, entries]) => {
        Object.entries(entries).forEach(async ([type, entry]) => {
          if (Object.entries(entry.payloads[0].data.attributes).length) {
            const urn = entry.urn;
            entry.payloads.forEach(async (payload) => {
              await app.broker[operation](urn, payload, 10000);
            });
          }
        })
      });
    } catch (e) {
      console.error(e);
      // todo catch and show error
    }
    // try {
    //   for (const page of this._pagesContainerEl.children) {
    //     page.save(this.data);
    //   }

    // } catch (error) {
    //   console.error(error);
    //   return;
    // }

    // this.close();
  }


}

customElements.define('casper-edit-dialog', CasperEditDialog);