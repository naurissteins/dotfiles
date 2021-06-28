(function() {
  var customMatchers, grammarExpect, ref;

  ref = require('./util'), grammarExpect = ref.grammarExpect, customMatchers = ref.customMatchers;

  describe("Language-Haskell Numbers", function() {
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
    return describe("numbers", function() {
      var testNumbers, testNumbersNeg;
      testNumbers = function(scope, s) {
        var g, i, tokens;
        g = grammarExpect(grammar, s);
        tokens = s.split("\n").map(function(s) {
          return [s];
        });
        g.toHaveTokens(tokens);
        return g.toHaveScopes((function() {
          var j, len, results;
          results = [];
          for (j = 0, len = tokens.length; j < len; j++) {
            i = tokens[j];
            results.push([scope]);
          }
          return results;
        })());
      };
      testNumbersNeg = function(s, scope) {
        var g, i, tokens;
        g = grammarExpect(grammar, s);
        tokens = s.split("\n").map(function(s) {
          return [s];
        });
        return g.notToHaveScopes((function() {
          var j, len, results;
          results = [];
          for (j = 0, len = tokens.length; j < len; j++) {
            i = tokens[j];
            results.push([scope]);
          }
          return results;
        })());
      };
      it("parses decimal integers", function() {
        return testNumbers('constant.numeric.decimal.haskell', '12345\n123_456\n123_45__6');
      });
      it("parses binary integers", function() {
        return testNumbers('constant.numeric.binary.haskell', '0b10010101\n0b1001_0101\n0b100__1_0101');
      });
      it("parses hexadecimal integers", function() {
        return testNumbers('constant.numeric.hexadecimal.haskell', '0xfade145\n0xfad_e145\n0xf__ad_e14_5');
      });
      it("parses octal integers", function() {
        return testNumbers('constant.numeric.octal.haskell', '0o1234567\n0o1_2_3___4_5_6_7');
      });
      it("does not parse invalid decimal integers", function() {
        return testNumbersNeg('constant.numeric.decimal.haskell', '12345a\n123_456a');
      });
      it("does not parse invalid binary integers", function() {
        return testNumbersNeg('constant.numeric.binary.haskell', '0b1001010123\n0b100101_0123');
      });
      it("does not parse invalid hexadecimal integers", function() {
        return testNumbersNeg('constant.numeric.hexadecimal.haskell', '0xfade145z\n0xfade14_5z');
      });
      it("does not parse invalid octal integers", function() {
        return testNumbersNeg('constant.numeric.octal.haskell', '0o12345678\n0o123_45678');
      });
      it("parses floating point numbers", function() {
        return testNumbers('constant.numeric.float.haskell', '1.234\n1e23\n1.23e4\n1E23\n1.23E4\n1.2_34\n1e2_3\n1.23e4\n1_2E2_3\n1.2_3E4');
      });
      return it("parses hexfloat numbers", function() {
        return testNumbers('constant.numeric.hexfloat.haskell', '0x1.234\n0x1p23\n0x1.23p4\n0x1P23\n0x1.23P4\n0xa.Efa\n0xFap23\n0xf.23p4\n0x1P23\n0XaP23\n0X1.23P4\n0xa.E_fa\n0xF_ap2_3\n0xf.2_3p4\n0x1P2_3\n0XaP2_3\n0X1.2_3P4');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NwZWMvbGFuZ3VhZ2UtaGFza2VsbC1udW1iZXJzLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFrQyxPQUFBLENBQVEsUUFBUixDQUFsQyxFQUFDLGlDQUFELEVBQWdCOztFQUVoQixRQUFBLENBQVMsMEJBQVQsRUFBcUMsU0FBQTtBQUNuQyxRQUFBO0lBQUEsT0FBQSxHQUFVO0lBRVYsVUFBQSxDQUFXLFNBQUE7TUFDVCxJQUFDLENBQUEsV0FBRCxDQUFhLGNBQWI7TUFDQSxlQUFBLENBQWdCLFNBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsa0JBQTlCO01BRGMsQ0FBaEI7YUFHQSxJQUFBLENBQUssU0FBQTtlQUNILE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLGdCQUFsQztNQURQLENBQUw7SUFMUyxDQUFYO1dBUUEsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQTtBQUNsQixVQUFBO01BQUEsV0FBQSxHQUFjLFNBQUMsS0FBRCxFQUFRLENBQVI7QUFDWixZQUFBO1FBQUEsQ0FBQSxHQUFJLGFBQUEsQ0FBYyxPQUFkLEVBQXVCLENBQXZCO1FBQ0osTUFBQSxHQUFTLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBUixDQUFhLENBQUMsR0FBZCxDQUFrQixTQUFDLENBQUQ7aUJBQU8sQ0FBQyxDQUFEO1FBQVAsQ0FBbEI7UUFDVCxDQUFDLENBQUMsWUFBRixDQUFlLE1BQWY7ZUFDQSxDQUFDLENBQUMsWUFBRjs7QUFDRTtlQUFBLHdDQUFBOzt5QkFBQSxDQUFDLEtBQUQ7QUFBQTs7WUFERjtNQUpZO01BT2QsY0FBQSxHQUFpQixTQUFDLENBQUQsRUFBSSxLQUFKO0FBQ2YsWUFBQTtRQUFBLENBQUEsR0FBSSxhQUFBLENBQWMsT0FBZCxFQUF1QixDQUF2QjtRQUNKLE1BQUEsR0FBUyxDQUFDLENBQUMsS0FBRixDQUFRLElBQVIsQ0FBYSxDQUFDLEdBQWQsQ0FBa0IsU0FBQyxDQUFEO2lCQUFPLENBQUMsQ0FBRDtRQUFQLENBQWxCO2VBQ1QsQ0FBQyxDQUFDLGVBQUY7O0FBQ0U7ZUFBQSx3Q0FBQTs7eUJBQUEsQ0FBQyxLQUFEO0FBQUE7O1lBREY7TUFIZTtNQU9qQixFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtlQUM1QixXQUFBLENBQVksa0NBQVosRUFBZ0QsMkJBQWhEO01BRDRCLENBQTlCO01BT0EsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUE7ZUFDM0IsV0FBQSxDQUFZLGlDQUFaLEVBQStDLHdDQUEvQztNQUQyQixDQUE3QjtNQU9BLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBO2VBQ2hDLFdBQUEsQ0FBWSxzQ0FBWixFQUFvRCxzQ0FBcEQ7TUFEZ0MsQ0FBbEM7TUFPQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQTtlQUMxQixXQUFBLENBQVksZ0NBQVosRUFBOEMsOEJBQTlDO01BRDBCLENBQTVCO01BTUEsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUE7ZUFDNUMsY0FBQSxDQUFlLGtDQUFmLEVBQW1ELGtCQUFuRDtNQUQ0QyxDQUE5QztNQU1BLEVBQUEsQ0FBRyx3Q0FBSCxFQUE2QyxTQUFBO2VBQzNDLGNBQUEsQ0FBZSxpQ0FBZixFQUFrRCw2QkFBbEQ7TUFEMkMsQ0FBN0M7TUFNQSxFQUFBLENBQUcsNkNBQUgsRUFBa0QsU0FBQTtlQUNoRCxjQUFBLENBQWUsc0NBQWYsRUFBdUQseUJBQXZEO01BRGdELENBQWxEO01BTUEsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUE7ZUFDMUMsY0FBQSxDQUFlLGdDQUFmLEVBQWlELHlCQUFqRDtNQUQwQyxDQUE1QztNQU1BLEVBQUEsQ0FBRywrQkFBSCxFQUFvQyxTQUFBO2VBQ2xDLFdBQUEsQ0FBWSxnQ0FBWixFQUE4Qyw0RUFBOUM7TUFEa0MsQ0FBcEM7YUFjQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtlQUM1QixXQUFBLENBQVksbUNBQVosRUFBaUQsZ0tBQWpEO01BRDRCLENBQTlCO0lBaEZrQixDQUFwQjtFQVhtQyxDQUFyQztBQUZBIiwic291cmNlc0NvbnRlbnQiOlsie2dyYW1tYXJFeHBlY3QsIGN1c3RvbU1hdGNoZXJzfSA9IHJlcXVpcmUgJy4vdXRpbCdcblxuZGVzY3JpYmUgXCJMYW5ndWFnZS1IYXNrZWxsIE51bWJlcnNcIiwgLT5cbiAgZ3JhbW1hciA9IG51bGxcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgQGFkZE1hdGNoZXJzKGN1c3RvbU1hdGNoZXJzKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJsYW5ndWFnZS1oYXNrZWxsXCIpXG5cbiAgICBydW5zIC0+XG4gICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKFwic291cmNlLmhhc2tlbGxcIilcblxuICBkZXNjcmliZSBcIm51bWJlcnNcIiwgLT5cbiAgICB0ZXN0TnVtYmVycyA9IChzY29wZSwgcykgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsIHNcbiAgICAgIHRva2VucyA9IHMuc3BsaXQoXCJcXG5cIikubWFwKChzKSAtPiBbc10pXG4gICAgICBnLnRvSGF2ZVRva2VucyB0b2tlbnNcbiAgICAgIGcudG9IYXZlU2NvcGVzIChcbiAgICAgICAgW3Njb3BlXSBmb3IgaSBpbiB0b2tlbnNcbiAgICAgIClcbiAgICB0ZXN0TnVtYmVyc05lZyA9IChzLCBzY29wZSkgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsIHNcbiAgICAgIHRva2VucyA9IHMuc3BsaXQoXCJcXG5cIikubWFwKChzKSAtPiBbc10pXG4gICAgICBnLm5vdFRvSGF2ZVNjb3BlcyAoXG4gICAgICAgIFtzY29wZV0gZm9yIGkgaW4gdG9rZW5zXG4gICAgICApXG5cbiAgICBpdCBcInBhcnNlcyBkZWNpbWFsIGludGVnZXJzXCIsIC0+XG4gICAgICB0ZXN0TnVtYmVycyAnY29uc3RhbnQubnVtZXJpYy5kZWNpbWFsLmhhc2tlbGwnLCAnJydcbiAgICAgICAgMTIzNDVcbiAgICAgICAgMTIzXzQ1NlxuICAgICAgICAxMjNfNDVfXzZcbiAgICAgICcnJ1xuXG4gICAgaXQgXCJwYXJzZXMgYmluYXJ5IGludGVnZXJzXCIsIC0+XG4gICAgICB0ZXN0TnVtYmVycyAnY29uc3RhbnQubnVtZXJpYy5iaW5hcnkuaGFza2VsbCcsICcnJ1xuICAgICAgICAwYjEwMDEwMTAxXG4gICAgICAgIDBiMTAwMV8wMTAxXG4gICAgICAgIDBiMTAwX18xXzAxMDFcbiAgICAgICcnJ1xuXG4gICAgaXQgXCJwYXJzZXMgaGV4YWRlY2ltYWwgaW50ZWdlcnNcIiwgLT5cbiAgICAgIHRlc3ROdW1iZXJzICdjb25zdGFudC5udW1lcmljLmhleGFkZWNpbWFsLmhhc2tlbGwnLCAnJydcbiAgICAgICAgMHhmYWRlMTQ1XG4gICAgICAgIDB4ZmFkX2UxNDVcbiAgICAgICAgMHhmX19hZF9lMTRfNVxuICAgICAgJycnXG5cbiAgICBpdCBcInBhcnNlcyBvY3RhbCBpbnRlZ2Vyc1wiLCAtPlxuICAgICAgdGVzdE51bWJlcnMgJ2NvbnN0YW50Lm51bWVyaWMub2N0YWwuaGFza2VsbCcsICcnJ1xuICAgICAgICAwbzEyMzQ1NjdcbiAgICAgICAgMG8xXzJfM19fXzRfNV82XzdcbiAgICAgICcnJ1xuXG4gICAgaXQgXCJkb2VzIG5vdCBwYXJzZSBpbnZhbGlkIGRlY2ltYWwgaW50ZWdlcnNcIiwgLT5cbiAgICAgIHRlc3ROdW1iZXJzTmVnICdjb25zdGFudC5udW1lcmljLmRlY2ltYWwuaGFza2VsbCcsICcnJ1xuICAgICAgICAxMjM0NWFcbiAgICAgICAgMTIzXzQ1NmFcbiAgICAgICcnJ1xuXG4gICAgaXQgXCJkb2VzIG5vdCBwYXJzZSBpbnZhbGlkIGJpbmFyeSBpbnRlZ2Vyc1wiLCAtPlxuICAgICAgdGVzdE51bWJlcnNOZWcgJ2NvbnN0YW50Lm51bWVyaWMuYmluYXJ5Lmhhc2tlbGwnLCAnJydcbiAgICAgICAgMGIxMDAxMDEwMTIzXG4gICAgICAgIDBiMTAwMTAxXzAxMjNcbiAgICAgICcnJ1xuXG4gICAgaXQgXCJkb2VzIG5vdCBwYXJzZSBpbnZhbGlkIGhleGFkZWNpbWFsIGludGVnZXJzXCIsIC0+XG4gICAgICB0ZXN0TnVtYmVyc05lZyAnY29uc3RhbnQubnVtZXJpYy5oZXhhZGVjaW1hbC5oYXNrZWxsJywgJycnXG4gICAgICAgIDB4ZmFkZTE0NXpcbiAgICAgICAgMHhmYWRlMTRfNXpcbiAgICAgICcnJ1xuXG4gICAgaXQgXCJkb2VzIG5vdCBwYXJzZSBpbnZhbGlkIG9jdGFsIGludGVnZXJzXCIsIC0+XG4gICAgICB0ZXN0TnVtYmVyc05lZyAnY29uc3RhbnQubnVtZXJpYy5vY3RhbC5oYXNrZWxsJywgJycnXG4gICAgICAgIDBvMTIzNDU2NzhcbiAgICAgICAgMG8xMjNfNDU2NzhcbiAgICAgICcnJ1xuXG4gICAgaXQgXCJwYXJzZXMgZmxvYXRpbmcgcG9pbnQgbnVtYmVyc1wiLCAtPlxuICAgICAgdGVzdE51bWJlcnMgJ2NvbnN0YW50Lm51bWVyaWMuZmxvYXQuaGFza2VsbCcsICcnJ1xuICAgICAgICAxLjIzNFxuICAgICAgICAxZTIzXG4gICAgICAgIDEuMjNlNFxuICAgICAgICAxRTIzXG4gICAgICAgIDEuMjNFNFxuICAgICAgICAxLjJfMzRcbiAgICAgICAgMWUyXzNcbiAgICAgICAgMS4yM2U0XG4gICAgICAgIDFfMkUyXzNcbiAgICAgICAgMS4yXzNFNFxuICAgICAgJycnXG5cbiAgICBpdCBcInBhcnNlcyBoZXhmbG9hdCBudW1iZXJzXCIsIC0+XG4gICAgICB0ZXN0TnVtYmVycyAnY29uc3RhbnQubnVtZXJpYy5oZXhmbG9hdC5oYXNrZWxsJywgJycnXG4gICAgICAgIDB4MS4yMzRcbiAgICAgICAgMHgxcDIzXG4gICAgICAgIDB4MS4yM3A0XG4gICAgICAgIDB4MVAyM1xuICAgICAgICAweDEuMjNQNFxuICAgICAgICAweGEuRWZhXG4gICAgICAgIDB4RmFwMjNcbiAgICAgICAgMHhmLjIzcDRcbiAgICAgICAgMHgxUDIzXG4gICAgICAgIDBYYVAyM1xuICAgICAgICAwWDEuMjNQNFxuICAgICAgICAweGEuRV9mYVxuICAgICAgICAweEZfYXAyXzNcbiAgICAgICAgMHhmLjJfM3A0XG4gICAgICAgIDB4MVAyXzNcbiAgICAgICAgMFhhUDJfM1xuICAgICAgICAwWDEuMl8zUDRcbiAgICAgICcnJ1xuIl19
