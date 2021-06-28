(function() {
  var CSON, defs, open;

  CSON = require('season');

  defs = CSON.readFileSync(__dirname + "/../snippets/language-haskell.cson");

  open = function(what) {
    return atom.workspace.open(__dirname + "/fixture/" + what);
  };

  xdescribe("Snippets", function() {
    var Snippets, editor, editorElement, expandSnippet, ref, sanitize, universalTests;
    ref = [], editorElement = ref[0], editor = ref[1], Snippets = ref[2];
    expandSnippet = function(editor) {
      return atom.commands.dispatch(atom.views.getView(editor), 'snippets:expand');
    };
    sanitize = function(body) {
      var flatten, parsed, parser;
      parser = Snippets.getBodyParser();
      flatten = function(obj) {
        if (typeof obj === "string") {
          return obj;
        } else {
          return obj.content.map(flatten).join('');
        }
      };
      parsed = parser.parse(body).map(flatten).join('').replace(/\t/g, ' '.repeat(editor.getTabLength()));
      return parsed;
    };
    universalTests = function() {
      it('triggers snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source .haskell'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText(prefix);
            expandSnippet(editor);
            results.push(expect(editor.getText().trim()).toBe(sanitize(body).trim()));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
      it('triggers non-comment snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source .haskell:not(.comment)'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText(prefix);
            expandSnippet(editor);
            results.push(expect(editor.getText().trim()).toBe(sanitize(body).trim()));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
      it('triggers comment snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source .haskell.comment'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText("-- " + prefix);
            expandSnippet(editor);
            results.push(expect(editor.getText().trim()).toBe("-- " + (sanitize(body).trim())));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
      it('triggers empty-list snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source .haskell.constant.language.empty-list'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText(prefix + "]");
            editor.getLastCursor().moveLeft();
            expandSnippet(editor);
            results.push(expect(editor.getText().trim()).toBe((sanitize(body).trim()) + "]"));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
      return it('triggers type snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source .haskell.meta.type'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText("data Data = Constr " + prefix);
            expandSnippet(editor);
            results.push(expect(editor.getText().trim()).toBe("data Data = Constr " + (sanitize(body).trim())));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-haskell");
      });
      return waitsForPromise(function() {
        var snippets;
        snippets = atom.packages.loadPackage('snippets');
        return snippets.activate().then(function() {
          Snippets = snippets.mainModule;
          return new Promise(function(resolve) {
            return Snippets.onDidLoadSnippets(function() {
              return resolve();
            });
          });
        });
      });
    });
    describe('haskell', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return open('sample.hs');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      return universalTests();
    });
    describe('c2hs', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return open('sample.chs');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      return universalTests();
    });
    describe('hsc2hs', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return open('sample.hsc');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      return universalTests();
    });
    return describe('cabal', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return open('sample.cabal');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      return it('triggers snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source.cabal'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText(prefix);
            expandSnippet(editor);
            results.push(expect(editor.getText().trim()).toBe(sanitize(body).trim()));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NwZWMvc25pcHBldHMtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFUCxJQUFBLEdBQU8sSUFBSSxDQUFDLFlBQUwsQ0FBcUIsU0FBRCxHQUFXLG9DQUEvQjs7RUFFUCxJQUFBLEdBQU8sU0FBQyxJQUFEO1dBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQXVCLFNBQUQsR0FBVyxXQUFYLEdBQXNCLElBQTVDO0VBREs7O0VBR1AsU0FBQSxDQUFVLFVBQVYsRUFBc0IsU0FBQTtBQUNwQixRQUFBO0lBQUEsTUFBb0MsRUFBcEMsRUFBQyxzQkFBRCxFQUFnQixlQUFoQixFQUF3QjtJQUV4QixhQUFBLEdBQWdCLFNBQUMsTUFBRDthQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBdkIsRUFBbUQsaUJBQW5EO0lBRGM7SUFHaEIsUUFBQSxHQUFXLFNBQUMsSUFBRDtBQUNULFVBQUE7TUFBQSxNQUFBLEdBQVMsUUFBUSxDQUFDLGFBQVQsQ0FBQTtNQUNULE9BQUEsR0FBVSxTQUFDLEdBQUQ7UUFDUixJQUFHLE9BQU8sR0FBUCxLQUFlLFFBQWxCO0FBQ0UsaUJBQU8sSUFEVDtTQUFBLE1BQUE7QUFHRSxpQkFBTyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQVosQ0FBZ0IsT0FBaEIsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixFQUE5QixFQUhUOztNQURRO01BS1YsTUFBQSxHQUNFLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBYixDQUNBLENBQUMsR0FERCxDQUNLLE9BREwsQ0FFQSxDQUFDLElBRkQsQ0FFTSxFQUZOLENBR0EsQ0FBQyxPQUhELENB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WUFBQTsrQkFBVyxzQkFBUTtZQUN6QixNQUFNLENBQUMsT0FBUCxDQUFlLEVBQWY7WUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixNQUFsQjtZQUNBLGFBQUEsQ0FBYyxNQUFkO3lCQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWdCLENBQUMsSUFBakIsQ0FBQSxDQUFQLENBQStCLENBQUMsSUFBaEMsQ0FBcUMsUUFBQSxDQUFTLElBQVQsQ0FBYyxDQUFDLElBQWYsQ0FBQSxDQUFyQztBQUpNOztZQUFELENBS04sQ0FBQyxNQUxGLENBS1MsQ0FBQyxlQUxWLENBSzBCLENBTDFCO01BRHNCLENBQXhCO0lBUGdCLENBQWxCO0VBOUZvQixDQUF0QjtBQVBBIiwic291cmNlc0NvbnRlbnQiOlsiQ1NPTiA9IHJlcXVpcmUgJ3NlYXNvbidcblxuZGVmcyA9IENTT04ucmVhZEZpbGVTeW5jKFwiI3tfX2Rpcm5hbWV9Ly4uL3NuaXBwZXRzL2xhbmd1YWdlLWhhc2tlbGwuY3NvblwiKVxuXG5vcGVuID0gKHdoYXQpIC0+XG4gIGF0b20ud29ya3NwYWNlLm9wZW4oXCIje19fZGlybmFtZX0vZml4dHVyZS8je3doYXR9XCIpXG5cbnhkZXNjcmliZSBcIlNuaXBwZXRzXCIsIC0+XG4gIFtlZGl0b3JFbGVtZW50LCBlZGl0b3IsIFNuaXBwZXRzXSA9IFtdXG5cbiAgZXhwYW5kU25pcHBldCA9IChlZGl0b3IpIC0+XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKSwgJ3NuaXBwZXRzOmV4cGFuZCcpXG5cbiAgc2FuaXRpemUgPSAoYm9keSkgLT5cbiAgICBwYXJzZXIgPSBTbmlwcGV0cy5nZXRCb2R5UGFyc2VyKClcbiAgICBmbGF0dGVuID0gKG9iaikgLT5cbiAgICAgIGlmIHR5cGVvZihvYmopIGlzIFwic3RyaW5nXCJcbiAgICAgICAgcmV0dXJuIG9ialxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gb2JqLmNvbnRlbnQubWFwKGZsYXR0ZW4pLmpvaW4oJycpXG4gICAgcGFyc2VkID1cbiAgICAgIHBhcnNlci5wYXJzZShib2R5KVxuICAgICAgLm1hcChmbGF0dGVuKVxuICAgICAgLmpvaW4oJycpXG4gICAgICAucmVwbGFjZSAvXFx0L2csICcgJy5yZXBlYXQoZWRpdG9yLmdldFRhYkxlbmd0aCgpKVxuICAgIHJldHVybiBwYXJzZWRcblxuICB1bml2ZXJzYWxUZXN0cyA9IC0+XG4gICAgaXQgJ3RyaWdnZXJzIHNuaXBwZXRzJywgLT5cbiAgICAgIGV4cGVjdCgoZm9yIG5hbWUsIHtwcmVmaXgsIGJvZHl9IG9mIGRlZnNbJy5zb3VyY2UgLmhhc2tlbGwnXVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dChcIlwiKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChwcmVmaXgpXG4gICAgICAgIGV4cGFuZFNuaXBwZXQoZWRpdG9yKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKS50cmltKCkpLnRvQmUgc2FuaXRpemUoYm9keSkudHJpbSgpXG4gICAgICApLmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuIDBcbiAgICBpdCAndHJpZ2dlcnMgbm9uLWNvbW1lbnQgc25pcHBldHMnLCAtPlxuICAgICAgZXhwZWN0KChmb3IgbmFtZSwge3ByZWZpeCwgYm9keX0gb2YgZGVmc1snLnNvdXJjZSAuaGFza2VsbDpub3QoLmNvbW1lbnQpJ11cbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJcIilcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQocHJlZml4KVxuICAgICAgICBleHBhbmRTbmlwcGV0KGVkaXRvcilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkudHJpbSgpKS50b0JlIHNhbml0aXplKGJvZHkpLnRyaW0oKVxuICAgICAgKS5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbiAwXG4gICAgaXQgJ3RyaWdnZXJzIGNvbW1lbnQgc25pcHBldHMnLCAtPlxuICAgICAgZXhwZWN0KChmb3IgbmFtZSwge3ByZWZpeCwgYm9keX0gb2YgZGVmc1snLnNvdXJjZSAuaGFza2VsbC5jb21tZW50J11cbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJcIilcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCItLSAje3ByZWZpeH1cIilcbiAgICAgICAgZXhwYW5kU25pcHBldChlZGl0b3IpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKSkudG9CZSBcIi0tICN7c2FuaXRpemUoYm9keSkudHJpbSgpfVwiXG4gICAgICApLmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuIDBcbiAgICBpdCAndHJpZ2dlcnMgZW1wdHktbGlzdCBzbmlwcGV0cycsIC0+XG4gICAgICBleHBlY3QoKGZvciBuYW1lLCB7cHJlZml4LCBib2R5fSBvZiBkZWZzWycuc291cmNlIC5oYXNrZWxsLmNvbnN0YW50Lmxhbmd1YWdlLmVtcHR5LWxpc3QnXVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dChcIlwiKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiN7cHJlZml4fV1cIilcbiAgICAgICAgZWRpdG9yLmdldExhc3RDdXJzb3IoKS5tb3ZlTGVmdCgpXG4gICAgICAgIGV4cGFuZFNuaXBwZXQoZWRpdG9yKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKS50cmltKCkpLnRvQmUgXCIje3Nhbml0aXplKGJvZHkpLnRyaW0oKX1dXCJcbiAgICAgICkubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4gMFxuICAgIGl0ICd0cmlnZ2VycyB0eXBlIHNuaXBwZXRzJywgLT5cbiAgICAgIGV4cGVjdCgoZm9yIG5hbWUsIHtwcmVmaXgsIGJvZHl9IG9mIGRlZnNbJy5zb3VyY2UgLmhhc2tlbGwubWV0YS50eXBlJ11cbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJcIilcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJkYXRhIERhdGEgPSBDb25zdHIgI3twcmVmaXh9XCIpXG4gICAgICAgIGV4cGFuZFNuaXBwZXQoZWRpdG9yKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKS50cmltKCkpLnRvQmUgXCJkYXRhIERhdGEgPSBDb25zdHIgI3tzYW5pdGl6ZShib2R5KS50cmltKCl9XCJcbiAgICAgICkubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4gMFxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwibGFuZ3VhZ2UtaGFza2VsbFwiKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgc25pcHBldHMgPSBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCdzbmlwcGV0cycpXG4gICAgICBzbmlwcGV0cy5hY3RpdmF0ZSgpXG4gICAgICAudGhlbiAtPlxuICAgICAgICBTbmlwcGV0cyA9IHNuaXBwZXRzLm1haW5Nb2R1bGVcbiAgICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUpIC0+XG4gICAgICAgICAgU25pcHBldHMub25EaWRMb2FkU25pcHBldHMgLT4gcmVzb2x2ZSgpXG5cbiAgZGVzY3JpYmUgJ2hhc2tlbGwnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBvcGVuKCdzYW1wbGUuaHMnKVxuICAgICAgcnVucyAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgdW5pdmVyc2FsVGVzdHMoKVxuICBkZXNjcmliZSAnYzJocycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIG9wZW4oJ3NhbXBsZS5jaHMnKVxuICAgICAgcnVucyAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgdW5pdmVyc2FsVGVzdHMoKVxuICBkZXNjcmliZSAnaHNjMmhzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgb3Blbignc2FtcGxlLmhzYycpXG4gICAgICBydW5zIC0+XG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICB1bml2ZXJzYWxUZXN0cygpXG5cbiAgZGVzY3JpYmUgJ2NhYmFsJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgb3Blbignc2FtcGxlLmNhYmFsJylcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgIGl0ICd0cmlnZ2VycyBzbmlwcGV0cycsIC0+XG4gICAgICBleHBlY3QoKGZvciBuYW1lLCB7cHJlZml4LCBib2R5fSBvZiBkZWZzWycuc291cmNlLmNhYmFsJ11cbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJcIilcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQocHJlZml4KVxuICAgICAgICBleHBhbmRTbmlwcGV0KGVkaXRvcilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkudHJpbSgpKS50b0JlIHNhbml0aXplKGJvZHkpLnRyaW0oKVxuICAgICAgKS5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbiAwXG4iXX0=
