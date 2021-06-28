(function() {
  module.exports = {
    config: {
      fontFamily: {
        description: 'Use one of the fonts available in this package. View the README for descriptions of each.',
        type: 'string',
        "default": 'System Default',
        "enum": ['Cantarell', 'Clear Sans', 'Fira Sans', 'Open Sans', 'Oxygen', 'Roboto', 'Source Sans Pro', 'Ubuntu', 'System Default']
      },
      fontWeight: {
        description: 'Not all fonts come in all weights: Canterell and Oxygen only have regular, Ubuntu and Open Sans don\'t have thin.',
        type: 'string',
        "default": 'Regular',
        "enum": ['Extra light / Thin', 'Light', 'Regular']
      },
      customBackgroundColor: {
        description: 'Choose a custom background color.',
        type: 'boolean',
        "default": false
      },
      customBackgroundColorPicker: {
        description: 'Choose your background color.',
        type: 'color',
        "default": 'white'
      },
      backgroundGradient: {
        description: 'Apply a subtle gradient to the background.',
        type: 'boolean',
        "default": false
      },
      backgroundImage: {
        description: 'Use an image as a background.',
        type: 'boolean',
        "default": false
      },
      backgroundImagePath: {
        description: 'The path to an image from your computer or the internets (e.g. hubblesite.org or unsplash.com).',
        type: 'string',
        "default": 'atom://isotope-ui/resources/images/raket.jpg'
      },
      lowContrastTooltip: {
        description: 'Make tooltips low contrast and not so colorful.',
        type: 'boolean',
        "default": false
      },
      matchEditorFont: {
        description: 'Match the font family you set for the editor.',
        type: 'boolean',
        "default": false
      },
      minimalMode: {
        description: 'Make the layout more minimal.',
        type: 'boolean',
        "default": false
      },
      tabSizing: {
        description: 'In Even mode all tabs will be the same size. Great for quickly closing many tabs. In Minimum mode the tabs will only take as little space as needed and also show longer file names.',
        type: 'string',
        "default": 'Even',
        "enum": ['Even', 'Minimum']
      }
    },
    activate: function(state) {
      return atom.themes.onDidChangeActiveThemes(function() {
        var Config;
        Config = require('./config');
        return Config.apply();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9pc290b3BlLXVpL2xpYi9pc290b3BlLXVpLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBRUU7SUFBQSxNQUFBLEVBQ0U7TUFBQSxVQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsMkZBQWI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsZ0JBSFQ7UUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQ0osV0FESSxFQUVKLFlBRkksRUFHSixXQUhJLEVBSUosV0FKSSxFQUtKLFFBTEksRUFNSixRQU5JLEVBT0osaUJBUEksRUFRSixRQVJJLEVBU0osZ0JBVEksQ0FKTjtPQURGO01BZ0JBLFVBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxtSEFBYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO1FBSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUNKLG9CQURJLEVBRUosT0FGSSxFQUdKLFNBSEksQ0FKTjtPQWpCRjtNQTBCQSxxQkFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLG1DQUFiO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7T0EzQkY7TUE4QkEsMkJBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSwrQkFBYjtRQUNBLElBQUEsRUFBTSxPQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUZUO09BL0JGO01Ba0NBLGtCQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsNENBQWI7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FGVDtPQW5DRjtNQXNDQSxlQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsK0JBQWI7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FGVDtPQXZDRjtNQTBDQSxtQkFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLGlHQUFiO1FBRUEsSUFBQSxFQUFNLFFBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLDhDQUhUO09BM0NGO01BK0NBLGtCQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsaURBQWI7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FGVDtPQWhERjtNQW1EQSxlQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsK0NBQWI7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FGVDtPQXBERjtNQXVEQSxXQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsK0JBQWI7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FGVDtPQXhERjtNQTJEQSxTQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsc0xBQWI7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFGVDtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixNQURJLEVBRUosU0FGSSxDQUhOO09BNURGO0tBREY7SUFzRUEsUUFBQSxFQUFVLFNBQUMsS0FBRDthQUVSLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQVosQ0FBb0MsU0FBQTtBQUNsQyxZQUFBO1FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO2VBQ1QsTUFBTSxDQUFDLEtBQVAsQ0FBQTtNQUZrQyxDQUFwQztJQUZRLENBdEVWOztBQUZGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuXG4gIGNvbmZpZzpcbiAgICBmb250RmFtaWx5OlxuICAgICAgZGVzY3JpcHRpb246ICdVc2Ugb25lIG9mIHRoZSBmb250cyBhdmFpbGFibGUgaW4gdGhpcyBwYWNrYWdlLlxuICAgICAgICBWaWV3IHRoZSBSRUFETUUgZm9yIGRlc2NyaXB0aW9ucyBvZiBlYWNoLidcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnU3lzdGVtIERlZmF1bHQnXG4gICAgICBlbnVtOiBbXG4gICAgICAgICdDYW50YXJlbGwnLFxuICAgICAgICAnQ2xlYXIgU2FucycsXG4gICAgICAgICdGaXJhIFNhbnMnLFxuICAgICAgICAnT3BlbiBTYW5zJyxcbiAgICAgICAgJ094eWdlbicsXG4gICAgICAgICdSb2JvdG8nLFxuICAgICAgICAnU291cmNlIFNhbnMgUHJvJyxcbiAgICAgICAgJ1VidW50dScsXG4gICAgICAgICdTeXN0ZW0gRGVmYXVsdCdcbiAgICAgIF1cbiAgICBmb250V2VpZ2h0OlxuICAgICAgZGVzY3JpcHRpb246ICdOb3QgYWxsIGZvbnRzIGNvbWUgaW4gYWxsIHdlaWdodHM6IENhbnRlcmVsbCBhbmQgT3h5Z2VuXG4gICAgICAgIG9ubHkgaGF2ZSByZWd1bGFyLCBVYnVudHUgYW5kIE9wZW4gU2FucyBkb25cXCd0IGhhdmUgdGhpbi4nXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ1JlZ3VsYXInXG4gICAgICBlbnVtOiBbXG4gICAgICAgICdFeHRyYSBsaWdodCAvIFRoaW4nLFxuICAgICAgICAnTGlnaHQnLFxuICAgICAgICAnUmVndWxhcidcbiAgICAgIF1cbiAgICBjdXN0b21CYWNrZ3JvdW5kQ29sb3I6XG4gICAgICBkZXNjcmlwdGlvbjogJ0Nob29zZSBhIGN1c3RvbSBiYWNrZ3JvdW5kIGNvbG9yLidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBjdXN0b21CYWNrZ3JvdW5kQ29sb3JQaWNrZXI6XG4gICAgICBkZXNjcmlwdGlvbjogJ0Nob29zZSB5b3VyIGJhY2tncm91bmQgY29sb3IuJ1xuICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgZGVmYXVsdDogJ3doaXRlJ1xuICAgIGJhY2tncm91bmRHcmFkaWVudDpcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXBwbHkgYSBzdWJ0bGUgZ3JhZGllbnQgdG8gdGhlIGJhY2tncm91bmQuJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGJhY2tncm91bmRJbWFnZTpcbiAgICAgIGRlc2NyaXB0aW9uOiAnVXNlIGFuIGltYWdlIGFzIGEgYmFja2dyb3VuZC4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgYmFja2dyb3VuZEltYWdlUGF0aDpcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHBhdGggdG8gYW4gaW1hZ2UgZnJvbSB5b3VyIGNvbXB1dGVyIG9yXG4gICAgICAgdGhlIGludGVybmV0cyAoZS5nLiBodWJibGVzaXRlLm9yZyBvciB1bnNwbGFzaC5jb20pLidcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnYXRvbTovL2lzb3RvcGUtdWkvcmVzb3VyY2VzL2ltYWdlcy9yYWtldC5qcGcnXG4gICAgbG93Q29udHJhc3RUb29sdGlwOlxuICAgICAgZGVzY3JpcHRpb246ICdNYWtlIHRvb2x0aXBzIGxvdyBjb250cmFzdCBhbmQgbm90IHNvIGNvbG9yZnVsLidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBtYXRjaEVkaXRvckZvbnQ6XG4gICAgICBkZXNjcmlwdGlvbjogJ01hdGNoIHRoZSBmb250IGZhbWlseSB5b3Ugc2V0IGZvciB0aGUgZWRpdG9yLidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBtaW5pbWFsTW9kZTpcbiAgICAgIGRlc2NyaXB0aW9uOiAnTWFrZSB0aGUgbGF5b3V0IG1vcmUgbWluaW1hbC4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgdGFiU2l6aW5nOlxuICAgICAgZGVzY3JpcHRpb246ICdJbiBFdmVuIG1vZGUgYWxsIHRhYnMgd2lsbCBiZSB0aGUgc2FtZSBzaXplLiBHcmVhdCBmb3IgcXVpY2tseSBjbG9zaW5nIG1hbnkgdGFicy4gSW4gTWluaW11bSBtb2RlIHRoZSB0YWJzIHdpbGwgb25seSB0YWtlIGFzIGxpdHRsZSBzcGFjZSBhcyBuZWVkZWQgYW5kIGFsc28gc2hvdyBsb25nZXIgZmlsZSBuYW1lcy4nXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ0V2ZW4nXG4gICAgICBlbnVtOiBbXG4gICAgICAgICdFdmVuJyxcbiAgICAgICAgJ01pbmltdW0nXG4gICAgICBdXG5cblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgICMgY29kZSBpbiBzZXBhcmF0ZSBmaWxlIHNvIGRlZmVycmFsIGtlZXBzIGFjdGl2YXRpb24gdGltZSBkb3duXG4gICAgYXRvbS50aGVtZXMub25EaWRDaGFuZ2VBY3RpdmVUaGVtZXMgLT5cbiAgICAgIENvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnJ1xuICAgICAgQ29uZmlnLmFwcGx5KClcbiJdfQ==
