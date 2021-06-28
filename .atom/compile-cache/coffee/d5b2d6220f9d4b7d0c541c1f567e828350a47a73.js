(function() {
  "$ curl https://raw.githubusercontent.com/twilson63/cakefile-template/master/Cakefile > ../Cakefile\n\n$ cd .. && coffee -c -o lib src/main.coffee\n$ cd .. && npm version minor\n$ cd .. && git comm\n$ cd .. && cake build";
  var GrammarCreator, include, makeGrammar;

  GrammarCreator = (function() {
    function GrammarCreator(grammar1, print1) {
      this.grammar = grammar1;
      this.print = print1 != null ? print1 : false;
    }

    GrammarCreator.prototype.process = function() {
      var CSON, G, all_done, fs, grammar, i, k, len, macros, n, name, pats, print, ref, ref1, ref2, v;
      grammar = this.grammar;
      print = this.print;
      G = {};
      ref = ["comment", "fileTypes", "firstLineMatch", "keyEquivalent", "name", "scopeName", "injectionSelector"];
      for (i = 0, len = ref.length; i < len; i++) {
        n = ref[i];
        if (grammar[n] != null) {
          G[n] = grammar[n];
        }
      }
      this.autoAppendScopeName = grammar.autoAppendScopeName, this.macros = grammar.macros;
      if (typeof this.autoAppendScopeName === "undefined") {
        this.autoAppendScopeName = true;
      }
      if (typeof this.macros === "undefined") {
        this.macros = {};
      }
      this.grammarScopeName = G.scopeName.replace(/.*\./, '');
      this.hasGrammarScopeName = new RegExp("\\." + this.grammarScopeName + "$");
      macros = this.macros;
      for (k in macros) {
        v = macros[k];
        if (v instanceof RegExp) {
          macros[k] = v.source;
        }
      }
      for (k in macros) {
        v = macros[k];
        macros[k] = this.resolveMacros(v);
      }
      while (true) {
        all_done = true;
        for (k in macros) {
          v = macros[k];
          macros[k] = this.resolveMacros(v);
          if (/\{[a-zA-Z_]\w*\}/.test(macros[k])) {
            all_done = false;
            if (v === macros[k]) {
              all_done = true;
            }
          }
        }
        if (all_done) {
          break;
        }
      }
      name = grammar['name'];
      ref1 = this.makePattern(grammar);
      for (k in ref1) {
        v = ref1[k];
        G[k] = v;
      }
      G['name'] = name;
      if (grammar.repository != null) {
        G.repository = {};
        ref2 = grammar.repository;
        for (k in ref2) {
          v = ref2[k];
          pats = this.makePattern(v, macros);
          if ((pats.begin != null) || (pats.match != null)) {
            pats = {
              "patterns": [pats]
            };
          } else if (pats instanceof Array) {
            pats = {
              "patterns": pats
            };
          }
          G.repository[k] = pats;
        }
      }
      if (print) {
        if (print.match(/\.cson$/)) {
          CSON = require("season");
          fs = require("fs");
          fs.writeFileSync(print, CSON.stringify(G));
        } else if (print.match(/\.json$/)) {
          fs.writeFileSync(print, JSON.stringify(G, null, "    "));
        } else if (print === "CSON") {
          CSON = require("season");
          process.stdout.write(CSON.stringify(G));
        } else {
          process.stdout.write(JSON.stringify(G, null, "    "));
        }
      }
      return G;
    };

    GrammarCreator.prototype.resolveMacros = function(regex) {
      var macros;
      if (regex instanceof RegExp) {
        regex = regex.source;
      }
      macros = this.macros;
      return regex.replace(/\{\w+\}/g, function(mob) {
        var s;
        s = mob.slice(1, -1);
        if (typeof macros[s] !== "undefined") {
          return macros[s];
        } else {
          return mob;
        }
      });
    };

    GrammarCreator.prototype.makeScopeName = function(name) {
      name = this.resolveMacros(name);
      if (this.autoAppendScopeName) {
        if (!this.hasGrammarScopeName.test(name)) {
          return name + "." + this.grammarScopeName;
        }
      }
      return name;
    };

    GrammarCreator.prototype.makePattern = function(pattern) {
      var P, c, ck, cv, k, p, pat, v;
      pat = pattern;
      P = {};
      if (typeof pattern === "string") {
        P.include = pattern;
        return P;
      }
      if (pattern instanceof Array) {
        return (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = pattern.length; i < len; i++) {
            p = pattern[i];
            results.push(this.makePattern(p));
          }
          return results;
        }).call(this);
      }
      for (k in pat) {
        v = pat[k];
        switch (k) {
          case "N":
          case "contentName":
            P.contentName = this.makeScopeName(v);
            break;
          case "i":
          case "include":
            P.include = v;
            break;
          case "n":
          case "name":
            P.name = this.makeScopeName(v);
            break;
          case "m":
          case "match":
            P.match = this.resolveMacros(v);
            break;
          case "b":
          case "begin":
            P.begin = this.resolveMacros(v);
            break;
          case "e":
          case "end":
            P.end = this.resolveMacros(v);
            break;
          case "c":
          case "captures":
          case "beginCaptures":
            if (P.begin != null) {
              P.beginCaptures = c = {};
            } else {
              P.captures = c = {};
            }
            if (typeof v === "string") {
              c[0] = {
                name: this.makeScopeName(v)
              };
            } else {
              for (ck in v) {
                cv = v[ck];
                if (typeof cv !== "string") {
                  c[ck] = this.makePattern(cv);
                } else {
                  c[ck] = {
                    name: this.makeScopeName(cv)
                  };
                }
              }
            }
            break;
          case "C":
          case "endCaptures":
            P.endCaptures = c = {};
            if (typeof v === "string") {
              c[0] = {
                name: this.makeScopeName(v)
              };
            } else {
              for (ck in v) {
                cv = v[ck];
                if (typeof cv !== "string") {
                  c[ck] = this.makePattern(cv);
                } else {
                  c[ck] = {
                    name: this.makeScopeName(cv)
                  };
                }
              }
            }
            break;
          case "p":
          case "patterns":
            if (!(v instanceof Array)) {
              v = [v];
            }
            P.patterns = (function() {
              var i, len, results;
              results = [];
              for (i = 0, len = v.length; i < len; i++) {
                p = v[i];
                results.push(this.makePattern(p));
              }
              return results;
            }).call(this);
            break;
          case "L":
          case "applyEndPatternLast":
            P.applyEndPatternLast = v;
            break;
          default:
            P[k] = v;
        }
      }
      return P;
    };

    return GrammarCreator;

  })();

  makeGrammar = function(print, grammar) {
    var grammar_;
    grammar_ = (require('clone'))(grammar);
    return (new GrammarCreator(grammar_, print)).process();
  };

  include = function(what) {
    return require("./include/" + what);
  };

  module.exports = {
    makeGrammar: makeGrammar,
    include: include
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NyYy9zeW50YXgtdG9vbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBOztFQVdNO0lBQ1Msd0JBQUMsUUFBRCxFQUFXLE1BQVg7TUFBQyxJQUFDLENBQUEsVUFBRDtNQUFVLElBQUMsQ0FBQSx5QkFBRCxTQUFTO0lBQXBCOzs2QkFFYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBO01BQ1gsS0FBQSxHQUFRLElBQUMsQ0FBQTtNQUNULENBQUEsR0FBSTtBQUVKO0FBQUEsV0FBQSxxQ0FBQTs7UUFDRSxJQUFxQixrQkFBckI7VUFBQSxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sT0FBUSxDQUFBLENBQUEsRUFBZjs7QUFERjtNQUdDLElBQUMsQ0FBQSw4QkFBQSxtQkFBRixFQUF1QixJQUFDLENBQUEsaUJBQUE7TUFFeEIsSUFBK0IsT0FBTyxJQUFDLENBQUEsbUJBQVIsS0FBK0IsV0FBOUQ7UUFBQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsS0FBdkI7O01BQ0EsSUFBZ0IsT0FBTyxJQUFDLENBQUEsTUFBUixLQUFrQixXQUFsQztRQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsR0FBVjs7TUFDQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFaLENBQW9CLE1BQXBCLEVBQTRCLEVBQTVCO01BRXBCLElBQUMsQ0FBQSxtQkFBRCxHQUF1QixJQUFJLE1BQUosQ0FBVyxLQUFBLEdBQU0sSUFBQyxDQUFBLGdCQUFQLEdBQXdCLEdBQW5DO01BRXZCLE1BQUEsR0FBUyxJQUFDLENBQUE7QUFHVixXQUFBLFdBQUE7O1FBQ0UsSUFBRyxDQUFBLFlBQWEsTUFBaEI7VUFDRSxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVksQ0FB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QXdDTyxHQXhDUDtBQUFBLGVBd0NZLFVBeENaO1lBeUNJLElBQUEsQ0FBQSxDQUFPLENBQUEsWUFBYSxLQUFwQixDQUFBO2NBQ0UsQ0FBQSxHQUFJLENBQUUsQ0FBRixFQUROOztZQUVBLENBQUMsQ0FBQyxRQUFGOztBQUFjO21CQUFBLG1DQUFBOzs2QkFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLENBQWI7QUFBQTs7O0FBSE47QUF4Q1osZUE2Q08sR0E3Q1A7QUFBQSxlQTZDWSxxQkE3Q1o7WUE4Q0ksQ0FBQyxDQUFDLG1CQUFGLEdBQXdCO0FBRGhCO0FBN0NaO1lBaURJLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTztBQWpEWDtBQURGO2FBb0RBO0lBL0RXOzs7Ozs7RUFpRWYsV0FBQSxHQUFjLFNBQUMsS0FBRCxFQUFRLE9BQVI7QUFDWixRQUFBO0lBQUEsUUFBQSxHQUFXLENBQUMsT0FBQSxDQUFRLE9BQVIsQ0FBRCxDQUFBLENBQWtCLE9BQWxCO1dBQ1gsQ0FBQyxJQUFJLGNBQUosQ0FBbUIsUUFBbkIsRUFBNkIsS0FBN0IsQ0FBRCxDQUFvQyxDQUFDLE9BQXJDLENBQUE7RUFGWTs7RUFJZCxPQUFBLEdBQVUsU0FBQyxJQUFEO1dBQVUsT0FBQSxDQUFRLFlBQUEsR0FBYSxJQUFyQjtFQUFWOztFQUdWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQUUsYUFBQSxXQUFGO0lBQWUsU0FBQSxPQUFmOztBQXZNakIiLCJzb3VyY2VzQ29udGVudCI6WyJcIlwiXCJcbiQgY3VybCBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vdHdpbHNvbjYzL2Nha2VmaWxlLXRlbXBsYXRlL21hc3Rlci9DYWtlZmlsZSA+IC4uL0Nha2VmaWxlXG5cbiQgY2QgLi4gJiYgY29mZmVlIC1jIC1vIGxpYiBzcmMvbWFpbi5jb2ZmZWVcbiQgY2QgLi4gJiYgbnBtIHZlcnNpb24gbWlub3JcbiQgY2QgLi4gJiYgZ2l0IGNvbW1cbiQgY2QgLi4gJiYgY2FrZSBidWlsZFxuXCJcIlwiXG5cbiMgVHJhbnNmb3JtcyBhbiBlYXN5IGdyYW1tYXIgc3BlY2lmaWNhdGlvbiBvYmplY3QgaW50byBhIHRtTGFuZ3VhZ2UgZ3JhbW1hclxuIyBzcGVjaWZpY2F0aW9uIG9iamVjdC5cbmNsYXNzIEdyYW1tYXJDcmVhdG9yXG4gIGNvbnN0cnVjdG9yOiAoQGdyYW1tYXIsIEBwcmludCA9IGZhbHNlKSAtPlxuXG4gIHByb2Nlc3M6IC0+XG4gICAgZ3JhbW1hciA9IEBncmFtbWFyXG4gICAgcHJpbnQgPSBAcHJpbnRcbiAgICBHID0ge31cblxuICAgIGZvciBuIGluIFsgXCJjb21tZW50XCIsIFwiZmlsZVR5cGVzXCIsIFwiZmlyc3RMaW5lTWF0Y2hcIiwgXCJrZXlFcXVpdmFsZW50XCIsIFwibmFtZVwiLCBcInNjb3BlTmFtZVwiLCBcImluamVjdGlvblNlbGVjdG9yXCIgXVxuICAgICAgR1tuXSA9IGdyYW1tYXJbbl0gaWYgZ3JhbW1hcltuXT9cblxuICAgIHtAYXV0b0FwcGVuZFNjb3BlTmFtZSwgQG1hY3Jvc30gPSBncmFtbWFyXG5cbiAgICBAYXV0b0FwcGVuZFNjb3BlTmFtZSA9IHRydWUgaWYgdHlwZW9mIEBhdXRvQXBwZW5kU2NvcGVOYW1lIGlzIFwidW5kZWZpbmVkXCJcbiAgICBAbWFjcm9zID0ge30gaWYgdHlwZW9mIEBtYWNyb3MgaXMgXCJ1bmRlZmluZWRcIlxuICAgIEBncmFtbWFyU2NvcGVOYW1lID0gRy5zY29wZU5hbWUucmVwbGFjZSAvLipcXC4vLCAnJ1xuXG4gICAgQGhhc0dyYW1tYXJTY29wZU5hbWUgPSBuZXcgUmVnRXhwIFwiXFxcXC4je0BncmFtbWFyU2NvcGVOYW1lfSRcIlxuXG4gICAgbWFjcm9zID0gQG1hY3Jvc1xuXG4gICAgIyBtYWtlIHJlZ2V4ZXMgdG8gc3RyaW5nc1xuICAgIGZvciBrLHYgb2YgbWFjcm9zXG4gICAgICBpZiB2IGluc3RhbmNlb2YgUmVnRXhwXG4gICAgICAgIG1hY3Jvc1trXSA9IHYuc291cmNlXG5cbiAgICAjIHJlc29sdmUgbWFjcm9zXG4gICAgZm9yIGssdiBvZiBtYWNyb3NcbiAgICAgIG1hY3Jvc1trXSA9IEByZXNvbHZlTWFjcm9zKHYpXG5cbiAgICBsb29wXG4gICAgICBhbGxfZG9uZSA9IHRydWVcbiAgICAgIGZvciBrLHYgb2YgbWFjcm9zXG4gICAgICAgIG1hY3Jvc1trXSA9IEByZXNvbHZlTWFjcm9zKHYpXG5cbiAgICAgICAgaWYgL1xce1thLXpBLVpfXVxcdypcXH0vLnRlc3QobWFjcm9zW2tdKVxuICAgICAgICAgIGFsbF9kb25lID0gZmFsc2VcbiAgICAgICAgICBpZiB2ID09IG1hY3Jvc1trXVxuICAgICAgICAgICAgYWxsX2RvbmUgPSB0cnVlXG4gICAgICAgICAgICAjIHRocm93IFwidW5yZXNvbHZlZCBtYWNybyBpbiAje3Z9XCJcblxuICAgICAgaWYgYWxsX2RvbmVcbiAgICAgICAgYnJlYWtcblxuICAgIG5hbWUgPSBncmFtbWFyWyduYW1lJ11cbiAgICBmb3Igayx2IG9mIEBtYWtlUGF0dGVybihncmFtbWFyKVxuICAgICAgR1trXSA9IHZcblxuICAgIEdbJ25hbWUnXSA9IG5hbWVcblxuICAgIGlmIGdyYW1tYXIucmVwb3NpdG9yeT9cbiAgICAgIEcucmVwb3NpdG9yeSA9IHt9XG4gICAgICBmb3Igayx2IG9mIGdyYW1tYXIucmVwb3NpdG9yeVxuICAgICAgICBwYXRzID0gQG1ha2VQYXR0ZXJuKHYsIG1hY3JvcylcbiAgICAgICAgaWYgcGF0cy5iZWdpbj8gb3IgcGF0cy5tYXRjaD9cbiAgICAgICAgICBwYXRzID0geyBcInBhdHRlcm5zXCI6IFsgcGF0cyBdIH1cbiAgICAgICAgZWxzZSBpZiBwYXRzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICBwYXRzID0geyBcInBhdHRlcm5zXCI6IHBhdHMgfVxuXG4gICAgICAgIEcucmVwb3NpdG9yeVtrXSA9IHBhdHNcblxuICAgIGlmIHByaW50XG4gICAgICBpZiBwcmludC5tYXRjaCAvXFwuY3NvbiQvXG4gICAgICAgIENTT04gPSByZXF1aXJlIFwic2Vhc29uXCJcbiAgICAgICAgZnMgICA9IHJlcXVpcmUgXCJmc1wiXG5cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyBwcmludCwgQ1NPTi5zdHJpbmdpZnkoRylcblxuICAgICAgZWxzZSBpZiBwcmludC5tYXRjaCAvXFwuanNvbiQvXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMgcHJpbnQsIEpTT04uc3RyaW5naWZ5KEcsIG51bGwsIFwiICAgIFwiKVxuXG4gICAgICBlbHNlIGlmIHByaW50ID09IFwiQ1NPTlwiXG4gICAgICAgIENTT04gPSByZXF1aXJlIFwic2Vhc29uXCJcbiAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUgQ1NPTi5zdHJpbmdpZnkoRylcblxuICAgICAgZWxzZVxuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSBKU09OLnN0cmluZ2lmeShHLCBudWxsLCBcIiAgICBcIilcblxuICAgIEdcblxuICByZXNvbHZlTWFjcm9zOiAocmVnZXgpIC0+XG4gICAgaWYgcmVnZXggaW5zdGFuY2VvZiBSZWdFeHBcbiAgICAgIHJlZ2V4ID0gcmVnZXguc291cmNlXG5cbiAgICBtYWNyb3MgPSBAbWFjcm9zXG5cbiAgICByZWdleC5yZXBsYWNlIC8vLyBcXHtcXHcrXFx9IC8vL2csIChtb2IpIC0+XG4gICAgICBzID0gbW9iWzEuLi4tMV1cblxuICAgICAgaWYgdHlwZW9mIG1hY3Jvc1tzXSBpc250IFwidW5kZWZpbmVkXCJcbiAgICAgICAgbWFjcm9zW3NdXG4gICAgICBlbHNlXG4gICAgICAgIG1vYlxuXG4gIG1ha2VTY29wZU5hbWU6IChuYW1lKSAtPlxuICAgIG5hbWUgPSBAcmVzb2x2ZU1hY3JvcyhuYW1lKVxuICAgIGlmIEBhdXRvQXBwZW5kU2NvcGVOYW1lXG4gICAgICB1bmxlc3MgQGhhc0dyYW1tYXJTY29wZU5hbWUudGVzdChuYW1lKVxuICAgICAgICByZXR1cm4gXCIje25hbWV9LiN7QGdyYW1tYXJTY29wZU5hbWV9XCJcblxuICAgIG5hbWVcblxuICAjIFRyYW5zZm9ybXMgYW4gZWFzeSBncmFtbWFyIHNwZWNpZmljYXRpb24gb2JqZWN0IGludG8gYSB0bUxhbmd1YWdlIGdyYW1tYXJcbiAgIyBzcGVjaWZpY2F0aW9uIG9iamVjdC5cbiAgI1xuICAjIG4gLT4gbmFtZVxuICAjIE4gLT4gY29udGVudE5hbWVcbiAgIyBwIC0+IHBhdHRlcm5zXG4gICMgaSAtPiBpbmNsdWRlXG4gICMgbSAtPiBtYXRjaFxuICAjIGIgLT4gYmVnaW5cbiAgIyBlIC0+IGVuZFxuICAjIGMgLT4gY2FwdHVyZXMvYmVnaW5DYXB0dXJlc1xuICAjIEMgLT4gZW5kQ2FwdHVyZXNcbiAgIyBMIC0+IGFwcGx5RW5kUGF0dGVybkxhc3RcbiAgI1xuICBtYWtlUGF0dGVybjogKHBhdHRlcm4pIC0+XG4gICAgcGF0ID0gcGF0dGVyblxuICAgIFAgICA9IHt9XG5cbiAgICBpZiB0eXBlb2YgcGF0dGVybiA9PSBcInN0cmluZ1wiXG4gICAgICBQLmluY2x1ZGUgPSBwYXR0ZXJuXG4gICAgICByZXR1cm4gUFxuXG4gICAgaWYgcGF0dGVybiBpbnN0YW5jZW9mIEFycmF5XG4gICAgICByZXR1cm4gKEBtYWtlUGF0dGVybihwKSBmb3IgcCBpbiBwYXR0ZXJuKVxuXG4gICAgZm9yIGssdiBvZiBwYXRcbiAgICAgIHN3aXRjaCBrXG4gICAgICAgIHdoZW4gXCJOXCIsIFwiY29udGVudE5hbWVcIlxuICAgICAgICAgIFAuY29udGVudE5hbWUgPSBAbWFrZVNjb3BlTmFtZSh2KVxuICAgICAgICB3aGVuIFwiaVwiLCBcImluY2x1ZGVcIlxuICAgICAgICAgIFAuaW5jbHVkZSA9IHZcbiAgICAgICAgd2hlbiBcIm5cIiwgXCJuYW1lXCJcbiAgICAgICAgICBQLm5hbWUgID0gQG1ha2VTY29wZU5hbWUodilcbiAgICAgICAgd2hlbiBcIm1cIiwgXCJtYXRjaFwiXG4gICAgICAgICAgUC5tYXRjaCA9IEByZXNvbHZlTWFjcm9zKHYpXG4gICAgICAgIHdoZW4gXCJiXCIsIFwiYmVnaW5cIlxuICAgICAgICAgIFAuYmVnaW4gPSBAcmVzb2x2ZU1hY3Jvcyh2KVxuICAgICAgICB3aGVuIFwiZVwiLCBcImVuZFwiXG4gICAgICAgICAgUC5lbmQgICA9IEByZXNvbHZlTWFjcm9zKHYpXG5cbiAgICAgICAgd2hlbiBcImNcIiwgXCJjYXB0dXJlc1wiLCBcImJlZ2luQ2FwdHVyZXNcIlxuICAgICAgICAgIGlmIFAuYmVnaW4/XG4gICAgICAgICAgICBQLmJlZ2luQ2FwdHVyZXMgPSBjID0ge31cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBQLmNhcHR1cmVzID0gYyA9IHt9XG5cbiAgICAgICAgICBpZiB0eXBlb2YgdiA9PSBcInN0cmluZ1wiXG4gICAgICAgICAgICBjWzBdID0geyBuYW1lOiBAbWFrZVNjb3BlTmFtZSh2KSB9XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZm9yIGNrLGN2IG9mIHZcbiAgICAgICAgICAgICAgaWYgdHlwZW9mIGN2IGlzbnQgXCJzdHJpbmdcIlxuICAgICAgICAgICAgICAgIGNbY2tdID0gQG1ha2VQYXR0ZXJuKGN2KVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY1tja10gPSB7IG5hbWU6IEBtYWtlU2NvcGVOYW1lKGN2KSB9XG5cbiAgICAgICAgd2hlbiBcIkNcIiwgXCJlbmRDYXB0dXJlc1wiXG4gICAgICAgICAgUC5lbmRDYXB0dXJlcyA9IGMgPSB7fVxuICAgICAgICAgIGlmIHR5cGVvZiB2ID09IFwic3RyaW5nXCJcbiAgICAgICAgICAgIGNbMF0gPSB7IG5hbWU6IEBtYWtlU2NvcGVOYW1lKHYpIH1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBmb3IgY2ssY3Ygb2YgdlxuICAgICAgICAgICAgICBpZiB0eXBlb2YgY3YgaXNudCBcInN0cmluZ1wiXG4gICAgICAgICAgICAgICAgY1tja10gPSBAbWFrZVBhdHRlcm4oY3YpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjW2NrXSA9IHsgbmFtZTogQG1ha2VTY29wZU5hbWUoY3YpIH1cblxuICAgICAgICB3aGVuIFwicFwiLCBcInBhdHRlcm5zXCJcbiAgICAgICAgICB1bmxlc3MgdiBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICB2ID0gWyB2IF1cbiAgICAgICAgICBQLnBhdHRlcm5zID0gKEBtYWtlUGF0dGVybihwKSBmb3IgcCBpbiB2KVxuXG4gICAgICAgIHdoZW4gXCJMXCIsIFwiYXBwbHlFbmRQYXR0ZXJuTGFzdFwiXG4gICAgICAgICAgUC5hcHBseUVuZFBhdHRlcm5MYXN0ID0gdlxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBQW2tdID0gdlxuXG4gICAgUFxuXG5tYWtlR3JhbW1hciA9IChwcmludCwgZ3JhbW1hcikgLT5cbiAgZ3JhbW1hcl8gPSAocmVxdWlyZSAnY2xvbmUnKShncmFtbWFyKVxuICAobmV3IEdyYW1tYXJDcmVhdG9yIGdyYW1tYXJfLCBwcmludCkucHJvY2VzcygpXG5cbmluY2x1ZGUgPSAod2hhdCkgLT4gcmVxdWlyZSBcIi4vaW5jbHVkZS8je3doYXR9XCJcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgbWFrZUdyYW1tYXIsIGluY2x1ZGUgfVxuIl19
