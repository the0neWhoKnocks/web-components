// Shared ======================================================================

const WRAPPER_EL = document.getElementById('wrapper');

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
