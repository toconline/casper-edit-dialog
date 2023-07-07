import { html, css, LitElement } from 'lit';
import {styleMap} from 'lit/directives/style-map.js';
import {classMap} from 'lit/directives/class-map.js';
import { CasperSocketPromise } from  '@cloudware-casper/casper-socket/casper-socket.js';
import { Casper } from '@cloudware-casper/casper-common-ui/casper-i18n-behavior.js';
import { mediaQueriesBreakpoints } from './components/casper-edit-dialog-constants.js';
import { CasperEditDialogPage } from './components/casper-edit-dialog-page.js';
import '@cloudware-casper/casper-icons/casper-icon.js';
import '@cloudware-casper/casper-icons/casper-icon-button.js';
import './components/casper-confirmation-dialog.js';
import './components/casper-toast-lit.js';

export class CasperEditDialog extends Casper.I18n(LitElement) {
  static properties = {
    mode: {
      type: String,
      reflect: true
    },
    noWhiteSpace: {
      type: Boolean,
      reflect: true,
      attribute: 'no-white-space'
    },
    _title: {
      type: String
    },
    _type: {
      type: String
    },
    _rootDialog: {
      type: String
    },
    _pages: {
      type: Array
    },
    _activeIndex: {
      type: Number
    },
    _disableLabels: {
      type: Boolean
    },
    _disablePrevious: {
      type: Boolean
    },
    _disableNext: {
      type: Boolean
    },
    _hidePrevious: {
      type: Boolean
    },
    _hideNext: {
      type: Boolean
    },
    _pagesContainerStyles: {
      type: Object
    },
    _previousText: {
      type: String
    },
    _nextText: {
      type: String
    },
    _previousIcon: {
      type: String
    },
    _nextIcon: {
      type: String
    }
  };

