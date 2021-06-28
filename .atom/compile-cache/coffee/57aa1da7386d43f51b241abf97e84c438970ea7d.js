(function() {
  var grammarTest, sep;

  grammarTest = require('atom-grammar-test');

  sep = require('path').sep;

  describe('Fixture-based grammar tests', function() {
    var ftest, test;
    beforeEach(function() {
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-haskell');
      });
    });
    test = function(name, file, desc) {
      if (desc == null) {
        desc = describe;
      }
      return desc(name, function() {
        return grammarTest("" + __dirname + sep + "fixture" + sep + file);
      });
    };
    ftest = function(name, file) {
      return test(name, file, fdescribe);
    };
    test('Haskell', 'general.hs');
    test('Liquid Haskell', 'liquidhaskell.hs');
    test('Record syntax', 'record.hs');
    test('Identifiers', 'identifiers.hs');
    test('GADTs', 'gadt.hs');
    test('Multiline signatures', 'multilineSignatures.hs');
    test('Signatures', 'signatures.hs');
    test('Type families', 'typeFamilies.hs');
    test('Deriving strategy', 'deriveStrategy.hs');
    return test('Char Kind', 'charKind.hs');
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NwZWMvZ3JhbW1hci10ZXN0LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLG1CQUFSOztFQUNiLE1BQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVIsUUFBQSxDQUFTLDZCQUFULEVBQXdDLFNBQUE7QUFFdEMsUUFBQTtJQUFBLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGtCQUE5QjtNQURjLENBQWhCO0lBRFMsQ0FBWDtJQUlBLElBQUEsR0FBTyxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsSUFBYjs7UUFBYSxPQUFPOzthQUN6QixJQUFBLENBQUssSUFBTCxFQUFXLFNBQUE7ZUFBRyxXQUFBLENBQVksRUFBQSxHQUFHLFNBQUgsR0FBZSxHQUFmLEdBQW1CLFNBQW5CLEdBQTRCLEdBQTVCLEdBQWtDLElBQTlDO01BQUgsQ0FBWDtJQURLO0lBRVAsS0FBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLElBQVA7YUFBZ0IsSUFBQSxDQUFLLElBQUwsRUFBVyxJQUFYLEVBQWlCLFNBQWpCO0lBQWhCO0lBRVIsSUFBQSxDQUFLLFNBQUwsRUFBZ0IsWUFBaEI7SUFDQSxJQUFBLENBQUssZ0JBQUwsRUFBdUIsa0JBQXZCO0lBQ0EsSUFBQSxDQUFLLGVBQUwsRUFBc0IsV0FBdEI7SUFDQSxJQUFBLENBQUssYUFBTCxFQUFvQixnQkFBcEI7SUFDQSxJQUFBLENBQUssT0FBTCxFQUFjLFNBQWQ7SUFDQSxJQUFBLENBQUssc0JBQUwsRUFBNkIsd0JBQTdCO0lBQ0EsSUFBQSxDQUFLLFlBQUwsRUFBbUIsZUFBbkI7SUFDQSxJQUFBLENBQUssZUFBTCxFQUFzQixpQkFBdEI7SUFDQSxJQUFBLENBQUssbUJBQUwsRUFBMEIsbUJBQTFCO1dBQ0EsSUFBQSxDQUFLLFdBQUwsRUFBa0IsYUFBbEI7RUFuQnNDLENBQXhDO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJncmFtbWFyVGVzdCA9IHJlcXVpcmUgJ2F0b20tZ3JhbW1hci10ZXN0J1xue3NlcH0gPSByZXF1aXJlICdwYXRoJ1xuXG5kZXNjcmliZSAnRml4dHVyZS1iYXNlZCBncmFtbWFyIHRlc3RzJywgLT5cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSAnbGFuZ3VhZ2UtaGFza2VsbCdcblxuICB0ZXN0ID0gKG5hbWUsIGZpbGUsIGRlc2MgPSBkZXNjcmliZSkgLT5cbiAgICBkZXNjIG5hbWUsIC0+IGdyYW1tYXJUZXN0KFwiI3tfX2Rpcm5hbWV9I3tzZXB9Zml4dHVyZSN7c2VwfSN7ZmlsZX1cIilcbiAgZnRlc3QgPSAobmFtZSwgZmlsZSkgLT4gdGVzdChuYW1lLCBmaWxlLCBmZGVzY3JpYmUpXG5cbiAgdGVzdCAnSGFza2VsbCcsICdnZW5lcmFsLmhzJ1xuICB0ZXN0ICdMaXF1aWQgSGFza2VsbCcsICdsaXF1aWRoYXNrZWxsLmhzJ1xuICB0ZXN0ICdSZWNvcmQgc3ludGF4JywgJ3JlY29yZC5ocydcbiAgdGVzdCAnSWRlbnRpZmllcnMnLCAnaWRlbnRpZmllcnMuaHMnXG4gIHRlc3QgJ0dBRFRzJywgJ2dhZHQuaHMnXG4gIHRlc3QgJ011bHRpbGluZSBzaWduYXR1cmVzJywgJ211bHRpbGluZVNpZ25hdHVyZXMuaHMnXG4gIHRlc3QgJ1NpZ25hdHVyZXMnLCAnc2lnbmF0dXJlcy5ocydcbiAgdGVzdCAnVHlwZSBmYW1pbGllcycsICd0eXBlRmFtaWxpZXMuaHMnXG4gIHRlc3QgJ0Rlcml2aW5nIHN0cmF0ZWd5JywgJ2Rlcml2ZVN0cmF0ZWd5LmhzJ1xuICB0ZXN0ICdDaGFyIEtpbmQnLCAnY2hhcktpbmQuaHMnXG4iXX0=
