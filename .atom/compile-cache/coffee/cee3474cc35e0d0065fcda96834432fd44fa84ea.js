(function() {
  var customMatchers, grammarExpect, prelude, ref;

  ref = require('./util'), grammarExpect = ref.grammarExpect, customMatchers = ref.customMatchers;

  prelude = require('../src/include/prelude');

  describe("Language-Haskell Operators", function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      this.addMatchers(customMatchers);
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-haskell");
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName("source.haskell");
      });
    });
    return describe("operators", function() {
      it("tokenizes the / arithmetic operator when separated by newlines", function() {
        var g;
        g = grammarExpect(grammar, "1\n/ 2");
        g.toHaveTokens([['1'], ['/', ' ', '2']]);
        g.toHaveScopes([['source.haskell'], ['source.haskell']]);
        return g.tokensToHaveScopes({
          '1': ['constant.numeric.decimal.haskell'],
          '/': ['keyword.operator.haskell'],
          '2': ['constant.numeric.decimal.haskell']
        });
      });
      return prelude.operators.forEach(function(i) {
        it("tokenizes " + i + " operator", function() {
          var g;
          g = grammarExpect(grammar, "a " + i + " b");
          g.toHaveTokens([['a', ' ', i, ' ', 'b']]);
          g.toHaveScopes([['source.haskell']]);
          return g.tokenToHaveScopes([
            {
              2: ['keyword.operator.haskell', 'support.operator.prelude.haskell']
            }
          ]);
        });
        it("tokenizes (" + i + ") operator function", function() {
          var g;
          g = grammarExpect(grammar, "(" + i + ") a b");
          g.toHaveTokens([["(" + i + ")", ' ', 'a', ' ', 'b']]);
          g.toHaveScopes([['source.haskell']]);
          return g.tokenToHaveScopes([
            {
              0: ['entity.name.function.operator.haskell', 'support.operator.prelude.haskell']
            }
          ]);
        });
        it("tokenizes qualified " + i + " operator", function() {
          var g;
          g = grammarExpect(grammar, "a Prelude." + i + " b");
          g.toHaveTokens([['a', ' ', 'Prelude.', i, ' ', 'b']]);
          g.toHaveScopes([['source.haskell']]);
          return g.tokenToHaveScopes([
            {
              2: ['keyword.operator.haskell', 'support.other.module.haskell'],
              3: ['keyword.operator.haskell']
            }
          ]);
        });
        return it("tokenizes qualified (" + i + ") operator function", function() {
          var g;
          g = grammarExpect(grammar, "(Prelude." + i + ") a b");
          g.toHaveTokens([['(', 'Prelude.', i + ")", ' ', 'a', ' ', 'b']]);
          g.toHaveScopes([['source.haskell']]);
          return g.tokenToHaveScopes([
            {
              0: ['entity.name.function.operator.haskell'],
              1: ['entity.name.function.operator.haskell', 'support.other.module.haskell'],
              2: ['entity.name.function.operator.haskell']
            }
          ]);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NwZWMvb3BlcmF0b3JzLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFrQyxPQUFBLENBQVEsUUFBUixDQUFsQyxFQUFDLGlDQUFELEVBQWdCOztFQUNoQixPQUFBLEdBQVUsT0FBQSxDQUFRLHdCQUFSOztFQUVWLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBO0FBQ3JDLFFBQUE7SUFBQSxPQUFBLEdBQVU7SUFFVixVQUFBLENBQVcsU0FBQTtNQUNULElBQUMsQ0FBQSxXQUFELENBQWEsY0FBYjtNQUNBLGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixrQkFBOUI7TUFEYyxDQUFoQjthQUdBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsZ0JBQWxDO01BRFAsQ0FBTDtJQUxTLENBQVg7V0FRQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBO01BQ3BCLEVBQUEsQ0FBRyxnRUFBSCxFQUFxRSxTQUFBO0FBQ25FLFlBQUE7UUFBQSxDQUFBLEdBQUksYUFBQSxDQUFjLE9BQWQsRUFBdUIsUUFBdkI7UUFJSixDQUFDLENBQUMsWUFBRixDQUFlLENBQ2IsQ0FBQyxHQUFELENBRGEsRUFFYixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQUZhLENBQWY7UUFJQSxDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxDQUFELEVBQXFCLENBQUMsZ0JBQUQsQ0FBckIsQ0FBZjtlQUNBLENBQUMsQ0FBQyxrQkFBRixDQUFxQjtVQUNuQixHQUFBLEVBQUssQ0FBQyxrQ0FBRCxDQURjO1VBRW5CLEdBQUEsRUFBSyxDQUFDLDBCQUFELENBRmM7VUFHbkIs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Q29udGVudCI6WyJ7Z3JhbW1hckV4cGVjdCwgY3VzdG9tTWF0Y2hlcnN9ID0gcmVxdWlyZSAnLi91dGlsJ1xucHJlbHVkZSA9IHJlcXVpcmUgJy4uL3NyYy9pbmNsdWRlL3ByZWx1ZGUnXG5cbmRlc2NyaWJlIFwiTGFuZ3VhZ2UtSGFza2VsbCBPcGVyYXRvcnNcIiwgLT5cbiAgZ3JhbW1hciA9IG51bGxcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgQGFkZE1hdGNoZXJzKGN1c3RvbU1hdGNoZXJzKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJsYW5ndWFnZS1oYXNrZWxsXCIpXG5cbiAgICBydW5zIC0+XG4gICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKFwic291cmNlLmhhc2tlbGxcIilcblxuICBkZXNjcmliZSBcIm9wZXJhdG9yc1wiLCAtPlxuICAgIGl0IFwidG9rZW5pemVzIHRoZSAvIGFyaXRobWV0aWMgb3BlcmF0b3Igd2hlbiBzZXBhcmF0ZWQgYnkgbmV3bGluZXNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsIFwiXCJcIlxuICAgICAgICAxXG4gICAgICAgIC8gMlxuICAgICAgXCJcIlwiXG4gICAgICBnLnRvSGF2ZVRva2VucyBbXG4gICAgICAgIFsnMSddXG4gICAgICAgIFsnLycsICcgJywgJzInXVxuICAgICAgXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXSwgWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgZy50b2tlbnNUb0hhdmVTY29wZXMge1xuICAgICAgICAnMSc6IFsnY29uc3RhbnQubnVtZXJpYy5kZWNpbWFsLmhhc2tlbGwnXVxuICAgICAgICAnLyc6IFsna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJ11cbiAgICAgICAgJzInOiBbJ2NvbnN0YW50Lm51bWVyaWMuZGVjaW1hbC5oYXNrZWxsJ11cbiAgICAgIH1cbiAgICBwcmVsdWRlLm9wZXJhdG9ycy5mb3JFYWNoIChpKSAtPlxuICAgICAgaXQgXCJ0b2tlbml6ZXMgI3tpfSBvcGVyYXRvclwiLCAtPlxuICAgICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCBcImEgI3tpfSBiXCJcbiAgICAgICAgZy50b0hhdmVUb2tlbnMgW1snYScsICcgJywgaSwgJyAnLCAnYiddXVxuICAgICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFsyOiBbJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCcsICdzdXBwb3J0Lm9wZXJhdG9yLnByZWx1ZGUuaGFza2VsbCddXVxuXG4gICAgICBpdCBcInRva2VuaXplcyAoI3tpfSkgb3BlcmF0b3IgZnVuY3Rpb25cIiwgLT5cbiAgICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgXCIoI3tpfSkgYSBiXCJcbiAgICAgICAgZy50b0hhdmVUb2tlbnMgW1tcIigje2l9KVwiLCAnICcsICdhJywgJyAnLCAnYiddXVxuICAgICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFswOiBbJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLm9wZXJhdG9yLmhhc2tlbGwnLCAnc3VwcG9ydC5vcGVyYXRvci5wcmVsdWRlLmhhc2tlbGwnXV1cblxuICAgICAgaXQgXCJ0b2tlbml6ZXMgcXVhbGlmaWVkICN7aX0gb3BlcmF0b3JcIiwgLT5cbiAgICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgXCJhIFByZWx1ZGUuI3tpfSBiXCJcbiAgICAgICAgZy50b0hhdmVUb2tlbnMgW1snYScsICcgJywgJ1ByZWx1ZGUuJywgaSwgJyAnLCAnYiddXVxuICAgICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtcbiAgICAgICAgICAyOiBbJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCcsICdzdXBwb3J0Lm90aGVyLm1vZHVsZS5oYXNrZWxsJ11cbiAgICAgICAgICAzOiBbJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCddXG4gICAgICAgIF1cblxuICAgICAgaXQgXCJ0b2tlbml6ZXMgcXVhbGlmaWVkICgje2l9KSBvcGVyYXRvciBmdW5jdGlvblwiLCAtPlxuICAgICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCBcIihQcmVsdWRlLiN7aX0pIGEgYlwiXG4gICAgICAgIGcudG9IYXZlVG9rZW5zIFtbJygnLCAnUHJlbHVkZS4nLCBcIiN7aX0pXCIsICcgJywgJ2EnLCAnICcsICdiJ11dXG4gICAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJ11dXG4gICAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1xuICAgICAgICAgIDA6IFsnZW50aXR5Lm5hbWUuZnVuY3Rpb24ub3BlcmF0b3IuaGFza2VsbCddXG4gICAgICAgICAgMTogWydlbnRpdHkubmFtZS5mdW5jdGlvbi5vcGVyYXRvci5oYXNrZWxsJywgJ3N1cHBvcnQub3RoZXIubW9kdWxlLmhhc2tlbGwnXVxuICAgICAgICAgIDI6IFsnZW50aXR5Lm5hbWUuZnVuY3Rpb24ub3BlcmF0b3IuaGFza2VsbCddXG4gICAgICAgICAgXVxuIl19
