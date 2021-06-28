/** @babel */
"use strict";

/**
 * @access private
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CanvasLayer = (function () {
  function CanvasLayer() {
    _classCallCheck(this, CanvasLayer);

    /**
     * The onscreen canvas.
     * @type {HTMLCanvasElement}
     */
    this.canvas = document.createElement("canvas");

    var desynchronized = false; // TODO Electron 9 has color issues #786

    /**
     * The onscreen canvas context.
     * @type {CanvasRenderingContext2D}
     */
    this.context = this.canvas.getContext("2d", { desynchronized: desynchronized });
    this.canvas.webkitImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;

    /**
     * The offscreen canvas.
     * @type {HTMLCanvasElement}
     * @access private
     */
    this.offscreenCanvas = document.createElement("canvas");
    /**
     * The offscreen canvas context.
     * @type {CanvasRenderingContext2D}
     * @access private
     */
    this.offscreenContext = this.offscreenCanvas.getContext("2d", { desynchronized: desynchronized });
    this.offscreenCanvas.webkitImageSmoothingEnabled = false;
    this.offscreenContext.imageSmoothingEnabled = false;
  }

  _createClass(CanvasLayer, [{
    key: "attach",
    value: function attach(parent) {
      if (this.canvas.parentNode) {
        return;
      }

      parent.appendChild(this.canvas);
    }
  }, {
    key: "setSize",
    value: function setSize() {
      var width = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var height = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      this.canvas.width = width;
      this.canvas.height = height;
      this.context.imageSmoothingEnabled = false;
      this.resetOffscreenSize();
    }
  }, {
    key: "getSize",
    value: function getSize() {
      return {
        width: this.canvas.width,
        height: this.canvas.height
      };
    }
  }, {
    key: "resetOffscreenSize",
    value: function resetOffscreenSize() {
      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
      this.offscreenContext.imageSmoothingEnabled = false;
    }
  }, {
    key: "copyToOffscreen",
    value: function copyToOffscreen() {
      if (this.canvas.width > 0 && this.canvas.height > 0) {
        this.offscreenContext.drawImage(this.canvas, 0, 0);
      }
    }
  }, {
    key: "copyFromOffscreen",
    value: function copyFromOffscreen() {
      if (this.offscreenCanvas.width > 0 && this.offscreenCanvas.height > 0) {
        this.context.drawImage(this.offscreenCanvas, 0, 0);
      }
    }
  }, {
    key: "copyPartFromOffscreen",
    value: function copyPartFromOffscreen(srcY, destY, height) {
      if (this.offscreenCanvas.width > 0 && this.offscreenCanvas.height > 0) {
        this.context.drawImage(this.offscreenCanvas, 0, srcY, this.offscreenCanvas.width, height, 0, destY, this.offscreenCanvas.width, height);
      }
    }
  }, {
    key: "clearCanvas",
    value: function clearCanvas() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }]);

  return CanvasLayer;
})();