  static styles = css`
    :host {
      --ced-vertical-padding: 0.625rem;
      --ced-horizontal-padding: 1.25rem;
      --ced-background-color: #FFF;
      --ced-disabled-light-color-rgb: 224, 224, 224;
      --ced-disabled-dark-color-rgb: 175, 175, 175;
      --ced-border-radius: var(--radius-primary, 8px);
      --ced-labels-background-color: var(--primary-color);
      --ced-labels-max-width: 13.75rem;
      --ced-labels-buttons-transition-duration: 0.5s;

      --ced-content-vertical-padding: calc(var(--ced-vertical-padding) * 3);
      --ced-content-horizontal-padding: calc(var(--ced-horizontal-padding) * 2);
      --ced-page-padding: calc((var(--paper-checkbox-ink-size, 48px) - var(--paper-checkbox-size, 18px)) / 2);
      --ced-wrapper-vertical-padding: calc(var(--ced-content-vertical-padding) - var(--ced-page-padding));
      --ced-wrapper-horizontal-padding: calc(var(--ced-content-horizontal-padding) - var(--ced-page-padding));
    }

    * {
      box-sizing: border-box;
    }

    [disabled] {
      pointer-events: none !important;
    }

    .edit-dialog {
      max-width: 90vw;
      max-height: 90vh;
      background-color: var(--ced-labels-background-color);
      box-shadow: rgba(0, 0, 0, 15%) 0 5px 20px;
      border: none;
      padding: 0;
      border-radius: var(--ced-border-radius);
      overflow: hidden;
      transition: opacity 0.3s ease;
    }

    .edit-dialog[open] {
      display: flex;
    }

    .edit-dialog::backdrop {
      background-color: rgba(204, 204, 204, 65%);
    }

    .edit-dialog__inner {
      display: grid;
      grid-template-areas:
        "labels header"
        "labels page"
        "labels footer";
      grid-template-columns: fit-content(var(--ced-labels-max-width)) minmax(calc(100% - var(--ced-labels-max-width)), auto);
      grid-template-rows: min-content 1fr min-content;
    }

    /* LABELS */

    .edit-dialog__labels-list {
      --ced-label-number-color-rgb: 255, 255, 255;

      grid-area: labels;
      list-style-type: none;
      margin: 0;
      padding: 5rem var(--ced-horizontal-padding);
      /* Trick to add shadow beneath the left rounded corners */
      padding-right: calc(var(--ced-border-radius) + var(--ced-horizontal-padding));
      margin-right: calc(var(--ced-border-radius) * -1);
      box-shadow: rgba(0, 0, 0, 6%) calc(-15px - var(--ced-border-radius)) -7px 10px inset;
      color: rgb(var(--ced-label-number-color-rgb));
      background-color: var(--ced-labels-background-color);
      transition: all var(--ced-labels-buttons-transition-duration);
    }

    .edit-dialog__labels-list[disabled] {
      --ced-labels-background-color: rgb(var(--ced-disabled-dark-color-rgb));
      --ced-label-number-color-rgb: var(--ced-disabled-light-color-rgb);
    }

    :host([mode="wizard"]) .edit-dialog__labels-list {
      padding: 0;
    }

    .edit-dialog__label {
      position: relative;
      font-size: 1rem;
      margin-bottom: 1.375em;
      display: flex;
      align-items: center;
      gap: 0.625em;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity var(--ced-labels-buttons-transition-duration);

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

    .edit-dialog__label[disabled] {
      color: rgb(var(--ced-disabled-light-color-rgb));
      --ced-label-number-color-rgb: var(--ced-disabled-light-color-rgb);
    }

    .edit-dialog__label-number {
      position: relative;
      flex-shrink: 0;
      width: 1.875em;
      height: 1.875em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      /* Removes top white-space, centering the number */
      line-height: 0;
      background: transparent;
      border: solid 1px rgba(var(--ced-label-number-color-rgb), 56%);
      transition: all var(--ced-labels-buttons-transition-duration);
    }

    .edit-dialog__label[active] .edit-dialog__label-number {
      background: rgba(var(--ced-label-number-color-rgb), 28%);
      border: solid 1px transparent;
      box-shadow: rgba(0, 0, 0, 5%) 1px 1px 4px;
      transform: scale(1.1);
    }

    .edit-dialog__label-number::after {
      content: "!";
      position: absolute;
      top: 0;
      right: 0;
      font-size: 0.75rem;
      box-sizing: border-box;
      transform: translate(40%, -40%);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: solid 1px var(--ced-labels-background-color);
      background-color: var(--status-red);
      opacity: 0;
      width: 0;
      height: 0;
      transition: opacity var(--ced-labels-buttons-transition-duration), width var(--ced-labels-buttons-transition-duration), height var(--ced-labels-buttons-transition-duration);
    }

    .edit-dialog__label[invalid] .edit-dialog__label-number::after {
      height: 1.4em;
      width: 1.4em;
      opacity: 1;
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
      right: calc(var(--ced-horizontal-padding) * -1 - 1px);
      transform: translate(50%, -50%) rotate(45deg);
      display: block;
      height: 1.25em;
      width: 1.25em;
      clip-path: polygon(0% 0%, 100% 100%, 0% 100%);
      border-radius: 0 0 0 0.2em;
      background-color: var(--ced-background-color);
      opacity: 0;
      transition: opacity var(--ced-labels-buttons-transition-duration);
    }

    .edit-dialog__label[active]::after {
      opacity: 1;
    }


    .edit-dialog__inner > *:not(.edit-dialog__labels-list) {
      background-color: var(--ced-background-color);
    }


    /* HEADER */

    .edit-dialog__header {
      grid-area: header;
      display: flex;
      flex-direction: column;
      border-top-left-radius: var(--ced-border-radius);
      padding: var(--ced-vertical-padding) var(--ced-horizontal-padding) 0 var(--ced-horizontal-padding);

      --ced-close-button-width: 1.5625rem;
    }

    :host([mode="wizard"]) .edit-dialog__header {
      flex-direction: row-reverse;
      align-items: center;
      gap: 1rem;
      background-color: var(--primary-color);
      color: #FFF;
      padding-bottom: var(--ced-vertical-padding);
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

    :host([mode="wizard"]) .edit-dialog__close {
      align-self: flex-start;
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

    :host([mode="wizard"]) .edit-dialog__header-text {
      flex-grow: 1;
      padding: 0;
      border: none;
    }

    .edit-dialog__header-text > * {
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .edit-dialog__page-title:nth-last-child(2) {
      font-size: 0.875em;
      font-weight: 400;
      color: #808080;
    }

    .edit-dialog__page-title:last-child,
    .edit-dialog__general-title {
      font-size: 1.125em;
      font-weight: 700;
      color: #000;
    }

    :host([mode="wizard"]) .edit-dialog__page-title,
    :host([mode="wizard"]) .edit-dialog__general-title {
      color: inherit;
    }


    /* CONTENT */

    .edit-dialog__content-wrapper {
      grid-area: page;
      position: relative;
      padding: var(--ced-wrapper-vertical-padding) var(--ced-wrapper-horizontal-padding);
      overflow: hidden;
    }

    :host([mode="wizard"]) .edit-dialog__content-wrapper {
      padding: calc(var(--ced-wrapper-vertical-padding) / 2) calc(var(--ced-wrapper-horizontal-padding) / 2);
    }

    :host([mode="wizard"][no-white-space]) .edit-dialog__content-wrapper {
      padding: 0;
    }

    .edit-dialog__pages-container {
      width: 50rem; /* 800px */
      height: 26.125rem; /* 418px */
      max-width: 100%;
      max-height: 100%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      position: relative;
      z-index: 1;
    }

    [name^="page"] {
      /* Padding needed to prevent the checkbox's ripple from being trimmed */
      padding: var(--ced-page-padding);
      position: absolute;
      opacity: 0;
      pointer-events: none;
      width: 100%;
      height: 100%;
      background-color: var(--ced-background-color);
      transform: translateY(-100%);
      transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.5s;
      overflow: auto;
      /* This prevents layout shifts when switching pages */
      scrollbar-gutter: stable;
    }

    :host([mode="wizard"]) [name^="page"] {
      scrollbar-gutter: auto;
    }

    [name^="page"][active] {
      position: relative;
      opacity: 1;
      pointer-events: auto;
      transform: none;
      transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0s;
      z-index: 2;
    }

    [name^="page"][active] ~ * {
      transform: translateY(100%);
    }

    .edit-dialog__status-progress-page {
      position: absolute;
      top: var(--ced-content-vertical-padding);
      left: var(--ced-content-horizontal-padding);
      width: calc(100% - 2 * var(--ced-content-horizontal-padding));
      height: calc(100% - 2 * var(--ced-content-vertical-padding));
      z-index: 2;
      transition: opacity 0.3s ease;
    }

    .edit-dialog__status-progress-page[hidden] {
      opacity: 0;
      display: none;
    }


    /* FOOTER */

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
      padding: 0.714em 1em;
      border-radius: 1.428em;
      outline: none;
      text-transform: uppercase;
      transition: all var(--ced-labels-buttons-transition-duration);
      font-family: inherit;
    }

    .edit-dialog__button.secondary {
      background-color: #FFF;
      color: var(--button-primary-color);
    }

    .edit-dialog__button.icon:not(.text) {
      font-size: 1rem;
      padding: 0;
      border-radius: 50%;
      width: 2.5em;
      height: 2.5em;
    }

    .edit-dialog__button.icon:not(.text) casper-icon {
      width: 1.5625em;
      height: 1.5625em;
    }

    .edit-dialog__button:hover {
      cursor: pointer;
      background-color: var(--light-primary-color);
      color: var(--button-primary-color);
    }

    .edit-dialog__button[disabled] {
      color: #FFF;
      background-color: rgb(var(--ced-disabled-light-color-rgb));
      border: 2px solid rgb(var(--ced-disabled-light-color-rgb));
    }

    #toastLit {
      position: absolute;
      bottom: calc(var(--ced-vertical-padding) * 2);
      left: var(--ced-horizontal-padding);
      width: calc(100% - var(--ced-horizontal-padding) * 2);
      z-index: 2;
    }


    @media (max-width: ${mediaQueriesBreakpoints.mobile}) {
      .edit-dialog__label-text {
        display: none;
      }
    }
  `;

