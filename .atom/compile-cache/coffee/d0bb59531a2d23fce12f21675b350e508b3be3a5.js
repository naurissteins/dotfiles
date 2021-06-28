(function() {
  var customMatchers, grammarExpect, ref;

  ref = require('./util'), grammarExpect = ref.grammarExpect, customMatchers = ref.customMatchers;

  describe("Language-Haskell", function() {
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
    it("parses the grammar", function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe("source.haskell");
    });
    describe("chars", function() {
      it('tokenizes general chars', function() {
        var char, chars, g, results, scope;
        chars = ['a', '0', '9', 'z', '@', '0', '"'];
        results = [];
        for (scope in chars) {
          char = chars[scope];
          g = grammarExpect(grammar, "'" + char + "'");
          g.toHaveTokens([["'", char, "'"]]);
          g.toHaveScopes([['source.haskell', "string.quoted.single.haskell"]]);
          results.push(g.tokenToHaveScopes([
            {
              0: ['punctuation.definition.string.begin.haskell'],
              2: ['punctuation.definition.string.end.haskell']
            }
          ]));
        }
        return results;
      });
      it('tokenizes escape chars', function() {
        var char, escapeChars, g, results, scope;
        escapeChars = ['\\t', '\\n', '\\\''];
        results = [];
        for (scope in escapeChars) {
          char = escapeChars[scope];
          g = grammarExpect(grammar, "'" + char + "'");
          g.toHaveTokens([["'", char, "'"]]);
          g.toHaveScopes([['source.haskell', "string.quoted.single.haskell"]]);
          results.push(g.tokenToHaveScopes([
            {
              0: ['punctuation.definition.string.begin.haskell'],
              1: ['constant.character.escape.haskell'],
              2: ['punctuation.definition.string.end.haskell']
            }
          ]));
        }
        return results;
      });
      return it('tokenizes control chars', function() {
        var char, escapeChars, g, i, results, results1, scope;
        escapeChars = (function() {
          results = [];
          for (i = 64; i <= 95; i++){ results.push(i); }
          return results;
        }).apply(this).map(function(x) {
          return "\\^" + (String.fromCharCode(x));
        });
        results1 = [];
        for (scope in escapeChars) {
          char = escapeChars[scope];
          g = grammarExpect(grammar, "'" + char + "'");
          g.toHaveTokens([["'", char, "'"]]);
          g.toHaveScopes([['source.haskell', "string.quoted.single.haskell"]]);
          results1.push(g.tokenToHaveScopes([
            {
              1: ["constant.character.escape.control.haskell"]
            }
          ]));
        }
        return results1;
      });
    });
    describe("keywords", function() {
      var controlKeywords, otherKeywords, ref1;
      ref1 = require('../src/include/util'), controlKeywords = ref1.controlKeywords, otherKeywords = ref1.otherKeywords;
      controlKeywords.forEach(function(keyword) {
        return it("tokenizes " + keyword + " as a control keyword", function() {
          var g;
          g = grammarExpect(grammar, keyword);
          g.toHaveTokens([[keyword]]);
          return g.toHaveScopes([["keyword.control." + keyword + ".haskell"]]);
        });
      });
      otherKeywords.forEach(function(keyword) {
        return it("tokenizes " + keyword + " as a keyword", function() {
          var g;
          g = grammarExpect(grammar, keyword);
          g.toHaveTokens([[keyword]]);
          return g.toHaveScopes([["keyword.other." + keyword + ".haskell"]]);
        });
      });
      return ['infix', 'infixl', 'infixr'].forEach(function(keyword) {
        return it("tokenizes " + keyword + " as a keyword", function() {
          var g;
          g = grammarExpect(grammar, keyword);
          g.toHaveTokens([[keyword]]);
          return g.toHaveScopes([["keyword.operator." + keyword + ".haskell"]]);
        });
      });
    });
    describe("Prelude", function() {
      var prelude, test;
      prelude = require('../src/include/prelude');
      test = function(what, template, tokens, scope) {
        return describe(what, function() {
          return prelude[what].forEach(function(x) {
            return it("handles " + what + " " + x, function() {
              var g;
              g = grammarExpect(grammar, template(x));
              g.toHaveTokens([tokens(x)]);
              return g.tokenToHaveScopes([scope(x)]);
            });
          });
        });
      };
      test("classes", function(x) {
        return "func :: " + x + " a => a";
      }, function(x) {
        return ['func', ' ', '::', ' ', x, ' ', 'a', ' ', '=>', ' ', 'a'];
      }, function(x) {
        return {
          4: ["entity.name.type.haskell", "entity.other.inherited-class.prelude." + x + ".haskell"]
        };
      });
      test("funct", function(x) {
        return "" + x;
      }, function(x) {
        return [x];
      }, function(x) {
        return {
          0: ["identifier.haskell", "support.function.prelude." + x + ".haskell"]
        };
      });
      test("constr", function(x) {
        return "" + x;
      }, function(x) {
        return [x];
      }, function(x) {
        return {
          0: ["entity.name.tag.haskell", "support.tag.prelude." + x + ".haskell"]
        };
      });
      return test("types", function(x) {
        return "type Test = " + x;
      }, function(x) {
        return ['type', ' ', 'Test', ' ', '=', ' ', x];
      }, function(x) {
        return {
          6: ["entity.name.type.haskell", "support.class.prelude." + x + ".haskell"]
        };
      });
    });
    describe("identifiers", function() {
      return it('doesnt highlight partial prelude names', function() {
        var g;
        g = grammarExpect(grammar, "top'n'tail");
        g.toHaveScopes([['source.haskell', 'identifier.haskell']]);
        g.toHaveTokens([["top'n'tail"]]);
        return g.tokensToHaveScopes({
          "top'n'tail": ['identifier.haskell']
        });
      });
    });
    describe(':: declarations', function() {
      it('parses newline declarations', function() {
        var g;
        g = grammarExpect(grammar, 'function :: Type -> OtherType');
        g.toHaveScopes([['source.haskell', 'meta.function.type-declaration.haskell']]);
        g.toHaveTokens([['function', ' ', '::', ' ', 'Type', ' ', '->', ' ', 'OtherType']]);
        return g.tokensToHaveScopes({
          'function': ['entity.name.function.haskell'],
          '::': ['keyword.other.double-colon.haskell'],
          'Type': ['entity.name.type.haskell'],
          '->': ['keyword.other.arrow.haskell'],
          'OtherType': ['entity.name.type.haskell']
        });
      });
      it('parses in-line parenthesised declarations', function() {
        var g;
        g = grammarExpect(grammar, 'main = (putStrLn :: String -> IO ()) ("Hello World" :: String)');
        g.toHaveScopes([['source.haskell']]);
        g.toHaveTokens([["main", " ", "=", " ", "(", "putStrLn", " ", "::", " ", "String", " ", "->", " ", "IO", " ", "()", ")", " ", "(", "\"", "Hello World", "\"", " ", "::", " ", "String", ")"]]);
        return g.tokensToHaveScopes({
          "main": ['identifier.haskell'],
          "=": ['keyword.operator.haskell'],
          "putStrLn": ['support.function.prelude.putStrLn.haskell'],
          "::": ['keyword.other.double-colon.haskell'],
          "String": ['entity.name.type.haskell', 'support.class.prelude.String.haskell'],
          "->": ['keyword.other.arrow.haskell'],
          "IO": ['entity.name.type.haskell', 'support.class.prelude.IO.haskell'],
          "()": ['constant.language.unit.haskell'],
          "Hello World": ['string.quoted.double.haskell']
        });
      });
      it('doesnt get confused by quoted ::', function() {
        var g;
        g = grammarExpect(grammar, '("x :: String -> IO ()" ++ var)');
        g.toHaveScopes([['source.haskell']]);
        g.toHaveTokens([["(", "\"", "x :: String -> IO ()", "\"", " ", "++", " ", "var", ")"]]);
        return g.tokensToHaveScopes({
          "x :: String -> IO ()": ['string.quoted.double.haskell'],
          "++": ['keyword.operator.haskell'],
          "var": ['identifier.haskell']
        });
      });
      return it('parses in-line non-parenthesised declarations', function() {
        var g;
        g = grammarExpect(grammar, 'main = putStrLn "Hello World" :: IO ()');
        g.toHaveScopes([['source.haskell']]);
        g.toHaveTokens([['main', ' ', '=', ' ', 'putStrLn', ' ', '"', 'Hello World', '"', ' ', '::', ' ', 'IO', ' ', '()']]);
        g.tokensToHaveScopes({
          'main': ['identifier.haskell'],
          '=': ['keyword.operator.haskell'],
          'putStrLn': ['identifier.haskell', 'support.function.prelude.putStrLn.haskell'],
          '"': ['string.quoted.double.haskell'],
          'Hello World': ['string.quoted.double.haskell'],
          '::': ['keyword.other.double-colon.haskell'],
          'IO': ['meta.type-signature.haskell', 'entity.name.type.haskell', 'support.class.prelude.IO.haskell'],
          '()': ['meta.type-signature.haskell', 'constant.language.unit.haskell']
        });
        return g.tokenToHaveScopes([
          {
            6: ['punctuation.definition.string.begin.haskell'],
            8: ['punctuation.definition.string.end.haskell']
          }
        ]);
      });
    });
    describe("type operators", function() {
      it("parses type operators", function() {
        var data, tokens;
        data = ":: a *** b";
        tokens = grammar.tokenizeLine(data).tokens;
        expect(tokens[4].value).toEqual('***');
        return expect(tokens[4].scopes).toContain('keyword.operator.haskell');
      });
      return it("doesn't confuse arrows and type operators", function() {
        var g;
        g = grammarExpect(grammar, ":: a --> b");
        g.toHaveTokens([['::', ' ', 'a', ' ', '-->', ' ', 'b']]);
        g.toHaveScopes([['source.haskell']]);
        g.tokenToHaveScopes([
          {
            4: ['keyword.operator.haskell', 'meta.type-signature.haskell']
          }
        ]);
        g = grammarExpect(grammar, ":: a ->- b");
        g.toHaveTokens([['::', ' ', 'a', ' ', '->-', ' ', 'b']]);
        g.toHaveScopes([['source.haskell']]);
        g.tokenToHaveScopes([
          {
            4: ['keyword.operator.haskell', 'meta.type-signature.haskell']
          }
        ]);
        g = grammarExpect(grammar, ":: a ==> b");
        g.toHaveTokens([['::', ' ', 'a', ' ', '==>', ' ', 'b']]);
        g.toHaveScopes([['source.haskell']]);
        g.tokenToHaveScopes([
          {
            4: ['keyword.operator.haskell', 'meta.type-signature.haskell']
          }
        ]);
        g = grammarExpect(grammar, ":: a =>= b");
        g.toHaveTokens([['::', ' ', 'a', ' ', '=>=', ' ', 'b']]);
        g.toHaveScopes([['source.haskell']]);
        return g.tokenToHaveScopes([
          {
            4: ['keyword.operator.haskell', 'meta.type-signature.haskell']
          }
        ]);
      });
    });
    describe("comments", function() {
      it("parses block comments", function() {
        var g;
        g = grammarExpect(grammar, "{- this is a block comment -}");
        g.toHaveTokens([['{-', ' this is a block comment ', '-}']]);
        g.toHaveScopes([['source.haskell', 'comment.block.haskell']]);
        return g.tokenToHaveScopes([
          {
            0: ['punctuation.definition.comment.block.start.haskell'],
            2: ['punctuation.definition.comment.block.end.haskell']
          }
        ]);
      });
      it("parses nested block comments", function() {
        var g;
        g = grammarExpect(grammar, "{- this is a {- nested -} block comment -}");
        g.toHaveTokens([['{-', ' this is a ', '{-', ' nested ', '-}', ' block comment ', '-}']]);
        g.toHaveScopes([['source.haskell', 'comment.block.haskell']]);
        return g.tokenToHaveScopes([
          {
            0: ['punctuation.definition.comment.block.start.haskell'],
            2: ['punctuation.definition.comment.block.start.haskell'],
            4: ['punctuation.definition.comment.block.end.haskell'],
            6: ['punctuation.definition.comment.block.end.haskell']
          }
        ]);
      });
      return it("parses pragmas as comments in block comments", function() {
        var g;
        g = grammarExpect(grammar, '{- this is a {-# nested #-} block comment -}');
        g.toHaveTokens([['{-', ' this is a ', '{-', '# nested #', '-}', ' block comment ', '-}']]);
        g.toHaveScopes([['source.haskell', 'comment.block.haskell']]);
        return g.tokenToHaveScopes([
          {
            0: ['punctuation.definition.comment.block.start.haskell'],
            2: ['punctuation.definition.comment.block.start.haskell'],
            4: ['punctuation.definition.comment.block.end.haskell'],
            6: ['punctuation.definition.comment.block.end.haskell']
          }
        ]);
      });
    });
    describe("pragmas", function() {
      it("parses pragmas", function() {
        var g;
        g = grammarExpect(grammar, '{-# LANGUAGE OverloadedStrings #-}');
        g.toHaveTokens([['{-#', ' ', 'LANGUAGE', ' OverloadedStrings ', '#-}']]);
        g.toHaveScopes([['source.haskell', 'meta.preprocessor.haskell']]);
        return g.tokenToHaveScopes([
          {
            2: ['keyword.other.preprocessor.haskell']
          }
        ]);
      });
      it("parses lowercase pragmas", function() {
        var g;
        g = grammarExpect(grammar, '{-# language OverloadedStrings #-}');
        g.toHaveTokens([['{-#', ' ', 'language', ' OverloadedStrings ', '#-}']]);
        g.toHaveScopes([['source.haskell', 'meta.preprocessor.haskell']]);
        return g.tokenToHaveScopes([
          {
            2: ['keyword.other.preprocessor.haskell']
          }
        ]);
      });
      return it("parses mixed case pragmas", function() {
        var g;
        g = grammarExpect(grammar, '{-# lanGuaGE OverloadedStrings #-}');
        g.toHaveTokens([['{-#', ' ', 'lanGuaGE', ' OverloadedStrings ', '#-}']]);
        g.toHaveScopes([['source.haskell', 'meta.preprocessor.haskell']]);
        return g.tokenToHaveScopes([
          {
            2: ['keyword.other.preprocessor.haskell']
          }
        ]);
      });
    });
    describe("instance", function() {
      it("recognizes instances", function() {
        var g;
        g = grammarExpect(grammar, 'instance Class where');
        g.toHaveTokens([['instance', ' ', 'Class', ' ', 'where']]);
        g.toHaveScopes([['source.haskell', 'meta.declaration.instance.haskell']]);
        return g.tokenToHaveScopes([
          {
            1: ['meta.type-signature.haskell'],
            2: ['meta.type-signature.haskell', 'entity.name.type.haskell'],
            3: ['meta.type-signature.haskell'],
            4: ['keyword.other.haskell']
          }
        ]);
      });
      it("recognizes instance pragmas", function() {
        var g, i, len, p, ref1, results;
        ref1 = ['OVERLAPS', 'OVERLAPPING', 'OVERLAPPABLE', 'INCOHERENT'];
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          p = ref1[i];
          g = grammarExpect(grammar, "instance {-# " + p + " #-} Class where");
          g.toHaveTokens([['instance', ' ', '{-#', ' ', p, ' ', '#-}', ' ', 'Class', ' ', 'where']]);
          g.toHaveScopes([['source.haskell', 'meta.declaration.instance.haskell']]);
          results.push(g.tokenToHaveScopes([
            {
              2: ['meta.preprocessor.haskell'],
              3: ['meta.preprocessor.haskell'],
              4: ['meta.preprocessor.haskell', 'keyword.other.preprocessor.haskell'],
              5: ['meta.preprocessor.haskell'],
              6: ['meta.preprocessor.haskell']
            }
          ]));
        }
        return results;
      });
      return it("recognizes lowercase instance pragmas", function() {
        var g, i, len, p, ref1, results;
        ref1 = ['overlaps', 'overlapping', 'overlappable', 'incoherent'];
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          p = ref1[i];
          g = grammarExpect(grammar, "instance {-# " + p + " #-} Class where");
          g.toHaveTokens([['instance', ' ', '{-#', ' ', p, ' ', '#-}', ' ', 'Class', ' ', 'where']]);
          g.toHaveScopes([['source.haskell', 'meta.declaration.instance.haskell']]);
          results.push(g.tokenToHaveScopes([
            {
              2: ['meta.preprocessor.haskell'],
              3: ['meta.preprocessor.haskell'],
              4: ['meta.preprocessor.haskell', 'keyword.other.preprocessor.haskell'],
              5: ['meta.preprocessor.haskell'],
              6: ['meta.preprocessor.haskell']
            }
          ]));
        }
        return results;
      });
    });
    describe("module", function() {
      it("understands module declarations", function() {
        var g;
        g = grammarExpect(grammar, 'module Module where');
        g.toHaveTokens([['module', ' ', 'Module', ' ', 'where']]);
        g.toHaveScopes([['source.haskell', 'meta.declaration.module.haskell']]);
        return g.tokenToHaveScopes([
          {
            2: ['support.other.module.haskell']
          }
        ]);
      });
      it("understands module declarations with exports", function() {
        var g;
        g = grammarExpect(grammar, 'module Module (export1, export2) where');
        g.toHaveTokens([['module', ' ', 'Module', ' ', '(', 'export1', ',', ' ', 'export2', ')', ' ', 'where']]);
        g.toHaveScopes([['source.haskell', 'meta.declaration.module.haskell']]);
        return g.tokenToHaveScopes([
          {
            2: ['support.other.module.haskell'],
            5: ['meta.declaration.exports.haskell', 'entity.name.function.haskell'],
            8: ['meta.declaration.exports.haskell', 'entity.name.function.haskell']
          }
        ]);
      });
      it("understands module declarations with operator exports", function() {
        var g;
        g = grammarExpect(grammar, 'module Module ((<|>), export2) where');
        g.toHaveTokens([['module', ' ', 'Module', ' ', '(', '(<|>)', ',', ' ', 'export2', ')', ' ', 'where']]);
        g.toHaveScopes([['source.haskell', 'meta.declaration.module.haskell']]);
        return g.tokenToHaveScopes([
          {
            2: ['support.other.module.haskell'],
            5: ['meta.declaration.exports.haskell', 'entity.name.function.operator.haskell'],
            8: ['meta.declaration.exports.haskell', 'entity.name.function.haskell']
          }
        ]);
      });
      return it("understands module declarations with export lists", function() {
        var g;
        g = grammarExpect(grammar, 'module Module (export1 (..), export2 (Something)) where');
        g.toHaveTokens([['module', ' ', 'Module', ' ', '(', 'export1', ' ', '(', '..', ')', ',', ' ', 'export2', ' ', '(', 'Something', ')', ')', ' ', 'where']]);
        g.toHaveScopes([['source.haskell', 'meta.declaration.module.haskell']]);
        return g.tokenToHaveScopes([
          {
            2: ['support.other.module.haskell'],
            5: ['meta.declaration.exports.haskell', 'entity.name.function.haskell'],
            8: ['meta.declaration.exports.haskell', 'meta.other.constructor-list.haskell', 'keyword.operator.wildcard.haskell'],
            12: ['meta.declaration.exports.haskell', 'entity.name.function.haskell'],
            15: ['meta.declaration.exports.haskell', 'meta.other.constructor-list.haskell', 'entity.name.tag.haskell']
          }
        ]);
      });
    });
    describe("regression test for comments after module name in imports", function() {
      return it("parses comments after module names", function() {
        var g;
        g = grammarExpect(grammar, 'import Module -- comment');
        g.toHaveTokens([['import', ' ', 'Module', ' ', '--', ' comment']]);
        g.toHaveScopes([['source.haskell', 'meta.import.haskell']]);
        return g.tokenToHaveScopes([
          {
            2: ['support.other.module.haskell'],
            4: ['comment.line.double-dash.haskell', 'punctuation.definition.comment.haskell'],
            5: ['comment.line.double-dash.haskell']
          }
        ]);
      });
    });
    return describe("quasiqotes", function() {
      it("parses unqualified quasiquotes", function() {
        var g;
        g = grammarExpect(grammar, '[q| do maybe String|]');
        g.toHaveTokens([['[', 'q', '|', ' do maybe String', '|', ']']]);
        g.toHaveScopes([['source.haskell']]);
        return g.tokenToHaveScopes([
          {
            0: ['punctuation.definition.quasiquotes.begin.haskell'],
            1: ['entity.name.tag.haskell'],
            3: ['quoted.quasiquotes.qq-q.haskell'],
            5: ['punctuation.definition.quasiquotes.end.haskell']
          }
        ]);
      });
      return it("parses qualified quasiquotes", function() {
        var g;
        g = grammarExpect(grammar, '[Some.Module.Name.q| do maybe String|]');
        g.toHaveTokens([['[', 'Some.Module.Name.', 'q', '|', ' do maybe String', '|', ']']]);
        g.toHaveScopes([['source.haskell']]);
        return g.tokenToHaveScopes([
          {
            0: ['punctuation.definition.quasiquotes.begin.haskell'],
            1: ['entity.name.tag.haskell', 'support.other.module.haskell'],
            2: ['entity.name.tag.haskell'],
            4: ['quoted.quasiquotes.qq-q.haskell'],
            6: ['punctuation.definition.quasiquotes.end.haskell']
          }
        ]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NwZWMvbGFuZ3VhZ2UtaGFza2VsbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBa0MsT0FBQSxDQUFRLFFBQVIsQ0FBbEMsRUFBQyxpQ0FBRCxFQUFnQjs7RUFFaEIsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7QUFDM0IsUUFBQTtJQUFBLE9BQUEsR0FBVTtJQUVWLFVBQUEsQ0FBVyxTQUFBO01BQ1QsSUFBQyxDQUFBLFdBQUQsQ0FBYSxjQUFiO01BQ0EsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGtCQUE5QjtNQURjLENBQWhCO2FBR0EsSUFBQSxDQUFLLFNBQUE7ZUFDSCxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBZCxDQUFrQyxnQkFBbEM7TUFEUCxDQUFMO0lBTFMsQ0FBWDtJQVFBLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBO01BQ3ZCLE1BQUEsQ0FBTyxPQUFQLENBQWUsQ0FBQyxVQUFoQixDQUFBO2FBQ0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxTQUFmLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsZ0JBQS9CO0lBRnVCLENBQXpCO0lBSUEsUUFBQSxDQUFTLE9BQVQsRUFBa0IsU0FBQTtNQUNoQixFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtBQUM1QixZQUFBO1FBQUEsS0FBQSxHQUFRLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CO0FBRVI7YUFBQSxjQUFBOztVQUNFLENBQUEsR0FBSSxhQUFBLENBQWMsT0FBZCxFQUF1QixHQUFBLEdBQUksSUFBSixHQUFTLEdBQWhDO1VBQ0osQ0FBQyxD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O1FBQ0osQ0FBQyxDQUFDLFlBQUYsQ0FBZSxDQUFDLENBQUMsR0FBRCxFQUFNLG1CQUFOLEVBQTJCLEdBQTNCLEVBQWdDLEdBQWhDLEVBQXFDLGtCQUFyQyxFQUF5RCxHQUF6RCxFQUE4RCxHQUE5RCxDQUFELENBQWY7UUFDQSxDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxDQUFELENBQWY7ZUFDQSxDQUFDLENBQUMsaUJBQUYsQ0FBb0I7VUFDbEI7WUFBQSxDQUFBLEVBQUcsQ0FBQyxrREFBRCxDQUFIO1lBQ0EsQ0FBQSxFQUFHLENBQUMseUJBQUQsRUFBNEIsOEJBQTVCLENBREg7WUFFQSxDQUFBLEVBQUcsQ0FBQyx5QkFBRCxDQUZIO1lBR0EsQ0FBQSxFQUFHLENBQUMsaUNBQUQsQ0FISDtZQUlBLENBQUEsRUFBRyxDQUFDLGdEQUFELENBSkg7V0FEa0I7U0FBcEI7TUFKaUMsQ0FBbkM7SUFacUIsQ0FBdkI7RUE1VTJCLENBQTdCO0FBRkEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z3JhbW1hckV4cGVjdCwgY3VzdG9tTWF0Y2hlcnN9ID0gcmVxdWlyZSAnLi91dGlsJ1xuXG5kZXNjcmliZSBcIkxhbmd1YWdlLUhhc2tlbGxcIiwgLT5cbiAgZ3JhbW1hciA9IG51bGxcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgQGFkZE1hdGNoZXJzKGN1c3RvbU1hdGNoZXJzKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJsYW5ndWFnZS1oYXNrZWxsXCIpXG5cbiAgICBydW5zIC0+XG4gICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKFwic291cmNlLmhhc2tlbGxcIilcblxuICBpdCBcInBhcnNlcyB0aGUgZ3JhbW1hclwiLCAtPlxuICAgIGV4cGVjdChncmFtbWFyKS50b0JlVHJ1dGh5KClcbiAgICBleHBlY3QoZ3JhbW1hci5zY29wZU5hbWUpLnRvQmUgXCJzb3VyY2UuaGFza2VsbFwiXG5cbiAgZGVzY3JpYmUgXCJjaGFyc1wiLCAtPlxuICAgIGl0ICd0b2tlbml6ZXMgZ2VuZXJhbCBjaGFycycsIC0+XG4gICAgICBjaGFycyA9IFsnYScsICcwJywgJzknLCAneicsICdAJywgJzAnLCAnXCInXVxuXG4gICAgICBmb3Igc2NvcGUsIGNoYXIgb2YgY2hhcnNcbiAgICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgXCInI3tjaGFyfSdcIlxuICAgICAgICBnLnRvSGF2ZVRva2VucyBbW1wiJ1wiLCBjaGFyLCBcIidcIl1dXG4gICAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJywgXCJzdHJpbmcucXVvdGVkLnNpbmdsZS5oYXNrZWxsXCJdXVxuICAgICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtcbiAgICAgICAgICAwOiBbJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmJlZ2luLmhhc2tlbGwnXVxuICAgICAgICAgIDI6IFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuZW5kLmhhc2tlbGwnXVxuICAgICAgICBdXG5cbiAgICBpdCAndG9rZW5pemVzIGVzY2FwZSBjaGFycycsIC0+XG4gICAgICBlc2NhcGVDaGFycyA9IFsnXFxcXHQnLCAnXFxcXG4nLCAnXFxcXFxcJyddXG4gICAgICBmb3Igc2NvcGUsIGNoYXIgb2YgZXNjYXBlQ2hhcnNcbiAgICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgXCInI3tjaGFyfSdcIlxuICAgICAgICBnLnRvSGF2ZVRva2VucyBbW1wiJ1wiLCBjaGFyLCBcIidcIl1dXG4gICAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJywgXCJzdHJpbmcucXVvdGVkLnNpbmdsZS5oYXNrZWxsXCJdXVxuICAgICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtcbiAgICAgICAgICAwOiBbJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmJlZ2luLmhhc2tlbGwnXVxuICAgICAgICAgIDE6IFsnY29uc3RhbnQuY2hhcmFjdGVyLmVzY2FwZS5oYXNrZWxsJ11cbiAgICAgICAgICAyOiBbJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZC5oYXNrZWxsJ11cbiAgICAgICAgXVxuICAgIGl0ICd0b2tlbml6ZXMgY29udHJvbCBjaGFycycsIC0+XG4gICAgICBlc2NhcGVDaGFycyA9IFs2NC4uOTVdLm1hcCAoeCkgLT4gXCJcXFxcXiN7U3RyaW5nLmZyb21DaGFyQ29kZSh4KX1cIlxuICAgICAgZm9yIHNjb3BlLCBjaGFyIG9mIGVzY2FwZUNoYXJzXG4gICAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsIFwiJyN7Y2hhcn0nXCJcbiAgICAgICAgZy50b0hhdmVUb2tlbnMgW1tcIidcIiwgY2hhciwgXCInXCJdXVxuICAgICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsIFwic3RyaW5nLnF1b3RlZC5zaW5nbGUuaGFza2VsbFwiXV1cbiAgICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbMTogW1wiY29uc3RhbnQuY2hhcmFjdGVyLmVzY2FwZS5jb250cm9sLmhhc2tlbGxcIl1dXG5cbiAgZGVzY3JpYmUgXCJrZXl3b3Jkc1wiLCAtPlxuICAgIHsgY29udHJvbEtleXdvcmRzLCBvdGhlcktleXdvcmRzIH0gPSByZXF1aXJlICcuLi9zcmMvaW5jbHVkZS91dGlsJ1xuXG4gICAgY29udHJvbEtleXdvcmRzLmZvckVhY2ggKGtleXdvcmQpIC0+XG4gICAgICBpdCBcInRva2VuaXplcyAje2tleXdvcmR9IGFzIGEgY29udHJvbCBrZXl3b3JkXCIsIC0+XG4gICAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsIGtleXdvcmRcbiAgICAgICAgZy50b0hhdmVUb2tlbnMgW1trZXl3b3JkXV1cbiAgICAgICAgZy50b0hhdmVTY29wZXMgW1tcImtleXdvcmQuY29udHJvbC4je2tleXdvcmR9Lmhhc2tlbGxcIl1dXG5cbiAgICBvdGhlcktleXdvcmRzLmZvckVhY2ggKGtleXdvcmQpIC0+XG4gICAgICBpdCBcInRva2VuaXplcyAje2tleXdvcmR9IGFzIGEga2V5d29yZFwiLCAtPlxuICAgICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCBrZXl3b3JkXG4gICAgICAgIGcudG9IYXZlVG9rZW5zIFtba2V5d29yZF1dXG4gICAgICAgIGcudG9IYXZlU2NvcGVzIFtbXCJrZXl3b3JkLm90aGVyLiN7a2V5d29yZH0uaGFza2VsbFwiXV1cblxuICAgIFsnaW5maXgnLCAnaW5maXhsJywgJ2luZml4ciddLmZvckVhY2ggKGtleXdvcmQpIC0+XG4gICAgICBpdCBcInRva2VuaXplcyAje2tleXdvcmR9IGFzIGEga2V5d29yZFwiLCAtPlxuICAgICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCBrZXl3b3JkXG4gICAgICAgIGcudG9IYXZlVG9rZW5zIFtba2V5d29yZF1dXG4gICAgICAgIGcudG9IYXZlU2NvcGVzIFtbXCJrZXl3b3JkLm9wZXJhdG9yLiN7a2V5d29yZH0uaGFza2VsbFwiXV1cblxuICBkZXNjcmliZSBcIlByZWx1ZGVcIiwgLT5cbiAgICBwcmVsdWRlID0gcmVxdWlyZSAnLi4vc3JjL2luY2x1ZGUvcHJlbHVkZSdcbiAgICAjIGNsYXNzZXMsZnVuY3QsY29uc3RyLHR5cGVzLG9wZXJhdG9yc1xuICAgIHRlc3QgPSAod2hhdCwgdGVtcGxhdGUsIHRva2Vucywgc2NvcGUpIC0+XG4gICAgICBkZXNjcmliZSB3aGF0LCAtPlxuICAgICAgICBwcmVsdWRlW3doYXRdLmZvckVhY2ggKHgpIC0+XG4gICAgICAgICAgaXQgXCJoYW5kbGVzICN7d2hhdH0gI3t4fVwiLCAtPlxuICAgICAgICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgdGVtcGxhdGUoeClcbiAgICAgICAgICAgIGcudG9IYXZlVG9rZW5zIFt0b2tlbnMoeCldXG4gICAgICAgICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtzY29wZSh4KV1cbiAgICB0ZXN0IFwiY2xhc3Nlc1wiLFxuICAgICAgKHgpIC0+IFwiZnVuYyA6OiAje3h9IGEgPT4gYVwiLFxuICAgICAgKHgpIC0+IFsnZnVuYycsICcgJywgJzo6JywgJyAnLCB4LCAnICcsICdhJywgJyAnLCAnPT4nLCAnICcsICdhJ11cbiAgICAgICh4KSAtPiA0OiBbXCJlbnRpdHkubmFtZS50eXBlLmhhc2tlbGxcIiwgXCJlbnRpdHkub3RoZXIuaW5oZXJpdGVkLWNsYXNzLnByZWx1ZGUuI3t4fS5oYXNrZWxsXCJdXG4gICAgdGVzdCBcImZ1bmN0XCIsXG4gICAgICAoeCkgLT4gXCIje3h9XCIsXG4gICAgICAoeCkgLT4gW3hdXG4gICAgICAoeCkgLT4gMDogW1wiaWRlbnRpZmllci5oYXNrZWxsXCIsIFwic3VwcG9ydC5mdW5jdGlvbi5wcmVsdWRlLiN7eH0uaGFza2VsbFwiXVxuICAgIHRlc3QgXCJjb25zdHJcIixcbiAgICAgICh4KSAtPiBcIiN7eH1cIixcbiAgICAgICh4KSAtPiBbeF1cbiAgICAgICh4KSAtPiAwOiBbXCJlbnRpdHkubmFtZS50YWcuaGFza2VsbFwiLCBcInN1cHBvcnQudGFnLnByZWx1ZGUuI3t4fS5oYXNrZWxsXCJdXG4gICAgdGVzdCBcInR5cGVzXCIsXG4gICAgICAoeCkgLT4gXCJ0eXBlIFRlc3QgPSAje3h9XCIsXG4gICAgICAoeCkgLT4gWyd0eXBlJywgJyAnLCAnVGVzdCcsICcgJywgJz0nLCAnICcsIHhdXG4gICAgICAoeCkgLT4gNjogW1wiZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsXCIsIFwic3VwcG9ydC5jbGFzcy5wcmVsdWRlLiN7eH0uaGFza2VsbFwiXVxuICAgICMgb3BlcmF0b3JzIGFyZSBoYW5kbGVkIHNlcGFyYXRlbHlcblxuICBkZXNjcmliZSBcImlkZW50aWZpZXJzXCIsIC0+XG4gICAgaXQgJ2RvZXNudCBoaWdobGlnaHQgcGFydGlhbCBwcmVsdWRlIG5hbWVzJywgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsIFwidG9wJ24ndGFpbFwiKVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnaWRlbnRpZmllci5oYXNrZWxsJ11dXG4gICAgICBnLnRvSGF2ZVRva2VucyBbW1widG9wJ24ndGFpbFwiXV1cbiAgICAgIGcudG9rZW5zVG9IYXZlU2NvcGVzIHtcbiAgICAgICAgXCJ0b3Anbid0YWlsXCI6IFsnaWRlbnRpZmllci5oYXNrZWxsJ11cbiAgICAgIH1cblxuICBkZXNjcmliZSAnOjogZGVjbGFyYXRpb25zJywgLT5cbiAgICBpdCAncGFyc2VzIG5ld2xpbmUgZGVjbGFyYXRpb25zJywgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsICdmdW5jdGlvbiA6OiBUeXBlIC0+IE90aGVyVHlwZScpXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdtZXRhLmZ1bmN0aW9uLnR5cGUtZGVjbGFyYXRpb24uaGFza2VsbCddXVxuICAgICAgZy50b0hhdmVUb2tlbnMgW1sgJ2Z1bmN0aW9uJywgJyAnLCAnOjonLCAnICcsICdUeXBlJywgJyAnLCAnLT4nLCAnICcsICdPdGhlclR5cGUnIF1dXG4gICAgICBnLnRva2Vuc1RvSGF2ZVNjb3BlcyB7XG4gICAgICAgICdmdW5jdGlvbic6IFsnZW50aXR5Lm5hbWUuZnVuY3Rpb24uaGFza2VsbCddXG4gICAgICAgICc6Oic6IFsna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCddXG4gICAgICAgICdUeXBlJzogWydlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnXVxuICAgICAgICAnLT4nOiBbJ2tleXdvcmQub3RoZXIuYXJyb3cuaGFza2VsbCddXG4gICAgICAgICdPdGhlclR5cGUnOiBbJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCddXG4gICAgICB9XG5cbiAgICBpdCAncGFyc2VzIGluLWxpbmUgcGFyZW50aGVzaXNlZCBkZWNsYXJhdGlvbnMnLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QoZ3JhbW1hciwgJ21haW4gPSAocHV0U3RyTG4gOjogU3RyaW5nIC0+IElPICgpKSAoXCJIZWxsbyBXb3JsZFwiIDo6IFN0cmluZyknKVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbXG4gICAgICAgICAgXCJtYWluXCIsIFwiIFwiLCBcIj1cIiwgXCIgXCIsIFwiKFwiLCBcInB1dFN0ckxuXCIsIFwiIFwiLCBcIjo6XCIsIFwiIFwiLCBcIlN0cmluZ1wiLCBcIiBcIixcbiAgICAgICAgICBcIi0+XCIsIFwiIFwiLCBcIklPXCIsIFwiIFwiLCBcIigpXCIsIFwiKVwiLCBcIiBcIiwgXCIoXCIsIFwiXFxcIlwiLCBcIkhlbGxvIFdvcmxkXCIsIFwiXFxcIlwiLFxuICAgICAgICAgIFwiIFwiLCBcIjo6XCIsIFwiIFwiLCBcIlN0cmluZ1wiLCBcIilcIlxuICAgICAgICBdXVxuICAgICAgZy50b2tlbnNUb0hhdmVTY29wZXMge1xuICAgICAgICBcIm1haW5cIiA6IFsnaWRlbnRpZmllci5oYXNrZWxsJ11cbiAgICAgICAgXCI9XCIgOiBbJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCddXG4gICAgICAgIFwicHV0U3RyTG5cIiA6IFsnc3VwcG9ydC5mdW5jdGlvbi5wcmVsdWRlLnB1dFN0ckxuLmhhc2tlbGwnIF1cbiAgICAgICAgXCI6OlwiIDogWydrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ11cbiAgICAgICAgXCJTdHJpbmdcIiA6IFsnZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsJywgJ3N1cHBvcnQuY2xhc3MucHJlbHVkZS5TdHJpbmcuaGFza2VsbCddXG4gICAgICAgIFwiLT5cIiA6IFsna2V5d29yZC5vdGhlci5hcnJvdy5oYXNrZWxsJ11cbiAgICAgICAgXCJJT1wiIDogWydlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnLCAnc3VwcG9ydC5jbGFzcy5wcmVsdWRlLklPLmhhc2tlbGwnXVxuICAgICAgICBcIigpXCIgOiBbJ2NvbnN0YW50Lmxhbmd1YWdlLnVuaXQuaGFza2VsbCcgXVxuICAgICAgICBcIkhlbGxvIFdvcmxkXCIgOiBbJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnXVxuICAgICAgfVxuXG4gICAgaXQgJ2RvZXNudCBnZXQgY29uZnVzZWQgYnkgcXVvdGVkIDo6JywgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsICcoXCJ4IDo6IFN0cmluZyAtPiBJTyAoKVwiICsrIHZhciknKVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbIFwiKFwiLCBcIlxcXCJcIiwgXCJ4IDo6IFN0cmluZyAtPiBJTyAoKVwiLCBcIlxcXCJcIiwgXCIgXCIsIFwiKytcIiwgXCIgXCIsIFwidmFyXCIsIFwiKVwiXV1cbiAgICAgIGcudG9rZW5zVG9IYXZlU2NvcGVzIHtcbiAgICAgICAgXCJ4IDo6IFN0cmluZyAtPiBJTyAoKVwiIDogWydzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJ11cbiAgICAgICAgXCIrK1wiIDogWydrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnXVxuICAgICAgICBcInZhclwiIDogWydpZGVudGlmaWVyLmhhc2tlbGwnXVxuICAgICAgfVxuXG4gICAgaXQgJ3BhcnNlcyBpbi1saW5lIG5vbi1wYXJlbnRoZXNpc2VkIGRlY2xhcmF0aW9ucycsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdChncmFtbWFyLCAnbWFpbiA9IHB1dFN0ckxuIFwiSGVsbG8gV29ybGRcIiA6OiBJTyAoKScpXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgZy50b0hhdmVUb2tlbnMgW1tcbiAgICAgICAgJ21haW4nLCAnICcsICc9JywgJyAnLCAncHV0U3RyTG4nLCAnICcsICdcIicsICdIZWxsbyBXb3JsZCcsICdcIicsICcgJywgJzo6JywgJyAnLCAnSU8nLCAnICcsICcoKSdcbiAgICAgIF1dXG4gICAgICBnLnRva2Vuc1RvSGF2ZVNjb3BlcyB7XG4gICAgICAgICdtYWluJyA6IFsgJ2lkZW50aWZpZXIuaGFza2VsbCcgXVxuICAgICAgICAnPScgOiBbICdrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnIF1cbiAgICAgICAgJ3B1dFN0ckxuJyA6IFsgJ2lkZW50aWZpZXIuaGFza2VsbCcsICdzdXBwb3J0LmZ1bmN0aW9uLnByZWx1ZGUucHV0U3RyTG4uaGFza2VsbCcgXVxuICAgICAgICAnXCInIDogWyAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaGFza2VsbCcgXVxuICAgICAgICAnSGVsbG8gV29ybGQnIDogWyAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaGFza2VsbCcgXVxuICAgICAgICAnOjonIDogWyAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCcgXVxuICAgICAgICAnSU8nIDogWyAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcsICdzdXBwb3J0LmNsYXNzLnByZWx1ZGUuSU8uaGFza2VsbCcgXVxuICAgICAgICAnKCknIDogWyAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2NvbnN0YW50Lmxhbmd1YWdlLnVuaXQuaGFza2VsbCcgXVxuICAgICAgfVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbXG4gICAgICAgIDY6IFsgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmJlZ2luLmhhc2tlbGwnIF1cbiAgICAgICAgODogWyAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuZW5kLmhhc2tlbGwnIF1cbiAgICAgIF1cblxuICBkZXNjcmliZSBcInR5cGUgb3BlcmF0b3JzXCIsIC0+XG4gICAgaXQgXCJwYXJzZXMgdHlwZSBvcGVyYXRvcnNcIiwgLT5cbiAgICAgIGRhdGEgPSBcIjo6IGEgKioqIGJcIlxuICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShkYXRhKVxuICAgICAgZXhwZWN0KHRva2Vuc1s0XS52YWx1ZSkudG9FcXVhbCAnKioqJ1xuICAgICAgZXhwZWN0KHRva2Vuc1s0XS5zY29wZXMpLnRvQ29udGFpbiAna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJ1xuICAgIGl0IFwiZG9lc24ndCBjb25mdXNlIGFycm93cyBhbmQgdHlwZSBvcGVyYXRvcnNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsIFwiOjogYSAtLT4gYlwiKVxuICAgICAgZy50b0hhdmVUb2tlbnMgW1snOjonLCAnICcsICdhJywgJyAnLCAnLS0+JywgJyAnLCAnYiddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgWzQ6IFsna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCddXVxuXG4gICAgICBnID0gZ3JhbW1hckV4cGVjdChncmFtbWFyLCBcIjo6IGEgLT4tIGJcIilcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJzo6JywgJyAnLCAnYScsICcgJywgJy0+LScsICcgJywgJ2InXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFs0OiBbJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCcsICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXV1cblxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QoZ3JhbW1hciwgXCI6OiBhID09PiBiXCIpXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWyc6OicsICcgJywgJ2EnLCAnICcsICc9PT4nLCAnICcsICdiJ11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbNDogWydrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ11dXG5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsIFwiOjogYSA9Pj0gYlwiKVxuICAgICAgZy50b0hhdmVUb2tlbnMgW1snOjonLCAnICcsICdhJywgJyAnLCAnPT49JywgJyAnLCAnYiddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgWzQ6IFsna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCddXVxuXG4gIGRlc2NyaWJlIFwiY29tbWVudHNcIiwgLT5cbiAgICBpdCBcInBhcnNlcyBibG9jayBjb21tZW50c1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgXCJ7LSB0aGlzIGlzIGEgYmxvY2sgY29tbWVudCAtfVwiXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWyd7LScsICcgdGhpcyBpcyBhIGJsb2NrIGNvbW1lbnQgJywgJy19J11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdjb21tZW50LmJsb2NrLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1xuICAgICAgICAwOiBbJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5ibG9jay5zdGFydC5oYXNrZWxsJ11cbiAgICAgICAgMjogWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suZW5kLmhhc2tlbGwnXVxuICAgICAgXVxuXG4gICAgaXQgXCJwYXJzZXMgbmVzdGVkIGJsb2NrIGNvbW1lbnRzXCIsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCBcInstIHRoaXMgaXMgYSB7LSBuZXN0ZWQgLX0gYmxvY2sgY29tbWVudCAtfVwiXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWyd7LScsICcgdGhpcyBpcyBhICcsICd7LScsICcgbmVzdGVkICcsICctfScsICcgYmxvY2sgY29tbWVudCAnLCAnLX0nXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJywgJ2NvbW1lbnQuYmxvY2suaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbXG4gICAgICAgIDA6IFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLnN0YXJ0Lmhhc2tlbGwnXVxuICAgICAgICAyOiBbJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5ibG9jay5zdGFydC5oYXNrZWxsJ11cbiAgICAgICAgNDogWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suZW5kLmhhc2tlbGwnXVxuICAgICAgICA2OiBbJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5ibG9jay5lbmQuaGFza2VsbCddXG4gICAgICBdXG5cbiAgICBpdCBcInBhcnNlcyBwcmFnbWFzIGFzIGNvbW1lbnRzIGluIGJsb2NrIGNvbW1lbnRzXCIsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCAney0gdGhpcyBpcyBhIHstIyBuZXN0ZWQgIy19IGJsb2NrIGNvbW1lbnQgLX0nXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWyd7LScsICcgdGhpcyBpcyBhICcsICd7LScsICcjIG5lc3RlZCAjJywgJy19JywgJyBibG9jayBjb21tZW50ICcsICctfSddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnY29tbWVudC5ibG9jay5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtcbiAgICAgICAgMDogWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suc3RhcnQuaGFza2VsbCddXG4gICAgICAgIDI6IFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLnN0YXJ0Lmhhc2tlbGwnXVxuICAgICAgICA0OiBbJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5ibG9jay5lbmQuaGFza2VsbCddXG4gICAgICAgIDY6IFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLmVuZC5oYXNrZWxsJ11cbiAgICAgIF1cblxuICBkZXNjcmliZSBcInByYWdtYXNcIiwgLT5cbiAgICBpdCBcInBhcnNlcyBwcmFnbWFzXCIsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCAney0jIExBTkdVQUdFIE92ZXJsb2FkZWRTdHJpbmdzICMtfSdcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJ3stIycsICcgJywgJ0xBTkdVQUdFJywgJyBPdmVybG9hZGVkU3RyaW5ncyAnLCAnIy19J11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdtZXRhLnByZXByb2Nlc3Nvci5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFsyOiBbJ2tleXdvcmQub3RoZXIucHJlcHJvY2Vzc29yLmhhc2tlbGwnXV1cblxuICAgIGl0IFwicGFyc2VzIGxvd2VyY2FzZSBwcmFnbWFzXCIsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCAney0jIGxhbmd1YWdlIE92ZXJsb2FkZWRTdHJpbmdzICMtfSdcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJ3stIycsICcgJywgJ2xhbmd1YWdlJywgJyBPdmVybG9hZGVkU3RyaW5ncyAnLCAnIy19J11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdtZXRhLnByZXByb2Nlc3Nvci5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFsyOiBbJ2tleXdvcmQub3RoZXIucHJlcHJvY2Vzc29yLmhhc2tlbGwnXV1cblxuICAgIGl0IFwicGFyc2VzIG1peGVkIGNhc2UgcHJhZ21hc1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgJ3stIyBsYW5HdWFHRSBPdmVybG9hZGVkU3RyaW5ncyAjLX0nXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWyd7LSMnLCAnICcsICdsYW5HdWFHRScsICcgT3ZlcmxvYWRlZFN0cmluZ3MgJywgJyMtfSddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5wcmVwcm9jZXNzb3IuaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbMjogWydrZXl3b3JkLm90aGVyLnByZXByb2Nlc3Nvci5oYXNrZWxsJ11dXG5cbiAgZGVzY3JpYmUgXCJpbnN0YW5jZVwiLCAtPlxuICAgIGl0IFwicmVjb2duaXplcyBpbnN0YW5jZXNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsICdpbnN0YW5jZSBDbGFzcyB3aGVyZSdcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJ2luc3RhbmNlJywgJyAnLCAnQ2xhc3MnLCAnICcsICd3aGVyZSddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi5pbnN0YW5jZS5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtcbiAgICAgICAgMTogWydtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXVxuICAgICAgICAyOiBbJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnXVxuICAgICAgICAzOiBbJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCddXG4gICAgICAgIDQ6IFsna2V5d29yZC5vdGhlci5oYXNrZWxsJ11cbiAgICAgIF1cbiAgICBpdCBcInJlY29nbml6ZXMgaW5zdGFuY2UgcHJhZ21hc1wiLCAtPlxuICAgICAgZm9yIHAgaW4gWyAnT1ZFUkxBUFMnLCAnT1ZFUkxBUFBJTkcnLCAnT1ZFUkxBUFBBQkxFJywgJ0lOQ09IRVJFTlQnIF1cbiAgICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgXCJpbnN0YW5jZSB7LSMgI3twfSAjLX0gQ2xhc3Mgd2hlcmVcIlxuICAgICAgICBnLnRvSGF2ZVRva2VucyBbWydpbnN0YW5jZScsICcgJywgJ3stIycsICcgJywgcCwgJyAnLCAnIy19JywgJyAnLCAnQ2xhc3MnLCAnICcsICd3aGVyZSddXVxuICAgICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLmluc3RhbmNlLmhhc2tlbGwnXV1cbiAgICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbXG4gICAgICAgICAgMjogWydtZXRhLnByZXByb2Nlc3Nvci5oYXNrZWxsJ11cbiAgICAgICAgICAzOiBbJ21ldGEucHJlcHJvY2Vzc29yLmhhc2tlbGwnXVxuICAgICAgICAgIDQ6IFsnbWV0YS5wcmVwcm9jZXNzb3IuaGFza2VsbCcsICdrZXl3b3JkLm90aGVyLnByZXByb2Nlc3Nvci5oYXNrZWxsJ11cbiAgICAgICAgICA1OiBbJ21ldGEucHJlcHJvY2Vzc29yLmhhc2tlbGwnXVxuICAgICAgICAgIDY6IFsnbWV0YS5wcmVwcm9jZXNzb3IuaGFza2VsbCddXG4gICAgICAgIF1cblxuICAgIGl0IFwicmVjb2duaXplcyBsb3dlcmNhc2UgaW5zdGFuY2UgcHJhZ21hc1wiLCAtPlxuICAgICAgZm9yIHAgaW4gWyAnb3ZlcmxhcHMnLCAnb3ZlcmxhcHBpbmcnLCAnb3ZlcmxhcHBhYmxlJywgJ2luY29oZXJlbnQnIF1cbiAgICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgXCJpbnN0YW5jZSB7LSMgI3twfSAjLX0gQ2xhc3Mgd2hlcmVcIlxuICAgICAgICBnLnRvSGF2ZVRva2VucyBbWydpbnN0YW5jZScsICcgJywgJ3stIycsICcgJywgcCwgJyAnLCAnIy19JywgJyAnLCAnQ2xhc3MnLCAnICcsICd3aGVyZSddXVxuICAgICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLmluc3RhbmNlLmhhc2tlbGwnXV1cbiAgICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbXG4gICAgICAgICAgMjogWydtZXRhLnByZXByb2Nlc3Nvci5oYXNrZWxsJ11cbiAgICAgICAgICAzOiBbJ21ldGEucHJlcHJvY2Vzc29yLmhhc2tlbGwnXVxuICAgICAgICAgIDQ6IFsnbWV0YS5wcmVwcm9jZXNzb3IuaGFza2VsbCcsICdrZXl3b3JkLm90aGVyLnByZXByb2Nlc3Nvci5oYXNrZWxsJ11cbiAgICAgICAgICA1OiBbJ21ldGEucHJlcHJvY2Vzc29yLmhhc2tlbGwnXVxuICAgICAgICAgIDY6IFsnbWV0YS5wcmVwcm9jZXNzb3IuaGFza2VsbCddXG4gICAgICAgIF1cbiAgZGVzY3JpYmUgXCJtb2R1bGVcIiwgLT5cbiAgICBpdCBcInVuZGVyc3RhbmRzIG1vZHVsZSBkZWNsYXJhdGlvbnNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsICdtb2R1bGUgTW9kdWxlIHdoZXJlJ1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1snbW9kdWxlJywgJyAnLCAnTW9kdWxlJywgJyAnLCAnd2hlcmUnXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24ubW9kdWxlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgWzI6IFsnc3VwcG9ydC5vdGhlci5tb2R1bGUuaGFza2VsbCddXVxuICAgIGl0IFwidW5kZXJzdGFuZHMgbW9kdWxlIGRlY2xhcmF0aW9ucyB3aXRoIGV4cG9ydHNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsICdtb2R1bGUgTW9kdWxlIChleHBvcnQxLCBleHBvcnQyKSB3aGVyZSdcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJ21vZHVsZScsICcgJywgJ01vZHVsZScsICcgJywgJygnLCAnZXhwb3J0MScsICcsJywgJyAnLCAnZXhwb3J0MicsICcpJywgJyAnLCAnd2hlcmUnXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24ubW9kdWxlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1xuICAgICAgICAyOiBbJ3N1cHBvcnQub3RoZXIubW9kdWxlLmhhc2tlbGwnXVxuICAgICAgICA1OiBbJ21ldGEuZGVjbGFyYXRpb24uZXhwb3J0cy5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLmhhc2tlbGwnXVxuICAgICAgICA4OiBbJ21ldGEuZGVjbGFyYXRpb24uZXhwb3J0cy5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLmhhc2tlbGwnXVxuICAgICAgXVxuICAgIGl0IFwidW5kZXJzdGFuZHMgbW9kdWxlIGRlY2xhcmF0aW9ucyB3aXRoIG9wZXJhdG9yIGV4cG9ydHNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsICdtb2R1bGUgTW9kdWxlICgoPHw+KSwgZXhwb3J0Mikgd2hlcmUnXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWydtb2R1bGUnLCAnICcsICdNb2R1bGUnLCAnICcsICcoJywgJyg8fD4pJywgJywnLCAnICcsICdleHBvcnQyJywgJyknLCAnICcsICd3aGVyZSddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi5tb2R1bGUuaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbXG4gICAgICAgIDI6IFsnc3VwcG9ydC5vdGhlci5tb2R1bGUuaGFza2VsbCddXG4gICAgICAgIDU6IFsnbWV0YS5kZWNsYXJhdGlvbi5leHBvcnRzLmhhc2tlbGwnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24ub3BlcmF0b3IuaGFza2VsbCddXG4gICAgICAgIDg6IFsnbWV0YS5kZWNsYXJhdGlvbi5leHBvcnRzLmhhc2tlbGwnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24uaGFza2VsbCddXG4gICAgICBdXG4gICAgaXQgXCJ1bmRlcnN0YW5kcyBtb2R1bGUgZGVjbGFyYXRpb25zIHdpdGggZXhwb3J0IGxpc3RzXCIsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCAnbW9kdWxlIE1vZHVsZSAoZXhwb3J0MSAoLi4pLCBleHBvcnQyIChTb21ldGhpbmcpKSB3aGVyZSdcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJ21vZHVsZScsICcgJywgJ01vZHVsZScsICcgJywgJygnLCAnZXhwb3J0MScsICcgJywgJygnICwgJy4uJywgJyknLFxuICAgICAgICAgICAgICAgICAgICAgICAnLCcsICcgJywgJ2V4cG9ydDInLCAnICcsICcoJywgJ1NvbWV0aGluZycsICcpJywgJyknLCAnICcsICd3aGVyZSddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi5tb2R1bGUuaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbXG4gICAgICAgIDI6IFsnc3VwcG9ydC5vdGhlci5tb2R1bGUuaGFza2VsbCddXG4gICAgICAgIDU6IFsnbWV0YS5kZWNsYXJhdGlvbi5leHBvcnRzLmhhc2tlbGwnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24uaGFza2VsbCddXG4gICAgICAgIDg6IFsnbWV0YS5kZWNsYXJhdGlvbi5leHBvcnRzLmhhc2tlbGwnLCAnbWV0YS5vdGhlci5jb25zdHJ1Y3Rvci1saXN0Lmhhc2tlbGwnLFxuICAgICAgICAgICAgICdrZXl3b3JkLm9wZXJhdG9yLndpbGRjYXJkLmhhc2tlbGwnXVxuICAgICAgICAxMjogWydtZXRhLmRlY2xhcmF0aW9uLmV4cG9ydHMuaGFza2VsbCcsICdlbnRpdHkubmFtZS5mdW5jdGlvbi5oYXNrZWxsJ11cbiAgICAgICAgMTU6IFsnbWV0YS5kZWNsYXJhdGlvbi5leHBvcnRzLmhhc2tlbGwnLCAnbWV0YS5vdGhlci5jb25zdHJ1Y3Rvci1saXN0Lmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnZW50aXR5Lm5hbWUudGFnLmhhc2tlbGwnXVxuICAgICAgXVxuICBkZXNjcmliZSBcInJlZ3Jlc3Npb24gdGVzdCBmb3IgY29tbWVudHMgYWZ0ZXIgbW9kdWxlIG5hbWUgaW4gaW1wb3J0c1wiLCAtPlxuICAgIGl0IFwicGFyc2VzIGNvbW1lbnRzIGFmdGVyIG1vZHVsZSBuYW1lc1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgJ2ltcG9ydCBNb2R1bGUgLS0gY29tbWVudCdcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJ2ltcG9ydCcsICcgJywgJ01vZHVsZScsICcgJywgJy0tJywgJyBjb21tZW50J11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdtZXRhLmltcG9ydC5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtcbiAgICAgICAgMjogWydzdXBwb3J0Lm90aGVyLm1vZHVsZS5oYXNrZWxsJ11cbiAgICAgICAgNDogWydjb21tZW50LmxpbmUuZG91YmxlLWRhc2guaGFza2VsbCcsICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuaGFza2VsbCddXG4gICAgICAgIDU6IFsnY29tbWVudC5saW5lLmRvdWJsZS1kYXNoLmhhc2tlbGwnXVxuICAgICAgXVxuXG4gIGRlc2NyaWJlIFwicXVhc2lxb3Rlc1wiLCAtPlxuICAgIGl0IFwicGFyc2VzIHVucXVhbGlmaWVkIHF1YXNpcXVvdGVzXCIsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCAnW3F8IGRvIG1heWJlIFN0cmluZ3xdJ1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1snWycsICdxJywgJ3wnLCAnIGRvIG1heWJlIFN0cmluZycsICd8JywgJ10nXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtcbiAgICAgICAgMDogWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpcXVvdGVzLmJlZ2luLmhhc2tlbGwnXVxuICAgICAgICAxOiBbJ2VudGl0eS5uYW1lLnRhZy5oYXNrZWxsJ11cbiAgICAgICAgMzogWydxdW90ZWQucXVhc2lxdW90ZXMucXEtcS5oYXNrZWxsJ11cbiAgICAgICAgNTogWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpcXVvdGVzLmVuZC5oYXNrZWxsJ11cbiAgICAgIF1cblxuICAgIGl0IFwicGFyc2VzIHF1YWxpZmllZCBxdWFzaXF1b3Rlc1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgJ1tTb21lLk1vZHVsZS5OYW1lLnF8IGRvIG1heWJlIFN0cmluZ3xdJ1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1snWycsICdTb21lLk1vZHVsZS5OYW1lLicsICdxJywgJ3wnLCAnIGRvIG1heWJlIFN0cmluZycsICd8JywgJ10nXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtcbiAgICAgICAgMDogWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpcXVvdGVzLmJlZ2luLmhhc2tlbGwnXVxuICAgICAgICAxOiBbJ2VudGl0eS5uYW1lLnRhZy5oYXNrZWxsJywgJ3N1cHBvcnQub3RoZXIubW9kdWxlLmhhc2tlbGwnXVxuICAgICAgICAyOiBbJ2VudGl0eS5uYW1lLnRhZy5oYXNrZWxsJ11cbiAgICAgICAgNDogWydxdW90ZWQucXVhc2lxdW90ZXMucXEtcS5oYXNrZWxsJ11cbiAgICAgICAgNjogWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpcXVvdGVzLmVuZC5oYXNrZWxsJ11cbiAgICAgIF1cbiJdfQ==
