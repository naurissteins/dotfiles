'use babel';

export default class StatusTile {
  constructor(statusBar) {
    this._statusBar = statusBar;
    this._mousePos = { x: -1, y: -1 };
    this._atomWorkspaceEl = document.getElementsByTagName('atom-workspace')[0];
    this._contextMenuOpen = false;

    this._onMousemove = ({ clientX, clientY, target }) => {
      this._mousePos.x = clientX;
      this._mousePos.y = clientY;

      if (!this.enabled || this._contextMenuOpen) return;

      if (!this._atomWorkspaceEl.contains(target)) return;

      this._update(target);

      const { left, top } = target.getBoundingClientRect();
      let x = parseInt(left);
      let y = parseInt(top);

      // this.__testEl.style.top = `${top}px`;
      // this.__testEl.style.left = `${left}px`;
      // this.__testEl.style.width = `${target.offsetWidth}px`;
      // this.__testEl.style.height = `${target.offsetHeight}px`;
    };

    this._onContextMenu = () => {
      this._contextMenuOpen = true;
    };

    this._onClick = () => {
      if (!this._contextMenuOpen) return;

      this._contextMenuOpen = false;
      this._update();
    };

    document.addEventListener('mousemove', this._onMousemove);
    document.addEventListener('contextmenu', this._onContextMenu);
    document.addEventListener('click', this._onClick);

    // this.__testEl = document.createElement('div');
    // this.__testEl.style.position = 'fixed';
    // this.__testEl.style.width = '4px';
    // this.__testEl.style.height = '4px';
    // this.__testEl.style.background = 'red';
    // this.__testEl.style.top = '500px';
    // this.__testEl.style.left = '500px';
    // this.__testEl.style.zIndex = '999999999';
    // this.__testEl.style.pointerEvents = 'none';

    // document.body.appendChild(this.__testEl);
  }

  get enabled() {
    return !!this._tile;
  }

  _update(el) {
    if (!this._tile) return;

    el = el || document.elementFromPoint(this._mousePos.x, this._mousePos.y);

    this._tagEl.innerText = el ? el.tagName.toLowerCase() : '';
    this._classListEl.innerText =
      el && el.classList.length
        ? '.' + el.classList.toString().replace(/ /g, '.')
        : '';
  }

  enable() {
    if (this._tile) return;

    this.rootEl = document.createElement('div');
    this.rootEl.classList.add('inline-block', 'inspect-element-status-tile');

    const tagIconEl = document.createElement('span');
    tagIconEl.classList.add('icon', 'icon-tag');
    this.rootEl.appendChild(tagIconEl);

    this._tagEl = document.createElement('span');
    this._tagEl.classList.add('target-element-tag');
    this.rootEl.appendChild(this._tagEl);

    this._classListEl = document.createElement('span');
    this._classListEl.classList.add('target-element-class-list');
    this.rootEl.appendChild(this._classListEl);

    this._tile = this._statusBar.addLeftTile({
      item: this.rootEl,
      priority: 2000
    });

    this._update();
  }

  disable() {
    if (!this.enabled) return;

    this._tile.destroy();

    this.rootEl = null;
    this._tagEl = null;
    this._classListEl = null;
    this._tile = null;
  }

  destroy() {
    if (this.enabled) {
      this.disable();
    }

    document.removeEventListener('mousemove', this._onMousemove);
    document.removeEventListener('contextmenu', this._onContextMenu);
    document.removeEventListener('click', this._onClick);
  }
}