exports["default"] = CanvasLayer;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FyY2gvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvY2FudmFzLWxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUE7Ozs7Ozs7Ozs7Ozs7SUFLUyxXQUFXO0FBQ25CLFdBRFEsV0FBVyxHQUNoQjswQkFESyxXQUFXOzs7Ozs7QUFNNUIsUUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUU5QyxRQUFNLGNBQWMsR0FBRyxLQUFLLENBQUE7Ozs7OztBQU01QixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLGNBQWMsRUFBZCxjQUFjLEVBQUUsQ0FBQyxDQUFBO0FBQy9ELFFBQUksQ0FBQyxNQUFNLENBQUMsMkJBQTJCLEdBQUcsS0FBSyxDQUFBO0FBQy9DLFFBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFBOzs7Ozs7O0FBTzFDLFFBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQTs7Ozs7O0FBTXZELFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxjQUFjLEVBQWQsY0FBYyxFQUFFLENBQUMsQ0FBQTtBQUNqRixRQUFJLENBQUMsZUFBZSxDQUFDLDJCQUEyQixHQUFHLEtBQUssQ0FBQTtBQUN4RCxRQUFJLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFBO0dBQ3BEOztlQWhDa0IsV0FBVzs7V0FrQ3hCLGdCQUFDLE1BQU0sRUFBRTtBQUNiLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7QUFDMUIsZUFBTTtPQUNQOztBQUVELFlBQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0tBQ2hDOzs7V0FFTSxtQkFBd0I7VUFBdkIsS0FBSyx5REFBRyxDQUFDO1VBQUUsTUFBTSx5REFBRyxDQUFDOztBQUMzQixVQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDekIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQzNCLFVBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFBO0FBQzFDLFVBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO0tBQzFCOzs7V0FFTSxtQkFBRztBQUNSLGFBQU87QUFDTCxhQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO0FBQ3hCLGNBQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07T0FDM0IsQ0FBQTtLQUNGOzs7V0FFaUIsOEJBQUc7QUFDbkIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUE7QUFDOUMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUE7QUFDaEQsVUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQTtLQUNwRDs7O1dBRWMsMkJBQUc7QUFDaEIsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ25ELFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7T0FDbkQ7S0FDRjs7O1dBRWdCLDZCQUFHO0FBQ2xCLFVBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUNyRSxZQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtPQUNuRDtLQUNGOzs7V0FFb0IsK0JBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDekMsVUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3JFLFlBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUNwQixJQUFJLENBQUMsZUFBZSxFQUNwQixDQUFDLEVBQ0QsSUFBSSxFQUNKLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUMxQixNQUFNLEVBQ04sQ0FBQyxFQUNELEtBQUssRUFDTCxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFDMUIsTUFBTSxDQUNQLENBQUE7T0FDRjtLQUNGOzs7V0FFVSx1QkFBRztBQUNaLFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUNwRTs7O1NBNUZrQixXQUFXOzs7cUJBQVgsV0FBVyIsImZpbGUiOiIvaG9tZS9hcmNoLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL2NhbnZhcy1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cblwidXNlIHN0cmljdFwiXG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhbnZhc0xheWVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqXG4gICAgICogVGhlIG9uc2NyZWVuIGNhbnZhcy5cbiAgICAgKiBAdHlwZSB7SFRNTENhbnZhc0VsZW1lbnR9XG4gICAgICovXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpXG5cbiAgICBjb25zdCBkZXN5bmNocm9uaXplZCA9IGZhbHNlIC8vIFRPRE8gRWxlY3Ryb24gOSBoYXMgY29sb3IgaXNzdWVzICM3ODZcblxuICAgIC8qKlxuICAgICAqIFRoZSBvbnNjcmVlbiBjYW52YXMgY29udGV4dC5cbiAgICAgKiBAdHlwZSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfVxuICAgICAqL1xuICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiLCB7IGRlc3luY2hyb25pemVkIH0pXG4gICAgdGhpcy5jYW52YXMud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2VcbiAgICB0aGlzLmNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2VcblxuICAgIC8qKlxuICAgICAqIFRoZSBvZmZzY3JlZW4gY2FudmFzLlxuICAgICAqIEB0eXBlIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNjcmVlbkNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIilcbiAgICAvKipcbiAgICAgKiBUaGUgb2Zmc2NyZWVuIGNhbnZhcyBjb250ZXh0LlxuICAgICAqIEB0eXBlIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vZmZzY3JlZW5Db250ZXh0ID0gdGhpcy5vZmZzY3JlZW5DYW52YXMuZ2V0Q29udGV4dChcIjJkXCIsIHsgZGVzeW5jaHJvbml6ZWQgfSlcbiAgICB0aGlzLm9mZnNjcmVlbkNhbnZhcy53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZVxuICAgIHRoaXMub2Zmc2NyZWVuQ29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZVxuICB9XG5cbiAgYXR0YWNoKHBhcmVudCkge1xuICAgIGlmICh0aGlzLmNhbnZhcy5wYXJlbnROb2RlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpXG4gIH1cblxuICBzZXRTaXplKHdpZHRoID0gMCwgaGVpZ2h0ID0gMCkge1xuICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGhcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHRcbiAgICB0aGlzLmNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2VcbiAgICB0aGlzLnJlc2V0T2Zmc2NyZWVuU2l6ZSgpXG4gIH1cblxuICBnZXRTaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogdGhpcy5jYW52YXMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuY2FudmFzLmhlaWdodCxcbiAgICB9XG4gIH1cblxuICByZXNldE9mZnNjcmVlblNpemUoKSB7XG4gICAgdGhpcy5vZmZzY3JlZW5DYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aFxuICAgIHRoaXMub2Zmc2NyZWVuQ2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodFxuICAgIHRoaXMub2Zmc2NyZWVuQ29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZVxuICB9XG5cbiAgY29weVRvT2Zmc2NyZWVuKCkge1xuICAgIGlmICh0aGlzLmNhbnZhcy53aWR0aCA+IDAgJiYgdGhpcy5jYW52YXMuaGVpZ2h0ID4gMCkge1xuICAgICAgdGhpcy5vZmZzY3JlZW5Db250ZXh0LmRyYXdJbWFnZSh0aGlzLmNhbnZhcywgMCwgMClcbiAgICB9XG4gIH1cblxuICBjb3B5RnJvbU9mZnNjcmVlbigpIHtcbiAgICBpZiAodGhpcy5vZmZzY3JlZW5DYW52YXMud2lkdGggPiAwICYmIHRoaXMub2Zmc2NyZWVuQ2FudmFzLmhlaWdodCA+IDApIHtcbiAgICAgIHRoaXMuY29udGV4dC5kcmF3SW1hZ2UodGhpcy5vZmZzY3JlZW5DYW52YXMsIDAsIDApXG4gICAgfVxuICB9XG5cbiAgY29weVBhcnRGcm9tT2Zmc2NyZWVuKHNyY1ksIGRlc3RZLCBoZWlnaHQpIHtcbiAgICBpZiAodGhpcy5vZmZzY3JlZW5DYW52YXMud2lkdGggPiAwICYmIHRoaXMub2Zmc2NyZWVuQ2FudmFzLmhlaWdodCA+IDApIHtcbiAgICAgIHRoaXMuY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgICAgIHRoaXMub2Zmc2NyZWVuQ2FudmFzLFxuICAgICAgICAwLFxuICAgICAgICBzcmNZLFxuICAgICAgICB0aGlzLm9mZnNjcmVlbkNhbnZhcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0LFxuICAgICAgICAwLFxuICAgICAgICBkZXN0WSxcbiAgICAgICAgdGhpcy5vZmZzY3JlZW5DYW52YXMud2lkdGgsXG4gICAgICAgIGhlaWdodFxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGNsZWFyQ2FudmFzKCkge1xuICAgIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodClcbiAgfVxufVxuIl19