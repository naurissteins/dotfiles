(function() {
  var customMatchers, grammarExpect, ref;

  ref = require('./util'), grammarExpect = ref.grammarExpect, customMatchers = ref.customMatchers;

  describe("Literate Haskell", function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      this.addMatchers(customMatchers);
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-haskell");
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName("text.tex.latex.haskell");
      });
    });
    it("parses the grammar", function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe("text.tex.latex.haskell");
    });
    return describe("regression test for 64", function() {
      it("parses inline signatures", function() {
        var g;
        g = grammarExpect(grammar, 'a signature |f::Type| should be contained');
        g.toHaveTokens([['a signature ', '|', 'f', '::', 'Type', '|', ' should be contained']]);
        g.toHaveScopes([['text.tex.latex.haskell']]);
        return g.tokenToHaveScopes([
          {
            1: ['meta.embedded.text.haskell.latex.haskell'],
            2: ['meta.embedded.text.haskell.latex.haskell', 'meta.function.type-declaration.haskell'],
            3: ['meta.embedded.text.haskell.latex.haskell', 'keyword.other.double-colon.haskell'],
            4: ['meta.embedded.text.haskell.latex.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell'],
            5: ['meta.embedded.text.haskell.latex.haskell']
          }
        ]);
      });
      it("parses inline signatures with dots", function() {
        var g;
        g = grammarExpect(grammar, 'a signature |f::Type|. should be contained');
        g.toHaveTokens([['a signature ', '|', 'f', '::', 'Type', '|', '. should be contained']]);
        g.toHaveScopes([['text.tex.latex.haskell']]);
        return g.tokenToHaveScopes([
          {
            1: ['meta.embedded.text.haskell.latex.haskell'],
            2: ['meta.embedded.text.haskell.latex.haskell', 'meta.function.type-declaration.haskell'],
            3: ['meta.embedded.text.haskell.latex.haskell', 'keyword.other.double-colon.haskell'],
            4: ['meta.embedded.text.haskell.latex.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell'],
            5: ['meta.embedded.text.haskell.latex.haskell']
          }
        ]);
      });
      it("parses inline code with pipes", function() {
        var g;
        g = grammarExpect(grammar, 'a code |type Bool = True || False| should parse correctly');
        g.toHaveTokens([['a code ', '|', 'type', ' ', 'Bool', ' ', '=', ' ', 'True', ' ', '||', ' ', 'False', '|', ' should parse correctly']]);
        g.toHaveScopes([['text.tex.latex.haskell']]);
        return g.tokenToHaveScopes([
          {
            1: ['meta.embedded.text.haskell.latex.haskell'],
            2: ["keyword.other.type.haskell"],
            3: ["meta.type-signature.haskell"],
            4: ["entity.name.type.haskell"],
            6: ['keyword.operator.assignment.haskell'],
            8: ['entity.name.type.haskell'],
            10: ['keyword.operator.haskell'],
            12: ['entity.name.type.haskell'],
            13: ['meta.embedded.text.haskell.latex.haskell']
          }
        ]);
      });
      return it("parses inline code with pipes", function() {
        var g;
        g = grammarExpect(grammar, 'a |code||||| should parse correctly');
        g.toHaveTokens([['a ', '|', 'code', '||||', '|', ' should parse correctly']]);
        g.toHaveScopes([['text.tex.latex.haskell']]);
        return g.tokenToHaveScopes([
          {
            1: ['meta.embedded.text.haskell.latex.haskell'],
            2: ["identifier.haskell"],
            3: ["keyword.operator.haskell"],
            4: ['meta.embedded.text.haskell.latex.haskell']
          }
        ]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NwZWMvbGl0ZXJhdGUtaGFza2VsbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBa0MsT0FBQSxDQUFRLFFBQVIsQ0FBbEMsRUFBQyxpQ0FBRCxFQUFnQjs7RUFFaEIsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7QUFDM0IsUUFBQTtJQUFBLE9BQUEsR0FBVTtJQUVWLFVBQUEsQ0FBVyxTQUFBO01BQ1QsSUFBQyxDQUFBLFdBQUQsQ0FBYSxjQUFiO01BQ0EsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGtCQUE5QjtNQURjLENBQWhCO2FBR0EsSUFBQSxDQUFLLFNBQUE7ZUFDSCxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBZCxDQUFrQyx3QkFBbEM7TUFEUCxDQUFMO0lBTFMsQ0FBWDtJQVFBLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBO01BQ3ZCLE1BQUEsQ0FBTyxPQUFQLENBQWUsQ0FBQyxVQUFoQixDQUFBO2FBQ0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxTQUFmLENBQXlCLENBQUMsSUFBMUIsQ0FBK0Isd0JBQS9CO0lBRnVCLENBQXpCO1dBSUEsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUE7TUFDakMsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUE7QUFDN0IsWUFBQTtRQUFBLENBQUEsR0FBSSxhQUFBLENBQWMsT0FBZCxFQUF1QiwyQ0FBdkI7UUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxjQUFELEVBQWlCLEdBQWpCLEVBQXNCLEdBQXRCLEVBQTJCLElBQTNCLEVBQWlDLE1BQWpDLEVBQXlDLEdBQXpDLEVBQThDLHNCQUE5QyxDQUFELENBQWY7UUFDQSxDQUFDLENBQUMs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RCxDQUFIO1lBQ0EsQ0FBQSxFQUFHLENBQUMsb0JBQUQsQ0FESDtZQUVBLENBQUEsRUFBRyxDQUFDLDBCQUFELENBRkg7WUFHQSxDQUFBLEVBQUcsQ0FBQywwQ0FBRCxDQUhIO1dBRGtCO1NBQXBCO01BSmtDLENBQXBDO0lBNUNpQyxDQUFuQztFQWYyQixDQUE3QjtBQUZBIiwic291cmNlc0NvbnRlbnQiOlsie2dyYW1tYXJFeHBlY3QsIGN1c3RvbU1hdGNoZXJzfSA9IHJlcXVpcmUgJy4vdXRpbCdcblxuZGVzY3JpYmUgXCJMaXRlcmF0ZSBIYXNrZWxsXCIsIC0+XG4gIGdyYW1tYXIgPSBudWxsXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIEBhZGRNYXRjaGVycyhjdXN0b21NYXRjaGVycylcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwibGFuZ3VhZ2UtaGFza2VsbFwiKVxuXG4gICAgcnVucyAtPlxuICAgICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShcInRleHQudGV4LmxhdGV4Lmhhc2tlbGxcIilcblxuICBpdCBcInBhcnNlcyB0aGUgZ3JhbW1hclwiLCAtPlxuICAgIGV4cGVjdChncmFtbWFyKS50b0JlVHJ1dGh5KClcbiAgICBleHBlY3QoZ3JhbW1hci5zY29wZU5hbWUpLnRvQmUgXCJ0ZXh0LnRleC5sYXRleC5oYXNrZWxsXCJcblxuICBkZXNjcmliZSBcInJlZ3Jlc3Npb24gdGVzdCBmb3IgNjRcIiwgLT5cbiAgICBpdCBcInBhcnNlcyBpbmxpbmUgc2lnbmF0dXJlc1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgJ2Egc2lnbmF0dXJlIHxmOjpUeXBlfCBzaG91bGQgYmUgY29udGFpbmVkJ1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1snYSBzaWduYXR1cmUgJywgJ3wnLCAnZicsICc6OicsICdUeXBlJywgJ3wnLCAnIHNob3VsZCBiZSBjb250YWluZWQnXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3RleHQudGV4LmxhdGV4Lmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1xuICAgICAgICAxOiBbJ21ldGEuZW1iZWRkZWQudGV4dC5oYXNrZWxsLmxhdGV4Lmhhc2tlbGwnXVxuICAgICAgICAyOiBbJ21ldGEuZW1iZWRkZWQudGV4dC5oYXNrZWxsLmxhdGV4Lmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnXVxuICAgICAgICAzOiBbJ21ldGEuZW1iZWRkZWQudGV4dC5oYXNrZWxsLmxhdGV4Lmhhc2tlbGwnLCAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCddXG4gICAgICAgIDQ6IFsnbWV0YS5lbWJlZGRlZC50ZXh0Lmhhc2tlbGwubGF0ZXguaGFza2VsbCdcbiAgICAgICAgICAgICwgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICAgICAgICAgICwgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCddXG4gICAgICAgIDU6IFsnbWV0YS5lbWJlZGRlZC50ZXh0Lmhhc2tlbGwubGF0ZXguaGFza2VsbCddXG4gICAgICAgIF1cbiAgICBpdCBcInBhcnNlcyBpbmxpbmUgc2lnbmF0dXJlcyB3aXRoIGRvdHNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsICdhIHNpZ25hdHVyZSB8Zjo6VHlwZXwuIHNob3VsZCBiZSBjb250YWluZWQnXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWydhIHNpZ25hdHVyZSAnLCAnfCcsICdmJywgJzo6JywgJ1R5cGUnLCAnfCcsICcuIHNob3VsZCBiZSBjb250YWluZWQnXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3RleHQudGV4LmxhdGV4Lmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1xuICAgICAgICAxOiBbJ21ldGEuZW1iZWRkZWQudGV4dC5oYXNrZWxsLmxhdGV4Lmhhc2tlbGwnXVxuICAgICAgICAyOiBbJ21ldGEuZW1iZWRkZWQudGV4dC5oYXNrZWxsLmxhdGV4Lmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnXVxuICAgICAgICAzOiBbICdtZXRhLmVtYmVkZGVkLnRleHQuaGFza2VsbC5sYXRleC5oYXNrZWxsJ1xuICAgICAgICAgICAsICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ11cbiAgICAgICAgNDogWydtZXRhLmVtYmVkZGVkLnRleHQuaGFza2VsbC5sYXRleC5oYXNrZWxsJ1xuICAgICAgICAgICAsICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXG4gICAgICAgICAgICwgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCddXG4gICAgICAgIDU6IFsnbWV0YS5lbWJlZGRlZC50ZXh0Lmhhc2tlbGwubGF0ZXguaGFza2VsbCddXG4gICAgICAgIF1cbiAgICBpdCBcInBhcnNlcyBpbmxpbmUgY29kZSB3aXRoIHBpcGVzXCIsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCAnYSBjb2RlIHx0eXBlIEJvb2wgPSBUcnVlIHx8IEZhbHNlfCBzaG91bGQgcGFyc2UgY29ycmVjdGx5J1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1snYSBjb2RlICcsICd8JywgJ3R5cGUnLCAnICcsICdCb29sJywgJyAnLCAnPScsICcgJywgJ1RydWUnLCAnICdcbiAgICAgICAgICAgICAgICAgICAgICAsICd8fCcsICcgJywgJ0ZhbHNlJywgJ3wnLCAnIHNob3VsZCBwYXJzZSBjb3JyZWN0bHknXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3RleHQudGV4LmxhdGV4Lmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1xuICAgICAgICAxOiBbJ21ldGEuZW1iZWRkZWQudGV4dC5oYXNrZWxsLmxhdGV4Lmhhc2tlbGwnXVxuICAgICAgICAyOiBbXCJrZXl3b3JkLm90aGVyLnR5cGUuaGFza2VsbFwiXVxuICAgICAgICAzOiBbXCJtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGxcIl1cbiAgICAgICAgNDogW1wiZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsXCJdXG4gICAgICAgIDY6ICBbJ2tleXdvcmQub3BlcmF0b3IuYXNzaWdubWVudC5oYXNrZWxsJ11cbiAgICAgICAgODogIFsnZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsJ11cbiAgICAgICAgMTA6IFsna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJ11cbiAgICAgICAgMTI6IFsnZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsJ11cbiAgICAgICAgMTM6IFsnbWV0YS5lbWJlZGRlZC50ZXh0Lmhhc2tlbGwubGF0ZXguaGFza2VsbCddXG4gICAgICBdXG4gICAgaXQgXCJwYXJzZXMgaW5saW5lIGNvZGUgd2l0aCBwaXBlc1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgJ2EgfGNvZGV8fHx8fCBzaG91bGQgcGFyc2UgY29ycmVjdGx5J1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1snYSAnLCAnfCcsICdjb2RlJywgJ3x8fHwnLCAnfCcsICcgc2hvdWxkIHBhcnNlIGNvcnJlY3RseSddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1sndGV4dC50ZXgubGF0ZXguaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbXG4gICAgICAgIDE6IFsnbWV0YS5lbWJlZGRlZC50ZXh0Lmhhc2tlbGwubGF0ZXguaGFza2VsbCddXG4gICAgICAgIDI6IFtcImlkZW50aWZpZXIuaGFza2VsbFwiXVxuICAgICAgICAzOiBbXCJrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGxcIl1cbiAgICAgICAgNDogWydtZXRhLmVtYmVkZGVkLnRleHQuaGFza2VsbC5sYXRleC5oYXNrZWxsJ11cbiAgICAgIF1cbiJdfQ==
