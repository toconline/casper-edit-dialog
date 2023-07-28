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

    if (elNodeName === 'casper-select' || elNodeName === 'casper-select-lit') {
      element.searchInput.focus({preventScroll: true});
    } else {
      element.focus({preventScroll: true});
    }
  }
}