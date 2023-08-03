import { html, css, LitElement } from 'lit';
import {styleMap} from 'lit/directives/style-map.js';
import {classMap} from 'lit/directives/class-map.js';
import { CasperSocketPromise } from  '@cloudware-casper/casper-socket/casper-socket.js';
import { Casper } from '@cloudware-casper/casper-common-ui/casper-i18n-behavior.js';
import { mediaQueriesBreakpoints } from './components/casper-edit-dialog-constants.js';
import { CasperEditDialogPage } from './components/casper-edit-dialog-page.js';
import { CasperUiHelper } from './components/casper-ui-helper.js';
import '@cloudware-casper/casper-icons/casper-icon.js';
import '@cloudware-casper/casper-icons/casper-icon-button.js';
import './components/casper-edit-dialog-status-page.js';
import './components/casper-confirmation-dialog.js';
import './components/casper-toast-lit.js';

export class CasperEditDialog extends Casper.I18n(LitElement) {
  static properties = {
    mode: {
      type: String,
      reflect: true
    },
    /* Removes extra white space. Only available for wizard mode */
    noWhiteSpace: {
      type: Boolean,
      reflect: true,
      attribute: 'no-white-space'
    },
    _title: {
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

    .edit-dialog__general-title,
    .edit-dialog__page-title:first-child {
      font-size: 1.125em;
      font-weight: 700;
      color: #000;
    }

    .edit-dialog__page-title:nth-child(2) {
      font-size: 0.875em;
      font-weight: 400;
      color: #808080;
    }

    :host([mode="wizard"]) .edit-dialog__page-title,
    :host([mode="wizard"]) .edit-dialog__general-title {
      color: inherit;
    }


    /* CONTENT */

    .edit-dialog__content-wrapper {
      --pages-container-z-index: 0;
      --status-page-z-index: calc(var(--pages-container-z-index) + 1);
      --toast-z-index: calc(var(--status-page-z-index) + 1);

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
      z-index: var(--pages-container-z-index);
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
      z-index: 1;
    }

    [name^="page"][active] ~ * {
      transform: translateY(100%);
    }

    .edit-dialog__status-progress-page {
      position: absolute;
      top: var(--ced-wrapper-vertical-padding);
      left: var(--ced-wrapper-horizontal-padding);
      width: calc(100% - 2 * var(--ced-wrapper-horizontal-padding));
      height: calc(100% - 2 * var(--ced-wrapper-vertical-padding));
      z-index: var(--status-page-z-index);
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
      z-index: var(--toast-z-index);
    }


    @media (max-width: ${mediaQueriesBreakpoints.mobile}) {
      .edit-dialog__label-text {
        display: none;
      }
    }
  `;

  get statusProgressPageTag () {
    return 'casper-edit-dialog-status-page';
  }

  constructor () {
    super();

    window.ced = this;
    this._uiHelper = new CasperUiHelper();

    this.mode = 'dialog';
    
    this._state = 'normal';
    this._title = '';
    this._pages = [];
    this._activeIndex = 0;
    this._invalidPagesIndexes = new Set();
    this._userHasSavedData = false;

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
              ${(this._title)
                ? html`<h1 class="edit-dialog__general-title">${this._title}</h1>`
                : ''
              }
              ${(this._pages.length > 0 && this._pages[this._activeIndex].title)
                ? html`<h2 class="edit-dialog__page-title">${this._pages[this._activeIndex].title}</h2>`
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

    this._dialogEl.addEventListener('cancel', this._dialogCancelHandler.bind(this));
    this._pagesContainerEl.addEventListener('keydown', this._pagesContainerKeydownHandler.bind(this));
    this._pagesContainerEl.addEventListener('reached-last-focusable-field', this._reachedLastFocusableFieldHandler.bind(this));
    this.addEventListener('casper-overlay-opened', this._casperOverlayOpenedHandler);
    this.addEventListener('keydown', this._generalKeydownHandler.bind(this));

    if (this.mode === 'wizard') {
      this._previousButtonEl.addEventListener('click', () => this._gotoPreviousPage());
      this._nextButtonEl.addEventListener('click', () => this._gotoNextPage());
      this._errorsAreFatal = true;
    } else {
      this._previousButtonEl.addEventListener('click', () => this.save(false));
      this._nextButtonEl.addEventListener('click', () => this.save());
      this._errorsAreFatal = false;
    }
  }

  updated (changedProperties) {
    if (changedProperties.has('_pagesContainerStyles')) {
      setTimeout(() => this.fixWizardOpacity(), 300);
    }

    if (changedProperties.has('_activeIndex') && changedProperties.get('_activeIndex') !== undefined) {
      const index = this._activeIndex;

      // Focus can only be added after the page's transition has finished
      setTimeout(() => {
        this.focusPageFirstEditableField(index);
      }, 1000);
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
    if (this.options.mode) this.mode = this.options.mode;

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
          tag_name: module.tag_name ? module.tag_name : page.slice(idx),
          has_required_fields: !!module.hasRequiredFields
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
    this.focusPageFirstEditableField(0);
  }

  close () {
    const allowClose = !this.hasUnsavedChanges();

    if (allowClose) {
      if (this.options.promise) this.options.promise.resolve(this._userHasSavedData ? 'user-saved-data' : '');
      this.parentNode.removeChild(this);
    } else {
      const options = {
        title: 'Atenção!',
        message: 'Tem a certeza de que pretende fechar o diálogo sem gravar? Todas as alterações feitas serão perdidas.',
        type: 'warning',
        accept_callback: function () {
          if (this.options.promise) this.options.promise.resolve();
          this.parentNode.removeChild(this);
        }.bind(this)
      };

      this.openConfirmationDialog(options);
    }
  }

  openConfirmationDialog (options) {
    this._confirmationDialogEl.open(options);
  }

  async showProgressPage (timeout = 3000, count = 1) {
    if (this._state === 'show-progress') return;

    this.disableAllActions();
    if (!this._statusProgressPageEl) await this._createStatusProgressPage();

    this._statusProgressPageEl.setProgressCount(count, true, timeout);
    this._state = 'show-progress';
    this._statusProgressPageEl.hidden = false;
  }

  updateProgressPage (index = null, description, progress, title = 'Em progresso...') {
    this._statusProgressPageEl.updateProgress(index, description, progress, title);
  }

  async showStatusPage (notification, status) {
    if (!notification) return;

    this.disableAllActions();
    if (this._nextClosesWizard) this.changeNextButtonToText('Sair');
    
    if (!this._statusProgressPageEl) await this._createStatusProgressPage();

    this._statusProgressPageEl.showNotificationStatus(notification, status);
    this._state = 'show-status';
    this._statusProgressPageEl.hidden = false;

    if (this._nextClosesWizard) this.enableNext();
  }

  async showFreeStatusPage (options) {

    this.disableAllActions();
    if (!this._statusProgressPageEl) await this._createStatusProgressPage();

    this._statusProgressPageEl.showFreeStatus(options);
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
      this._statusProgressPageEl.style.removeProperty('opacity');
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
    this.showStatusPage(notification, 'error');
  }

  async activatePage (newIndex, beforeShowModal = false) {
    if (+newIndex === +this._activeIndex && !beforeShowModal) return;

    const previousIndex = this._activeIndex;
    const previousPage = this._pagesContainerEl.children.namedItem(`page-${previousIndex}`);
    if (previousPage) previousPage.removeAttribute('active');

    let newPage = this._pagesContainerEl.children.namedItem(`page-${newIndex}`);
    if (!newPage) newPage = await this.createPage(newIndex);

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
    

    // If the previous page was invalid, we check its validity again
    if (this._invalidPagesIndexes.has(previousIndex)) {
      const isValid = await previousPage.validate(this.data);
      if (isValid) this._invalidPagesIndexes.delete(previousIndex);
    }

    this._activeIndex = +newIndex;
  }




  focusPageFirstEditableField (pageIndex) {
    const pageEl = this._pagesContainerEl.children.namedItem(`page-${pageIndex}`);
    if (!pageEl) return;

    const childEl = this._uiHelper.findFocusableField(Array.from(pageEl.shadowRoot.children));
    if (!childEl) return;

    const elNodeName = childEl.nodeName.toLowerCase();

    if (this._uiHelper.nestedComponents.includes(elNodeName)) {
      childEl.focusFirstEditableField();
    } else {
      this._uiHelper.focusField(childEl);
    }
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
    this._runJobInBackground = !showStatusPage;
    this._jobPromise = new CasperSocketPromise();

    await this._submitJobWithStrictValidity(job, timeout, ttr, true);
    return this._jobPromise;
  }

  /**
   *
   * @param {Object}  job
   * @param {Integer} timeout
   * @param {Integer} ttr
   *
   */
  async _submitJobWithStrictValidity (job, timeout, ttr, hideTimeout) {
    const ltimeout = parseInt(timeout);
    const lttr = parseInt(ttr);

    if (isNaN(ltimeout) || isNaN(lttr) ) throw 'Strict timing requires valid ttr and timeout!!!';
    
    job.validity = ltimeout - lttr - 2; // 2 seconds safety margin
    if (job.validity < 1) throw 'Strict timing requires a timeout greater than ttr + 3!!!")';

    if (!this._runJobInBackground) await this.showProgressPage(ltimeout, 0);
    this._setControlledSubmission();
    this.socket.submitJob(job, this._submitJobResponse.bind(this), { validity: job.validity, ttr: lttr, timeout: ltimeout, hideTimeout: !!hideTimeout });
  }

  subscribeJob (jobId, timeout) {
    if (!this._runJobInBackground) this.showProgressPage(timeout);
    this.socket.subscribeJob(jobId, this._subscribeJobResponse.bind(this), timeout);
  }

  showCustomNotification (notification, status) {
    this._nextClosesWizard = true;
    this.showStatusPage(notification, status);
  }

  jobCompleted (notification) {
    this._jobPromise.resolve(Object.keys(notification.response).length ? notification.response : notification);
  }

  /**
   * Shows toast at the bottom of the pages-container.
   *
   * @param {String} text the text to display.
   * @param {Boolean} type controls the style.
   * @param {Boolean} duration the time during which the toast is displayed.
   * @param {Boolean} forced controls whether the toast is displayed or not, if there is already an open toast
   */
  openToast (text, type = '', duration = 3000, forced = true) {
    if (this._toastLitEl.isOpen() && !forced) return;

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

  async validateAllPages () {
    let valid = true;

    // Load pages that have required fields
    for (let index = 0; index < this._pages.length; index++) {
      if (!this._pages[index].has_required_fields) continue;
      if (!this.getPage(index)) await this.createPage(index);
    }

    for (const page of this._pagesContainerEl.children) {
      const index = +page.getAttribute('name')?.split('-')[1];

      const validPage = await page.validate();
      if (validPage) {
        if (this._invalidPagesIndexes.has(index)) this._invalidPagesIndexes.delete(index);
      } else {
        this._invalidPagesIndexes.add(index);
      }
    }

    if (this._invalidPagesIndexes.size > 0) {
      valid = false;
      if (!this._invalidPagesIndexes.has(this._activeIndex)) this.activatePage(this._invalidPagesIndexes.values().next().value);
      this.openToast('Não foi possível gravar as alterações. Por favor verifique se preencheu os campos corretamente.', 'error', 3000, false);
    }

    this.requestUpdate();
    return valid;
  }

  hasUnsavedChanges () {
    for (let i = 0; i < this._pagesContainerEl.children.length; i++) {
      const page = this._pagesContainerEl.children[i];
      if (!this._isCasperEditDialogPage(page)) continue;
      if (page.hasUnsavedChanges()) return true;
    }

    return false;
  }

  async save (close = true) {
    const isValid = await this.validateAllPages();
    if (!isValid) return;

    try {
      await this.showFreeStatusPage({state: 'connecting', title: 'Em progresso...', description: 'A guardar as alterações efetuadas, por favor aguarde.', timeout: 30000});

      const saveData = {
        patch: {}, // patch is the default operation
        post: {}, // only filled if specified in overcharged page save to handle it
        delete: {} // only filled if specified in overcharged page save to handle it
      }

      for (let i = 0; i < this._pagesContainerEl.children.length; i++) {
        this._pagesContainerEl.children[i].save(saveData, this.data);
      }

      await this._processSaveData(saveData);
      this.openToast('As alterações foram gravadas com sucesso.', 'success', 3000, false);
      this._userHasSavedData = true;

      for (let i = 0; i < this._pagesContainerEl.children.length; i++) {
        this._pagesContainerEl.children[i].afterSave(saveData, this.data);
      }

      if (close) this.close();
    } catch (error) {
      console.error(error);
      this.openToast(error?.errors?.[0]?.detail ? error.errors[0].detail : 'Erro! Não foi possível gravar as alterações.', 'error', 3000, false);
    } finally {
      this.hideStatusAndProgress();
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

  getDialogAction () {
    if (!this.options?.urn) return null;
    return this.options.urn.split('/').length > 1 ? 'edit' : 'create';
  }

  rootResource () {
    return this.options.urn.split('/')[0];
  }

  getPage (index = this._activeIndex) {
    return this._pagesContainerEl.children.namedItem(`page-${index}`);
  }

  async createPage (index) {
    if (!this._pages[index]) return;

    const newPage = document.createElement(this._pages[index].tag_name);
    newPage.setAttribute('name', `page-${index}`);
    newPage.editDialog = this;
    // For backwards compatibility
    newPage.wizard = this;

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

    if (this.getDialogAction() === 'edit') {
      if (!this.data) {
        try {
          const response = await window.app.broker.get(this.options.urn, 10000);
          this.data  = response.data;
          this._id   = response.id;
        } catch (error) {
          console.error(error);
          await this.showStatusPage({ message: ['Ocorreu um problema ao tentar carregar os dados.'] }, 'error');
          return;
        }
      }

      await newPage.load(this.data);
    } else if (this.getDialogAction() === 'create') {
      await newPage.load();
    }

    return newPage;
  }



  //***************************************************************************************//
  //                              ~~~ Private methods  ~~~                                 //
  //***************************************************************************************//


  async _createStatusProgressPage () {
    this._statusProgressPageEl = document.createElement(this.statusProgressPageTag);
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

  _generalKeydownHandler (event) {
    if (!event) return;

    // alt for Windows, and option for Mac
    if (event.key === 'ArrowDown' && event.altKey) {
      this._gotoNextPage();
    } else if (event.key === 'ArrowUp' && event.altKey) {
      this._gotoPreviousPage();
    }
  }

  _pagesContainerKeydownHandler (event) {
    if (!event) return;

    if (event.key === 'Tab') {
      const pageChildren = Array.from(this._getCurrentPage().shadowRoot.children);
      const reachedLast = this._uiHelper.fieldTabHandler(event, pageChildren);

      if (reachedLast) {
        // There aren't any focusable fields, so we go to the next page if it exists
        const nextPageIndex = +this._activeIndex + 1;
        if (this._pages[nextPageIndex]) this.activatePage(nextPageIndex);
      }
    }
  }

  _reachedLastFocusableFieldHandler (event) {
    if (!event?.detail?.focusable_element) return;

    event.stopPropagation();
    event.stopImmediatePropagation();

    const currentFieldEl = event.detail.focusable_element;
    const pageChildren = Array.from(this._getCurrentPage().shadowRoot.children);

    const focusableSiblingEl = this._uiHelper.findFocusableSiblingField(pageChildren, currentFieldEl);

    if (focusableSiblingEl) {
      this._uiHelper.focusField(focusableSiblingEl);
    } else {
      // There aren't any focusable fields, so we go to the next page if it exists
      const nextPageIndex = +this._activeIndex + 1;
      if (this._pages[nextPageIndex]) this.activatePage(nextPageIndex);
    }
  }

  // All components which use casper-overlay need to have their overlays moved to the stacking context of the top-layer, otherwise they wouldn't be visible
  _casperOverlayOpenedHandler (event) {
    if (!event?.detail?.element) return;

    event.stopPropagation();
    this._contentWrapperEl.appendChild(event.detail.element);
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
    const currentPageEl = this._getCurrentPage();

    const goToPrevious = () => {
      if (this._pages[this._activeIndex - 1]) this.activatePage(this._activeIndex - 1);
    };

    if (this.mode === 'wizard') {
      if (typeof currentPageEl.previous === 'function') {
        currentPageEl.previous();
      } else if (typeof this['previousOn' + currentPageEl.id] === 'function') {
        this['previousOn' + currentPageEl.id].apply(this);
      } else {
        goToPrevious(); 
      }

    } else if (this.mode === 'dialog') {
      goToPrevious();
    }
  }

  _gotoNextPage () {
    const currentPageEl = this._getCurrentPage();

    const goToNext = () => {
      if (this._pages[this._activeIndex + 1]) {
        this.activatePage(this._activeIndex + 1);
      } else {
        if (this._isCasperEditDialogPage(currentPageEl)) {
          this.save();
        // If the current page isn't an editDialogPage, then we simply close
        } else {
          this.close();
        }
      }
    };

    if (this.mode === 'wizard') {
      if (this._nextClosesWizard) {
        this.close();
        return;
      }

      if (typeof currentPageEl.next === 'function') {
        currentPageEl.next();
      } else if (typeof this['nextOn' + currentPageEl.id] === 'function') {
        this['nextOn' + currentPageEl.id].apply(this);
      } else {
        goToNext();
      }

    } else if (this.mode === 'dialog') {
      goToNext();
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
    return this.getPage();
  }

  async _updateUI (notification) {
    switch (notification.status) {
      case 'in-progress':
        if (!this._runJobInBackground) {
          const progressCount = (notification.index + 1 > this._statusProgressPageEl.progressCount) ? notification.index + 1 : 1;
          await this.showProgressPage(progressCount);
          this.updateProgressPage(notification.index, this.i18n.apply(this, notification.message), notification.progress);
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
              if (!this._runJobInBackground) this.showStatusPage(notification, 'success');
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

        if (this._runJobInBackground) {
          this._runJobInBackground = false;
        } else {
          this.hideStatusAndProgressWithTimeout(5000);
        }

        break;
      case 'failed':
      case 'error':
        this._setControlledSubmission();
        if (typeof this._getCurrentPage().error === 'function') {
          this._getCurrentPage().error(notification);
        } else if (typeof this['errorOn' + this._getCurrentPage().id] === 'function') {
          this['errorOn' + this._getCurrentPage().id].apply(this, [notification]);
        } else {
          if (!this._runJobInBackground) {
            if (this._errorsAreFatal) {
              this.showFatalError(notification);
            } else {
              this.showStatusPage(notification, 'error');
            }
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

  /**
   * Converts the given dimension to a rem value.
   * 1 rem = 16px, which is the browser's default font-size
   *
   * @param {Number} dimension numeric value that can be specified only in px.
   */
  _convertDimensionToRem (dimension) {
    return dimension / 16 + 'rem';
  }

  async _processSaveData (saveData) {
    for (const [operation, types] of Object.entries(saveData)) {
      for (const [relationshipName, data] of Object.entries(types)) {
        for (const entry of (data?.payloads|| [])) {
          if (!entry || !entry?.urn || entry.delayField) continue;
          const sUrn = entry.urn.split('/');
          if (entry.relationship) sUrn[0] = entry.relationship;
          if (operation !== 'delete') {
            if (Object.keys(entry.payload.data.attributes).length) {
              const response = await window.app.broker[operation](entry.urn, entry.payload, 10000);
              if (response?.data && operation === 'patch') {
                if (this.rootResource() === sUrn[0]) {
                  // Updating root element
                  response.data.relationships = this.data.relationships;
                  this.data = response.data;
                } else if (this.data.relationships[relationshipName]?.elements) {
                  // Updating relationships
                  response.data.relationships = this.data.relationships[relationshipName].elements.find(e => e.id == sUrn[1]).relationships;
                  const itemIndex = this.data.relationships[relationshipName].elements.indexOf(this.data.relationships[relationshipName].elements.find(e => e.id == sUrn[1]));
                  this.data.relationships[relationshipName].elements[itemIndex] = response.data;
                } else if (this.data.relationships[response.type]?.elements) {
                  response.data.relationships = this.data.relationships[response.type].elements.find(e => e.id == response.id).relationships;
                  const itemIndex = this.data.relationships[response.type].elements.indexOf(this.data.relationships[response.type].elements.find(e => e.id == response.id));
                  this.data.relationships[response.type].elements[itemIndex] = response.data;
                } else if (this.data.relationships[response.type]) {
                  this.data.relationships[response.type].elements = [response.data];
                }
              } else if (response?.data && this.data?.relationships && operation === 'post' && this.rootResource() !== sUrn[0]) {
                // Creating new elements in relationships
                this.data.relationships[relationshipName].data.push({type: response.type, id: response.id});
                this.data.relationships[relationshipName].elements.push(response.data);
              } else if (!this.data && operation === 'post' && this.rootResource() === sUrn[0]) {
                // Creating new root element
                this.data = {id: response.id};
              }
            }
          } else {
            await window.app.broker.delete(entry.urn, 30000);
            const itemIndex = this.data.relationships[relationshipName].elements.indexOf(this.data.relationships[relationshipName].elements.find(e => e.id == sUrn[1]));
            this.data.relationships[relationshipName].data.splice(itemIndex, 1);
            this.data.relationships[relationshipName].elements.splice(itemIndex, 1);
          }
        }
      }
    }

    if (this.getDialogAction() === 'create' && this.data?.id) {
      // Proccess delayed requests
      const rootObjectId = this.data?.id;
      this.options.urn = `${this.options.urn}/${rootObjectId}`;
      const createdRootObject = await window.app.broker.get(this.options.urn, 10000);
      this.data = createdRootObject.data;
      for (const [originalOp, types] of Object.entries(saveData)) {
        for (const [relationshipName, data] of Object.entries(types)) {
          for (const entry of (data?.payloads|| [])) {
            if (!entry.delayField) continue;
            if (entry.urn && Object.keys(entry.payload.data.attributes).length) {
              entry.payload.data.attributes[entry.delayField] = rootObjectId;
              if (entry.payload.data.id) {
                entry.payload.data.id = createdRootObject.data.relationships[entry.payload.data.id].data.id;
              }
              let operation = originalOp;
              if (this.data?.relationships?.[relationshipName]?.data?.id && originalOp === 'post') {
                // If item is created on root object post then change operation to patch
                operation = 'patch';
                entry.payload.data.id = this.data.relationships[relationshipName].data.id;
                entry.urn = `${entry.urn}/${entry.payload.data.id}`;
              }
              const response = await window.app.broker[operation](entry.urn, entry.payload, 10000);
              if (response?.data) {
                // Update dialog data with new values
                if (this.data.relationships[relationshipName]?.elements?.length > -1) {
                  this.data.relationships[relationshipName].elements.push(response.data);
                } else {
                  this.data.relationships[relationshipName].elements = [response.data];
                }
                if (operation === 'post') {
                  if (this.data.relationships[relationshipName].data?.length > -1) {
                    this.data.relationships[relationshipName].data.push({type: response.type, id: response.id});
                  } else {
                    this.data.relationships[relationshipName].data = [{type: response.type, id: response.id}];
                  } 
                }
              }
            }
          }
        }
      }  
    }
  }
}

customElements.define('casper-edit-dialog', CasperEditDialog);