  constructor () {
    super();

    window.ced = this;

    this.mode = 'dialog';
    this._state = 'normal';
    this._title = '';
    this._type = '';
    this._pages = [];
    this._rootDialog = '';
    this._activeIndex = 0;
    this._invalidPagesIndexes = new Set();

    this._disableLabels = false;
    this._disablePrevious = false;
    this._disableNext = false;
    this._hidePrevious = false;
    this._hideNext = false;
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
    const previousClasses = { icon: this._previousIcon, text: this._previousText };
    const nextClasses = { icon: this._nextIcon, text: this._nextText };

    return html`
      <dialog id="editDialog" class="edit-dialog">
        <div class="edit-dialog__inner">
          <ol class="edit-dialog__labels-list" ?disabled=${this._disableLabels}>
            ${(this._pages.length > 0 && this.mode === 'dialog')
              ? this._pages.map((page, index) => html`
                <li class="edit-dialog__label" ?active=${index === this._activeIndex} ?invalid=${this._invalidPagesIndexes.has(index)} .index=${index} @click=${this._labelClickHandler}>
                  <span class="edit-dialog__label-number">${index + 1}</span>
                  <span class="edit-dialog__label-text" text=${page.label}>${page.label}</span>
                </li>
              `)
              : ''}
          </ol>

          <div class="edit-dialog__header">
            <casper-icon-button tooltip="Fechar" class="edit-dialog__close" icon="fa-light:times-circle" @click=${this.close.bind(this)}></casper-icon-button>

            <hgroup class="edit-dialog__header-text">
              ${(this._pages.length > 0 && this._pages[this._activeIndex].title)
                ? html`<h2 class="edit-dialog__page-title">${this._pages[this._activeIndex].title}</h2>`
                : ''
              }
              ${(this._title)
                ? html`<h1 class="edit-dialog__general-title">${this._title}</h1>`
                : ''
              }
            </hgroup>
          </div>

          <div class="edit-dialog__content-wrapper">
            <div class="edit-dialog__pages-container" style=${this._pagesContainerStyles !== undefined ? styleMap(this._pagesContainerStyles) : ''}></div>
            <casper-toast-lit id="toastLit"></casper-toast-lit>
          </div>

          <div class="edit-dialog__footer">
            <button class="edit-dialog__button secondary previous ${classMap(previousClasses)}" ?disabled=${this._disablePrevious} ?hidden=${this._hidePrevious}>
              ${this._previousIcon ? html`<casper-icon icon=${this._previousIcon}></casper-icon>` : ''}
              ${this._previousText ? html`<span>${this._previousText}</span>` : ''}
            </button>
            <button class="edit-dialog__button next ${classMap(nextClasses)}" ?disabled=${this._disableNext} ?hidden=${this._hideNext}>
              ${this._nextIcon ? html`<casper-icon icon=${this._nextIcon}></casper-icon>` : ''}
              ${this._nextText ? html`<span>${this._nextText}</span>` : ''}
            </button>
          </div>
        </div>
      </dialog>

      <casper-confirmation-dialog id="confirmationDialog"></casper-confirmation-dialog>
    `;
  }

