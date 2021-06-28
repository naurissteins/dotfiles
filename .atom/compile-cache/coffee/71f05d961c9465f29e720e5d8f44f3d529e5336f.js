(function() {
  module.exports = [
    {
      begin: /^((\\)begin)({)(code|spec)(})(\s*$)?/,
      beginCaptures: {
        1: {
          name: 'support.function.be.latex'
        },
        2: {
          name: 'punctuation.definition.function.latex'
        },
        3: {
          name: 'punctuation.definition.arguments.begin.latex'
        },
        5: {
          name: 'punctuation.definition.arguments.end.latex'
        }
      },
      end: /^((\\)end)({)\4(})/,
      endCaptures: {
        1: {
          name: 'support.function.be.latex'
        },
        2: {
          name: 'punctuation.definition.function.latex'
        },
        3: {
          name: 'punctuation.definition.arguments.begin.latex'
        },
        4: {
          name: 'punctuation.definition.arguments.end.latex'
        }
      },
      contentName: 'source.haskell.embedded.latex',
      name: 'meta.embedded.block.haskell.latex',
      patterns: [
        {
          include: 'source.haskell'
        }
      ]
    }, {
      begin: /^(?=[><] )/,
      end: /^(?![><] )/,
      name: 'meta.embedded.haskell',
      patterns: (require('./haskell-patterns')).concat({
        match: /^> /,
        name: 'punctuation.definition.bird-track.haskell'
      })
    }, {
      match: '(?<!\\\\verb)\\|((:?[^|]|\\|\\|)+)\\|',
      name: 'meta.embedded.text.haskell.latex',
      captures: {
        1: {
          patterns: [
            {
              include: 'source.haskell'
            }
          ]
        }
      }
    }, {
      include: 'text.tex.latex'
    }
  ];

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NyYy9pbmNsdWRlL2xocy1wYXR0ZXJucy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQ0k7TUFBQSxLQUFBLEVBQU8sc0NBQVA7TUFDQSxhQUFBLEVBQ0U7UUFBQSxDQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sMkJBQU47U0FERjtRQUVBLENBQUEsRUFDRTtVQUFBLElBQUEsRUFBTSx1Q0FBTjtTQUhGO1FBSUEsQ0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLDhDQUFOO1NBTEY7UUFNQSxDQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sNENBQU47U0FQRjtPQUZGO01BVUEsR0FBQSxFQUFLLG9CQVZMO01BV0EsV0FBQSxFQUNFO1FBQUEsQ0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLDJCQUFOO1NBREY7UUFFQSxDQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sdUNBQU47U0FIRjtRQUlBLENBQUEsRUFDRTtVQUFBLElBQUEsRUFBTSw4Q0FBTjtTQUxGO1FBTUEsQ0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLDRDQUFOO1NBUEY7T0FaRjtNQW9CQSxXQUFBLEVBQWEsK0JBcEJiO01BcUJBLElBQUEsRUFBTSxtQ0FyQk47TUFzQkEsUUFBQSxFQUFVO1FBQ047VUFBQSxPQUFBLEVBQVMsZ0JBQVQ7U0FETTtPQXRCVjtLQURKLEVBMkJJO01BQUEsS0FBQSxFQUFPLFlBQVA7TUFDQSxHQUFBLEVBQUssWUFETDtNQUVBLElBQUEsRUFBTSx1QkFGTjtNQUdBLFFBQUEsRUFBVSxDQUFDLE9BQUEsQ0FBUSxvQkFBUixDQUFELENBQThCLENBQUMsTUFBL0IsQ0FDUjtRQUFBLEtBQUEsRUFBTyxLQUFQO1FBQ0EsSUFBQSxFQUFNLDJDQUROO09BRFEsQ0FIVjtLQTNCSixFQWtDSTtNQUFBLEtBQUEsRUFBTyx1Q0FBUDtNQUNBLElBQUEsRUFBTSxrQ0FETjtNQUVBLFFBQUEsRUFDRTtRQUFBLENBQUEsRUFBRztVQUFBLFFBQUEsRUFBVTtZQUFDO2NBQUEsT0FBQSxFQUFTLGdCQUFUO2FBQUQ7V0FBVjtTQUFIO09BSEY7S0FsQ0osRUF1Q0k7TUFBQSxPQUFBLEVBQVMsZ0JBQVQ7S0F2Q0o7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIFtcbiAgICAgIGJlZ2luOiAvXigoXFxcXCliZWdpbikoeykoY29kZXxzcGVjKSh9KShcXHMqJCk/L1xuICAgICAgYmVnaW5DYXB0dXJlczpcbiAgICAgICAgMTpcbiAgICAgICAgICBuYW1lOiAnc3VwcG9ydC5mdW5jdGlvbi5iZS5sYXRleCdcbiAgICAgICAgMjpcbiAgICAgICAgICBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5mdW5jdGlvbi5sYXRleCdcbiAgICAgICAgMzpcbiAgICAgICAgICBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5hcmd1bWVudHMuYmVnaW4ubGF0ZXgnXG4gICAgICAgIDU6XG4gICAgICAgICAgbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uYXJndW1lbnRzLmVuZC5sYXRleCdcbiAgICAgIGVuZDogL14oKFxcXFwpZW5kKSh7KVxcNCh9KS9cbiAgICAgIGVuZENhcHR1cmVzOlxuICAgICAgICAxOlxuICAgICAgICAgIG5hbWU6ICdzdXBwb3J0LmZ1bmN0aW9uLmJlLmxhdGV4J1xuICAgICAgICAyOlxuICAgICAgICAgIG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmZ1bmN0aW9uLmxhdGV4J1xuICAgICAgICAzOlxuICAgICAgICAgIG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmFyZ3VtZW50cy5iZWdpbi5sYXRleCdcbiAgICAgICAgNDpcbiAgICAgICAgICBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5hcmd1bWVudHMuZW5kLmxhdGV4J1xuICAgICAgY29udGVudE5hbWU6ICdzb3VyY2UuaGFza2VsbC5lbWJlZGRlZC5sYXRleCdcbiAgICAgIG5hbWU6ICdtZXRhLmVtYmVkZGVkLmJsb2NrLmhhc2tlbGwubGF0ZXgnXG4gICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgIGluY2x1ZGU6ICdzb3VyY2UuaGFza2VsbCdcbiAgICAgIF1cbiAgICAsXG4gICAgICBiZWdpbjogL14oPz1bPjxdICkvXG4gICAgICBlbmQ6IC9eKD8hWz48XSApL1xuICAgICAgbmFtZTogJ21ldGEuZW1iZWRkZWQuaGFza2VsbCdcbiAgICAgIHBhdHRlcm5zOiAocmVxdWlyZSAnLi9oYXNrZWxsLXBhdHRlcm5zJykuY29uY2F0XG4gICAgICAgIG1hdGNoOiAvXj4gL1xuICAgICAgICBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5iaXJkLXRyYWNrLmhhc2tlbGwnXG4gICAgLFxuICAgICAgbWF0Y2g6ICcoPzwhXFxcXFxcXFx2ZXJiKVxcXFx8KCg6P1tefF18XFxcXHxcXFxcfCkrKVxcXFx8J1xuICAgICAgbmFtZTogJ21ldGEuZW1iZWRkZWQudGV4dC5oYXNrZWxsLmxhdGV4J1xuICAgICAgY2FwdHVyZXM6XG4gICAgICAgIDE6IHBhdHRlcm5zOiBbaW5jbHVkZTogJ3NvdXJjZS5oYXNrZWxsJ11cbiAgICAsXG4gICAgICBpbmNsdWRlOiAndGV4dC50ZXgubGF0ZXgnXG4gIF1cbiJdfQ==
