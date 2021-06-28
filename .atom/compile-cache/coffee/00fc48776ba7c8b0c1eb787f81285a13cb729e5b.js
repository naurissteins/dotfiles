(function() {
  var customMatchers, grammarExpect, ref;

  ref = require('./util'), grammarExpect = ref.grammarExpect, customMatchers = ref.customMatchers;

  describe("Language-Haskell multiline signatures", function() {
    var doNotationScoped, grammar, lhs, negativeTopSigs, testBoth, topSigs;
    grammar = null;
    lhs = null;
    testBoth = function(ex, test) {
      it("works in Haskell", function() {
        return test(grammar, ex);
      });
      return it("works in Literate Haskell", function() {
        return test(lhs, '> ' + ex.split('\n').join('\n> '));
      });
    };
    beforeEach(function() {
      this.addMatchers(customMatchers);
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-haskell");
      });
      return runs(function() {
        grammar = atom.grammars.grammarForScopeName("source.haskell");
        return lhs = atom.grammars.grammarForScopeName("text.tex.latex.haskell");
      });
    });
    topSigs = ['someFunc\n  :: String -> String', 'someFunc\n  :: String\n  -> String', 'someFunc\n  :: forall res r (s :: * -> *)\n   . ( s ~ Maybe\n     , Monad s\n     )\n  => Either res r\n  -> Either [res] [r]'];
    negativeTopSigs = ['someFunc\n    :: String\n -> Integer'];
    doNotationScoped = ['f x = do\n  stuff :: String <- x\n  return ()', 'g x = do\n  stuff\n    :: String\n    -> String <- x\n  return ()', 'g x = do\n  stuff\n    :: String\n    -> a <- x\n  return ()', 'h x = do\n  stuff\n    :: String\n    ->> String\n    --> IO String <- x\n  return ()'];
    describe("Top level signatures", function() {
      topSigs.forEach(function(ex) {
        return it("correctly gets line scopes for " + ex, function() {
          var g, i, ref1, results;
          g = grammarExpect(grammar, ex);
          return g.toHaveScopes([['identifier.haskell']].concat((function() {
            results = [];
            for (var i = 2, ref1 = ex.split('\n').length; 2 <= ref1 ? i <= ref1 : i >= ref1; 2 <= ref1 ? i++ : i--){ results.push(i); }
            return results;
          }).apply(this).map(function() {
            return ['meta.multiline.type-declaration.haskell'];
          })));
        });
      });
      return topSigs.forEach(function(ex) {
        return describe("parses " + ex, function() {
          return testBoth(ex, function(grammar, ex) {
            var g;
            g = grammarExpect(grammar, ex);
            return g.tokensToHaveScopes({
              'String': ['entity.name.type.haskell'],
              'someFunc': ['identifier.haskell']
            });
          });
        });
      });
    });
    describe("Top level signatures failures", function() {
      return negativeTopSigs.forEach(function(ex) {
        return describe("does not parse " + ex, function() {
          return testBoth(ex, function(grammar, ex) {
            var g;
            g = grammarExpect(grammar, ex);
            g.tokensToHaveScopes({
              'String': ['entity.name.type.haskell'],
              'someFunc': ['identifier.haskell']
            });
            return g.tokensNotToHaveScopes({
              'Integer': ['entity.name.type.haskell']
            });
          });
        });
      });
    });
    return describe("Scoped do notation signatures", function() {
      return doNotationScoped.forEach(function(ex) {
        return describe("parses " + ex, function() {
          return testBoth(ex, function(grammar, ex) {
            var g;
            g = grammarExpect(grammar, ex);
            g.tokensToHaveScopes({
              'String': ['entity.name.type.haskell'],
              'IO': ['entity.name.type.haskell'],
              'x': ['identifier.haskell'],
              'a': ['variable.other.generic-type.haskell']
            });
            return g.tokensNotToHaveScopes({
              'x': ['entity.name.type.haskell', 'variable.other.generic-type.haskell'],
              'a': ['identifier.haskell']
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NwZWMvbGFuZ3VhZ2UtaGFza2VsbC1tdWx0aWxpbmUtc2lncy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBa0MsT0FBQSxDQUFRLFFBQVIsQ0FBbEMsRUFBQyxpQ0FBRCxFQUFnQjs7RUFFaEIsUUFBQSxDQUFTLHVDQUFULEVBQWtELFNBQUE7QUFDaEQsUUFBQTtJQUFBLE9BQUEsR0FBVTtJQUNWLEdBQUEsR0FBTTtJQUVOLFFBQUEsR0FBVyxTQUFDLEVBQUQsRUFBSyxJQUFMO01BQ1QsRUFBQSxDQUFHLGtCQUFILEVBQXVCLFNBQUE7ZUFDckIsSUFBQSxDQUFLLE9BQUwsRUFBYyxFQUFkO01BRHFCLENBQXZCO2FBRUEsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUE7ZUFDOUIsSUFBQSxDQUFLLEdBQUwsRUFBVSxJQUFBLEdBQU8sRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFULENBQWMsQ0FBQyxJQUFmLENBQW9CLE1BQXBCLENBQWpCO01BRDhCLENBQWhDO0lBSFM7SUFNWCxVQUFBLENBQVcsU0FBQTtNQUNULElBQUMsQ0FBQSxXQUFELENBQWEsY0FBYjtNQUNBLGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixrQkFBOUI7TUFEYyxDQUFoQjthQUdBLElBQUEsQ0FBSyxTQUFBO1FBQ0gsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsZ0JBQWxDO2VBQ1YsR0FBQSxHQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0Msd0JBQWxDO01BRkgsQ0FBTDtJQUxTLENBQVg7SUFTQSxPQUFBLEdBQVUsQ0FDUixpQ0FEUSxFQUtSLG9DQUxRLEVBVVIsK0hBVlE7SUFvQlYsZUFBQSxHQUFrQixDQUVoQixzQ0FGZ0I7SUFRbEIsZ0JBQUEsR0FBbUIsQ0FDakIsK0NBRGlCLEVBTWpCLG1FQU5pQixFQWFqQiw4REFiaUIsRUFvQmpCLHVGQXBCaUI7SUE4Qm5CLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBO01BQy9CLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFNBQUMsRUFBRDtlQUNkLEVBQUEsQ0FBRyxpQ0FBQSxHQUFrQyxFQUFyQyxFQUEyQyxTQUFBO0FBQ3pDLGNBQUE7VUFBQSxDQUFBLEdBQUksYUFBQSxDQUFjLE9BQWQsRUFBdUIsRUFBdkI7aUJBQ0osQ0FBQyxDQUFDLFlBQUYsQ0FBZSxDQUFDLENBQUMsb0JBQUQsQ0FBRCxDQUF3QixDQUFDLE1BQXpCLENBQ2I7Ozs7d0JBQTBCLENBQUMsR0FBM0IsQ0FBK0IsU0FBQTttQkFDN0IsQ0FBQyx5Q0FBRDtVQUQ2QixDQUEvQixDQURhLENBQWY7UUFGeUMsQ0FBM0M7TUFEYyxDQUFoQjthQU9BLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFNBQUMsRUFBRDtlQUNkLFFBQUEsQ0FBUyxTQUFBLEdBQVUsRUFBbkIsRUFBeUIsU0FBQTtpQkFDdkIsUUFBQSxDQUFTLEVBQVQsRUFBYSxTQUFDLE9BQUQsRUFBVSxFQUFWO0FBQ1gsZ0JBQUE7WUFBQSxDQUFBLEdBQUksYUFBQSxDQUFjLE9BQWQsRUFBdUIsRUFBdkI7bUJBS0osQ0FBQyxDQUFDLGtCQUFGLENBQ0U7Y0FBQSxRQUFBLEVBQVUsQ0FBQywwQkFBRCxDQUFWO2NBQ0EsVUFBQSxFQUFZLENBQUMsb0JBQUQsQ0FEWjthQURGO1VBTlcsQ0FBYjtRQUR1QixDQUF6QjtNQURjLENBQWhCO0lBUitCLENBQWpDO0lBb0JBLFFBQUEsQ0FBUywrQkFBVCxFQUEwQyxTQUFBO2FBQ3hDLGVBQWUsQ0FBQyxPQUFoQixDQUF3QixTQUFDLEVBQUQ7ZUFDdEIsUUFBQSxDQUFTLGlCQUFBLEdBQWtCLEVBQTNCLEVBQWlDLFNBQUE7aUJBQy9CLFFBQUEsQ0FBUyxFQUFULEVBQWEsU0FBQyxPQUFELEVBQVUsRUFBVjtBQUNYLGdCQUFBO1lBQUEsQ0FBQSxHQUFJLGFBQUEsQ0FBYyxPQUFkLEVBQXVCLEVBQXZCO1lBS0osQ0FBQyxDQUFDLGtCQUFGLENBQ0U7Y0FBQSxRQUFBLEVBQVUsQ0FBQywwQkFBRCxDQUFWO2NBQ0EsVUFBQSxFQUFZLENBQUMsb0JBQUQsQ0FEWjthQURGO21CQUlBLENBQUMsQ0FBQyxxQkFBRixDQUF3QjtjQUFBLFNBQUEsRUFBVyxDQUFDLDBCQUFELENBQVg7YUFBeEI7VUFWVyxDQUFiO1FBRCtCLENBQWpDO01BRHNCLENBQXhCO0lBRHdDLENBQTFDO1dBY0EsUUFBQSxDQUFTLCtCQUFULEVBQTBDLFNBQUE7YUFDeEMsZ0JBQWdCLENBQUMsT0FBakIsQ0FBeUIsU0FBQyxFQUFEO2VBQ3ZCLFFBQUEsQ0FBUyxTQUFBLEdBQVUsRUFBbkIsRUFBeUIsU0FBQTtpQkFDdkIsUUFBQSxDQUFTLEVBQVQsRUFBYSxTQUFDLE9BQUQsRUFBVSxFQUFWO0FBQ1gsZ0JBQUE7WUFBQSxDQUFBLEdBQUksYUFBQSxDQUFjLE9BQWQsRUFBdUIsRUFBdkI7WUFDSixDQUFDLENBQUMsa0JBQUYsQ0FDRTtjQUFBLFFBQUEsRUFBVSxDQUFDLDBCQUFELENBQVY7Y0FDQSxJQUFBLEVBQU0sQ0FBQywwQkFBRCxDQUROO2NBRUEsR0FBQSxFQUFLLENBQUMsb0JBQUQsQ0FGTDtjQUdBLEdBQUEsRUFBSyxDQUFDLHFDQUFELENBSEw7YUFERjttQkFNQSxDQUFDLENBQUMscUJBQUYsQ0FDRTtjQUFBLEdBQUEsRUFBSyxDQUFDLDBCQUFELEVBQTZCLHFDQUE3QixDQUFMO2NBQ0EsR0FBQSxFQUFLLENBQUMsb0JBQUQsQ0FETDthQURGO1VBUlcsQ0FBYjtRQUR1QixDQUF6QjtNQUR1QixDQUF6QjtJQUR3QyxDQUExQztFQS9HZ0QsQ0FBbEQ7QUFGQSIsInNvdXJjZXNDb250ZW50IjpbIntncmFtbWFyRXhwZWN0LCBjdXN0b21NYXRjaGVyc30gPSByZXF1aXJlICcuL3V0aWwnXG5cbmRlc2NyaWJlIFwiTGFuZ3VhZ2UtSGFza2VsbCBtdWx0aWxpbmUgc2lnbmF0dXJlc1wiLCAtPlxuICBncmFtbWFyID0gbnVsbFxuICBsaHMgPSBudWxsXG5cbiAgdGVzdEJvdGggPSAoZXgsIHRlc3QpIC0+XG4gICAgaXQgXCJ3b3JrcyBpbiBIYXNrZWxsXCIsIC0+XG4gICAgICB0ZXN0KGdyYW1tYXIsIGV4KVxuICAgIGl0IFwid29ya3MgaW4gTGl0ZXJhdGUgSGFza2VsbFwiLCAtPlxuICAgICAgdGVzdChsaHMsICc+ICcgKyBleC5zcGxpdCgnXFxuJykuam9pbignXFxuPiAnKSlcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgQGFkZE1hdGNoZXJzKGN1c3RvbU1hdGNoZXJzKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJsYW5ndWFnZS1oYXNrZWxsXCIpXG5cbiAgICBydW5zIC0+XG4gICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKFwic291cmNlLmhhc2tlbGxcIilcbiAgICAgIGxocyA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShcInRleHQudGV4LmxhdGV4Lmhhc2tlbGxcIilcblxuICB0b3BTaWdzID0gW1xuICAgICcnJ1xuICAgIHNvbWVGdW5jXG4gICAgICA6OiBTdHJpbmcgLT4gU3RyaW5nXG4gICAgJycnXG4gICAgJycnXG4gICAgc29tZUZ1bmNcbiAgICAgIDo6IFN0cmluZ1xuICAgICAgLT4gU3RyaW5nXG4gICAgJycnXG4gICAgJycnXG4gICAgc29tZUZ1bmNcbiAgICAgIDo6IGZvcmFsbCByZXMgciAocyA6OiAqIC0+ICopXG4gICAgICAgLiAoIHMgfiBNYXliZVxuICAgICAgICAgLCBNb25hZCBzXG4gICAgICAgICApXG4gICAgICA9PiBFaXRoZXIgcmVzIHJcbiAgICAgIC0+IEVpdGhlciBbcmVzXSBbcl1cbiAgICAnJydcbiAgXVxuICBuZWdhdGl2ZVRvcFNpZ3MgPSBbXG4gICAgIyBUaGlzIG9uZSdzIHN1cHBvc2VkIHRvIGZhaWxcbiAgICAnJydcbiAgICBzb21lRnVuY1xuICAgICAgICA6OiBTdHJpbmdcbiAgICAgLT4gSW50ZWdlclxuICAgICcnJ1xuICBdXG4gIGRvTm90YXRpb25TY29wZWQgPSBbXG4gICAgJycnXG4gICAgZiB4ID0gZG9cbiAgICAgIHN0dWZmIDo6IFN0cmluZyA8LSB4XG4gICAgICByZXR1cm4gKClcbiAgICAnJydcbiAgICAnJydcbiAgICBnIHggPSBkb1xuICAgICAgc3R1ZmZcbiAgICAgICAgOjogU3RyaW5nXG4gICAgICAgIC0+IFN0cmluZyA8LSB4XG4gICAgICByZXR1cm4gKClcbiAgICAnJydcbiAgICAnJydcbiAgICBnIHggPSBkb1xuICAgICAgc3R1ZmZcbiAgICAgICAgOjogU3RyaW5nXG4gICAgICAgIC0+IGEgPC0geFxuICAgICAgcmV0dXJuICgpXG4gICAgJycnXG4gICAgJycnXG4gICAgaCB4ID0gZG9cbiAgICAgIHN0dWZmXG4gICAgICAgIDo6IFN0cmluZ1xuICAgICAgICAtPj4gU3RyaW5nXG4gICAgICAgIC0tPiBJTyBTdHJpbmcgPC0geFxuICAgICAgcmV0dXJuICgpXG4gICAgJycnXG4gIF1cblxuICBkZXNjcmliZSBcIlRvcCBsZXZlbCBzaWduYXR1cmVzXCIsIC0+XG4gICAgdG9wU2lncy5mb3JFYWNoIChleCkgLT5cbiAgICAgIGl0IFwiY29ycmVjdGx5IGdldHMgbGluZSBzY29wZXMgZm9yICN7ZXh9XCIsIC0+XG4gICAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsIGV4XG4gICAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ2lkZW50aWZpZXIuaGFza2VsbCddXS5jb25jYXQoXG4gICAgICAgICAgWzIuLmV4LnNwbGl0KCdcXG4nKS5sZW5ndGhdLm1hcCAtPlxuICAgICAgICAgICAgWydtZXRhLm11bHRpbGluZS50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnXVxuICAgICAgICApXG4gICAgdG9wU2lncy5mb3JFYWNoIChleCkgLT5cbiAgICAgIGRlc2NyaWJlIFwicGFyc2VzICN7ZXh9XCIsIC0+XG4gICAgICAgIHRlc3RCb3RoIGV4LCAoZ3JhbW1hciwgZXgpIC0+XG4gICAgICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgZXhcbiAgICAgICAgICAjIGcudG9IYXZlU2NvcGVzIFtbJ2lkZW50aWZpZXIuaGFza2VsbCddXS5jb25jYXQoXG4gICAgICAgICAgIyAgIFsyLi5leC5zcGxpdCgnXFxuJykubGVuZ3RoXS5tYXAgLT5cbiAgICAgICAgICAjICAgICBbJ21ldGEubXVsdGlsaW5lLnR5cGUtZGVjbGFyYXRpb24uaGFza2VsbCddXG4gICAgICAgICAgIyApXG4gICAgICAgICAgZy50b2tlbnNUb0hhdmVTY29wZXMoXG4gICAgICAgICAgICAnU3RyaW5nJzogWydlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnXVxuICAgICAgICAgICAgJ3NvbWVGdW5jJzogWydpZGVudGlmaWVyLmhhc2tlbGwnXVxuICAgICAgICAgIClcbiAgZGVzY3JpYmUgXCJUb3AgbGV2ZWwgc2lnbmF0dXJlcyBmYWlsdXJlc1wiLCAtPlxuICAgIG5lZ2F0aXZlVG9wU2lncy5mb3JFYWNoIChleCkgLT5cbiAgICAgIGRlc2NyaWJlIFwiZG9lcyBub3QgcGFyc2UgI3tleH1cIiwgLT5cbiAgICAgICAgdGVzdEJvdGggZXgsIChncmFtbWFyLCBleCkgLT5cbiAgICAgICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCBleFxuICAgICAgICAgICMgZy5ub3RUb0hhdmVTY29wZXMgW1snaWRlbnRpZmllci5oYXNrZWxsJ11dLmNvbmNhdChcbiAgICAgICAgICAjICAgWzIuLmV4LnNwbGl0KCdcXG4nKS5sZW5ndGhdLm1hcCAtPlxuICAgICAgICAgICMgICAgIFsnbWV0YS5tdWx0aWxpbmUudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJ11cbiAgICAgICAgICAjIClcbiAgICAgICAgICBnLnRva2Vuc1RvSGF2ZVNjb3BlcyhcbiAgICAgICAgICAgICdTdHJpbmcnOiBbJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCddXG4gICAgICAgICAgICAnc29tZUZ1bmMnOiBbJ2lkZW50aWZpZXIuaGFza2VsbCddXG4gICAgICAgICAgKVxuICAgICAgICAgIGcudG9rZW5zTm90VG9IYXZlU2NvcGVzKCdJbnRlZ2VyJzogWydlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnXSlcbiAgZGVzY3JpYmUgXCJTY29wZWQgZG8gbm90YXRpb24gc2lnbmF0dXJlc1wiLCAtPlxuICAgIGRvTm90YXRpb25TY29wZWQuZm9yRWFjaCAoZXgpIC0+XG4gICAgICBkZXNjcmliZSBcInBhcnNlcyAje2V4fVwiLCAtPlxuICAgICAgICB0ZXN0Qm90aCBleCwgKGdyYW1tYXIsIGV4KSAtPlxuICAgICAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsIGV4XG4gICAgICAgICAgZy50b2tlbnNUb0hhdmVTY29wZXMoXG4gICAgICAgICAgICAnU3RyaW5nJzogWydlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnXVxuICAgICAgICAgICAgJ0lPJzogWydlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnXVxuICAgICAgICAgICAgJ3gnOiBbJ2lkZW50aWZpZXIuaGFza2VsbCddXG4gICAgICAgICAgICAnYSc6IFsndmFyaWFibGUub3RoZXIuZ2VuZXJpYy10eXBlLmhhc2tlbGwnXVxuICAgICAgICAgIClcbiAgICAgICAgICBnLnRva2Vuc05vdFRvSGF2ZVNjb3BlcyhcbiAgICAgICAgICAgICd4JzogWydlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnLCAndmFyaWFibGUub3RoZXIuZ2VuZXJpYy10eXBlLmhhc2tlbGwnXVxuICAgICAgICAgICAgJ2EnOiBbJ2lkZW50aWZpZXIuaGFza2VsbCddXG4gICAgICAgICAgKVxuIl19
