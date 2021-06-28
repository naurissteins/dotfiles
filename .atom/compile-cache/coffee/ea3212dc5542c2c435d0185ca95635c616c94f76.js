(function() {
  var _, include, makeGrammar, ref;

  ref = require('./syntax-tools'), include = ref.include, makeGrammar = ref.makeGrammar;

  _ = require('underscore-plus');

  makeGrammar("grammars/haskell.cson", {
    name: 'Haskell',
    fileTypes: ['hs', 'hs-boot', 'cpphs'],
    firstLineMatch: '^\\#\\!.*\\brunhaskell\\b',
    scopeName: 'source.haskell',
    macros: include('macros'),
    repository: include('repository'),
    patterns: include('haskell-patterns')
  });

  makeGrammar("grammars/module signature.cson", {
    name: 'Haskell Module Signature',
    fileTypes: ['hsig'],
    scopeName: 'source.hsig',
    macros: include('macros'),
    repository: include('repository'),
    patterns: include('hsig-patterns')
  });

  makeGrammar("grammars/haskell autocompletion hint.cson", {
    fileTypes: [],
    scopeName: 'hint.haskell',
    macros: include('macros'),
    patterns: [
      {
        include: '#function_type_declaration'
      }, {
        include: '#ctor_type_declaration'
      }
    ],
    repository: include('repository')
  });

  makeGrammar("grammars/haskell type hint.cson", {
    fileTypes: [],
    scopeName: 'hint.type.haskell',
    macros: include('macros'),
    patterns: [
      {
        include: '#type_signature'
      }
    ],
    repository: include('repository')
  });

  makeGrammar("grammars/haskell message hint.cson", {
    fileTypes: [],
    scopeName: 'hint.message.haskell',
    macros: include('macros'),
    patterns: [
      {
        match: /^[^:]*:(.+)$/,
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
        begin: /^[^:]*:$/,
        end: /^(?=\S)/,
        patterns: [
          {
            include: 'source.haskell'
          }
        ]
      }, {
        begin: /‘/,
        end: /’/,
        patterns: [
          {
            include: 'source.haskell'
          }
        ]
      }
    ],
    repository: include('repository')
  });

  makeGrammar("grammars/literate haskell.cson", {
    name: 'Literate Haskell',
    fileTypes: ['lhs'],
    scopeName: 'text.tex.latex.haskell',
    macros: _.extend((require('clone'))(include('macros')), {
      maybeBirdTrack: /^(?:>|<) /,
      indentBlockEnd: /^(?!(?:>|<) \1{indentChar}|(?:>|<) {indentChar}*$)|^(?!(?:>|<) )/,
      indentBlockCont: /^(?!(?:>|<) \1|(?:>|<) {indentChar}*$)|^(?!(?:>|<) )/,
      operatorChar: '(?:[\\p{S}\\p{P}](?<![(),;\\[\\]`{}_"\'\\|]))'
    }),
    patterns: include('lhs-patterns'),
    repository: include('repository')
  });

  makeGrammar("grammars/liquid haskell.cson", {
    fileTypes: [],
    scopeName: 'annotation.liquidhaskell.haskell',
    macros: _.extend((require('clone'))(include('macros')), {
      maybeBirdTrack: '(?:\\G(?:\\s*\\w+\\s)?|^)',
      indentBlockEnd: /(?:^(?!\1{indentChar}|{indentChar}*$)|(?=@-}))/,
      indentBlockCont: /(?:^(?!\1|{indentChar}*$)|(?=@-}))/
    }),
    patterns: include('liquid-patterns'),
    repository: _.extend((require('clone'))(include('repository')), {
      type_signature_hs: (include('repository')).type_signature,
      type_signature: {
        patterns: [
          {
            include: '#liquid_id'
          }, {
            include: '#liquid_type'
          }, {
            include: '#type_signature_hs'
          }
        ]
      },
      liquid_id: {
        match: /{functionName}\s*:/,
        captures: {
          0: {
            patterns: [
              {
                include: '#identifier'
              }
            ]
          }
        }
      },
      liquid_type: {
        begin: /\{/,
        end: /\}/,
        name: 'liquid.type.haskell',
        patterns: [
          {
            match: /\G(.*?)\|/,
            captures: {
              1: {
                patterns: [
                  {
                    include: '#type_signature'
                  }
                ]
              }
            }
          }, {
            include: '#haskell_expr'
          }
        ]
      }
    })
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NyYy9oYXNrZWxsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBeUIsT0FBQSxDQUFRLGdCQUFSLENBQXpCLEVBQUMscUJBQUQsRUFBVTs7RUFDVixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLFdBQUEsQ0FBWSx1QkFBWixFQUNFO0lBQUEsSUFBQSxFQUFNLFNBQU47SUFDQSxTQUFBLEVBQVcsQ0FBRSxJQUFGLEVBQVEsU0FBUixFQUFtQixPQUFuQixDQURYO0lBRUEsY0FBQSxFQUFnQiwyQkFGaEI7SUFHQSxTQUFBLEVBQVcsZ0JBSFg7SUFLQSxNQUFBLEVBQVEsT0FBQSxDQUFRLFFBQVIsQ0FMUjtJQU1BLFVBQUEsRUFBWSxPQUFBLENBQVEsWUFBUixDQU5aO0lBT0EsUUFBQSxFQUFVLE9BQUEsQ0FBUSxrQkFBUixDQVBWO0dBREY7O0VBVUEsV0FBQSxDQUFZLGdDQUFaLEVBQ0U7SUFBQSxJQUFBLEVBQU0sMEJBQU47SUFDQSxTQUFBLEVBQVcsQ0FBRSxNQUFGLENBRFg7SUFFQSxTQUFBLEVBQVcsYUFGWDtJQUlBLE1BQUEsRUFBUSxPQUFBLENBQVEsUUFBUixDQUpSO0lBS0EsVUFBQSxFQUFZLE9BQUEsQ0FBUSxZQUFSLENBTFo7SUFNQSxRQUFBLEVBQVUsT0FBQSxDQUFRLGVBQVIsQ0FOVjtHQURGOztFQVNBLFdBQUEsQ0FBWSwyQ0FBWixFQUVFO0lBQUEsU0FBQSxFQUFXLEVBQVg7SUFDQSxTQUFBLEVBQVcsY0FEWDtJQUdBLE1BQUEsRUFBUSxPQUFBLENBQVEsUUFBUixDQUhSO0lBSUEsUUFBQSxFQUFVO01BQ047UUFBQyxPQUFBLEVBQVMsNEJBQVY7T0FETSxFQUVOO1FBQUMsT0FBQSxFQUFTLHdCQUFWO09BRk07S0FKVjtJQVFBLFVBQUEsRUFBWSxPQUFB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UUFBQSxLQUFBLEVBQU8sSUFBUDtRQUNBLEdBQUEsRUFBSyxJQURMO1FBRUEsSUFBQSxFQUFNLHFCQUZOO1FBR0EsUUFBQSxFQUFVO1VBQ1I7WUFDRSxLQUFBLEVBQU8sV0FEVDtZQUVFLFFBQUEsRUFBVTtjQUFBLENBQUEsRUFBRztnQkFBQSxRQUFBLEVBQVU7a0JBQUM7b0JBQUEsT0FBQSxFQUFTLGlCQUFUO21CQUFEO2lCQUFWO2VBQUg7YUFGWjtXQURRLEVBS1I7WUFBRSxPQUFBLEVBQVMsZUFBWDtXQUxRO1NBSFY7T0FaRjtLQURVLENBUlo7R0FGRjtBQXhGQSIsInNvdXJjZXNDb250ZW50IjpbIntpbmNsdWRlLCBtYWtlR3JhbW1hcn0gPSByZXF1aXJlICcuL3N5bnRheC10b29scydcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbm1ha2VHcmFtbWFyIFwiZ3JhbW1hcnMvaGFza2VsbC5jc29uXCIsXG4gIG5hbWU6ICdIYXNrZWxsJ1xuICBmaWxlVHlwZXM6IFsgJ2hzJywgJ2hzLWJvb3QnLCAnY3BwaHMnIF1cbiAgZmlyc3RMaW5lTWF0Y2g6ICdeXFxcXCNcXFxcIS4qXFxcXGJydW5oYXNrZWxsXFxcXGInXG4gIHNjb3BlTmFtZTogJ3NvdXJjZS5oYXNrZWxsJ1xuXG4gIG1hY3JvczogaW5jbHVkZSAnbWFjcm9zJ1xuICByZXBvc2l0b3J5OiBpbmNsdWRlICdyZXBvc2l0b3J5J1xuICBwYXR0ZXJuczogaW5jbHVkZSAnaGFza2VsbC1wYXR0ZXJucydcblxubWFrZUdyYW1tYXIgXCJncmFtbWFycy9tb2R1bGUgc2lnbmF0dXJlLmNzb25cIixcbiAgbmFtZTogJ0hhc2tlbGwgTW9kdWxlIFNpZ25hdHVyZSdcbiAgZmlsZVR5cGVzOiBbICdoc2lnJyBdXG4gIHNjb3BlTmFtZTogJ3NvdXJjZS5oc2lnJ1xuXG4gIG1hY3JvczogaW5jbHVkZSgnbWFjcm9zJylcbiAgcmVwb3NpdG9yeTogaW5jbHVkZSAncmVwb3NpdG9yeSdcbiAgcGF0dGVybnM6IGluY2x1ZGUgJ2hzaWctcGF0dGVybnMnXG5cbm1ha2VHcmFtbWFyIFwiZ3JhbW1hcnMvaGFza2VsbCBhdXRvY29tcGxldGlvbiBoaW50LmNzb25cIixcbiAgIyBuYW1lOiAnSGFza2VsbCBBdXRvY29tcGxldGlvbiBIaW50J1xuICBmaWxlVHlwZXM6IFtdXG4gIHNjb3BlTmFtZTogJ2hpbnQuaGFza2VsbCdcblxuICBtYWNyb3M6IGluY2x1ZGUgJ21hY3JvcydcbiAgcGF0dGVybnM6IFtcbiAgICAgIHtpbmNsdWRlOiAnI2Z1bmN0aW9uX3R5cGVfZGVjbGFyYXRpb24nfVxuICAgICAge2luY2x1ZGU6ICcjY3Rvcl90eXBlX2RlY2xhcmF0aW9uJ31cbiAgXVxuICByZXBvc2l0b3J5OiBpbmNsdWRlICdyZXBvc2l0b3J5J1xuXG5tYWtlR3JhbW1hciBcImdyYW1tYXJzL2hhc2tlbGwgdHlwZSBoaW50LmNzb25cIixcbiAgIyBuYW1lOiAnSGFza2VsbCBUeXBlIEhpbnQnXG4gIGZpbGVUeXBlczogW11cbiAgc2NvcGVOYW1lOiAnaGludC50eXBlLmhhc2tlbGwnXG5cbiAgbWFjcm9zOiBpbmNsdWRlICdtYWNyb3MnXG4gIHBhdHRlcm5zOiBbXG4gICAgICBpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ1xuICBdXG4gIHJlcG9zaXRvcnk6IGluY2x1ZGUgJ3JlcG9zaXRvcnknXG5cbm1ha2VHcmFtbWFyIFwiZ3JhbW1hcnMvaGFza2VsbCBtZXNzYWdlIGhpbnQuY3NvblwiLFxuICAjIG5hbWU6ICdIYXNrZWxsIE1lc3NhZ2UgSGludCdcbiAgZmlsZVR5cGVzOiBbXVxuICBzY29wZU5hbWU6ICdoaW50Lm1lc3NhZ2UuaGFza2VsbCdcblxuICBtYWNyb3M6IGluY2x1ZGUgJ21hY3JvcydcbiAgcGF0dGVybnM6IFtcbiAgICAgIG1hdGNoOiAvXlteOl0qOiguKykkL1xuICAgICAgY2FwdHVyZXM6XG4gICAgICAgIDE6XG4gICAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIGluY2x1ZGU6ICdzb3VyY2UuaGFza2VsbCdcbiAgICAgICAgICBdXG4gICAgLFxuICAgICAgYmVnaW46IC9eW146XSo6JC9cbiAgICAgIGVuZDogL14oPz1cXFMpL1xuICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgaW5jbHVkZTogJ3NvdXJjZS5oYXNrZWxsJ1xuICAgICAgXVxuICAgICxcbiAgICAgIGJlZ2luOiAv4oCYL1xuICAgICAgZW5kOiAv4oCZL1xuICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgaW5jbHVkZTogJ3NvdXJjZS5oYXNrZWxsJ1xuICAgICAgXVxuICBdXG4gIHJlcG9zaXRvcnk6IGluY2x1ZGUgJ3JlcG9zaXRvcnknXG5cbm1ha2VHcmFtbWFyIFwiZ3JhbW1hcnMvbGl0ZXJhdGUgaGFza2VsbC5jc29uXCIsXG4gIG5hbWU6ICdMaXRlcmF0ZSBIYXNrZWxsJ1xuICBmaWxlVHlwZXM6IFsgJ2xocycgXVxuICBzY29wZU5hbWU6ICd0ZXh0LnRleC5sYXRleC5oYXNrZWxsJ1xuXG4gIG1hY3JvczogXy5leHRlbmQgKHJlcXVpcmUgJ2Nsb25lJykoaW5jbHVkZSgnbWFjcm9zJykpLFxuICAgIG1heWJlQmlyZFRyYWNrOiAvXig/Oj58PCkgL1xuICAgIGluZGVudEJsb2NrRW5kOlxuICAgICAgL14oPyEoPzo+fDwpIFxcMXtpbmRlbnRDaGFyfXwoPzo+fDwpIHtpbmRlbnRDaGFyfSokKXxeKD8hKD86Pnw8KSApL1xuICAgIGluZGVudEJsb2NrQ29udDpcbiAgICAgIC9eKD8hKD86Pnw8KSBcXDF8KD86Pnw8KSB7aW5kZW50Q2hhcn0qJCl8Xig/ISg/Oj58PCkgKS9cbiAgICBvcGVyYXRvckNoYXI6ICcoPzpbXFxcXHB7U31cXFxccHtQfV0oPzwhWygpLDtcXFxcW1xcXFxdYHt9X1wiXFwnXFxcXHxdKSknXG4gIHBhdHRlcm5zOiBpbmNsdWRlICdsaHMtcGF0dGVybnMnXG4gIHJlcG9zaXRvcnk6IGluY2x1ZGUgJ3JlcG9zaXRvcnknXG5cbm1ha2VHcmFtbWFyIFwiZ3JhbW1hcnMvbGlxdWlkIGhhc2tlbGwuY3NvblwiLFxuICAjIG5hbWU6ICdMaXF1aWQgSGFza2VsbCdcbiAgZmlsZVR5cGVzOiBbXVxuICBzY29wZU5hbWU6ICdhbm5vdGF0aW9uLmxpcXVpZGhhc2tlbGwuaGFza2VsbCdcblxuICBtYWNyb3M6IF8uZXh0ZW5kIChyZXF1aXJlICdjbG9uZScpKGluY2x1ZGUoJ21hY3JvcycpKSxcbiAgICBtYXliZUJpcmRUcmFjazogJyg/OlxcXFxHKD86XFxcXHMqXFxcXHcrXFxcXHMpP3xeKSdcbiAgICBpbmRlbnRCbG9ja0VuZDogLyg/Ol4oPyFcXDF7aW5kZW50Q2hhcn18e2luZGVudENoYXJ9KiQpfCg/PUAtfSkpL1xuICAgIGluZGVudEJsb2NrQ29udDogLyg/Ol4oPyFcXDF8e2luZGVudENoYXJ9KiQpfCg/PUAtfSkpL1xuICBwYXR0ZXJuczogaW5jbHVkZSAnbGlxdWlkLXBhdHRlcm5zJ1xuICByZXBvc2l0b3J5OiBfLmV4dGVuZCAocmVxdWlyZSAnY2xvbmUnKShpbmNsdWRlICdyZXBvc2l0b3J5JyksXG4gICAgdHlwZV9zaWduYXR1cmVfaHM6IChpbmNsdWRlICdyZXBvc2l0b3J5JykudHlwZV9zaWduYXR1cmVcbiAgICB0eXBlX3NpZ25hdHVyZTpcbiAgICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIHsgaW5jbHVkZTogJyNsaXF1aWRfaWQnIH1cbiAgICAgICAgeyBpbmNsdWRlOiAnI2xpcXVpZF90eXBlJyB9XG4gICAgICAgIHsgaW5jbHVkZTogJyN0eXBlX3NpZ25hdHVyZV9ocycgfVxuICAgICAgXVxuICAgIGxpcXVpZF9pZDpcbiAgICAgIG1hdGNoOiAve2Z1bmN0aW9uTmFtZX1cXHMqOi9cbiAgICAgIGNhcHR1cmVzOlxuICAgICAgICAwOiBwYXR0ZXJuczogWyBpbmNsdWRlOiAnI2lkZW50aWZpZXInIF1cbiAgICBsaXF1aWRfdHlwZTpcbiAgICAgIGJlZ2luOiAvXFx7L1xuICAgICAgZW5kOiAvXFx9L1xuICAgICAgbmFtZTogJ2xpcXVpZC50eXBlLmhhc2tlbGwnXG4gICAgICBwYXR0ZXJuczogW1xuICAgICAgICB7XG4gICAgICAgICAgbWF0Y2g6IC9cXEcoLio/KVxcfC9cbiAgICAgICAgICBjYXB0dXJlczogMTogcGF0dGVybnM6IFtpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ11cbiAgICAgICAgfVxuICAgICAgICB7IGluY2x1ZGU6ICcjaGFza2VsbF9leHByJyB9XG4gICAgICBdXG4iXX0=
