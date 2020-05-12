// Shared ======================================================================

const WRAPPER_EL = document.getElementById('wrapper');

// CustomAutoCompleteInput =====================================================

const filterInput = document.createElement('custom-auto-complete-input');
filterInput.placeholder = 'Filter Animals';
filterInput.onSelect = ({ elements: filters, value }) => {
  const matches = filters.map(({ dataset: { rawValue } }) => rawValue);
  alert(`Matches for "${value}":\n${JSON.stringify(matches, null, 2)}`);
};
filterInput.styles = `
  .custom-autocomplete__list-item button {
    margin: 0;
    display: flex;
    align-items: center;
  }
  .custom-autocomplete__list-item button * {
    pointer-events: none;
  }
  .custom-autocomplete .icon {
    width: 1em;
    height: 1em;
    border-radius: 100%;
    margin-right: 0.5em;
    background: pink;
    display: inline-block;
  }
`;
filterInput.items = [
  "Alligator Snapping Turtle",
  "Baja California Pronghorn Buck",
  "California Condor",
  "Desert Bighorn Ram",
  "Eastern Turkey Vulture",
  "Fer-de-Lance Snake",
  "Golden Crowned Sparrow",
  "Hereford Bull",
  "Java Chicken",
  "Labrador Retriever",
  "Mallard Duck",
  "Neotropic Cormorant",
  "Old Spot Pig",
  "Pacific Loon",
  "Rainbow Boa Snake",
  "Sandhill Crane",
  "Timber Rattlesnake",
  "Virginia Opossum",
  "Whooping Crane",
  "Wild Boar",
  "Yellow-billed Loon",
].map((txt) => ({
  attributes: {
    'data-raw-value': txt,
  },
  label: `<span class="icon"></span>${txt}`,
  value: txt.toLowerCase().replace(/\s/g, '-'),
}));

document.body.appendChild(filterInput);

// CustomDialog ================================================================

const dialog = document.createElement('custom-dialog');
dialog.styles = `
  .dialog-content {
    padding: 1em;
  }
`;
dialog.content = `
  <div class="dialog-content">
    Click button to close Dialog.
    <button>Close Dialog</button>
  </div>
`;
dialog.onClose = () => { alert('Dialog is closing'); };
dialog.title = 'Dialog Title';

const openDialogBtn = document.createElement('button');
openDialogBtn.innerHTML = 'Open Dialog';
openDialogBtn.addEventListener('click', () => {
  dialog.show();
});
dialog.shadowRoot.querySelector('.dialog-content button').addEventListener('click', () => {
  dialog.close();
});
WRAPPER_EL.appendChild(openDialogBtn);

// CustomFlyout ================================================================

const markerFlyout = document.createElement('custom-flyout');
markerFlyout.styles = `
  .content {
    width: 30vw;
    padding: 1em;
  }
`;
markerFlyout.content = `
  <div class="content">
    Hello
  </div>
`;
markerFlyout.onClose = () => {
  alert('closing flyout');
};
markerFlyout.title = 'Marker Creator';

const openFlyoutBtn = document.createElement('button');
openFlyoutBtn.innerHTML = 'Open Flyout';
openFlyoutBtn.addEventListener('click', () => {
  markerFlyout.show();
});
WRAPPER_EL.appendChild(openFlyoutBtn);
