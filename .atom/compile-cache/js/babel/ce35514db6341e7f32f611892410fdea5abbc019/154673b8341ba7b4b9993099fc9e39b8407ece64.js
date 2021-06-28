'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var StatusTile = (function () {
  function StatusTile(statusBar) {
    var _this = this;

    _classCallCheck(this, StatusTile);

    this._statusBar = statusBar;
    this._mousePos = { x: -1, y: -1 };
    this._atomWorkspaceEl = document.getElementsByTagName('atom-workspace')[0];
    this._contextMenuOpen = false;

    this._onMousemove = function (_ref) {
      var clientX = _ref.clientX;
      var clientY = _ref.clientY;
      var target = _ref.target;

      _this._mousePos.x = clientX;
      _this._mousePos.y = clientY;

      if (!_this.enabled || _this._contextMenuOpen) return;

      if (!_this._atomWorkspaceEl.contains(target)) return;

      _this._update(target);

      var _target$getBoundingClientRect = target.getBoundingClientRect();

      var left = _target$getBoundingClientRect.left;
      var top = _target$getBoundingClientRect.top;

      var x = parseInt(left);
      var y = parseInt(top);

      // this.__testEl.style.top = `${top}px`;
      // this.__testEl.style.left = `${left}px`;
      // this.__testEl.style.width = `${target.offsetWidth}px`;
      // this.__testEl.style.height = `${target.offsetHeight}px`;
    };

    this._onContextMenu = function () {
      _this._contextMenuOpen = true;
    };

    this._onClick = function () {
      if (!_this._contextMenuOpen) return;

      _this._contextMenuOpen = false;
      _this._update();
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

  _createClass(StatusTile, [{
    key: '_update',
    value: function _update(el) {
      if (!this._tile) return;

      el = el || document.elementFromPoint(this._mousePos.x, this._mousePos.y);

      this._tagEl.innerText = el ? el.tagName.toLowerCase() : '';
      this._classListEl.innerText = el && el.classList.length ? '.' + el.classList.toString().replace(/ /g, '.') : '';
    }
  }, {
    key: 'enable',
    value: function enable() {
      if (this._tile) return;

      this.rootEl = document.createElement('div');
      this.rootEl.classList.add('inline-block', 'inspect-element-status-tile');

      var tagIconEl = document.createElement('span');
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
  }, {
    key: 'disable',
    value: function disable() {
      if (!this.enabled) return;

      this._tile.destroy();

      this.rootEl = null;
      this._tagEl = null;
      this._classListEl = null;
      this._tile = null;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.enabled) {
        this.disable();
      }

      document.removeEventListener('mousemove', this._onMousemove);
      document.removeEventListener('contextmenu', this._onContextMenu);
      document.removeEventListener('click', this._onClick);
    }
  }, {
    key: 'enabled',
    get: function get() {
      return !!this._tile;
    }
  }]);

  return StatusTile;
})();

