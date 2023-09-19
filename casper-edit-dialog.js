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

import '@cloudware-casper/casper-tooltip/casper-tooltip.js';
import '@cloudware-casper/casper-select-lit/casper-select-lit.js';

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
    _disableLabelsList: {
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
    _hideInfoIcon: {
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
      --ced-label-number-color-rgb: 255, 255, 255;
      --ced-label-bold: 500;

      --ced-content-vertical-padding: calc(var(--ced-vertical-padding) * 3);
      --ced-content-horizontal-padding: calc(var(--ced-horizontal-padding) * 2);
      --ced-page-padding: calc((var(--paper-checkbox-ink-size, 48px) - var(--paper-checkbox-size, 18px)) / 2);
      --ced-wrapper-vertical-padding: calc(var(--ced-content-vertical-padding) - var(--ced-page-padding));
      --ced-wrapper-horizontal-padding: calc(var(--ced-content-horizontal-padding) - var(--ced-page-padding));
      --ced-progress-line-width: 0;
    }

    :host([mode="wizard"]) {
      --ced-labels-max-width: 0;
    }

    * {
      box-sizing: border-box;
    }

    [disabled] {
      pointer-events: none !important;
    }

    [hidden] {
      display: none !important;
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
      grid-template-columns: min(30%, var(--ced-labels-max-width)) auto;
      grid-template-rows: min-content 1fr min-content;
    }

    /* LABELS */

    .edit-dialog__labels-list {
      --ced-labels-list-padding-right: calc(var(--ced-border-radius) + var(--ced-horizontal-padding));

      grid-area: labels;
      list-style-type: none;
      width: calc(var(--ced-labels-max-width) + var(--ced-border-radius));
      max-width: calc(100% + var(--ced-border-radius));
      margin: 0;
      padding: 5rem var(--ced-horizontal-padding);
      /* Trick to add shadow beneath the left rounded corners */
      padding-right: var(--ced-labels-list-padding-right);
      box-shadow: rgba(0, 0, 0, 6%) calc(-15px - var(--ced-border-radius)) -7px 10px inset;
      color: rgb(var(--ced-label-number-color-rgb));
      background-color: var(--ced-labels-background-color);
      position: relative;
      transition: all var(--ced-labels-buttons-transition-duration);
    }

    .edit-dialog__labels-list[disabled] {
      --ced-labels-background-color: rgb(var(--ced-disabled-dark-color-rgb));
      --ced-label-number-color-rgb: var(--ced-disabled-light-color-rgb);
    }

    /* Firefox by default doesn't support :has() */
    @supports selector(:has(a, b)) {
      .edit-dialog__header:has(.edit-dialog__labels-select[disabled]) {
        --ced-labels-background-color: rgb(var(--ced-disabled-dark-color-rgb));
        --ced-label-number-color-rgb: var(--ced-disabled-light-color-rgb);
      }
    }

    :host([mode="wizard"]) .edit-dialog__labels-list {
      padding: 0;
    }

    .edit-dialog__label,
    .edit-dialog__label--info {
      font-size: 1rem;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity var(--ced-labels-buttons-transition-duration);
    }

    .edit-dialog__labels-list:not([disabled]) .edit-dialog__label[disabled] {
      opacity: 0.3;
    }

    .edit-dialog__label--info {
      position: absolute;
      left: var(--ced-horizontal-padding);
      bottom: var(--ced-horizontal-padding);
      width: calc(100% - var(--ced-horizontal-padding) - var(--ced-labels-list-padding-right));
    }

    .edit-dialog__label {
      position: relative;
      margin-bottom: 1.375em;
      display: flex;
      align-items: center;
      gap: 0.625em;
    }

    .edit-dialog__label:hover,
    .edit-dialog__label[active],
    .edit-dialog__label--info:hover {
      opacity: 1;
    }

    .edit-dialog__label[active] {
      font-weight: var(--ced-label-bold);
      pointer-events: none;
    }

    .edit-dialog__label-number {
      position: relative;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      /* Removes top white-space, centering the number */
      line-height: 0;
      transition: all var(--ced-labels-buttons-transition-duration);
    }

    .edit-dialog__label-number,
    .edit-dialog__label--info casper-icon {
      background-color: transparent;
      width: 1.875em;
      height: 1.875em;
      border-radius: 50%;
    }

    .edit-dialog__label--info casper-icon {
      padding: 0.375em;
    }

    .edit-dialog__label-number,
    .edit-dialog__label--info casper-icon {
      border: solid 1px rgba(var(--ced-label-number-color-rgb), 56%);
    }

    .edit-dialog__label[active] .edit-dialog__label-number,
    .edit-dialog__labels-select .edit-dialog__label-number {
      background: rgba(var(--ced-label-number-color-rgb), 28%);
      border: solid 1px transparent;
      box-shadow: rgba(0, 0, 0, 5%) 1px 1px 4px;
    }

    .edit-dialog__label[active] .edit-dialog__label-number {
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

    .edit-dialog__label[invalid] .edit-dialog__label-number::after,
    .edit-dialog__labels-select .edit-dialog__label-number[invalid]::after {
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
      /* Needed to stay above the labels-list and to display the labels-select */
      z-index: 1;

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
      outline: none;
      transition: all var(--ced-labels-buttons-transition-duration);
    }

    :host([mode="wizard"]) .edit-dialog__close {
      align-self: flex-start;
    }

    .edit-dialog__close:hover {
      background-color: rgba(0, 0, 0, 0.1);
      transform: scale(1.05);
    }

    .edit-dialog__header-text {
      --ced-header-text-padding-right: calc(var(--ced-close-button-width) + 0.625rem);

      font-size: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.3125rem;
      padding-bottom: 0.3125rem;
      border-bottom: solid 1px var(--primary-color);
      /* Space reserved to prevent text from colliding with the button */
      padding-right: var(--ced-header-text-padding-right);
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

    /* HEADER - LABELS */

    .edit-dialog__labels-select {
      --paper-input-container-color: #FFF;
      --paper-input-container-input-color: rgb(var(--ced-label-number-color-rgb));

      color: var(--secondary-text-color);
      width: calc(100% + var(--ced-header-text-padding-right));
      display: none;
      transition: opacity var(--ced-labels-buttons-transition-duration);
    }

    .edit-dialog__labels-select[disabled] {
      opacity: 0.5;
    }

    /* Firefox by default doesn't support :has() */
    @supports selector(:has(a, b)) {
      .edit-dialog__labels-select[disabled] {
        opacity: 1;
      }
    }

    .edit-dialog__labels-select::part(virtual-scroller) {
      border-color: transparent;
      margin-top: 2px;
    }

    .edit-dialog__labels-select::part(container) {
      /* 5px to accommodate the "!" invalid mark */
      padding: 5px 0 2px 0;
      opacity: 1 !important;
    }

    .edit-dialog__labels-select::part(label),
    .edit-dialog__labels-select::part(iron-input),
    .edit-dialog__labels-select .edit-dialog__label-number {
      font-weight: var(--ced-label-bold);
    }

    .edit-dialog__labels-select::part(underline) {
      display: none;
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
      transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.5s;
      overflow: auto;
    }

    :host([mode="dialog"]) [name^="page"] {
      transform: translateY(-100%);
      /* This prevents layout shifts when switching pages */
      scrollbar-gutter: stable;
    }

    :host([mode="wizard"]) [name^="page"] {
      transform: translateX(-100%);
      scrollbar-gutter: auto;
    }

    [name^="page"][active] {
      position: relative;
      opacity: 1;
      pointer-events: auto;
      transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0s;
      z-index: 1;
    }

    :host([mode="dialog"]) [name^="page"][active],
    :host([mode="wizard"]) [name^="page"][active] {
      transform: none;
    }

    :host([mode="dialog"]) [name^="page"][active] ~ * {
      transform: translateY(100%);
    }

    :host([mode="wizard"]) [name^="page"][active] ~ * {
      transform: translateX(100%);
    }

    .edit-dialog__status-progress-page {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: solid var(--ced-background-color);
      border-width: var(--ced-wrapper-vertical-padding) var(--ced-wrapper-horizontal-padding);
      z-index: var(--status-page-z-index);
      opacity: 1;
      pointer-events: auto;
      transition: opacity 0.3s ease;
    }

    :host([mode="wizard"]) .edit-dialog__status-progress-page {
      border-width: var(--ced-page-padding);
    }

    .edit-dialog__status-progress-page[hidden] {
      opacity: 0 !important;
      pointer-events: none !important;
      display: flex !important;
    }


    /* FOOTER */

    .edit-dialog__footer {
      grid-area: footer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: var(--ced-vertical-padding) var(--ced-horizontal-padding);
      box-shadow: rgba(0, 0, 0, 0.05) 0px -4px 12px;
      border-top: solid 1px rgba(0, 0, 0, 0.05);
      /* Needed so that the shadow displays above the previous sibling */
      z-index: 1;
      border-bottom-left-radius: var(--ced-border-radius);
      position: relative;
    }

    :host([mode="dialog"]) .edit-dialog__footer {
      justify-content: flex-end;
    }

    :host([mode="wizard"]) .edit-dialog__footer {
      justify-content: space-between;
    }

    .edit-dialog__progress-line {
      --ced-progress-line-color: var(--primary-color);

      font-size: 1rem;
      position: absolute;
      top: 0;
      left: 0;
      transform: translateY(-50%);
      background-color: var(--ced-progress-line-color);
      width: var(--ced-progress-line-width);
      height: 0.125em;
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1), background-color 1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .edit-dialog__progress-line.invalid {
      --ced-progress-line-color: var(--status-red);
    }

    .edit-dialog__progress-line::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 0;
      transform: translate(50%, -50%);
      border-radius: 50%;
      border: solid 0.125em var(--ced-progress-line-color);
      background-color: var(--ced-background-color);
      width: 0.5em;
      height: 0.5em;
      outline: solid 0.09375em var(--ced-background-color);
      transition: width 0.1s cubic-bezier(0.4, 0, 0.2, 1) 0.9s, height 0.1s cubic-bezier(0.4, 0, 0.2, 1) 0.9s, border-color 1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .edit-dialog__progress-list {
      margin: 0;
      padding: 0;
      list-style-type: none;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(2px, 1fr));
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      transform: translateY(-50%);
    }

    .edit-dialog__progress-item {
      font-size: 1rem;
      width: 100%;
      height: 0.0625em;
      position: relative;
    }

    .edit-dialog__progress-item::after {
      font-size: 0.75rem;
      font-weight: 600;
      content: "";
      position: absolute;
      top: 50%;
      right: 0;
      transform: translate(50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: var(--primary-color);
      color: transparent;
      opacity: 0;
      width: 0.5em;
      height: 0.5em;
      z-index: 1;
      transition: opacity 0.1s ease 0s, width 0.1s ease 0s, height 0.1s ease 0s, color 0.1s ease 0s, background-color 0.1s ease 0.9s;
    }

    .edit-dialog__progress-item[invalid]::after {
      background-color: var(--status-red);
    }

    .edit-dialog__progress-item[invalid][active]::after {
      content: "!";
      width: 1.5em;
      height: 1.5em;
      color: #FFF;
      transition: opacity 0.1s ease 0.9s, width 0.1s ease 0.9s, height 0.1s ease 0.9s, color 0.1s ease 0.9s, background-color 0.1s ease 0.9s;

      opacity: 1;
    }

    .edit-dialog__footer-info {
      display: flex;
      font-size: 1rem;
      color: var(--primary-color);
    }

    .edit-dialog__footer-info casper-icon {
      width: 1.875em;
      height: 1.875em;
      border-radius: 50%;
      background-color: transparent;
      transition: background-color var(--ced-labels-buttons-transition-duration);
    }

    .edit-dialog__footer-info:hover casper-icon {
      cursor: pointer;
      background-color: var(--light-primary-color);
    }

    .edit-dialog__buttons-wrapper {
      display: flex;
      gap: 0.5rem;
      flex-grow: 1;
      justify-content: flex-end;
      flex-wrap: wrap;
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
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
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
      z-index: var(--toast-z-index);
    }

    
    @media (max-width: 41.25rem) {
      :host([mode="dialog"]) {
        --ced-labels-max-width: 0;
      }

      :host([mode="dialog"]) .edit-dialog__header {
        background-color: var(--ced-labels-background-color);
        color: #FFF;

        transition: background-color var(--ced-labels-buttons-transition-duration);
      }

      :host([mode="dialog"]) .edit-dialog__header-text {
        margin-top: calc(var(--ced-close-button-width) * -1);
        border-color: transparent;
      }

      :host([mode="dialog"]) .edit-dialog__general-title {
        color: inherit;
      }

      :host([mode="dialog"]) .edit-dialog__page-title,
      :host([mode="dialog"]) .edit-dialog__labels-list {
        display: none;
      }

      :host([mode="dialog"]) .edit-dialog__labels-select {
        display: block;
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
    this._isMacOs = window.navigator.userAgent.indexOf("Mac OS") !== -1;

    this.mode = 'dialog';
    this.noCancelOnEscKey = false;
    
    this._state = 'normal';
    this._title = '';
    this._pages = [];
    this._initialIndex = 0;
    this._activeIndex = this._initialIndex;
    this._invalidPagesIndexes = new Set();
    this._userHasSavedData = false;

    this._disableLabelsList = false;
    this._disabledLabelsIndexes = new Set();
    this._disablePrevious = false;
    this._disableNext = false;
    this._hidePrevious = false;
    this._hideNext = false;
    this._hideInfoIcon = false;

    this._setControlledSubmission();
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
    const progressClasses = { invalid: this._invalidPagesIndexes.size > 0};
    const previousClasses = { icon: this._previousIcon, text: this._previousText };
    const nextClasses = { icon: this._nextIcon, text: this._nextText };

    return html`
      <dialog id="editDialog" class="edit-dialog">
        <div class="edit-dialog__inner">
          <ol class="edit-dialog__labels-list" ?disabled=${this._disableLabelsList}>
            ${(this._pages.length > 0 && this.mode === 'dialog')
              ? this._pages.map((page, index) => html`
                  <li class="edit-dialog__label" ?active=${index === this._activeIndex} ?invalid=${this._invalidPagesIndexes.has(index)} ?disabled=${this._disabledLabelsIndexes.has(index)} .index=${index} @click=${this._labelClickHandler}>
                    <span class="edit-dialog__label-number">${index + 1}</span>
                    <span class="edit-dialog__label-text" text=${page.label}>${page.label}</span>
                  </li>
                `)
              : ''}

            ${this.mode === 'dialog' ? html`
              <li class="edit-dialog__label--info" @click=${this.showKeyboardShortcuts.bind(this)} tooltip="Atalhos de teclado" ?hidden=${this._hideInfoIcon}>
                <casper-icon icon="fa-solid/info"></casper-icon>
              </li>
            ` : ''}
          </ol>

          <div class="edit-dialog__header">
            <!-- Tabindex="-1" should never be removed, since this is used in a trick which prevents focus + page's transition problems. This button can also never be disabled or hidden. -->
            <casper-icon-button tabindex="-1" tooltip="Fechar" class="edit-dialog__close" icon="fa-light:times-circle" @click=${this.close.bind(this)}></casper-icon-button>

            <hgroup class="edit-dialog__header-text">
              ${(this._title)
                ? html`<h1 class="edit-dialog__general-title">${this._title}</h1>`
                : ''
              }
              ${(this._pages.length > 0 && this._pages[this._activeIndex].title)
                ? html`<h2 class="edit-dialog__page-title">${this._pages[this._activeIndex].title}</h2>`
                : ''
              }

              ${this.mode === 'dialog' ? html`
                <casper-select-lit 
                  class="edit-dialog__labels-select"
                  disableClear 
                  noLabelFloat 
                  listHeight="250" 
                  label="Página atual"
                  .initialId=${this._initialIndex.toString()}
                  .items=${this._pages}
                  .renderLine=${this._renderClsLabelsLine.bind(this)}
                  @change=${this._selectedClsLabelChanged}
                  ?disabled=${this._disableLabelsList}>
                    <span slot="cs-prefix" class="edit-dialog__label-number" ?invalid=${this._invalidPagesIndexes.has(this._activeIndex)}>${this._activeIndex + 1}</span>
                </casper-select-lit>` 
              : ''}
            </hgroup>
          </div>

          <div class="edit-dialog__content-wrapper">
            <div class="edit-dialog__pages-container" style=${this._pagesContainerStyles !== undefined ? styleMap(this._pagesContainerStyles) : ''}></div>
            <casper-toast-lit id="toastLit"></casper-toast-lit>
          </div>

          <div class="edit-dialog__footer">
            ${(this._pages.length > 1 && this.mode === 'wizard') ? html`
              <div class="edit-dialog__progress-line ${classMap(progressClasses)}"></div>
              <ol class="edit-dialog__progress-list">
                ${ this._pages.map((page, index) => html`
                  <li class="edit-dialog__progress-item" ?active=${index === this._activeIndex} ?invalid=${this._invalidPagesIndexes.has(index)} .index=${index}>
                  </li>
                `)}
              </ol>
            ` : ''}

            ${this.mode === 'wizard' ? html`
              <div class="edit-dialog__footer-info" @click=${this.showKeyboardShortcuts.bind(this)} tooltip="Atalhos de teclado" ?hidden=${this._hideInfoIcon}>
                <casper-icon icon="fa-light/info-circle"></casper-icon>
              </div>
            ` : ''}

            <div class="edit-dialog__buttons-wrapper">
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
        </div>
        <casper-tooltip id="dialogTooltip"></casper-tooltip>
      </dialog>

      <casper-confirmation-dialog id="confirmationDialog"></casper-confirmation-dialog>
    `;
  }

  willUpdate (changedProperties) {
    if (changedProperties.has('_activeIndex') && changedProperties.get('_activeIndex') !== undefined) {
      this.style.setProperty('--ced-progress-line-width', `calc(100% / ${this._pages.length} * (${+this._activeIndex + 1}))`);

      this._labelsSelectEl.setValue(this._activeIndex.toString());
    }

    // This only executes after firstUpdated
    if (changedProperties.has('_pagesContainerStyles') && this.hasUpdated) {
      this.fixWizardOpacity();
    }
  }

  firstUpdated () {
    this._dialogEl = this.shadowRoot.getElementById('editDialog');
    this._closeButtonEl = this.shadowRoot.querySelector('.edit-dialog__close');
    this._labelsListEl = this.shadowRoot.querySelector('.edit-dialog__labels-list');
    this._contentWrapperEl = this.shadowRoot.querySelector('.edit-dialog__content-wrapper');
    this._pagesContainerEl = this.shadowRoot.querySelector('.edit-dialog__pages-container');
    this._confirmationDialogEl = this.shadowRoot.getElementById('confirmationDialog');
    this._toastLitEl = this.shadowRoot.getElementById('toastLit');
    this._previousButtonEl = this.shadowRoot.querySelector('.edit-dialog__button.previous');
    this._nextButtonEl = this.shadowRoot.querySelector('.edit-dialog__button.next');

    if (this.mode === 'dialog') {
      this._labelsSelectEl = this.shadowRoot.querySelector('.edit-dialog__labels-select');
      this._setLabelsSelectStyles();
    }

    // Needed to hide jumps caused by changes in the wizard's dimensions
    if (this.options.hasOwnProperty('initial_opacity')) {
      this._dialogEl.style.opacity = this.options.initial_opacity;
    }

    this._dialogEl.addEventListener('cancel', this._dialogCancelHandler.bind(this));
    this._pagesContainerEl.addEventListener('keydown', this._pagesContainerKeydownHandler.bind(this));
    this._pagesContainerEl.addEventListener('casper-select-tab-was-pressed', this._csTabWasPressedHandler.bind(this));
    this._pagesContainerEl.addEventListener('reached-extreme-focusable-field', this._reachedExtremeFocusableFieldHandler.bind(this));
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

    // Tooltip
    this._dialogTooltipEl = this.shadowRoot.getElementById('dialogTooltip');
    this._dialogTooltipEl.fitInto = this._dialogEl;
    this.addEventListener('mousemove', (event) => {
      this._dialogTooltipEl.mouseMoveToolip(event); 
      app.tooltip.hide();
    });
  }

  updated (changedProperties) {
    if (changedProperties.has('_activeIndex') && changedProperties.get('_activeIndex') !== undefined) {
      const index = this._activeIndex;

      // Focus can only be added after the page's transition has finished
      setTimeout(() => {
        this.focusPageFirstOrLastEditableField('first', index);
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
      for (let i = 0; i < this.options.pages.length; i++) {
        const page = this.options.pages[i];
        const sliceIndex = page.lastIndexOf('/') + 1;
        const module = await import(`/src/${page.slice(0,sliceIndex)}${window.app.digest ? `${window.app.digest}.` : ''}${page.slice(sliceIndex)}.js`);

        this._pages.push({
          label: module.label ? module.label : '',
          title: module.title ? module.title : module.label,
          tag_name: module.tag_name ? module.tag_name : page.slice(sliceIndex),
          has_required_fields: !!module.hasRequiredFields,
          id: i.toString(),
          name: module.label ? module.label : ''
        });
      }

      this.requestUpdate();
    } catch (error) {
      console.error(error);
      window.app.openToast({'text': 'Erro ao tentar abrir o diálogo. Por favor contacte o suporte técnico.', 'duration': 3500, 'backgroundColor': 'var(--status-red)'});
      return;
    }

    this.style.setProperty('--ced-progress-line-width', `calc(100% / ${this._pages.length} * (${+this._activeIndex + 1}))`);

    // Then we create only the first page
    await this.activatePage(0, true);
    this._dialogEl.showModal();
    this.focusPageFirstOrLastEditableField('first', 0);
  }

  async close () {
    const allowClose = !(await this.hasUnsavedChanges());

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

    this._state = 'show-progress';
    this.disableAllActions();

    if (!this._statusProgressPageEl) await this._createStatusProgressPage();
    this._statusProgressPageEl.setProgressCount(count, true, timeout);
    this._statusProgressPageEl.hidden = false;
  }

  updateProgressPage (index = null, description, progress, title = 'Em progresso...') {
    this._statusProgressPageEl.updateProgress(index, description, progress, title);
  }

  async showStatusPage (notification, status) {
    if (!notification) return;

    this._state = 'show-status';
    this.disableAllActions();
    if (this._nextClosesWizard) this.changeNextButtonToText('Sair');
    
    if (!this._statusProgressPageEl) await this._createStatusProgressPage();
    this._statusProgressPageEl.showNotificationStatus(notification, status);
    this._statusProgressPageEl.hidden = false;

    if (this._nextClosesWizard) this.enableNext();
  }

  async showFreeStatusPage (options) {

    this._state = 'show-status';
    this.disableAllActions();

    if (!this._statusProgressPageEl) await this._createStatusProgressPage();
    this._statusProgressPageEl.showFreeStatus(options);
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

  

  /**
   * Shows an error that is considered fatal, i.e. the next button will close the wizard
   *
   * @param {Object} notification an error notification returned by the server
   */
  showFatalError (notification) {
    this._nextClosesWizard = true;
    this.showStatusPage(notification, 'fatal-error');
  }

  async activatePage (newIndex, beforeShowModal = false) {
    if ((+newIndex === +this._activeIndex && !beforeShowModal) || !this._pages[+newIndex] || this._disabledLabelsIndexes.has(+newIndex)) return;

    const previousIndex = this._activeIndex;
    const previousPage = this.getPage(previousIndex);
    if (previousPage) previousPage.removeAttribute('active');

    let newPage = this.getPage(newIndex);
    if (!newPage) newPage = await this.createPage(newIndex);

    if (beforeShowModal) {
      newPage.setAttribute('active', '');
    } else {
      setTimeout(() => {
        newPage.setAttribute('active', '');
        if (newPage.style.transform) newPage.style.removeProperty('transform');
      }, 0);
    }
    
    if (this.mode === 'wizard') +newIndex === 0 ? this.disablePrevious() : this.enablePrevious();

    if (typeof newPage.enter === 'function') {
      newPage.enter();
    } else if (typeof this['enterOn' + newPage.id] === 'function') {
      this['enterOn' + newPage.id].apply(this);
    }
    

    if (this.mode === 'wizard') {
      newPage.hasAttribute('previous') ? this.changePreviousButtonToText(newPage.getAttribute('previous')) : this.changePreviousButtonToIcon();

      if (newPage.hasAttribute('next')) {
        this.changeNextButtonToText(newPage.getAttribute('next'));
      } else {
        const nextIcon = (+newIndex === this._pages.length - 1) 
          ? 'fa-light:check' 
          : 'fa-light:arrow-right';

        this.changeNextButtonToIcon(nextIcon);
      }
    }

    // If the previous page was invalid, we check its validity again
    if (this._invalidPagesIndexes.has(previousIndex)) {
      const isValid = await previousPage.validate(this.data);
      if (isValid) this._invalidPagesIndexes.delete(previousIndex);
    }

    this._activeIndex = +newIndex;
  }

  activatePreviousPage () {
    if (this.mode === 'wizard' && this._disablePrevious) return;

    this.activatePage(this._activeIndex - 1);
  }

  activateNextPage () {
    if (this.mode === 'wizard' && this._disableNext) return;

    if (this._pages[this._activeIndex + 1]) {
      this.activatePage(this._activeIndex + 1);
    } else {
      if (this._isCasperEditDialogPage(this._getCurrentPage())) {
        this.save();
      // If the current page isn't an editDialogPage, then we simply close
      } else {
        this.close();
      }
    }
  }

  showKeyboardShortcuts () {
    if (this._hideInfoIcon) return;

    const altKey = this._isMacOs ? 'option' : 'Alt';
    const previousKey = this.mode === 'dialog' ? '&#8593;' : '&#8592;';
    const nextKey = this.mode === 'dialog' ? '&#8595;' : '&#8594;';

    let html = `
      <style>
        .confirmation-dialog__title {
          margin-bottom: 1.5rem !important;
        }

        .shortcuts-list {
          --list-gap: 1em;

          list-style-type: none;
          margin: 0;
          padding: 0;
          font-size: 0.875rem;
          display: flex;
          flex-direction: column;
          gap: var(--list-gap);
          color: #808080;
        }

        .shortcuts-list__item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1em;
        }

        .shortcuts-list__item.divider:not(:first-child) {
          padding-top: var(--list-gap);
          border-top: solid 1px rgb(217, 217, 217);
        }

        .shortcuts-list__category {
          margin: 0;
          font-size: inherit;
        }

        .shortcut__key {
          display: inline-flex;
          background-color: #f3f3f3;
          padding: 0.28em 0.57em;
          border-radius: 0.21em;
        }
      </style>

      <h1 class="confirmation-dialog__title">Atalhos</h1>
      <ul class="shortcuts-list">
        <li class="shortcuts-list__item divider">
          <h2 class="shortcuts-list__category">Campos</h2>
        </li>
        <li class="shortcuts-list__item">
          <span class="shortcut__key">Tab</span>
          <span class="shortcut__description">Saltar para o campo seguinte.</span>
        </li>
        <li class="shortcuts-list__item">
          <div class="shortcut__keys-wrapper">
            <span class="shortcut__key">Shift</span> + <span class="shortcut__key">Tab</span>
          </div>
          <span class="shortcut__description">Saltar para o campo anterior.</span>
        </li>
        <li class="shortcuts-list__item divider">
          <h2 class="shortcuts-list__category">Páginas</h2>
        </li>
        <li class="shortcuts-list__item">
          <div class="shortcut__keys-wrapper">
            <span class="shortcut__key">${altKey}</span> + <span class="shortcut__key">${previousKey}</span>
          </div>
          <span class="shortcut__description">Saltar para a página anterior.</span>
        </li>
        <li class="shortcuts-list__item">
          <div class="shortcut__keys-wrapper">
            <span class="shortcut__key">${altKey}</span> + <span class="shortcut__key">${nextKey}</span>
          </div>
          <span class="shortcut__description">Saltar para a página seguinte.</span>
        </li>
    `;

    if (this.mode === 'dialog') {
      html += `
        <li class="shortcuts-list__item">
          <div class="shortcut__keys-wrapper">
            <span class="shortcut__key">${altKey}</span> + <span class="shortcut__key">Shift</span> + <span class="shortcut__key">1 - 9</span>
          </div>
          <span class="shortcut__description">Saltar para a página número X.</span>
        </li>
      `;
    }

    html += `
      <li class="shortcuts-list__item divider">
        <h2 class="shortcuts-list__category">Geral</h2>
      </li>
      <li class="shortcuts-list__item">
        <div class="shortcut__keys-wrapper">
          <span class="shortcut__key">${altKey}</span> + <span class="shortcut__key">F1</span>
        </div>
        <span class="shortcut__description">Abrir este ecrã de ajuda.</span>
      </li>
      <li class="shortcuts-list__item">
        <span class="shortcut__key">Esc</span>
        <span class="shortcut__description">Fechar este ecrã de ajuda ou diálogo.</span>
      </li>
    `;

    if (this.mode === 'dialog') {
      html += `
        <li class="shortcuts-list__item">
          <div class="shortcut__keys-wrapper">
            <span class="shortcut__key">${altKey}</span> + <span class="shortcut__key">Enter</span>
          </div>
          <span class="shortcut__description">Gravar e sair.</span>
        </li>
      `;
    }

    html += '</ul>';

    const options = {
      reject: '',
      accept: 'Fechar',
      custom: html
    };


    this.openConfirmationDialog(options);
  }

  focusPageFirstOrLastEditableField (position = 'first', pageIndex = this._activeIndex) {
    const pageEl = this.getPage(pageIndex);
    if (!pageEl) return;

    const childEl = this._uiHelper.findFocusableField(Array.from(pageEl.shadowRoot.children), position);
    if (!childEl) return;

    const elNodeName = childEl.nodeName.toLowerCase();

    if (this._uiHelper.nestedComponents.includes(elNodeName)) {
      childEl.focusFirstOrLastEditableField(position);
    } else {
      this._uiHelper.focusField(childEl);
    }
  }

  /* --- Labels --- */

  disableLabel (index) {
    this._disabledLabelsIndexes.add(index);
    this._pages = JSON.parse(JSON.stringify(this._pages));
  }

  enableLabel (index) {
    if (!this._disabledLabelsIndexes.has(index)) return;

    this._disabledLabelsIndexes.delete(index);
    this._pages = JSON.parse(JSON.stringify(this._pages));
  }

  disableLabelsList () {
    this._disableLabelsList = true;
  }

  enableLabelsList () {
    this._disableLabelsList = false;
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

  showPrevious () {
    this._hidePrevious = false;
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

  showNext () {
    this._hideNext = false;
  }

  changeNextButtonToText (text) {
    this._changeButtonToText('next', text);
  }

  changeNextButtonToIcon (icon = 'fa-light:arrow-right') {
    this._changeButtonToIcon('next', icon);
  }

  disableAllActions () {
    if (this.mode === 'dialog') this.disableLabelsList();
    this.disablePrevious();
    this.disableNext();
    this._getCurrentPage()?.setAttribute('disabled', '');
  }

  enableAllActions () {
    if (this.mode === 'dialog') this.enableLabelsList();
    this.enablePrevious();
    this.enableNext();
    this._getCurrentPage()?.removeAttribute('disabled');
  }

  /* --- Info icon --- */

  hideInfoIcon () {
    this._hideInfoIcon = true;
  }

  showInfoIcon () {
    this._hideInfoIcon = false;
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

    await this.submitJobWithStrictValidity(job, timeout, ttr, true);
    return this._jobPromise;
  }

  /**
   *
   * @param {Object}  job
   * @param {Integer} timeout
   * @param {Integer} ttr
   *
   */
  async submitJobWithStrictValidity (job, timeout, ttr, hideTimeout) {
    const ltimeout = parseInt(timeout);
    const lttr = parseInt(ttr);

    if (isNaN(ltimeout) || isNaN(lttr) ) throw 'Strict timing requires valid ttr and timeout!!!';
    
    job.validity = ltimeout - lttr - 2; // 2 seconds safety margin
    if (job.validity < 1) throw 'Strict timing requires a timeout greater than ttr + 3!!!")';

    if (!this._runJobInBackground) await this.showProgressPage(ltimeout, 0);
    this._setControlledSubmission();
    this.socket.submitJob(job, this._submitJobResponse.bind(this), { validity: job.validity, ttr: lttr, timeout: ltimeout, hideTimeout: !!hideTimeout });
  }

  subscribeJob (jobId, timeout, showStatusPage = !this._runJobInBackground) {
    if (showStatusPage) this.showProgressPage(timeout);
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
   * Shows toast at the bottom of the screen.
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
      
      if (!this._invalidPagesIndexes.has(this._activeIndex)) {
        if (this.mode === 'dialog') {
          for (const index of this._invalidPagesIndexes.values()){
            if (!this._disabledLabelsIndexes.has(index)) {
              this.activatePage(index);
              break;
            }
          }
        } else {
          this.activatePage(this._invalidPagesIndexes.values().next().value);
        }
      }

      this.openToast('Não foi possível gravar as alterações. Por favor verifique se preencheu os campos corretamente.', 'error', 3000, false);
    }

    this.requestUpdate();
    return valid;
  }

  async hasUnsavedChanges () {
    for (let i = 0; i < this._pagesContainerEl.children.length; i++) {
      const page = this._pagesContainerEl.children[i];
      if (!this._isCasperEditDialogPage(page)) continue;
      if (await page.hasUnsavedChanges()) return true;
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
        await this._pagesContainerEl.children[i].save(saveData, this.data);
      }

      let errors = await this._processSaveData(saveData);
      if (errors.length === 0) {
        this.openToast('As alterações foram gravadas com sucesso.', 'success', 3000, false);
      } else {
        this.openToast('Atenção! Apenas foram gravadas algumas alterações.', 'warning', 3000, false);
      }
      this._userHasSavedData = true;

      for (let i = 0; i < this._pagesContainerEl.children.length; i++) {
        await this._pagesContainerEl.children[i].afterSave(saveData, this.data);
      }

      if (close) this.close();
    } catch (error) {
      console.error(error);
      if (!this._errorsAreFatal) this.openToast(error?.errors?.[0]?.detail ? error.errors[0].detail : 'Erro! Não foi possível gravar as alterações.', 'error', 3000, false);
    } finally {
      if (!this._errorsAreFatal) this.hideStatusAndProgress();
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
      closestPreviousSibling = this.getPage(i);
      if (closestPreviousSibling) break;
    }

    if (closestPreviousSibling) {
      closestPreviousSibling.insertAdjacentElement('afterend', newPage);
    } else {
      this._pagesContainerEl.appendChild(newPage);
    }

    if (index > this._activeIndex) newPage.style.transform =  this.mode === 'dialog' ? 'translateY(100%)' : 'translateX(100%)';

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

  _renderClsLabelsLine (item) {
    item.disabled = this._disabledLabelsIndexes.has(+item.id);

    return html`
      <style>
        .cvs__item-row {
          background-color: #FFF !important;
          display: flex;
          align-items: center;
          gap: 0.357em;
          margin: 0.357em;
          margin-bottom: 0.1785em;
          border-radius: 0.1785em;
          position: relative;
          transition: opacity var(--ced-labels-buttons-transition-duration);
        }

        .cvs__item-row[selectable][active] {
          font-weight: var(--ced-label-bold);
        }

        .cvs__item-row[selectable]:hover,
        .cvs__item-row[selectable][active] {
          color: var(--primary-color) !important;
          background-color: #f8f8f8 !important;
        }

        .cvs__item-row[disabled] {
          opacity: 0.3 !important;
        }

        .cvs-item-row__number {
          position: relative;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          /* Removes top white-space, centering the number */
          line-height: 0;
          width: 1.875em;
          height: 1.875em;
          border-radius: 50%;
          background-color: transparent;
          border: solid 1px;
          transition: all var(--ced-labels-buttons-transition-duration);
        }

        .cvs__item-row[selectable][active] .cvs-item-row__number {
          background-color: var(--primary-color);
          border-color: transparent;
          box-shadow: rgba(0, 0, 0, 5%) 1px 1px 4px;
          color: #FFF;
        }

        .cvs-item-row__number::after {
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
          border: solid 1px #FFF;
          background-color: var(--status-red);
          color: #FFF;
          opacity: 0;
          width: 0;
          height: 0;
          transition: opacity var(--ced-labels-buttons-transition-duration), width var(--ced-labels-buttons-transition-duration), height var(--ced-labels-buttons-transition-duration);
        }

        .cvs__item-row[selectable]:hover .cvs-item-row__number::after,
        .cvs__item-row[selectable][active] .cvs-item-row__number::after {
          border-color: #f8f8f8;
        }

        .cvs-item-row__number[invalid]::after {
          height: 1.4em;
          width: 1.4em;
          opacity: 1;
        }
      </style>

      <span class="cvs-item-row__number" ?invalid=${this._invalidPagesIndexes.has(+item.id)}>${+item.id + 1}</span>
      <span class="cvs-item-row__text">${item.name}</span>
    `;
  }

  async _setLabelsSelectStyles () {
    await this._labelsSelectEl.updateComplete;

    const input = this._labelsSelectEl.shadowRoot?.getElementById('cs-input');
    const container = input?.shadowRoot?.getElementById('container');
    const label = input?.shadowRoot?.querySelector('label');
    const ironInput = input?.shadowRoot?.querySelector('.input-element');
    const underline = container?.shadowRoot?.querySelector('.underline');

    underline?.setAttribute('part', 'underline');
    ironInput?.setAttribute('part', 'iron-input');
    label?.setAttribute('part', 'label');
    container?.setAttribute('exportparts', 'underline');
    container?.setAttribute('part', 'container');
    input?.setAttribute('exportparts', 'label, container, iron-input, underline');
    input?.setAttribute('part', 'outer-input');
    this._labelsSelectEl.setAttribute('exportparts', 'outer-input, container, iron-input, underline');
  }

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
    if (!event || this._state !== 'normal') return;

    if (event.altKey) {
      const previousKey = this.mode === 'dialog' ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = this.mode === 'dialog' ? 'ArrowDown' : 'ArrowRight';

      switch (event.key) {
        case 'Enter':
          if (this.mode === 'dialog' && !this._disablePrevious) this.save();
          break;

        case previousKey:
          if ((this.mode === 'wizard' && this._disablePrevious) || (this.mode === 'dialog' && this._disableLabelsList)) break;

          // This prevents the dialog from being accidentally saved
          if (this._pages[+this._activeIndex - 1]) this._gotoPreviousPage();
          break;

        case nextKey:
          if ((this.mode === 'wizard' && this._disableNext) || (this.mode === 'dialog' && this._disableLabelsList)) break;

          // This prevents the dialog from being accidentally saved
          if (+this._activeIndex < this._pages.length - 1) this._gotoNextPage();
          break;

        case 'F1':
          this.showKeyboardShortcuts();
          break;

        default:
          const digitCodes = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'];
          const numpadCodes = ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9'];

          if (event.shiftKey && (digitCodes.includes(event.code) || numpadCodes.includes(event.code))) {
            if (this.mode === 'dialog' && !this._disableLabelsList) {
              // Prevents character from being written
              event.preventDefault();
              this.activatePage(+event.code?.slice(-1) - 1);
            }
          }
          break;
      }

    }
  }

  _reachedFieldAtTheExtreme (position = 'last') {
    // Before going to another page, we use the trick of moving the focus to the close-button. 
    // This prevents transition problems that would break the layout (mainly caused by the casper-select, since it manipulates the focus).
    this._closeButtonEl.focus({preventScroll: true});

    if (position === 'first') {
      if (this._pages[+this._activeIndex - 1]) this._gotoPreviousPage();
    } else if (position === 'last') {
      if (this._pages[+this._activeIndex + 1]) this._gotoNextPage();
    }
  }

  _pagesContainerKeydownHandler (event) {
    const currentPage = this._getCurrentPage();
    if (!event || !currentPage) return;

    if (event.key === 'Tab') {
      if (currentPage.hasAttribute('disabled')) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }

      const pageChildren = Array.from(currentPage.shadowRoot.children);

      const reachedExtreme = this._uiHelper.fieldTabHandler(event, pageChildren);
      if (reachedExtreme) {
        this._reachedFieldAtTheExtreme(event.shiftKey ? 'first' : 'last');
      }
    }
  }

  /** Event listener which is fired by the casper-select when the user presses the 'tab' key. 
   * We have a special event for this, because the casper-select prevents the propagation of the keydown event.
   * @param {Event} event
   */
  _csTabWasPressedHandler (event) {
    const currentPage = this._getCurrentPage();
    if (!event?.detail?.element || !Object.hasOwn(event?.detail, 'pressed_shift_key') || !currentPage) return;

    if (currentPage.hasAttribute('disabled')) {
      event.stopPropagation();
      event.stopImmediatePropagation();
      return;
    }

    const currentField = event.detail.element;
    const pageChildrenArr = Array.from(currentPage.shadowRoot.children);
    if (!pageChildrenArr.includes(currentField)) return;

    const reachedExtreme = this._uiHelper.casperSelectTabHandler(event, pageChildrenArr);

    if (reachedExtreme) {
      this._reachedFieldAtTheExtreme(event.detail.pressed_shift_key ? 'first' : 'last');
    }
  }

  _reachedExtremeFocusableFieldHandler (event) {
    if (!event?.detail?.focusable_element || !event?.detail?.position) return;

    event.stopPropagation();
    event.stopImmediatePropagation();

    const direction = event.detail.position === 'first' ? 'previous' : 'next';
    const currentFieldEl = event.detail.focusable_element;
    const pageChildren = Array.from(this._getCurrentPage().shadowRoot.children);

    const focusableSiblingEl = this._uiHelper.findFocusableSiblingField(pageChildren, currentFieldEl, direction);

    if (focusableSiblingEl) {
      this._uiHelper.focusField(focusableSiblingEl);
    } else {
      this._reachedFieldAtTheExtreme(event.detail.position);
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
    if (!this.noCancelOnEscKey) this.close();
  }

  _selectedClsLabelChanged (event) {
    if (!event?.detail?.item?.id) return;
    
    this.activatePage(+event.detail.item.id);
  }

  _labelClickHandler (event) {
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

  _gotoPreviousPage () {
    const currentPageEl = this._getCurrentPage();

    if (this.mode === 'wizard') {
      if (typeof currentPageEl.previous === 'function') {
        currentPageEl.previous();
      } else if (typeof this['previousOn' + currentPageEl.id] === 'function') {
        this['previousOn' + currentPageEl.id].apply(this);
      } else {
        this.activatePreviousPage(); 
      }

    } else if (this.mode === 'dialog') {
      if (this._disabledLabelsIndexes.has(this._activeIndex - 1)) {
        const previousPageIndex = this._pages.findLastIndex((page, index) => {
          return (index < this._activeIndex - 1) && !this._disabledLabelsIndexes.has(index);
        });

        if (previousPageIndex !== -1) this.activatePage(previousPageIndex);
      } else {
        this.activatePreviousPage();
      }
    }
  }

  _gotoNextPage () {
    const currentPageEl = this._getCurrentPage();

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
        this.activateNextPage();
      }

    } else if (this.mode === 'dialog') {
      if (this._disabledLabelsIndexes.has(this._activeIndex + 1)) {
        const nextPageIndex = this._pages.findIndex((page, index) => {
          return (index > this._activeIndex + 1) && !this._disabledLabelsIndexes.has(index);
        });

        if (nextPageIndex !== -1) this.activatePage(nextPageIndex);
      } else {
        this.activateNextPage();
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
          if (this.mode === 'wizard') {
            const nextIcon = (this._activeIndex === this._pages.length - 1 && !this._getCurrentPage().hasAttribute('next')) 
              ? 'fa-light:check' 
              : 'fa-light:arrow-right';

            this.changeNextButtonToIcon(nextIcon);
          }

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

            if (!this._runJobInBackground) {
              if (notification.custom === true) {
                this.showCustomNotification(notification);
              } else {
                this.showStatusPage(notification, 'success');
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

        this._jobPromise.reject(notification);

        if (typeof this['errorOn' + this._getCurrentPage().id] === 'function') {
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
    let errors = [];
    for (const [operation, types] of Object.entries(saveData)) {
      for (const [relationshipName, data] of Object.entries(types)) {
        for (const entry of (data?.payloads|| [])) {
          if (!entry || !entry?.urn || entry.delayField) continue;
          const sUrn = entry.urn.split('/');
          if (entry.relationship) sUrn[0] = entry.relationship;
          if (operation !== 'delete') {
            if (Object.keys(entry.payload.data.attributes).length) {
              let response;
              try {
                response = await window.app.broker[operation](entry.urn, entry.payload, 10000);
              } catch (error) {
                console.error(error);
                if (this.rootResource() === sUrn[0]) {
                  throw error;
                  return;
                }
                errors.push(error);
              }
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
                  const relElement = this.data.relationships[response.type].elements.find(e => e.id == response.id);
                  if (relElement) {
                    response.data.relationships = relElement.relationships;
                    const itemIndex = this.data.relationships[response.type].elements.indexOf(relElement);
                    this.data.relationships[response.type].elements[itemIndex] = response.data;
                  } else {
                    this.data.relationships[response.type].data.push({type: response.type, id: response.id});
                    this.data.relationships[response.type].elements.push(response.data);
                  }
                } else if (this.data.relationships[response.type]) {
                  this.data.relationships[response.type].elements = [response.data];
                }
              } else if (response?.data && this.data?.relationships && operation === 'post' && this.rootResource() !== sUrn[0]) {
                // Creating new elements in relationships
                this.data.relationships[relationshipName].data.push({type: response.type, id: response.id});
                if (this.data.relationships[relationshipName].elements) {
                  this.data.relationships[relationshipName].elements.push(response.data);
                } else {
                  this.data.relationships[relationshipName].elements = [response.data];
                }
              } else if (!this.data && operation === 'post' && this.rootResource() === sUrn[0]) {
                // Creating new root element
                this.data = {id: response.id};
              }
            }
          } else {
            await window.app.broker.delete(entry.urn, 30000);
            const itemIndex = this.data.relationships[relationshipName].data.indexOf(this.data.relationships[relationshipName].data.find(e => e.id == sUrn[1]));
            if (itemIndex >= 0) {
              this.data.relationships[relationshipName].data?.splice(itemIndex, 1);
              this.data.relationships[relationshipName].elements?.splice(itemIndex, 1);
            }
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
              let response
              try {
                response = await window.app.broker[operation](entry.urn, entry.payload, 10000);
              } catch (error) {
                errors.push(error);
                console.error(error);
              }
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
    return errors;
  }
}

customElements.define('casper-edit-dialog', CasperEditDialog);