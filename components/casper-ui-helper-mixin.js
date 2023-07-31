export const CasperUiHelperMixin = (superClass) => class extends superClass {
  constructor() {
    super();

    this.nestedComponents = ['casper-tabbed-items', 'casper-address'];
    this.focusableFields = ['paper-input', 'paper-checkbox', 'casper-select-lit', 'casper-select', 'casper-date-picker'];
  }

  findFocusableField (array) {
    const field = array.find(element => {
      return (this.focusableFields.includes(element.nodeName?.toLowerCase()) || this.nestedComponents.includes(element.nodeName?.toLowerCase())) 
          && (!element.hasAttribute('disabled') 
          && !element.hasAttribute('readonly') 
          && !element.hasAttribute('hidden')
      );
    });

    return field;
  }

  findFocusableSiblingField (siblingsArray, currentFieldEl) {
    const currentFieldIndex = siblingsArray.indexOf(currentFieldEl);
    if (currentFieldIndex === -1) return;

    const focusableSiblingEl = siblingsArray.find((element, index) => {
      return (index > currentFieldIndex) 
          && (this.focusableFields.includes(element.nodeName?.toLowerCase()) || this.nestedComponents.includes(element.nodeName.toLowerCase())) 
          && (!element.hasAttribute('disabled') 
          && !element.hasAttribute('readonly') 
          && !element.hasAttribute('hidden'));
    });

    return focusableSiblingEl;
  }

  focusField (element) {
    const elNodeName = element?.nodeName?.toLowerCase();
    if (!this.focusableFields.includes(elNodeName)) return;

    if (elNodeName === 'casper-select-lit') {
      element.searchInput.focus({preventScroll: true});
    } else if (elNodeName === 'casper-select') {
      if (element.hasAttribute('multi-selection')) {
        const paperInputContainer = element.shadowRoot.querySelector('paper-input-container');
        if (paperInputContainer) paperInputContainer.focus({preventScroll: true});
      } else {
        element.searchInput.focus({preventScroll: true});
      }
      
    } else if (elNodeName === 'casper-date-picker') {
      element.__datePickerInput.focus({preventScroll: true});
    } else {
      element.focus({preventScroll: true});
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
    let reachedLast = false;

    if (currentField.nodeName?.toLowerCase() === 'casper-select-lit') {
      currentField.hidePopover();
    }
    
    if (currentField.nextElementSibling) {
      const focusableSiblingEl = this.findFocusableSiblingField(siblingsArray, currentField);

      if (focusableSiblingEl) {
        const focusableSiblingNodeName = focusableSiblingEl.nodeName.toLowerCase();

        if (this.nestedComponents.includes(focusableSiblingNodeName)) {
          focusableSiblingEl.focusFirstEditableField();
        } else {
          this.focusField(focusableSiblingEl);
        }
      } else {
        reachedLast = true;
      }
    } else {
      reachedLast = true;
    }

    return reachedLast;
  }
}