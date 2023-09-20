export class CasperUiHelper {
  constructor() {
    this.nestedComponents = ['casper-tabbed-items', 'casper-address'];
    this.focusableFields = ['paper-input', 'paper-checkbox', 'casper-select-lit', 'casper-select', 'casper-date-picker'];
  }

  findFocusableField (array, position = 'first') {
    let field;

    if (position === 'first') {
      field = array.find(element => {
        return (this.focusableFields.includes(element.nodeName?.toLowerCase()) || this.nestedComponents.includes(element.nodeName?.toLowerCase())) 
            && (!element.hasAttribute('disabled') 
            && !element.hasAttribute('readonly') 
            && !element.hasAttribute('hidden')
            && !element.hasAttribute('no-autofocus'))
        ;
      });

    } else if (position === 'last') {
      field = array.findLast(element => {
        return (this.focusableFields.includes(element.nodeName?.toLowerCase()) || this.nestedComponents.includes(element.nodeName?.toLowerCase())) 
            && (!element.hasAttribute('disabled') 
            && !element.hasAttribute('readonly') 
            && !element.hasAttribute('hidden')
            && !element.hasAttribute('no-autofocus'))
        ;
      });
    }

    return field;
  }

  findFocusableSiblingField (siblingsArray, currentFieldEl, direction = 'next') {
    const currentFieldIndex = siblingsArray.indexOf(currentFieldEl);
    if (currentFieldIndex === -1) return;

    let focusableSiblingEl;

    if (direction === 'previous') {
      focusableSiblingEl = siblingsArray.findLast((element, index) => {
        return (index < currentFieldIndex) 
            && (this.focusableFields.includes(element.nodeName?.toLowerCase()) || this.nestedComponents.includes(element.nodeName.toLowerCase())) 
            && (!element.hasAttribute('disabled') 
            && !element.hasAttribute('readonly') 
            && !element.hasAttribute('hidden')
            && !element.hasAttribute('no-autofocus'))
        ;
      });

    } else if (direction === 'next') {
      focusableSiblingEl = siblingsArray.find((element, index) => {
        return (index > currentFieldIndex) 
            && (this.focusableFields.includes(element.nodeName?.toLowerCase()) || this.nestedComponents.includes(element.nodeName.toLowerCase())) 
            && (!element.hasAttribute('disabled') 
            && !element.hasAttribute('readonly') 
            && !element.hasAttribute('hidden')
            && !element.hasAttribute('no-autofocus'))
        ;
      });
    }

    return focusableSiblingEl;
  }

  focusField (element) {
    const elNodeName = element?.nodeName?.toLowerCase();
    if (!this.focusableFields.includes(elNodeName)) return;

    if (elNodeName === 'casper-select-lit' || elNodeName === 'casper-select') {
      element.searchInput.focus({preventScroll: false});
    } else if (elNodeName === 'casper-date-picker') {
      element.__datePickerInput.focus({preventScroll: false});
    } else {
      element.focus({preventScroll: false});
    }
  }

  fieldTabHandler (event, siblingsArray) {
    if (!event) return;

    const currentField = event.composedPath().findLast((element) => this.focusableFields.includes(element.nodeName?.toLowerCase()));
    if (!currentField) return;

    // These prevent the browser from ruining transitions
    event.preventDefault();
    event.stopPropagation();
    // This prevents errors from clearing
    event.stopImmediatePropagation();

    if (!siblingsArray) siblingsArray = currentField.parentNode.children;
    if (currentField.nodeName?.toLowerCase() === 'casper-select-lit') currentField.hidePopover();

    const direction = event.shiftKey ? 'previous' : 'next';
    const position = event.shiftKey ? 'last' : 'first';
    let reachedExtreme = false;

    if (currentField[direction + 'ElementSibling']) {
      const focusableSiblingEl = this.findFocusableSiblingField(siblingsArray, currentField, direction);

      if (focusableSiblingEl) {
        const focusableSiblingNodeName = focusableSiblingEl.nodeName.toLowerCase();

        if (this.nestedComponents.includes(focusableSiblingNodeName)) {
          focusableSiblingEl.focusFirstOrLastEditableField(position);
        } else {
          this.focusField(focusableSiblingEl);
        }

      } else {
        reachedExtreme = true;
      }
    } else {
      reachedExtreme = true;
    }

    return reachedExtreme;
  }

  casperSelectTabHandler (event, siblingsArray) {
    if (!event?.detail?.element || !Object.hasOwn(event?.detail, 'pressed_shift_key')) return;

    event.stopPropagation();
    event.stopImmediatePropagation();

    const element = event.detail.element;
    const direction = event.detail.pressed_shift_key ? 'previous' : 'next';
    const position = event.detail.pressed_shift_key ? 'last' : 'first';
    let reachedExtreme = false;

    element.closeDropdown();


    if (element[`${direction}ElementSibling`]) {
      const focusableSiblingEl = this.findFocusableSiblingField(siblingsArray, element, direction);

      if (focusableSiblingEl) {
        if (focusableSiblingEl === element[`${direction}ElementSibling`]) return;
      
        const focusableSiblingNodeName = focusableSiblingEl.nodeName.toLowerCase();

        if (this.nestedComponents.includes(focusableSiblingNodeName)) {
          focusableSiblingEl.focusFirstOrLastEditableField(position);
        } else {
          this.focusField(focusableSiblingEl);
        }
      } else {
        reachedExtreme = true;
      }
  
    } else {
      reachedExtreme = true;
    }

    return reachedExtreme;
  }

  /** Validates fields which have the "required" attribute and shows an error message when appropriate.
   * @param {Element} ancestor The parent or ancestor element closest to the fields which will be validated. Works with a shadowRoot node as well.
   */
  validateRequiredFields (ancestor) {
    let isValid = true;
    const requiredFields = ancestor.querySelectorAll('[required]');

    for (const element of requiredFields) {
      this.addErrorMessageClearListener(element);

      const nodeName = element.nodeName.toLowerCase();
      const message = 'Campo obrigatório.';

      switch (nodeName) {
        case 'casper-select-lit':
          if (element.value === undefined) {
            element.searchInput.invalid = true;
            element.error = message;
            isValid = false;
          }
          break;

        case 'casper-select':
          if (!element.value) {
            if (element.multiSelection) {
              const paperInputContainer = element.shadowRoot.querySelector('paper-input-container');
              if (paperInputContainer) paperInputContainer.invalid = true;
            } else {
              element.searchInput.invalid = true;
              element.searchInput.errorMessage = message;
            }
            
            isValid = false;
          }
          break;

        case 'casper-date-picker':
          if (!element.value) {
            element.invalid = true;
            element.requiredErrorMessage = message;
            element.__errorMessage = message;
            isValid = false;
          }
          break;

        case 'paper-checkbox':
          if (!element.checked) {
            element.invalid = true;
            isValid = false;
          }
          break;
      
        case 'paper-input':
          if ((!element.value && element.value !== 0) || element.value?.toString()?.trim() === '') {
            element.invalid = true;
            element.errorMessage = message;
            isValid = false;
          }
          break;

        default:
          break;
      }
    }

    return isValid;
  }

  /** Event listener which is fired when the user interacts with an invalid field. 
   * This will clear the error message.
   * @param {Event} event
   */
  clearFieldErrorMessage (element) {
    if (!element) return;
    const nodeName = element.nodeName.toLowerCase();

    switch (nodeName) {
      case 'casper-select-lit':
        if (element.searchInput?.invalid) {
          element.searchInput.invalid = false;
          element.error = ''; 
        }
        break;

      case 'casper-select':
        if (element.multiSelection) {
          const paperInputContainer = element.shadowRoot.querySelector('paper-input-container');
          if (paperInputContainer?.invalid) paperInputContainer.invalid = false;
        } else {
          if (element.searchInput?.invalid) {
            element.searchInput.invalid = false;
            element.searchInput.errorMessage = '';
          }
        }
        break;

      case 'casper-date-picker':
        if (element.invalid) {
          element.invalid = false;
          element.__errorMessage = '';
        }
        break;

      case 'paper-checkbox':
        if (element.invalid) {
          element.invalid = false;
        }
        break;

      case 'paper-input':
        if (element.invalid) {
          element.invalid = false;
          element.errorMessage = ''; 
        }
        break;

      default:
        break;
    }
  }

  /** Adds the necessary event listeners to clear a field's error message. 
   * @param {Element} element The element to which the listeners will be added to.
   */
  addErrorMessageClearListener (element) {
    if (!element) return;

    if (!element.hasAttribute('has-clear-listener')) {
      let eventType = 'value-changed';
      const nodeName = element.nodeName.toLowerCase();

      if (nodeName === 'paper-checkbox' || nodeName === 'paper-radio-button') eventType = 'checked-changed';

      element.addEventListener(eventType, (event) => this.clearFieldErrorMessage(event?.currentTarget));
      element.setAttribute('has-clear-listener', '');
    }
  }
}