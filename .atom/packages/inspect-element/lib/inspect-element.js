'use babel';

import { CompositeDisposable } from 'atom';
import { remote } from 'electron';

import StatusTile from './status-tile';

const config = {
  showTargetElementInStatusBar: {
    description:
      'Show the tag name and class list of the element the mouse is currently positioned over in the status bar.',
    type: 'boolean',
    default: 'true'
  }
};

var subscriptions = null;
// Reference to the current app window to be set
// upon activation.
var win = null;
// Current Target element status tile handler.
var statusTileHandler = null;

function inspect(el) {
  if (!win || !el) return;

  // Get the target element's position on in the window
  // using its rect.
  const { left, top } = el.getBoundingClientRect();
  const x = parseInt(left);
  const y = parseInt(top);

  // Atom does not have a public API for triggering
  // element inspection, so electron's native
  // inspect-element functionality must be used instead.
  win.inspectElement(x, y);

  // If the app window's DevTools pane is already open,
  // focus it instead.
  if (win.isDevToolsOpened()) {
    win.devToolsWebContents.focus();
  }
}

function activate(state) {
  // This functionality already exists in Dev Mode, so
  // do not continue if Dev Mode is active.
  if (atom.inDevMode()) return;

  win = remote.getCurrentWindow();

  subscriptions = new CompositeDisposable();

  subscriptions.add(
    // Command
    atom.commands.add(
      'atom-workspace',
      'inspect-element:inspect',
      ({ target }) => inspect(target)
    ),
    // Context menu item
    atom.contextMenu.add({
      'atom-workspace': [
        { label: 'Inspect Element', command: 'inspect-element:inspect' }
      ]
    }),
    atom.config.observe(
      'inspect-element.showTargetElementInStatusBar',
      show => {
        if (!statusTileHandler) return;
        else if (show) statusTileHandler.enable();
        else statusTileHandler.disable();
      }
    )
  );
}

function deactivate() {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }

  win = null;

  statusTileHandler.destroy();
}

function consumeStatusBar(statusBar) {
  statusTileHandler = new StatusTile(statusBar);

  const showTargetElementInStatusBar = atom.config.get(
    'inspect-element.showTargetElementInStatusBar'
  );

  if (showTargetElementInStatusBar) {
    statusTileHandler.enable();
  }
}

export default {
  config,
  activate,
  deactivate,
  consumeStatusBar
};