  firstUpdated () {
    this._dialogEl = this.shadowRoot.getElementById('editDialog');
    this._labelsList = this.shadowRoot.querySelector('.edit-dialog__labels-list');
    this._contentWrapperEl = this.shadowRoot.querySelector('.edit-dialog__content-wrapper');
    this._pagesContainerEl = this.shadowRoot.querySelector('.edit-dialog__pages-container');
    this._confirmationDialogEl = this.shadowRoot.getElementById('confirmationDialog');
    this._toastLitEl = this.shadowRoot.getElementById('toastLit');
    this._previousButtonEl = this.shadowRoot.querySelector('.edit-dialog__button.previous');
    this._nextButtonEl = this.shadowRoot.querySelector('.edit-dialog__button.next');

    // Needed to hide jumps caused by changes in the wizard's dimensions
    if (this.options.hasOwnProperty('initial_opacity')) {
      this._dialogEl.style.opacity = this.options.initial_opacity;
    }

    this._dialogEl.addEventListener('click', this._dialogClickHandler.bind(this));
    this._dialogEl.addEventListener('cancel', this._dialogCancelHandler.bind(this));
    this.addEventListener('casper-overlay-opened', this._casperOverlayOpenedHandler);

    if (this.mode === 'wizard') {
      this._previousButtonEl.addEventListener('click', () => this._gotoPreviousPage());
      this._nextButtonEl.addEventListener('click', () => this._gotoNextPage());
    } else {
      this._previousButtonEl.addEventListener('click', () => this.save(false));
      this._nextButtonEl.addEventListener('click', () => this.save());
    }
  }

  updated (changedProperties) {
    if (changedProperties.has('_pagesContainerStyles')) {
      setTimeout(() => this.fixWizardOpacity(), 300);
    }
  }


  //***************************************************************************************//
  //                              ~~~ Public methods  ~~~                                  //
  //***************************************************************************************//

  setOptions (options) {
    this.options = options;
  }

