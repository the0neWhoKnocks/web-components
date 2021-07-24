// Shared ======================================================================

const WRAPPER_EL = document.getElementById('wrapper');

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
dialog.onClose = () => { alert('Dialog closed'); };
dialog.title = 'Dialog Title';

const openDialogBtn = document.createElement('button');
openDialogBtn.innerHTML = 'Open Dialog';
openDialogBtn.addEventListener('click', () => {
  dialog.show();
});
dialog.shadowRoot.querySelector('.dialog-content button').addEventListener('click', () => {
  dialog.close();
});
WRAPPER_EL.querySelector('#dialogExample').appendChild(openDialogBtn);

// CustomFlyout ================================================================

const FLYOUT_WRAPPER = WRAPPER_EL.querySelector('#flyoutExample');
const markerFlyout = document.createElement('custom-flyout');

markerFlyout.styles = `
  .content {
    min-width: 80vw;
    min-height: 80vh;
    padding: 1em;
  }
`;
markerFlyout.content = `
  <div class="content">
    Flyout content goes here.
  </div>
`;
markerFlyout.onClose = () => {
  alert('Flyout closed');
};
markerFlyout.title = 'Flyout Title';

Object.keys(markerFlyout).forEach((prop) => {
  if (prop.startsWith('DIRECTION__')) {
    const btn = document.createElement('button');
    const dir = markerFlyout[prop];
    btn.dataset.openFrom = dir;
    btn.innerHTML = `Open From <b>${dir}</b>`;
    
    FLYOUT_WRAPPER.appendChild(btn);
  }
});

FLYOUT_WRAPPER.addEventListener('click', (ev) => {
  const el = ev.target;
  const { openFrom } = el.dataset;
  
  if (openFrom) {
    markerFlyout.openFrom = openFrom;
    markerFlyout.show();
  }
});
