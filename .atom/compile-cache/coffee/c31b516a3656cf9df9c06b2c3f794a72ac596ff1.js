(function() {
  var root, setFormFocusEffect, setTabSizing, unsetFormFocusEffect, unsetTabSizing;

  root = document.documentElement;

  module.exports = {
    activate: function(state) {
      atom.config.observe('nord-atom-ui.tabSizing', function(noFullWidth) {
        return setTabSizing(noFullWidth);
      });
      return atom.config.observe('nord-atom-ui.darkerFormFocusEffect', function(noSnowLight) {
        return setFormFocusEffect(noSnowLight);
      });
    },
    deactivate: function() {
      unsetTabSizing();
      return unsetFormFocusEffect();
    }
  };

  setFormFocusEffect = function(noSnowLight) {
    if (noSnowLight) {
      return root.setAttribute('theme-nord-atom-ui-form-focus-effect', "nosnowlight");
    } else {
      return unsetFormFocusEffect();
    }
  };

  setTabSizing = function(noFullWidth) {
    if (noFullWidth) {
      return unsetTabSizing();
    } else {
      return root.setAttribute('theme-nord-atom-ui-tabsizing', "nofullwidth");
    }
  };

  unsetFormFocusEffect = function() {
    return root.removeAttribute('theme-nord-atom-ui-form-focus-effect');
  };

  unsetTabSizing = function() {
    return root.removeAttribute('theme-nord-atom-ui-tabsizing');
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9ub3JkLWF0b20tdWkvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDOztFQUVoQixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix3QkFBcEIsRUFBOEMsU0FBQyxXQUFEO2VBQzVDLFlBQUEsQ0FBYSxXQUFiO01BRDRDLENBQTlDO2FBRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLG9DQUFwQixFQUEwRCxTQUFDLFdBQUQ7ZUFDeEQsa0JBQUEsQ0FBbUIsV0FBbkI7TUFEd0QsQ0FBMUQ7SUFIUSxDQUFWO0lBTUEsVUFBQSxFQUFZLFNBQUE7TUFDVixjQUFBLENBQUE7YUFDQSxvQkFBQSxDQUFBO0lBRlUsQ0FOWjs7O0VBVUYsa0JBQUEsR0FBcUIsU0FBQyxXQUFEO0lBQ25CLElBQUksV0FBSjthQUNFLElBQUksQ0FBQyxZQUFMLENBQWtCLHNDQUFsQixFQUEwRCxhQUExRCxFQURGO0tBQUEsTUFBQTthQUdFLG9CQUFBLENBQUEsRUFIRjs7RUFEbUI7O0VBTXJCLFlBQUEsR0FBZSxTQUFDLFdBQUQ7SUFDYixJQUFJLFdBQUo7YUFDRSxjQUFBLENBQUEsRUFERjtLQUFBLE1BQUE7YUFHRSxJQUFJLENBQUMsWUFBTCxDQUFrQiw4QkFBbEIsRUFBa0QsYUFBbEQsRUFIRjs7RUFEYTs7RUFNZixvQkFBQSxHQUF1QixTQUFBO1dBQ3JCLElBQUksQ0FBQyxlQUFMLENBQXFCLHNDQUFyQjtFQURxQjs7RUFHdkIsY0FBQSxHQUFpQixTQUFBO1dBQ2YsSUFBSSxDQUFDLGVBQUwsQ0FBcUIsOEJBQXJCO0VBRGU7QUE1QmpCIiwic291cmNlc0NvbnRlbnQiOlsiIyBDb3B5cmlnaHQgKEMpIDIwMTYtcHJlc2VudCBBcmN0aWMgSWNlIFN0dWRpbyA8ZGV2ZWxvcG1lbnRAYXJjdGljaWNlc3R1ZGlvLmNvbT5cbiMgQ29weXJpZ2h0IChDKSAyMDE2LXByZXNlbnQgU3ZlbiBHcmViIDxkZXZlbG9wbWVudEBzdmVuZ3JlYi5kZT5cblxuIyBQcm9qZWN0OiAgICBOb3JkIEF0b20gVUlcbiMgUmVwb3NpdG9yeTogaHR0cHM6Ly9naXRodWIuY29tL2FyY3RpY2ljZXN0dWRpby9ub3JkLWF0b20tdWlcbiMgTGljZW5zZTogICAgTUlUXG5cbnJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICdub3JkLWF0b20tdWkudGFiU2l6aW5nJywgKG5vRnVsbFdpZHRoKSAtPlxuICAgICAgc2V0VGFiU2l6aW5nKG5vRnVsbFdpZHRoKVxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ25vcmQtYXRvbS11aS5kYXJrZXJGb3JtRm9jdXNFZmZlY3QnLCAobm9Tbm93TGlnaHQpIC0+XG4gICAgICBzZXRGb3JtRm9jdXNFZmZlY3Qobm9Tbm93TGlnaHQpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICB1bnNldFRhYlNpemluZygpXG4gICAgdW5zZXRGb3JtRm9jdXNFZmZlY3QoKVxuXG5zZXRGb3JtRm9jdXNFZmZlY3QgPSAobm9Tbm93TGlnaHQpIC0+XG4gIGlmIChub1Nub3dMaWdodClcbiAgICByb290LnNldEF0dHJpYnV0ZSgndGhlbWUtbm9yZC1hdG9tLXVpLWZvcm0tZm9jdXMtZWZmZWN0JywgXCJub3Nub3dsaWdodFwiKVxuICBlbHNlXG4gICAgdW5zZXRGb3JtRm9jdXNFZmZlY3QoKVxuXG5zZXRUYWJTaXppbmcgPSAobm9GdWxsV2lkdGgpIC0+XG4gIGlmIChub0Z1bGxXaWR0aClcbiAgICB1bnNldFRhYlNpemluZygpXG4gIGVsc2VcbiAgICByb290LnNldEF0dHJpYnV0ZSgndGhlbWUtbm9yZC1hdG9tLXVpLXRhYnNpemluZycsIFwibm9mdWxsd2lkdGhcIilcblxudW5zZXRGb3JtRm9jdXNFZmZlY3QgPSAtPlxuICByb290LnJlbW92ZUF0dHJpYnV0ZSgndGhlbWUtbm9yZC1hdG9tLXVpLWZvcm0tZm9jdXMtZWZmZWN0JylcblxudW5zZXRUYWJTaXppbmcgPSAtPlxuICByb290LnJlbW92ZUF0dHJpYnV0ZSgndGhlbWUtbm9yZC1hdG9tLXVpLXRhYnNpemluZycpXG4iXX0=