  async open () {
    if (this.options.title) this._title = this.options.title;
    if (this.options.root_dialog) this._rootDialog = this.options.root_dialog;
    if (this.options.mode) this.mode = this.options.mode;
    if (this.options.type) this._type = this.options.type;

    if (this.mode === 'wizard') {
      this.changePreviousButtonToIcon();
      this.changeNextButtonToIcon();

      if (this.options.dimensions) this.overrideWizardDimensions(this.options.dimensions);
      if (this.options.no_white_space) this.noWhiteSpace = true;
    } else {
      this.changePreviousButtonToText('Gravar');
      this.changeNextButtonToText('Gravar e sair');
    }

    // First we import the classes
    try {
      for (const page of this.options.pages) {
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
      window.app.openToast({'text': 'Erro ao tentar abrir o diálogo. Por favor contacte o suporte técnico.', 'duration': 3500, 'backgroundColor': 'var(--status-red)'});
      return;
    }

    // Then we create only the first page
    await this.activatePage(0, true);
    this._dialogEl.showModal();
  }

  close () {
    const allowClose = !this.hasUnsavedChanges();

    if (allowClose) {
      if (this.options.promise) this.options.promise.resolve();
      this.parentNode.removeChild(this);
    } else {
      const options = {
        title: 'Atenção!',
        message: 'Tem a certeza de que pretende fechar o diálogo sem gravar? Todas as alterações feitas serão perdidas.',
        type: 'warning',
        accept_callback: function () {
          this.parentNode.removeChild(this);
        }.bind(this)
      };

      this._confirmationDialogEl.open(options);
    }
  }

  async showProgressPage () {
    if (this._state === 'show-progress') return;

    if (!this._statusProgressPageEl) await this._createStatusProgressPage();

    this._statusProgressPageEl.setProgressCount(1, true);
    this._state = 'show-progress';
    this._statusProgressPageEl.hidden = false;
  }

  async showStatusPage (notification, status) {
    if (this._state === 'show-status' || !notification) return;

    this.disableAllActions();
    if (!this._statusProgressPageEl) await this._createStatusProgressPage();

    this._statusProgressPageEl.showStatus(notification, status);
    this._state = 'show-status';
    this._statusProgressPageEl.hidden = false;
  }

  hideStatusAndProgress () {
    if (!this._statusProgressPageEl) return;

    this._statusProgressPageEl.style.opacity = 0;
    this.enableAllActions();

    setTimeout(() => {
      this._statusProgressPageEl.hidden = true;
      this._statusProgressPageEl.resetValues();
      this._state = 'normal';
    }, 300);
  }

  async hideStatusAndProgressWithTimeout (value) {
    await this._statusProgressPageEl.updateComplete;
    this._statusProgressPageEl.selfClose(value / 1000);

    setTimeout(() => {
      this.hideStatusAndProgress();
    }, value);
  }

  showFatalError (notification) {
    this._nextClosesWizard = true;
    this.showStatusPage(notification);
  }

  async activatePage (newIndex, beforeShowModal = false) {
    if (+newIndex === +this._activeIndex && !beforeShowModal) return;

    const previousIndex = this._activeIndex;
    const previousPage = this._pagesContainerEl.children.namedItem(`page-${previousIndex}`);
    if (previousPage) previousPage.removeAttribute('active');

    let newPage = this._pagesContainerEl.children.namedItem(`page-${newIndex}`);
    if (!newPage) newPage = await this._createPage(newIndex);

    if (beforeShowModal) {
      newPage.setAttribute('active', '');
    } else {
      setTimeout(() => {
        newPage.setAttribute('active', '');
        if (newPage.style.transform) newPage.style.removeProperty('transform');
      }, 0);
    }
    
    if (this.mode === 'wizard') newIndex === 0 ? this.disablePrevious() : this.enablePrevious();

    if (typeof newPage.enter === 'function') {
      newPage.enter();
    } else if (typeof this['enterOn' + newPage.id] === 'function') {
      this['enterOn' + newPage.id].apply(this);
    }
    

    if (this.mode === 'wizard') {
      newPage.hasAttribute('previous') ? this.changePreviousButtonToText(newPage.getAttribute('previous')) : this.changePreviousButtonToIcon();
      newPage.hasAttribute('next') ? this.changeNextButtonToText(newPage.getAttribute('next')) : this.changeNextButtonToIcon();
    }
    
    this._activeIndex = +newIndex;
  }

  /* --- Labels --- */

  disableLabels () {
    this._disableLabels = true;
  }

  enableLabels () {
    this._disableLabels = false;
  }

  /* --- Previous button --- */

  disablePrevious () {
    this._disablePrevious = true;
  }

  enablePrevious () {
    this._disablePrevious = false;
  }

  hidePrevious () {
    this._hidePrevious = true;
  }

  changePreviousButtonToText (text) {
    this._changeButtonToText('previous', text);
  }

  changePreviousButtonToIcon (icon = 'fa-light:arrow-left') {
    this._changeButtonToIcon('previous', icon);
  }

  /* --- Next button --- */

  disableNext () {
    this._disableNext = true;
  }

  enableNext () {
    this._disableNext = false;
  }

  hideNext () {
    this._hideNext = true;
  }

  changeNextButtonToText (text) {
    this._changeButtonToText('next', text);
  }

  changeNextButtonToIcon (icon = 'fa-light:arrow-right') {
    this._changeButtonToIcon('next', icon);
  }

  disableAllActions () {
    if (this.mode === 'dialog') this.disableLabels();
    this.disablePrevious();
    this.disableNext();
  }

  enableAllActions () {
    if (this.mode === 'dialog') this.enableLabels();
    this.enablePrevious();
    this.enableNext();
  }

  

  /**
   * Submit a job and return a promise to the caller
   *
   * @param {Object} job the job payload
   * @param {Number} timeout in seconds, the maximum time the front will wait for the result
   * @param {Number} ttr time to run in seconds, maximum execution time on the server (counted after the job starts)
   * @param {Boolean} showStatusPage by default is true. pass value as false if the job is meant to run in the background
   * @returns the promise for the caller to await on
   */
  async execJob (job, timeout, ttr, showStatusPage = true) {
    this._runJobInBackground = showStatusPage ? false : true;
    this._jobPromise = new CasperSocketPromise();

    if (this._runJobInBackground) {
      this.submitJobWithStrictValidity(job, timeout, ttr, true);
    } else {
      this.disableAllActions();
      if (!this._statusProgressPageEl) await this._createStatusProgressPage();
      this.submitJobWithStrictValidity(job, timeout, ttr, true);
      this._statusProgressPageEl.timeout = timeout;
      this._statusProgressPageEl.state = 'connecting';
      this._statusProgressPageEl.progress = 0;
      this._statusProgressPageEl.message = 'Em fila de espera. Por favor, aguarde';
    }

    return this._jobPromise;
  }

  /**
   *
   * @param {Object}  job
   * @param {Integer} timeout
   * @param {Integer} ttr
   *
   * @return the progress page
   */
  submitJobWithStrictValidity (job, timeout, ttr, hideTimeout) {
    const ltimeout = parseInt(timeout);
    const lttr     = parseInt(ttr);

    if ( isNaN(ltimeout) || isNaN(lttr) ) {
      throw 'Strict timing requires valid ttr and timeout!!!';
    }
    job.validity = ltimeout - lttr - 2; // 2 seconds safety margin
    if ( job.validity < 1 ) {
      throw 'Strict timing requires a timeout greater than ttr + 3!!!")';
    }

    if (!this._runJobInBackground) this.showProgressPage();
    this._setControlledSubmission();
    this.socket.submitJob(job, this._submitJobResponse.bind(this), { validity: job.validity, ttr: lttr, timeout: ltimeout, hideTimeout: !!hideTimeout });
    
  }

  subscribeJob (jobId, timeout) {
    if (!this._runJobInBackground) this.showProgressPage();
    this.socket.subscribeJob(jobId, this._subscribeJobResponse.bind(this), timeout);
  }

  showCustomNotification (notification) {
    this.showStatusPage(notification);
    this._nextClosesWizard = true;
  }

  jobCompleted (notification) {
    this._jobPromise.resolve(Object.keys(notification.response).length ? notification.response : notification);
  }

  /**
   * Show toast at the bottom of the pages-container
   *
   * @param {String} text the text to display.
   * @param {Boolean} type controls the style.
   * @param {Boolean} duration the time during which the toast is displayed.
   */
  openToast (text, type = '', duration = 3000) {
    let color = '';

    switch (type) {
      case true:
      case 'success':
        color = 'var(--status-green)';
        break;
      case false:
      case 'error':
        color = 'var(--status-red)';
        break;
      case 'warning':
        color = 'var(--status-orange)';
        break;
      case 'info':
      default:
        color = 'var(--status-blue)';
    }

    this._toastLitEl.open({'text': text, 'duration': duration, 'backgroundColor': color});
  }

  validate () {
    let valid = true;

    for (const page of this._pagesContainerEl.children) {
      const index = +page.getAttribute('name')?.split('-')[1];

      const requiredValidations = page.validateRequiredFields();
      const otherValidations = page.validate(this.data);

      if (requiredValidations && otherValidations) {
        if (this._invalidPagesIndexes.has(index)) this._invalidPagesIndexes.delete(index);
      } else {
        this._invalidPagesIndexes.add(index);
      }
    }

    if (this._invalidPagesIndexes.size > 0) {
      valid = false;
      this.activatePage(this._invalidPagesIndexes.values().next().value);
      this.openToast ('Não foi possível gravar as alterações. Por favor verifique se preencheu os campos corretamente.', 'error');
    }

    this.requestUpdate();
    return valid;
  }

  hasUnsavedChanges () {
    for (let i = 0; i < this._pagesContainerEl.children.length; i++) {
      const page = this._pagesContainerEl.children[i];
      if (!this._isCasperEditDialogPage(page)) continue;
      if (page.hasUnsavedChanges(this.data)) return true;
    }

    return false;
  }

  async save (close = true) {
    const isValid = this.validate();
    if (!isValid) return;

    try {
      const saveData = {
        patch: {}, // patch is the default operation
        post: {}, // only filled if specified in overcharged page save to handle it
        delete: {} // only filled if specified in overcharged page save to handle it
      }

      for (let i = 0; i < this._pagesContainerEl.children.length; i++) {
        this._pagesContainerEl.children[i].save(saveData, this.data);
      }

      await this._processSaveData(saveData, close);
    } catch (error) {
      console.error(error);
      this.openToast (error?.errors?.[0]?.detail ? error.errors[0].detail : 'Erro! Não foi possível gravar as alterações.', 'error');
      return;
    }
  }

  /**
   * Sets the wizard's pages-container to the specified fixed dimensions.
   *
   * @param {Object} Object that contains the new dimensions that can be specified only in px.
   */
  overrideWizardDimensions (dimensions) {
    // Convert the pages-container dimensions to numeric values.
    const parsedWidth = this._parsePxDimension(dimensions.width);
    const parsedHeight = this._parsePxDimension(dimensions.height);

    this._pagesContainerStyles = {
      width: this._convertDimensionToRem(parsedWidth),
      height: this._convertDimensionToRem(parsedHeight)
    };
  }

  /* Needed to hide jumps caused by changes in the wizard's dimensions */
  fixWizardOpacity () {
    if (this.options.hasOwnProperty('initial_opacity') && window.getComputedStyle(this._dialogEl).opacity === '0') {
      this._dialogEl.style.removeProperty('opacity');
    }
  }



  //***************************************************************************************//
  //                              ~~~ Private methods  ~~~                                 //
  //***************************************************************************************//

  async _createPage (index) {
    const newPage = document.createElement(this._pages[index].tag_name);
    newPage.setAttribute('name', `page-${index}`);
    newPage.editDialog = this;
    // For backwards compatibility
    newPage.wizard = this;

    if (!this.data && this.options.urn) {
      try {
        const response = await window.app.broker.get(this.options.urn, 10000);
        this.data  = response.data;
        this._id   = response.id;
        this._type = response.type;
      } catch (error) {
        console.log(error);

        await this.showStatusPage({ message: ['Erro! Ocorreu um problema ao tentar carregar os dados.'] });
        return;
      }
    }

    let closestPreviousSibling;
    for (let i = +index - 1; i >= 0; i--) {
      closestPreviousSibling = this._pagesContainerEl.children.namedItem(`page-${i}`);
      if (closestPreviousSibling) break;
    }

    if (closestPreviousSibling) {
      closestPreviousSibling.insertAdjacentElement('afterend', newPage);
    } else {
      this._pagesContainerEl.appendChild(newPage);
    }

    if (index > this._activeIndex) newPage.style.transform = 'translateY(100%)';

    await newPage.updateComplete;
    if (!this._isCasperEditDialogPage(newPage)) return newPage;

    if (this.options.urn) {
      await newPage.load(this.data);
    } else {
      await newPage.load();
    }

    return newPage;
  }

  async _createStatusProgressPage () {
    const tagName = 'casper-edit-dialog-status-page';
    await import(`./components/${tagName}.js`);

    this._statusProgressPageEl = document.createElement(tagName);
    this._statusProgressPageEl.editDialog = this;
    // For backwards compatibility
    this._statusProgressPageEl.wizard = this;

    this._statusProgressPageEl.classList.add('edit-dialog__status-progress-page');
    this._statusProgressPageEl.hidden = true;
    this._contentWrapperEl.appendChild(this._statusProgressPageEl);
  }

  _isCasperEditDialogPage (pageEl) {
    return pageEl instanceof CasperEditDialogPage;
  }

  // All components which use casper-overlay need to have their overlays moved to the stacking context of the top-layer, otherwise they wouldn't be visible
  _casperOverlayOpenedHandler (event) {
    if (!event?.detail?.element) return;

    event.stopPropagation();
    this._contentWrapperEl.appendChild(event.detail.element);
  }

  _dialogClickHandler (event) {
    if (!event) return;

    // Trick needed to fix problems related to the casper-date-picker and the top-layer
    const clickedOnDatePicker = event.composedPath().find(element => (element.nodeName?.toLowerCase() === 'casper-date-picker' || element.nodeName?.toLowerCase() === 'vaadin-date-picker-overlay'))
      ? true
      : false;

    const datePickerOverlay = this._contentWrapperEl.querySelector('vaadin-date-picker-overlay');
    if (!clickedOnDatePicker && datePickerOverlay?.opened) {
      datePickerOverlay.correspondingPicker.close();
      return;
    }

    // A click on the ::backdrop generates the 'dialog' nodeName
    if (event.target?.nodeName === 'DIALOG') {
      this.close();
    }
  }

  // Fired when user presses the 'esc' key
  _dialogCancelHandler (event) {
    if (!event) return;

    // Needed otherwise it would call the dialog's native close method
    event.preventDefault();
    this.close();
  }

  async _labelClickHandler (event) {
    if (!event?.currentTarget) return;
    
    this.activatePage(+event.currentTarget.index);
  }

  _changeButtonToText (type, text) {
    this[`_${type}Text`] = text;
    this[`_${type}Icon`] = null;
  }

  _changeButtonToIcon (type, icon) {
    this[`_${type}Text`] = null;
    this[`_${type}Icon`] = icon;
  }

  _updateButtons () {
    const nextIcon = (this._activeIndex === this._pagesContainerEl.children.length - 1 && !this._getCurrentPage().hasAttribute('next')) 
      ? 'fa-light:check' 
      : 'fa-light:arrow-right';

    this.changeNextButtonToIcon(nextIcon);
  }

  _gotoPreviousPage () {
    if (typeof this._getCurrentPage().previous === 'function') {
      this._getCurrentPage().previous();
    } else if (typeof this['previousOn' + this._getCurrentPage().id] === 'function') {
      this['previousOn' + this._getCurrentPage().id].apply(this);
    } else {
      if (this._activeIndex >= 1) this.activatePage(this._activeIndex - 1);
    }
  }

  _gotoNextPage () {
    if (this._nextClosesWizard === true) {
      this.close();
      return;
    }

    if (typeof this._getCurrentPage().next === 'function') {
      this._getCurrentPage().next();
    } else if (typeof this['nextOn' + this._getCurrentPage().id] === 'function') {
      this['nextOn' + this._getCurrentPage().id].apply(this);
    } else {
      if (this._activeIndex < this._pagesContainerEl.children.length - 1) {
        this.activatePage(this._activeIndex + 1);
      } else {
        this.close();
      }
    }
  }

  _subscribeJobResponse (response) {
    CasperEditDialog._normalizeServerResponse(response);
    this._updateUI(response);
  }

  static _normalizeServerResponse (response) {
    let status;

    if (response.success === undefined) {
      response.success = true;
    }

    if (typeof response.status === 'object') {
      status = response.status;
    } else {
      status = response;
    }

    if (status.status_code === undefined) {
      response.status_code = response.success ? 200 : 500;
    }

    if (!response.status_code && response.success && status.response && status.status_code && status.action !== 'redirect') {
      if (status.custom) response.custom = status.custom;
      response.message = status.message;
      response.status = status.status;
      response.response = status.response;
      response.status_code = status.status_code;
    }

    if (response.status_code !== 200 && !status.message) {
      if (status.response) {
        try {

          // Catch the error from job if exists
          let detailed_error = status.response.map(element => {
            return element.errors.map(error => {
              return error.detail;
            }).join(";")
          }).join(";");

          if (detailed_error == "" || detailed_error == undefined) {
            throw "No error detail";
          }

          response.detailed_error = true;
          response.message = detailed_error;
        } catch (error) {
          response.detailed_error = false;
          response.message = ['Erro serviço, detalhe técnico: ' + JSON.stringify(status.response)];
        }
        response.status = 'error';
      } else {
        response.message = ['Erro desconhecido status por favor tente mais tarde'];
        response.status = 'error';
      }
    } else {
      if (response.success && status.status === 'error') {
        if (status.custom) response.custom = status.custom;
        response.message = status.message;
        response.status = status.status;
        response.status_code = status.status_code;
      }
    }

    if (status.action === 'redirect' && status.status === 'completed' && response.response === undefined) {
      response.response = {
        public_link: status.public_link,
        redirect: status.redirect
      };
      response.message = ['Redirect'];
      response.status = 'completed';
      response.status_code = 200;
    }
  }

  _submitJobResponse (notification) {
    if (notification.success === true && this._jobId === undefined && notification.id !== undefined) {
      this._jobId = notification.id;
      this._jobChannel = notification.channel;
      this.noCancelOnEscKey = true;
    }
    CasperEditDialog._normalizeServerResponse(notification);
    this._updateUI(notification);
  }

  _setControlledSubmission (isControlled = false, ttr = undefined) {
    this._controlledSubmission = isControlled;
    this._controlledSubmissionTTR = ttr;
  }
  _getCurrentPage () {
    return this._pagesContainerEl.children.namedItem(`page-${this._activeIndex}`);
  }


  async _updateUI (notification) {
    switch (notification.status) {
      case 'in-progress':
        if (!this._runJobInBackground) {
          this.showProgressPage();
          if (notification.index + 1 > this._statusProgressPageEl.progressCount) {
            this._statusProgressPageEl.setProgressCount(notification.index + 1);
          }

          this._statusProgressPageEl.updateProgress(notification.index, this.i18n.apply(this, notification.message), notification.progress);
        }

        if (typeof this['jobProgressOn' + this._getCurrentPage().id] === 'function') {
          this['jobProgressOn' + this._getCurrentPage().id].apply(this, [notification.status_code, notification, notification.response]);
        }

        break;
      case 'completed':
        if (this._controlledSubmission === true) {
          this.subscribeJob(notification.response.channel, this._controlledSubmissionTTR);
          this._setControlledSubmission();
        } else {
          if (this.mode === 'wizard') this._updateButtons();

          if (typeof  this._getCurrentPage().jobCompleted === 'function') {
            this._getCurrentPage().jobCompleted(notification);
          } else if (typeof this['jobCompletedOn' + this._getCurrentPage().id] === 'function') {
            if (notification.custom === true) {
              // ... Pass the full notification to allow more flexible custom handling ...
              this['jobCompletedOn' + this._getCurrentPage().id].apply(this, [notification.status_code, notification, notification.response]);
            } else {
              // ... passes only the notification message, it's an array that can be i18n'ed ...
              this['jobCompletedOn' + this._getCurrentPage().id].apply(this, [notification.status_code, notification.message, notification.response]);
            }
          } else {
            this.jobCompleted(notification);

            if (notification.custom === true) {
              if (!this._runJobInBackground) this.showCustomNotification(notification);
            } else {
              this.showStatusPage(notification, 'success');
              if (this.mode === 'wizard') {
                if (this._activeIndex === this._pagesContainerEl.children.length - 1) {
                  this.close();
                } else {
                  this.activatePage(this._activeIndex + 1);
                }
              }
            }
          }

          this._clearJob();
        }

        this.hideStatusAndProgressWithTimeout(5000);

        if (this._runJobInBackground) this._runJobInBackground = false;
        break;
      case 'failed':
      case 'error':
        this._setControlledSubmission();
        if (typeof this._getCurrentPage().error === 'function') {
          this._getCurrentPage().error(notification);
        } else if (typeof this['errorOn' + this._getCurrentPage().id] === 'function') {
          this['errorOn' + this._getCurrentPage().id].apply(this, [notification]);
        } else {
          if ( this.errorsAreFatal === true ) {
            this.showFatalError(notification);
          } else {
            this.showStatusPage(notification);
          }
        }
        this._clearJob();
        if (this._runJobInBackground) this._runJobInBackground = false;
        break;
      case 'reset':
        break;
      default:
        this._setControlledSubmission();
        break;
    }
  }

  _clearJob () {
    this._jobId = undefined;
    this._jobChannel = undefined;
    this.noCancelOnEscKey = false;
  }

  _parsePxDimension (dimension) {
    return parseFloat(dimension.slice(0, -2));
  }

  _convertDimensionToRem (dimension) {
    return dimension / 16 + 'rem';
  }

  async _processSaveData (saveData, close) {
    try {
      for (const [operation, types] of Object.entries(saveData)) {
        for (const [type, data] of Object.entries(types)) {
          for (const entry of (data?.payloads|| [])) {
            try {
              if (operation !== 'delete') {
                if (entry.urn && Object.keys(entry.payload.data.attributes).length) {
                  const response = await window.app.broker[operation](entry.urn, entry.payload, 10000);

                  if (response) {
                    saveData[operation][type]['response'] = response;
                  }
                }
              } else {
                if (entry.urn) {
                  await window.app.broker.delete(entry.urn, 30000);

                  // TODO: update this.data in case closing the dialog is optional
                }
              }
            } catch (error) {
              console.log(error);
              this._toastLitEl.open({'text': error?.errors?.[0]?.detail ? error.errors[0].detail : 'Erro! Não foi possível gravar as alterações.', 'duration': 3000, 'backgroundColor': 'var(--status-red)'});
              return;
            }
          }
        }
      }

      this._toastLitEl.open({'text': 'As alterações foram gravadas com sucesso.', 'duration': 3000, 'backgroundColor': 'var(--status-green)'});
      this._updatePageData(saveData);
      if (close) this.close();
    } catch (error) {
      console.log(error);
    }
  }

  _updatePageData (saveData) {
    for (let i = 0; i < this._pagesContainerEl.children.length; i++) {
      this.data = this._pagesContainerEl.children[i].updatePageData(saveData, this.data);
      this._pagesContainerEl.children[i].afterSave(saveData, this.data);
    }
  }
  
}

customElements.define('casper-edit-dialog', CasperEditDialog);