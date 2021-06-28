(function() {
  var balanced, concat, controlKeywords, floatPattern, guarded, list, listMaybe, otherKeywords, rxToStr,
    slice = [].slice;

  rxToStr = function(rx) {
    if (typeof rx === 'object') {
      return rx.source;
    } else {
      return rx;
    }
  };

  list = function(s, sep) {
    return "((?:" + (rxToStr(s)) + ")(?:(?:" + (rxToStr(sep)) + ")(?:" + (rxToStr(s)) + "))*)";
  };

  listMaybe = function(s, sep) {
    return (list(s, sep)) + "?";
  };

  concat = function() {
    var list, r;
    list = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    r = ''.concat.apply('', list.map(function(i) {
      return "(?:" + (rxToStr(i)) + ")";
    }));
    return "(?:" + r + ")";
  };

  balanced = function(name, left, right) {
    return "(?<" + name + ">(?:(?!" + left + "|" + right + ").|" + left + "\\g<" + name + ">" + right + ")*)";
  };

  floatPattern = function(digit, exp) {
    var exponent;
    exponent = exp + "[+-]?[0-9_]+";
    return digit + "*(?:\\." + digit + "+(?:" + exponent + ")?|" + exponent + ")";
  };

  guarded = function(pattern) {
    return "(?:(?<!{operatorChar})(?:" + pattern + ")(?!{operatorChar}))";
  };

  controlKeywords = ['do', 'if', 'then', 'else', 'case', 'of', 'let', 'in', 'default', 'mdo', 'rec', 'proc'];

  otherKeywords = ['deriving', 'where', 'data', 'type', 'newtype'];

  module.exports = {
    list: list,
    listMaybe: listMaybe,
    concat: concat,
    balanced: balanced,
    guarded: guarded,
    floatPattern: floatPattern,
    controlKeywords: controlKeywords,
    otherKeywords: otherKeywords
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NyYy9pbmNsdWRlL3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpR0FBQTtJQUFBOztFQUFBLE9BQUEsR0FBVSxTQUFDLEVBQUQ7SUFDUixJQUFHLE9BQU8sRUFBUCxLQUFhLFFBQWhCO2FBQ0UsRUFBRSxDQUFDLE9BREw7S0FBQSxNQUFBO2FBR0UsR0FIRjs7RUFEUTs7RUFNVixJQUFBLEdBQU8sU0FBQyxDQUFELEVBQUksR0FBSjtXQUVMLE1BQUEsR0FBTSxDQUFDLE9BQUEsQ0FBUSxDQUFSLENBQUQsQ0FBTixHQUFpQixTQUFqQixHQUF5QixDQUFDLE9BQUEsQ0FBUSxHQUFSLENBQUQsQ0FBekIsR0FBc0MsTUFBdEMsR0FBMkMsQ0FBQyxPQUFBLENBQVEsQ0FBUixDQUFELENBQTNDLEdBQXNEO0VBRmpEOztFQUlQLFNBQUEsR0FBWSxTQUFDLENBQUQsRUFBSSxHQUFKO1dBRVIsQ0FBQyxJQUFBLENBQUssQ0FBTCxFQUFRLEdBQVIsQ0FBRCxDQUFBLEdBQWM7RUFGTjs7RUFJWixNQUFBLEdBQVMsU0FBQTtBQUNQLFFBQUE7SUFEUTtJQUNSLENBQUEsR0FBSSxFQUFFLENBQUMsTUFBSCxXQUFXLElBQUksQ0FBQyxHQUFMLENBQVMsU0FBQyxDQUFEO2FBQU8sS0FBQSxHQUFLLENBQUMsT0FBQSxDQUFRLENBQVIsQ0FBRCxDQUFMLEdBQWdCO0lBQXZCLENBQVQsQ0FBWDtXQUNKLEtBQUEsR0FBTSxDQUFOLEdBQVE7RUFGRDs7RUFJVCxRQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEtBQWI7V0FDVCxLQUFBLEdBQU0sSUFBTixHQUFXLFNBQVgsR0FBb0IsSUFBcEIsR0FBeUIsR0FBekIsR0FBNEIsS0FBNUIsR0FBa0MsS0FBbEMsR0FBdUMsSUFBdkMsR0FBNEMsTUFBNUMsR0FBa0QsSUFBbEQsR0FBdUQsR0FBdkQsR0FBMEQsS0FBMUQsR0FBZ0U7RUFEdkQ7O0VBR1gsWUFBQSxHQUFlLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFDYixRQUFBO0lBQUEsUUFBQSxHQUFjLEdBQUQsR0FBSztXQUNmLEtBQUQsR0FBTyxTQUFQLEdBQWdCLEtBQWhCLEdBQXNCLE1BQXRCLEdBQTRCLFFBQTVCLEdBQXFDLEtBQXJDLEdBQTBDLFFBQTFDLEdBQW1EO0VBRnhDOztFQUlmLE9BQUEsR0FBVSxTQUFDLE9BQUQ7V0FDUiwyQkFBQSxHQUE0QixPQUE1QixHQUFvQztFQUQ1Qjs7RUFHVixlQUFBLEdBQWtCLENBQ2hCLElBRGdCLEVBQ1YsSUFEVSxFQUNKLE1BREksRUFDSSxNQURKLEVBQ1ksTUFEWixFQUNvQixJQURwQixFQUMwQixLQUQxQixFQUNpQyxJQURqQyxFQUN1QyxTQUR2QyxFQUNrRCxLQURsRCxFQUN5RCxLQUR6RCxFQUNnRSxNQURoRTs7RUFJbEIsYUFBQSxHQUFnQixDQUNkLFVBRGMsRUFDRixPQURFLEVBQ08sTUFEUCxFQUNlLE1BRGYsRUFDdUIsU0FEdkI7O0VBSWhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQUMsTUFBQSxJQUFEO0lBQU8sV0FBQSxTQUFQO0lBQWtCLFFBQUEsTUFBbEI7SUFBMEIsVUFBQSxRQUExQjtJQUFvQyxTQUFBLE9BQXBDO0lBQTZDLGNBQUEsWUFBN0M7SUFBMkQsaUJBQUEsZUFBM0Q7SUFBNEUsZUFBQSxhQUE1RTs7QUFwQ2pCIiwic291cmNlc0NvbnRlbnQiOlsicnhUb1N0ciA9IChyeCkgLT5cbiAgaWYgdHlwZW9mIHJ4IGlzICdvYmplY3QnXG4gICAgcnguc291cmNlXG4gIGVsc2VcbiAgICByeFxuXG5saXN0ID0gKHMsIHNlcCkgLT5cbiAgIyBcIig/PCN7aXRlbX0+KD86I3tyeFRvU3RyIHN9KSg/OlxcXFxzKig/OiN7cnhUb1N0ciBzZXB9KVxcXFxzKlxcXFxnPCN7aXRlbX0+KT8pXCJcbiAgXCIoKD86I3tyeFRvU3RyIHN9KSg/Oig/OiN7cnhUb1N0ciBzZXB9KSg/OiN7cnhUb1N0ciBzfSkpKilcIlxuXG5saXN0TWF5YmUgPSAocywgc2VwKSAtPlxuICAjIFwiKD88I3tpdGVtfT4oPzoje3J4VG9TdHIgc30pKD86XFxcXHMqKD86I3tyeFRvU3RyIHNlcH0pXFxcXHMqXFxcXGc8I3tpdGVtfT4pPyk/XCJcbiAgXCIje2xpc3Qocywgc2VwKX0/XCJcblxuY29uY2F0ID0gKGxpc3QuLi4pIC0+XG4gIHIgPSAnJy5jb25jYXQgKGxpc3QubWFwIChpKSAtPiBcIig/OiN7cnhUb1N0ciBpfSlcIikuLi5cbiAgXCIoPzoje3J9KVwiXG5cbmJhbGFuY2VkID0gKG5hbWUsIGxlZnQsIHJpZ2h0KSAtPlxuICBcIig/PCN7bmFtZX0+KD86KD8hI3tsZWZ0fXwje3JpZ2h0fSkufCN7bGVmdH1cXFxcZzwje25hbWV9PiN7cmlnaHR9KSopXCJcblxuZmxvYXRQYXR0ZXJuID0gKGRpZ2l0LCBleHApIC0+XG4gIGV4cG9uZW50ID0gXCIje2V4cH1bKy1dP1swLTlfXStcIlxuICBcIiN7ZGlnaXR9Kig/OlxcXFwuI3tkaWdpdH0rKD86I3tleHBvbmVudH0pP3wje2V4cG9uZW50fSlcIlxuXG5ndWFyZGVkID0gKHBhdHRlcm4pIC0+XG4gIFwiKD86KD88IXtvcGVyYXRvckNoYXJ9KSg/OiN7cGF0dGVybn0pKD8he29wZXJhdG9yQ2hhcn0pKVwiXG5cbmNvbnRyb2xLZXl3b3JkcyA9IFtcbiAgJ2RvJywgJ2lmJywgJ3RoZW4nLCAnZWxzZScsICdjYXNlJywgJ29mJywgJ2xldCcsICdpbicsICdkZWZhdWx0JywgJ21kbycsICdyZWMnLCAncHJvYydcbl1cblxub3RoZXJLZXl3b3JkcyA9IFtcbiAgJ2Rlcml2aW5nJywgJ3doZXJlJywgJ2RhdGEnLCAndHlwZScsICduZXd0eXBlJ1xuXVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtsaXN0LCBsaXN0TWF5YmUsIGNvbmNhdCwgYmFsYW5jZWQsIGd1YXJkZWQsIGZsb2F0UGF0dGVybiwgY29udHJvbEtleXdvcmRzLCBvdGhlcktleXdvcmRzfVxuIl19