exports['default'] = StatusTile;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FyY2gvLmF0b20vcGFja2FnZXMvaW5zcGVjdC1lbGVtZW50L2xpYi9zdGF0dXMtdGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7SUFFUyxVQUFVO0FBQ2xCLFdBRFEsVUFBVSxDQUNqQixTQUFTLEVBQUU7OzswQkFESixVQUFVOztBQUUzQixRQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUM1QixRQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2xDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRSxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDOztBQUU5QixRQUFJLENBQUMsWUFBWSxHQUFHLFVBQUMsSUFBNEIsRUFBSztVQUEvQixPQUFPLEdBQVQsSUFBNEIsQ0FBMUIsT0FBTztVQUFFLE9BQU8sR0FBbEIsSUFBNEIsQ0FBakIsT0FBTztVQUFFLE1BQU0sR0FBMUIsSUFBNEIsQ0FBUixNQUFNOztBQUM3QyxZQUFLLFNBQVMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQzNCLFlBQUssU0FBUyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7O0FBRTNCLFVBQUksQ0FBQyxNQUFLLE9BQU8sSUFBSSxNQUFLLGdCQUFnQixFQUFFLE9BQU87O0FBRW5ELFVBQUksQ0FBQyxNQUFLLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPOztBQUVwRCxZQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7MENBRUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFOztVQUE1QyxJQUFJLGlDQUFKLElBQUk7VUFBRSxHQUFHLGlDQUFILEdBQUc7O0FBQ2pCLFVBQUksQ0FB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RSxJQUFJO09BQ2YsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNoQjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPOztBQUUxQixVQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVyQixVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixVQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztBQUN6QixVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztLQUNuQjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsWUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ2hCOztBQUVELGNBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdELGNBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ2pFLGNBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3REOzs7U0E3RFUsZUFBRztBQUNaLGFBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDckI7OztTQXpEa0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9pbnNwZWN0LWVsZW1lbnQvbGliL3N0YXR1cy10aWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXR1c1RpbGUge1xuICBjb25zdHJ1Y3RvcihzdGF0dXNCYXIpIHtcbiAgICB0aGlzLl9zdGF0dXNCYXIgPSBzdGF0dXNCYXI7XG4gICAgdGhpcy5fbW91c2VQb3MgPSB7IHg6IC0xLCB5OiAtMSB9O1xuICAgIHRoaXMuX2F0b21Xb3Jrc3BhY2VFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhdG9tLXdvcmtzcGFjZScpWzBdO1xuICAgIHRoaXMuX2NvbnRleHRNZW51T3BlbiA9IGZhbHNlO1xuXG4gICAgdGhpcy5fb25Nb3VzZW1vdmUgPSAoeyBjbGllbnRYLCBjbGllbnRZLCB0YXJnZXQgfSkgPT4ge1xuICAgICAgdGhpcy5fbW91c2VQb3MueCA9IGNsaWVudFg7XG4gICAgICB0aGlzLl9tb3VzZVBvcy55ID0gY2xpZW50WTtcblxuICAgICAgaWYgKCF0aGlzLmVuYWJsZWQgfHwgdGhpcy5fY29udGV4dE1lbnVPcGVuKSByZXR1cm47XG5cbiAgICAgIGlmICghdGhpcy5fYXRvbVdvcmtzcGFjZUVsLmNvbnRhaW5zKHRhcmdldCkpIHJldHVybjtcblxuICAgICAgdGhpcy5fdXBkYXRlKHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHsgbGVmdCwgdG9wIH0gPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBsZXQgeCA9IHBhcnNlSW50KGxlZnQpO1xuICAgICAgbGV0IHkgPSBwYXJzZUludCh0b3ApO1xuXG4gICAgICAvLyB0aGlzLl9fdGVzdEVsLnN0eWxlLnRvcCA9IGAke3RvcH1weGA7XG4gICAgICAvLyB0aGlzLl9fdGVzdEVsLnN0eWxlLmxlZnQgPSBgJHtsZWZ0fXB4YDtcbiAgICAgIC8vIHRoaXMuX190ZXN0RWwuc3R5bGUud2lkdGggPSBgJHt0YXJnZXQub2Zmc2V0V2lkdGh9cHhgO1xuICAgICAgLy8gdGhpcy5fX3Rlc3RFbC5zdHlsZS5oZWlnaHQgPSBgJHt0YXJnZXQub2Zmc2V0SGVpZ2h0fXB4YDtcbiAgICB9O1xuXG4gICAgdGhpcy5fb25Db250ZXh0TWVudSA9ICgpID0+IHtcbiAgICAgIHRoaXMuX2NvbnRleHRNZW51T3BlbiA9IHRydWU7XG4gICAgfTtcblxuICAgIHRoaXMuX29uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2NvbnRleHRNZW51T3BlbikgcmV0dXJuO1xuXG4gICAgICB0aGlzLl9jb250ZXh0TWVudU9wZW4gPSBmYWxzZTtcbiAgICAgIHRoaXMuX3VwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlbW92ZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCB0aGlzLl9vbkNvbnRleHRNZW51KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spO1xuXG4gICAgLy8gdGhpcy5fX3Rlc3RFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIC8vIHRoaXMuX190ZXN0RWwuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgIC8vIHRoaXMuX190ZXN0RWwuc3R5bGUud2lkdGggPSAnNHB4JztcbiAgICAvLyB0aGlzLl9fdGVzdEVsLnN0eWxlLmhlaWdodCA9ICc0cHgnO1xuICAgIC8vIHRoaXMuX190ZXN0RWwuc3R5bGUuYmFja2dyb3VuZCA9ICdyZWQnO1xuICAgIC8vIHRoaXMuX190ZXN0RWwuc3R5bGUudG9wID0gJzUwMHB4JztcbiAgICAvLyB0aGlzLl9fdGVzdEVsLnN0eWxlLmxlZnQgPSAnNTAwcHgnO1xuICAgIC8vIHRoaXMuX190ZXN0RWwuc3R5bGUuekluZGV4ID0gJzk5OTk5OTk5OSc7XG4gICAgLy8gdGhpcy5fX3Rlc3RFbC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuXG4gICAgLy8gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLl9fdGVzdEVsKTtcbiAgfVxuXG4gIGdldCBlbmFibGVkKCkge1xuICAgIHJldHVybiAhIXRoaXMuX3RpbGU7XG4gIH1cblxuICBfdXBkYXRlKGVsKSB7XG4gICAgaWYgKCF0aGlzLl90aWxlKSByZXR1cm47XG5cbiAgICBlbCA9IGVsIHx8IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQodGhpcy5fbW91c2VQb3MueCwgdGhpcy5fbW91c2VQb3MueSk7XG5cbiAgICB0aGlzLl90YWdFbC5pbm5lclRleHQgPSBlbCA/IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA6ICcnO1xuICAgIHRoaXMuX2NsYXNzTGlzdEVsLmlubmVyVGV4dCA9XG4gICAgICBlbCAmJiBlbC5jbGFzc0xpc3QubGVuZ3RoXG4gICAgICAgID8gJy4nICsgZWwuY2xhc3NMaXN0LnRvU3RyaW5nKCkucmVwbGFjZSgvIC9nLCAnLicpXG4gICAgICAgIDogJyc7XG4gIH1cblxuICBlbmFibGUoKSB7XG4gICAgaWYgKHRoaXMuX3RpbGUpIHJldHVybjtcblxuICAgIHRoaXMucm9vdEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5yb290RWwuY2xhc3NMaXN0LmFkZCgnaW5saW5lLWJsb2NrJywgJ2luc3BlY3QtZWxlbWVudC1zdGF0dXMtdGlsZScpO1xuXG4gICAgY29uc3QgdGFnSWNvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHRhZ0ljb25FbC5jbGFzc0xpc3QuYWRkKCdpY29uJywgJ2ljb24tdGFnJyk7XG4gICAgdGhpcy5yb290RWwuYXBwZW5kQ2hpbGQodGFnSWNvbkVsKTtcblxuICAgIHRoaXMuX3RhZ0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHRoaXMuX3RhZ0VsLmNsYXNzTGlzdC5hZGQoJ3RhcmdldC1lbGVtZW50LXRhZycpO1xuICAgIHRoaXMucm9vdEVsLmFwcGVuZENoaWxkKHRoaXMuX3RhZ0VsKTtcblxuICAgIHRoaXMuX2NsYXNzTGlzdEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHRoaXMuX2NsYXNzTGlzdEVsLmNsYXNzTGlzdC5hZGQoJ3RhcmdldC1lbGVtZW50LWNsYXNzLWxpc3QnKTtcbiAgICB0aGlzLnJvb3RFbC5hcHBlbmRDaGlsZCh0aGlzLl9jbGFzc0xpc3RFbCk7XG5cbiAgICB0aGlzLl90aWxlID0gdGhpcy5fc3RhdHVzQmFyLmFkZExlZnRUaWxlKHtcbiAgICAgIGl0ZW06IHRoaXMucm9vdEVsLFxuICAgICAgcHJpb3JpdHk6IDIwMDBcbiAgICB9KTtcblxuICAgIHRoaXMuX3VwZGF0ZSgpO1xuICB9XG5cbiAgZGlzYWJsZSgpIHtcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgdGhpcy5fdGlsZS5kZXN0cm95KCk7XG5cbiAgICB0aGlzLnJvb3RFbCA9IG51bGw7XG4gICAgdGhpcy5fdGFnRWwgPSBudWxsO1xuICAgIHRoaXMuX2NsYXNzTGlzdEVsID0gbnVsbDtcbiAgICB0aGlzLl90aWxlID0gbnVsbDtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuZW5hYmxlZCkge1xuICAgICAgdGhpcy5kaXNhYmxlKCk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZW1vdmUpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgdGhpcy5fb25Db250ZXh0TWVudSk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKTtcbiAgfVxufVxuIl19