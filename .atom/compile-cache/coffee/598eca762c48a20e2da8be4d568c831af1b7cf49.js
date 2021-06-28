(function() {
  var _, zip;

  _ = require('underscore-plus');

  zip = function() {
    var arr, i, j, length, lengthArray, ref, results;
    lengthArray = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = arguments.length; j < len; j++) {
        arr = arguments[j];
        results.push(arr.length);
      }
      return results;
    }).apply(this, arguments);
    length = Math.max.apply(Math, lengthArray);
    results = [];
    for (i = j = 0, ref = length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      results.push((function() {
        var k, len, results1;
        results1 = [];
        for (k = 0, len = arguments.length; k < len; k++) {
          arr = arguments[k];
          results1.push(arr[i]);
        }
        return results1;
      }).apply(this, arguments));
    }
    return results;
  };

  module.exports = {
    grammarExpect: function(grammar, str) {
      var tkzd;
      tkzd = grammar.tokenizeLines(str);
      return expect(tkzd);
    },
    customMatchers: {
      toHaveTokens: function(expected) {
        var a, e, j, len, ref, ref1, ts;
        ref = zip(this.actual, expected);
        for (j = 0, len = ref.length; j < len; j++) {
          ref1 = ref[j], a = ref1[0], e = ref1[1];
          ts = a.map(function(arg) {
            var value;
            value = arg.value;
            return value;
          });
          if (!(_.isEqual(ts, e))) {
            this.message = function() {
              return "Expected " + (JSON.stringify(ts)) + " to equal " + (JSON.stringify(e));
            };
            return false;
          }
        }
        return true;
      },
      tokensToHaveScopes: function(expected) {
        var j, k, l, len, len1, len2, line, ref, ref1, sc, tok;
        ref = this.actual;
        for (j = 0, len = ref.length; j < len; j++) {
          line = ref[j];
          for (k = 0, len1 = line.length; k < len1; k++) {
            tok = line[k];
            if (tok.value in expected) {
              ref1 = expected[tok.value];
              for (l = 0, len2 = ref1.length; l < len2; l++) {
                sc = ref1[l];
                if (!_.contains(tok.scopes, sc)) {
                  this.message = function() {
                    return "Expected " + (JSON.stringify(tok)) + " to\nhave scope " + sc + " from " + (JSON.stringify(expected[tok.value]));
                  };
                  return false;
                }
              }
            }
          }
        }
        return true;
      },
      tokensNotToHaveScopes: function(expected) {
        var j, k, l, len, len1, len2, line, ref, ref1, sc, tok;
        ref = this.actual;
        for (j = 0, len = ref.length; j < len; j++) {
          line = ref[j];
          for (k = 0, len1 = line.length; k < len1; k++) {
            tok = line[k];
            if (tok.value in expected) {
              ref1 = expected[tok.value];
              for (l = 0, len2 = ref1.length; l < len2; l++) {
                sc = ref1[l];
                if (_.contains(tok.scopes, sc)) {
                  this.message = function() {
                    return "Expected " + (JSON.stringify(tok)) + " to not\nhave scope " + sc + " from " + (JSON.stringify(expected[tok.value]));
                  };
                  return false;
                }
              }
            }
          }
        }
        return true;
      },
      toHaveScopes: function(expected) {
        return zip(this.actual, expected).every(function(arg) {
          var a, e;
          a = arg[0], e = arg[1];
          return a.every(function(arg1) {
            var scopes;
            scopes = arg1.scopes;
            return e.every(function(s) {
              return _.contains(scopes, s);
            });
          });
        });
      },
      notToHaveScopes: function(expected) {
        return !zip(this.actual, expected).every(function(arg) {
          var a, e;
          a = arg[0], e = arg[1];
          return a.every(function(arg1) {
            var scopes;
            scopes = arg1.scopes;
            return e.every(function(s) {
              return _.contains(scopes, s);
            });
          });
        });
      },
      tokenToHaveScopes: function(expected) {
        var a, e, i, j, k, len, len1, ref, ref1, s, sc;
        ref = zip(this.actual, expected);
        for (j = 0, len = ref.length; j < len; j++) {
          ref1 = ref[j], a = ref1[0], e = ref1[1];
          for (i in e) {
            s = e[i];
            if (!Array.isArray(s) || s.length === 0) {
              this.message = function() {
                return "Zero-length assertion in " + i + " of " + (JSON.stringify(e));
              };
              return false;
            }
            for (k = 0, len1 = s.length; k < len1; k++) {
              sc = s[k];
              if (!_.contains(a[i].scopes, sc)) {
                this.message = function() {
                  return "Expected token " + i + " " + (JSON.stringify(a[i])) + " to have scope " + sc + " from " + (JSON.stringify(s));
                };
                return false;
              }
            }
          }
        }
        return true;
      },
      tokenNotToHaveScopes: function(expected) {
        var a, e, i, j, k, len, len1, ref, ref1, s, sc;
        ref = zip(this.actual, expected);
        for (j = 0, len = ref.length; j < len; j++) {
          ref1 = ref[j], a = ref1[0], e = ref1[1];
          for (i in e) {
            s = e[i];
            if (!Array.isArray(s) || s.length === 0) {
              this.message = function() {
                return "Zero-length assertion in " + i + " of " + (JSON.stringify(e));
              };
              return false;
            }
            for (k = 0, len1 = s.length; k < len1; k++) {
              sc = s[k];
              if (_.contains(a[parseInt(i, 10)].scopes, sc)) {
                this.message = function() {
                  return "Expected token " + i + " " + (JSON.stringify(a[i])) + " not to have scope " + sc + " from " + (JSON.stringify(s));
                };
                return false;
              }
            }
          }
        }
        return true;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NwZWMvdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosR0FBQSxHQUFNLFNBQUE7QUFDSixRQUFBO0lBQUEsV0FBQTs7QUFBZTtXQUFBLDJDQUFBOztxQkFBQSxHQUFHLENBQUM7QUFBSjs7O0lBQ2YsTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLGFBQVMsV0FBVDtBQUNUO1NBQVMsK0VBQVQ7OztBQUNFO2FBQUEsMkNBQUE7O3dCQUFBLEdBQUksQ0FBQSxDQUFBO0FBQUo7OztBQURGOztFQUhJOztFQU1OLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxhQUFBLEVBQWUsU0FBQyxPQUFELEVBQVUsR0FBVjtBQUNiLFVBQUE7TUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLGFBQVIsQ0FBc0IsR0FBdEI7YUFDUCxNQUFBLENBQU8sSUFBUDtJQUZhLENBQWY7SUFJQSxjQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQWMsU0FBQyxRQUFEO0FBQ1osWUFBQTtBQUFBO0FBQUEsYUFBQSxxQ0FBQTt5QkFBSyxhQUFHO1VBQ04sRUFBQSxHQUFLLENBQUMsQ0FBQyxHQUFGLENBQU0sU0FBQyxHQUFEO0FBQWEsZ0JBQUE7WUFBWCxRQUFEO21CQUFZO1VBQWIsQ0FBTjtVQUNMLElBQUEsQ0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFGLENBQVUsRUFBVixFQUFjLENBQWQsQ0FBRCxDQUFQO1lBRUUsSUFBQyxDQUFBLE9BQUQsR0FBVyxTQUFBO3FCQUFHLFdBQUEsR0FBVyxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsRUFBZixDQUFELENBQVgsR0FBK0IsWUFBL0IsR0FBMEMsQ0FBQyxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsQ0FBRDtZQUE3QztBQUNY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TyxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBRSxDQUFBLENBQUEsQ0FBakIsQ0FBRCxDQURQLEdBQzZCLHFCQUQ3QixHQUNrRCxFQURsRCxHQUNxRCxRQURyRCxHQUM0RCxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBZixDQUFEO2dCQUQvRDtBQUdYLHVCQUFPLE1BSlQ7O0FBREY7QUFKRjtBQURGO0FBV0EsZUFBTztNQVphLENBbkR0QjtLQUxGOztBQVRGIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuemlwID0gLT5cbiAgbGVuZ3RoQXJyYXkgPSAoYXJyLmxlbmd0aCBmb3IgYXJyIGluIGFyZ3VtZW50cylcbiAgbGVuZ3RoID0gTWF0aC5tYXgobGVuZ3RoQXJyYXkuLi4pXG4gIGZvciBpIGluIFswLi4ubGVuZ3RoXVxuICAgIGFycltpXSBmb3IgYXJyIGluIGFyZ3VtZW50c1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdyYW1tYXJFeHBlY3Q6IChncmFtbWFyLCBzdHIpIC0+XG4gICAgdGt6ZCA9IGdyYW1tYXIudG9rZW5pemVMaW5lcyhzdHIpXG4gICAgZXhwZWN0KHRremQpXG5cbiAgY3VzdG9tTWF0Y2hlcnM6XG4gICAgdG9IYXZlVG9rZW5zOiAoZXhwZWN0ZWQpIC0+XG4gICAgICBmb3IgW2EsIGVdIGluIHppcChAYWN0dWFsLCBleHBlY3RlZClcbiAgICAgICAgdHMgPSBhLm1hcCAoe3ZhbHVlfSkgLT4gdmFsdWVcbiAgICAgICAgdW5sZXNzIChfLmlzRXF1YWwodHMsIGUpKVxuICAgICAgICAgICMgY29uc29sZS5sb2cgQG1lc3NhZ2VcbiAgICAgICAgICBAbWVzc2FnZSA9IC0+IFwiRXhwZWN0ZWQgI3tKU09OLnN0cmluZ2lmeSh0cyl9IHRvIGVxdWFsICN7SlNPTi5zdHJpbmdpZnkoZSl9XCJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIHJldHVybiB0cnVlXG4gICAgdG9rZW5zVG9IYXZlU2NvcGVzOiAoZXhwZWN0ZWQpIC0+XG4gICAgICBmb3IgbGluZSBpbiBAYWN0dWFsXG4gICAgICAgIGZvciB0b2sgaW4gbGluZVxuICAgICAgICAgIGlmIHRvay52YWx1ZSBvZiBleHBlY3RlZFxuICAgICAgICAgICAgZm9yIHNjIGluIGV4cGVjdGVkW3Rvay52YWx1ZV1cbiAgICAgICAgICAgICAgaWYgbm90IF8uY29udGFpbnModG9rLnNjb3Blcywgc2MpXG4gICAgICAgICAgICAgICAgQG1lc3NhZ2UgPSAtPiBcIlwiXCJcbiAgICAgICAgICAgICAgICBFeHBlY3RlZCAje0pTT04uc3RyaW5naWZ5KHRvayl9IHRvXG4gICAgICAgICAgICAgICAgaGF2ZSBzY29wZSAje3NjfSBmcm9tICN7SlNPTi5zdHJpbmdpZnkoZXhwZWN0ZWRbdG9rLnZhbHVlXSl9XG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHRva2Vuc05vdFRvSGF2ZVNjb3BlczogKGV4cGVjdGVkKSAtPlxuICAgICAgZm9yIGxpbmUgaW4gQGFjdHVhbFxuICAgICAgICBmb3IgdG9rIGluIGxpbmVcbiAgICAgICAgICBpZiB0b2sudmFsdWUgb2YgZXhwZWN0ZWRcbiAgICAgICAgICAgIGZvciBzYyBpbiBleHBlY3RlZFt0b2sudmFsdWVdXG4gICAgICAgICAgICAgIGlmIF8uY29udGFpbnModG9rLnNjb3Blcywgc2MpXG4gICAgICAgICAgICAgICAgQG1lc3NhZ2UgPSAtPiBcIlwiXCJcbiAgICAgICAgICAgICAgICBFeHBlY3RlZCAje0pTT04uc3RyaW5naWZ5KHRvayl9IHRvIG5vdFxuICAgICAgICAgICAgICAgIGhhdmUgc2NvcGUgI3tzY30gZnJvbSAje0pTT04uc3RyaW5naWZ5KGV4cGVjdGVkW3Rvay52YWx1ZV0pfVxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB0b0hhdmVTY29wZXM6IChleHBlY3RlZCkgLT5cbiAgICAgIHppcChAYWN0dWFsLCBleHBlY3RlZCkuZXZlcnkgKFthLCBlXSkgLT5cbiAgICAgICAgYS5ldmVyeSAoe3Njb3Blc30pIC0+XG4gICAgICAgICAgZS5ldmVyeSAocykgLT4gXy5jb250YWlucyhzY29wZXMsIHMpXG4gICAgbm90VG9IYXZlU2NvcGVzOiAoZXhwZWN0ZWQpIC0+XG4gICAgICBub3QgemlwKEBhY3R1YWwsIGV4cGVjdGVkKS5ldmVyeSAoW2EsIGVdKSAtPlxuICAgICAgICBhLmV2ZXJ5ICh7c2NvcGVzfSkgLT5cbiAgICAgICAgICBlLmV2ZXJ5IChzKSAtPiBfLmNvbnRhaW5zKHNjb3BlcywgcylcbiAgICB0b2tlblRvSGF2ZVNjb3BlczogKGV4cGVjdGVkKSAtPlxuICAgICAgZm9yIFthLCBlXSBpbiB6aXAoQGFjdHVhbCwgZXhwZWN0ZWQpXG4gICAgICAgIGZvciBpLCBzIG9mIGVcbiAgICAgICAgICBpZiBub3QgQXJyYXkuaXNBcnJheShzKSBvciBzLmxlbmd0aCBpcyAwXG4gICAgICAgICAgICBAbWVzc2FnZSA9IC0+IFwiWmVyby1sZW5ndGggYXNzZXJ0aW9uIGluICN7aX0gb2YgI3tKU09OLnN0cmluZ2lmeShlKX1cIlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgZm9yIHNjIGluIHNcbiAgICAgICAgICAgIHVubGVzcyBfLmNvbnRhaW5zKGFbaV0uc2NvcGVzLCBzYylcbiAgICAgICAgICAgICAgQG1lc3NhZ2UgPSAtPiBcIkV4cGVjdGVkIHRva2VuICN7aX0gI3tKU09OLnN0cmluZ2lmeShhW2ldKX0gdG8gaGF2ZSBzY29wZSAje3NjfSBmcm9tICN7SlNPTi5zdHJpbmdpZnkocyl9XCJcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHRva2VuTm90VG9IYXZlU2NvcGVzOiAoZXhwZWN0ZWQpIC0+XG4gICAgICBmb3IgW2EsIGVdIGluIHppcChAYWN0dWFsLCBleHBlY3RlZClcbiAgICAgICAgZm9yIGksIHMgb2YgZVxuICAgICAgICAgIGlmIG5vdCBBcnJheS5pc0FycmF5KHMpIG9yIHMubGVuZ3RoIGlzIDBcbiAgICAgICAgICAgIEBtZXNzYWdlID0gLT4gXCJaZXJvLWxlbmd0aCBhc3NlcnRpb24gaW4gI3tpfSBvZiAje0pTT04uc3RyaW5naWZ5KGUpfVwiXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICBmb3Igc2MgaW4gc1xuICAgICAgICAgICAgaWYgXy5jb250YWlucyhhW3BhcnNlSW50KGksIDEwKV0uc2NvcGVzLCBzYylcbiAgICAgICAgICAgICAgQG1lc3NhZ2UgPSAtPiBcIlwiXCJcbiAgICAgICAgICAgICAgRXhwZWN0ZWQgdG9rZW4gI3tpfSAje0pTT04uc3RyaW5naWZ5KGFbaV0pfSBub3QgdG8gaGF2ZSBzY29wZSAje3NjfSBmcm9tICN7SlNPTi5zdHJpbmdpZnkocyl9XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIHJldHVybiB0cnVlXG4iXX0=
