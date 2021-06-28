(function() {
  module.exports = {
    apply: function() {
      var applyBackgroundColor, applyBackgroundGradient, applyBackgroundImage, applyEditorFont, applyFont, applyFontWeight, applyMinimalMode, applyTabSizing, applyTooltipContrast, body;
      body = document.querySelector('body');
      applyFont = function(font) {
        return body.setAttribute('data-isotope-ui-font', font);
      };
      applyFontWeight = function(weight) {
        return body.setAttribute('data-isotope-ui-fontweight', weight);
      };
      applyBackgroundColor = function() {
        if (atom.config.get('isotope-ui.customBackgroundColor')) {
          atom.config.set('isotope-ui.backgroundImage', 'false');
          atom.config.set('isotope-ui.backgroundGradient', 'false');
          body.setAttribute('data-isotope-ui-bg-color', 'true');
          return body.style.backgroundColor = atom.config.get('isotope-ui.customBackgroundColorPicker').toHexString();
        } else {
          body.setAttribute('data-isotope-ui-bg-color', 'false');
          return body.style.backgroundColor = '';
        }
      };
      applyBackgroundGradient = function() {
        if (atom.config.get('isotope-ui.backgroundGradient')) {
          atom.config.set('isotope-ui.backgroundImage', 'false');
          atom.config.set('isotope-ui.customBackgroundColor', 'false');
          return body.setAttribute('data-isotope-ui-bg-gradient', 'true');
        } else {
          return body.setAttribute('data-isotope-ui-bg-gradient', 'false');
        }
      };
      applyBackgroundImage = function() {
        if (atom.config.get('isotope-ui.backgroundImage')) {
          atom.config.set('isotope-ui.customBackgroundColor', 'false');
          atom.config.set('isotope-ui.customBackgroundColor', 'false');
          atom.config.set('isotope-ui.backgroundGradient', 'false');
          body.setAttribute('data-isotope-ui-bg-image', 'true');
          return body.style.backgroundImage = 'url(' + atom.config.get('isotope-ui.backgroundImagePath') + ')';
        } else {
          body.setAttribute('data-isotope-ui-bg-image', 'false');
          return body.style.backgroundImage = '';
        }
      };
      applyTooltipContrast = function() {
        if (atom.config.get('isotope-ui.lowContrastTooltip')) {
          return body.setAttribute('data-isotope-ui-tooltip-lowcontrast', 'true');
        } else {
          return body.setAttribute('data-isotope-ui-tooltip-lowcontrast', 'false');
        }
      };
      applyEditorFont = function() {
        if (atom.config.get('isotope-ui.matchEditorFont')) {
          if (atom.config.get('editor.fontFamily') === '') {
            return body.style.fontFamily = 'Inconsolata, Monaco, Consolas, "Courier New", Courier';
          } else {
            return body.style.fontFamily = atom.config.get('editor.fontFamily');
          }
        } else {
          return body.style.fontFamily = '';
        }
      };
      applyMinimalMode = function() {
        if (atom.config.get('isotope-ui.minimalMode')) {
          return body.setAttribute('data-isotope-ui-minimal', 'true');
        } else {
          return body.setAttribute('data-isotope-ui-minimal', 'false');
        }
      };
      applyTabSizing = function() {
        return body.setAttribute('data-isotope-ui-tabsizing', atom.config.get('isotope-ui.tabSizing').toLowerCase());
      };
      applyFont(atom.config.get('isotope-ui.fontFamily'));
      applyFontWeight(atom.config.get('isotope-ui.fontWeight'));
      applyBackgroundGradient();
      applyBackgroundImage();
      applyBackgroundColor();
      applyTooltipContrast();
      applyEditorFont();
      applyMinimalMode();
      applyTabSizing();
      atom.config.onDidChange('isotope-ui.fontFamily', function() {
        return applyFont(atom.config.get('isotope-ui.fontFamily'));
      });
      atom.config.onDidChange('isotope-ui.fontWeight', function() {
        return applyFontWeight(atom.config.get('isotope-ui.fontWeight'));
      });
      atom.config.onDidChange('isotope-ui.customBackgroundColor', function() {
        return applyBackgroundColor();
      });
      atom.config.onDidChange('isotope-ui.customBackgroundColorPicker', function() {
        return applyBackgroundColor();
      });
      atom.config.onDidChange('isotope-ui.backgroundGradient', function() {
        return applyBackgroundGradient();
      });
      atom.config.onDidChange('isotope-ui.backgroundImage', function() {
        return applyBackgroundImage();
      });
      atom.config.onDidChange('isotope-ui.backgroundImagePath', function() {
        return applyBackgroundImage();
      });
      atom.config.onDidChange('isotope-ui.lowContrastTooltip', function() {
        return applyTooltipContrast();
      });
      atom.config.onDidChange('isotope-ui.matchEditorFont', function() {
        return applyEditorFont();
      });
      atom.config.onDidChange('isotope-ui.minimalMode', function() {
        return applyMinimalMode();
      });
      atom.config.onDidChange('editor.fontFamily', function() {
        return applyEditorFont();
      });
      return atom.config.onDidChange('isotope-ui.tabSizing', function() {
        return applyTabSizing();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9pc290b3BlLXVpL2xpYi9jb25maWcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FFRTtJQUFBLEtBQUEsRUFBTyxTQUFBO0FBRUwsVUFBQTtNQUFBLElBQUEsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUtQLFNBQUEsR0FBWSxTQUFDLElBQUQ7ZUFDVixJQUFJLENBQUMsWUFBTCxDQUFrQixzQkFBbEIsRUFBMEMsSUFBMUM7TUFEVTtNQUdaLGVBQUEsR0FBa0IsU0FBQyxNQUFEO2VBQ2hCLElBQUksQ0FBQyxZQUFMLENBQWtCLDRCQUFsQixFQUFnRCxNQUFoRDtNQURnQjtNQUdsQixvQkFBQSxHQUF1QixTQUFBO1FBQ3JCLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQixDQUFIO1VBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxPQUE5QztVQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwrQkFBaEIsRUFBaUQsT0FBakQ7VUFDQSxJQUFJLENBQUMsWUFBTCxDQUFrQiwwQkFBbEIsRUFBOEMsTUFBOUM7aUJBQ0EsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFYLEdBQTZCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsQ0FBeUQsQ0FBQyxXQUExRCxDQUFBLEVBSi9CO1NBQUEsTUFBQTtVQU1FLElBQUksQ0FBQyxZQUFMLENBQWtCLDBCQUFsQixFQUE4QyxPQUE5QztpQkFDQSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQVgsR0FBNkIsR0FQL0I7O01BRHFCO01BVXZCLHVCQUFBLEdBQTBCLFNBQUE7UUFDeEIsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsK0JBQWhCLENB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U0FBQTtlQUNoRCxnQkFBQSxDQUFBO01BRGdELENBQWxEO01BR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLG1CQUF4QixFQUE2QyxTQUFBO2VBQzNDLGVBQUEsQ0FBQTtNQUQyQyxDQUE3QzthQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixzQkFBeEIsRUFBZ0QsU0FBQTtlQUM5QyxjQUFBLENBQUE7TUFEOEMsQ0FBaEQ7SUFwSEssQ0FBUDs7QUFGRiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cblxuICBhcHBseTogKCkgLT5cblxuICAgIGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JylcblxuXG4gICAgIyBmdW5jdGlvbnNcblxuICAgIGFwcGx5Rm9udCA9IChmb250KSAtPlxuICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaXNvdG9wZS11aS1mb250JywgZm9udClcblxuICAgIGFwcGx5Rm9udFdlaWdodCA9ICh3ZWlnaHQpIC0+XG4gICAgICBib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1pc290b3BlLXVpLWZvbnR3ZWlnaHQnLCB3ZWlnaHQpXG5cbiAgICBhcHBseUJhY2tncm91bmRDb2xvciA9ICgpIC0+XG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2lzb3RvcGUtdWkuY3VzdG9tQmFja2dyb3VuZENvbG9yJylcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdpc290b3BlLXVpLmJhY2tncm91bmRJbWFnZScsICdmYWxzZScpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnaXNvdG9wZS11aS5iYWNrZ3JvdW5kR3JhZGllbnQnLCAnZmFsc2UnKVxuICAgICAgICBib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1pc290b3BlLXVpLWJnLWNvbG9yJywgJ3RydWUnKVxuICAgICAgICBib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGF0b20uY29uZmlnLmdldCgnaXNvdG9wZS11aS5jdXN0b21CYWNrZ3JvdW5kQ29sb3JQaWNrZXInKS50b0hleFN0cmluZygpXG4gICAgICBlbHNlXG4gICAgICAgIGJvZHkuc2V0QXR0cmlidXRlKCdkYXRhLWlzb3RvcGUtdWktYmctY29sb3InLCAnZmFsc2UnKVxuICAgICAgICBib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcnXG5cbiAgICBhcHBseUJhY2tncm91bmRHcmFkaWVudCA9ICgpIC0+XG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2lzb3RvcGUtdWkuYmFja2dyb3VuZEdyYWRpZW50JylcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdpc290b3BlLXVpLmJhY2tncm91bmRJbWFnZScsICdmYWxzZScpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnaXNvdG9wZS11aS5jdXN0b21CYWNrZ3JvdW5kQ29sb3InLCAnZmFsc2UnKVxuICAgICAgICBib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1pc290b3BlLXVpLWJnLWdyYWRpZW50JywgJ3RydWUnKVxuICAgICAgZWxzZVxuICAgICAgICBib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1pc290b3BlLXVpLWJnLWdyYWRpZW50JywgJ2ZhbHNlJylcblxuICAgIGFwcGx5QmFja2dyb3VuZEltYWdlID0gKCkgLT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnaXNvdG9wZS11aS5iYWNrZ3JvdW5kSW1hZ2UnKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2lzb3RvcGUtdWkuY3VzdG9tQmFja2dyb3VuZENvbG9yJywgJ2ZhbHNlJylcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdpc290b3BlLXVpLmN1c3RvbUJhY2tncm91bmRDb2xvcicsICdmYWxzZScpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnaXNvdG9wZS11aS5iYWNrZ3JvdW5kR3JhZGllbnQnLCAnZmFsc2UnKVxuICAgICAgICBib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1pc290b3BlLXVpLWJnLWltYWdlJywgJ3RydWUnKVxuICAgICAgICBib2R5LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9XG4gICAgICAgICAgJ3VybCgnICsgYXRvbS5jb25maWcuZ2V0KCdpc290b3BlLXVpLmJhY2tncm91bmRJbWFnZVBhdGgnKSArICcpJ1xuICAgICAgZWxzZVxuICAgICAgICBib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1pc290b3BlLXVpLWJnLWltYWdlJywgJ2ZhbHNlJylcbiAgICAgICAgYm9keS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAnJ1xuXG4gICAgYXBwbHlUb29sdGlwQ29udHJhc3QgPSAoKSAtPlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdpc290b3BlLXVpLmxvd0NvbnRyYXN0VG9vbHRpcCcpXG4gICAgICAgIGJvZHkuc2V0QXR0cmlidXRlKCdkYXRhLWlzb3RvcGUtdWktdG9vbHRpcC1sb3djb250cmFzdCcsICd0cnVlJylcbiAgICAgIGVsc2VcbiAgICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaXNvdG9wZS11aS10b29sdGlwLWxvd2NvbnRyYXN0JywgJ2ZhbHNlJylcblxuICAgIGFwcGx5RWRpdG9yRm9udCA9ICgpIC0+XG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2lzb3RvcGUtdWkubWF0Y2hFZGl0b3JGb250JylcbiAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IuZm9udEZhbWlseScpIGlzICcnXG4gICAgICAgICAgYm9keS5zdHlsZS5mb250RmFtaWx5ID0gJ0luY29uc29sYXRhLCBNb25hY28sIENvbnNvbGFzLCBcIkNvdXJpZXIgTmV3XCIsIENvdXJpZXInXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBib2R5LnN0eWxlLmZvbnRGYW1pbHkgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250RmFtaWx5JylcbiAgICAgIGVsc2VcbiAgICAgICAgYm9keS5zdHlsZS5mb250RmFtaWx5ID0gJydcblxuICAgIGFwcGx5TWluaW1hbE1vZGUgPSAoKSAtPlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdpc290b3BlLXVpLm1pbmltYWxNb2RlJylcbiAgICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaXNvdG9wZS11aS1taW5pbWFsJywgJ3RydWUnKVxuICAgICAgZWxzZVxuICAgICAgICBib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1pc290b3BlLXVpLW1pbmltYWwnLCAnZmFsc2UnKVxuXG4gICAgYXBwbHlUYWJTaXppbmcgPSAoKSAtPlxuICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaXNvdG9wZS11aS10YWJzaXppbmcnLCBhdG9tLmNvbmZpZy5nZXQoJ2lzb3RvcGUtdWkudGFiU2l6aW5nJykudG9Mb3dlckNhc2UoKSlcblxuXG4gICAgIyBydW4gd2hlbiBhdG9tIGlzIHJlYWR5XG5cbiAgICBhcHBseUZvbnQoYXRvbS5jb25maWcuZ2V0KCdpc290b3BlLXVpLmZvbnRGYW1pbHknKSlcbiAgICBhcHBseUZvbnRXZWlnaHQoYXRvbS5jb25maWcuZ2V0KCdpc290b3BlLXVpLmZvbnRXZWlnaHQnKSlcbiAgICBhcHBseUJhY2tncm91bmRHcmFkaWVudCgpXG4gICAgYXBwbHlCYWNrZ3JvdW5kSW1hZ2UoKVxuICAgIGFwcGx5QmFja2dyb3VuZENvbG9yKClcbiAgICBhcHBseVRvb2x0aXBDb250cmFzdCgpXG4gICAgYXBwbHlFZGl0b3JGb250KClcbiAgICBhcHBseU1pbmltYWxNb2RlKClcbiAgICBhcHBseVRhYlNpemluZygpXG5cblxuICAgICMgcnVuIHdoZW4gY29uZmlncyBjaGFuZ2VcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdpc290b3BlLXVpLmZvbnRGYW1pbHknLCAtPlxuICAgICAgYXBwbHlGb250KGF0b20uY29uZmlnLmdldCgnaXNvdG9wZS11aS5mb250RmFtaWx5JykpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnaXNvdG9wZS11aS5mb250V2VpZ2h0JywgLT5cbiAgICAgIGFwcGx5Rm9udFdlaWdodChhdG9tLmNvbmZpZy5nZXQoJ2lzb3RvcGUtdWkuZm9udFdlaWdodCcpKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2lzb3RvcGUtdWkuY3VzdG9tQmFja2dyb3VuZENvbG9yJywgLT5cbiAgICAgIGFwcGx5QmFja2dyb3VuZENvbG9yKClcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdpc290b3BlLXVpLmN1c3RvbUJhY2tncm91bmRDb2xvclBpY2tlcicsIC0+XG4gICAgICBhcHBseUJhY2tncm91bmRDb2xvcigpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnaXNvdG9wZS11aS5iYWNrZ3JvdW5kR3JhZGllbnQnLCAtPlxuICAgICAgYXBwbHlCYWNrZ3JvdW5kR3JhZGllbnQoKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2lzb3RvcGUtdWkuYmFja2dyb3VuZEltYWdlJywgLT5cbiAgICAgIGFwcGx5QmFja2dyb3VuZEltYWdlKClcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdpc290b3BlLXVpLmJhY2tncm91bmRJbWFnZVBhdGgnLCAtPlxuICAgICAgYXBwbHlCYWNrZ3JvdW5kSW1hZ2UoKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2lzb3RvcGUtdWkubG93Q29udHJhc3RUb29sdGlwJywgLT5cbiAgICAgIGFwcGx5VG9vbHRpcENvbnRyYXN0KClcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdpc290b3BlLXVpLm1hdGNoRWRpdG9yRm9udCcsIC0+XG4gICAgICBhcHBseUVkaXRvckZvbnQoKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2lzb3RvcGUtdWkubWluaW1hbE1vZGUnLCAtPlxuICAgICAgYXBwbHlNaW5pbWFsTW9kZSgpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnZWRpdG9yLmZvbnRGYW1pbHknLCAtPlxuICAgICAgYXBwbHlFZGl0b3JGb250KClcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdpc290b3BlLXVpLnRhYlNpemluZycsIC0+XG4gICAgICBhcHBseVRhYlNpemluZygpXG4iXX0=
