(function() {
  var Cursor, Delegator, DisplayBuffer, Editor, LanguageMode, Model, Point, Range, Selection, Serializable, TextMateScopeSelector, _, deprecate, path, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  path = require('path');

  Serializable = require('serializable');

  Delegator = require('delegato');

  deprecate = require('grim').deprecate;

  Model = require('theorist').Model;

  ref = require('text-buffer'), Point = ref.Point, Range = ref.Range;

  LanguageMode = require('./language-mode');

  DisplayBuffer = require('./display-buffer');

  Cursor = require('./cursor');

  Selection = require('./selection');

  TextMateScopeSelector = require('first-mate').ScopeSelector;

  module.exports = Editor = (function(superClass) {
    extend(Editor, superClass);

    Serializable.includeInto(Editor);

    atom.deserializers.add(Editor);

    Delegator.includeInto(Editor);

    Editor.prototype.deserializing = false;

    Editor.prototype.callDisplayBufferCreatedHook = false;

    Editor.prototype.registerEditor = false;

    Editor.prototype.buffer = null;

    Editor.prototype.languageMode = null;

    Editor.prototype.cursors = null;

    Editor.prototype.selections = null;

    Editor.prototype.suppressSelectionMerging = false;

    Editor.delegatesMethods('suggestedIndentForBufferRow', 'autoIndentBufferRow', 'autoIndentBufferRows', 'autoDecreaseIndentForBufferRow', 'toggleLineCommentForBufferRow', 'toggleLineCommentsForBufferRows', {
      toProperty: 'languageMode'
    });

    Editor.delegatesProperties('$lineHeight', '$defaultCharWidth', '$height', '$width', '$scrollTop', '$scrollLeft', 'manageScrollPosition', {
      toProperty: 'displayBuffer'
    });

    function Editor(arg) {
      var buffer, initialColumn, initialLine, j, len, marker, ref1, ref2, ref3, ref4, ref5, registerEditor, softWrap, suppressCursorCreation, tabLength;
      this.softTabs = arg.softTabs, initialLine = arg.initialLine, initialColumn = arg.initialColumn, tabLength = arg.tabLength, softWrap = arg.softWrap, this.displayBuffer = arg.displayBuffer, buffer = arg.buffer, registerEditor = arg.registerEditor, suppressCursorCreation = arg.suppressCursorCreation;
      this.handleMarkerCreated = bind(this.handleMarkerCreated, this);
      Editor.__super__.constructor.apply(this, arguments);
      this.cursors = [];
      this.selections = [];
      if (this.displayBuffer == null) {
        this.displayBuffer = new DisplayBuffer({
          buffer: buffer,
          tabLength: tabLength,
          softWrap: softWrap
        });
      }
      this.buffer = this.displayBuffer.buffer;
      this.softTabs = (ref1 = (ref2 = (ref3 = this.buffer.usesSoftTabs()) != null ? ref3 : this.softTabs) != null ? ref2 : atom.config.get('editor.softTabs')) != null ? ref1 : true;
      ref4 = this.findMarkers(this.getSelectionMarkerAttributes());
      for (j = 0, len = ref4.length; j < len; j++) {
        marker = ref4[j];
        marker.setAttributes({
          preserveFolds: true
        });
        this.addSelection(marker);
      }
      this.subscribeToBuffer();
      this.subscribeToDisplayBuffer();
      if (this.getCursors().length === 0 && !suppressCursorCreation) {
        initialLine = Math.max(parseInt(initialLine) || 0, 0);
        initialColumn = Math.max(parseInt(initialColumn) || 0, 0);
        this.addCursorAtBufferPosition([initialLine, initialColumn]);
      }
      this.languageMode = new LanguageMode(this);
      this.subscribe(this.$scrollTop, (function(_this) {
        return function(scrollTop) {
          return _this.emit('scroll-top-changed', scrollTop);
        };
      })(this));
      this.subscribe(this.$scrollLeft, (function(_this) {
        return function(scrollLeft) {
          return _this.emit('scroll-left-changed', scrollLeft);
        };
      })(this));
      if (registerEditor) {
        if ((ref5 = atom.workspace) != null) {
          ref5.editorAdded(this);
        }
      }
    }

    Editor.prototype.serializeParams = function() {
      return {
        id: this.id,
        softTabs: this.softTabs,
        scrollTop: this.scrollTop,
        scrollLeft: this.scrollLeft,
        displayBuffer: this.displayBuffer.serialize()
      };
    };

    Editor.prototype.deserializeParams = function(params) {
      params.displayBuffer = DisplayBuffer.deserialize(params.displayBuffer);
      params.registerEditor = true;
      return params;
    };

    Editor.prototype.subscribeToBuffer = function() {
      this.buffer.retain();
      this.subscribe(this.buffer, "path-changed", (function(_this) {
        return function() {
          if (atom.project.getPath() == null) {
            atom.project.setPath(path.dirname(_this.getPath()));
          }
          _this.emit("title-changed");
          return _this.emit("path-changed");
        };
      })(this));
      this.subscribe(this.buffer, "contents-modified", (function(_this) {
        return function() {
          return _this.emit("contents-modified");
        };
      })(this));
      this.subscribe(this.buffer, "contents-conflicted", (function(_this) {
        return function() {
          return _this.emit("contents-conflicted");
        };
      })(this));
      this.subscribe(this.buffer, "modified-status-changed", (function(_this) {
        return function() {
          return _this.emit("modified-status-changed");
        };
      })(this));
      this.subscribe(this.buffer, "destroyed", (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this));
      return this.preserveCursorPositionOnBufferReload();
    };

    Editor.prototype.subscribeToDisplayBuffer = function() {
      this.subscribe(this.displayBuffer, 'marker-created', this.handleMarkerCreated);
      this.subscribe(this.displayBuffer, "changed", (function(_this) {
        return function(e) {
          return _this.emit('screen-lines-changed', e);
        };
      })(this));
      this.subscribe(this.displayBuffer, "markers-updated", (function(_this) {
        return function() {
          return _this.mergeIntersectingSelections();
        };
      })(this));
      this.subscribe(this.displayBuffer, 'grammar-changed', (function(_this) {
        return function() {
          return _this.handleGrammarChange();
        };
      })(this));
      return this.subscribe(this.displayBuffer, 'soft-wrap-changed', (function(_this) {
        return function() {
          var args;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return _this.emit.apply(_this, ['soft-wrap-changed'].concat(slice.call(args)));
        };
      })(this));
    };

    Editor.prototype.getViewClass = function() {
      if (atom.config.get('core.useReactEditor')) {
        return require('./react-editor-view');
      } else {
        return require('./editor-view');
      }
    };

    Editor.prototype.destroyed = function() {
      var j, len, ref1, selection;
      this.unsubscribe();
      ref1 = this.getSelections();
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        selection.destroy();
      }
      this.buffer.release();
      this.displayBuffer.destroy();
      return this.languageMode.destroy();
    };

    Editor.prototype.copy = function() {
      var displayBuffer, j, len, marker, newEditor, ref1, softTabs, tabLength;
      tabLength = this.getTabLength();
      displayBuffer = this.displayBuffer.copy();
      softTabs = this.getSoftTabs();
      newEditor = new Editor({
        buffer: this.buffer,
        displayBuffer: displayBuffer,
        tabLength: tabLength,
        softTabs: softTabs,
        suppressCursorCreation: true,
        registerEditor: true
      });
      ref1 = this.findMarkers({
        editorId: this.id
      });
      for (j = 0, len = ref1.length; j < len; j++) {
        marker = ref1[j];
        marker.copy({
          editorId: newEditor.id,
          preserveFolds: true
        });
      }
      return newEditor;
    };

    Editor.prototype.getTitle = function() {
      var sessionPath;
      if (sessionPath = this.getPath()) {
        return path.basename(sessionPath);
      } else {
        return 'untitled';
      }
    };

    Editor.prototype.getLongTitle = function() {
      var directory, fileName, sessionPath;
      if (sessionPath = this.getPath()) {
        fileName = path.basename(sessionPath);
        directory = path.basename(path.dirname(sessionPath));
        return fileName + " - " + directory;
      } else {
        return 'untitled';
      }
    };

    Editor.prototype.setVisible = function(visible) {
      return this.displayBuffer.setVisible(visible);
    };

    Editor.prototype.setEditorWidthInChars = function(editorWidthInChars) {
      return this.displayBuffer.setEditorWidthInChars(editorWidthInChars);
    };

    Editor.prototype.getSoftWrapColumn = function() {
      return this.displayBuffer.getSoftWrapColumn();
    };

    Editor.prototype.getSoftTabs = function() {
      return this.softTabs;
    };

    Editor.prototype.setSoftTabs = function(softTabs1) {
      this.softTabs = softTabs1;
      return this.softTabs;
    };

    Editor.prototype.toggleSoftTabs = function() {
      return this.setSoftTabs(!this.getSoftTabs());
    };

    Editor.prototype.getSoftWrap = function() {
      return this.displayBuffer.getSoftWrap();
    };

    Editor.prototype.setSoftWrap = function(softWrap) {
      return this.displayBuffer.setSoftWrap(softWrap);
    };

    Editor.prototype.toggleSoftWrap = function() {
      return this.setSoftWrap(!this.getSoftWrap());
    };

    Editor.prototype.getTabText = function() {
      return this.buildIndentString(1);
    };

    Editor.prototype.getTabLength = function() {
      return this.displayBuffer.getTabLength();
    };

    Editor.prototype.setTabLength = function(tabLength) {
      return this.displayBuffer.setTabLength(tabLength);
    };

    Editor.prototype.clipBufferPosition = function(bufferPosition) {
      return this.buffer.clipPosition(bufferPosition);
    };

    Editor.prototype.clipBufferRange = function(range) {
      return this.buffer.clipRange(range);
    };

    Editor.prototype.indentationForBufferRow = function(bufferRow) {
      return this.indentLevelForLine(this.lineForBufferRow(bufferRow));
    };

    Editor.prototype.setIndentationForBufferRow = function(bufferRow, newLevel, arg) {
      var endColumn, newIndentString, preserveLeadingWhitespace;
      preserveLeadingWhitespace = (arg != null ? arg : {}).preserveLeadingWhitespace;
      if (preserveLeadingWhitespace) {
        endColumn = 0;
      } else {
        endColumn = this.lineForBufferRow(bufferRow).match(/^\s*/)[0].length;
      }
      newIndentString = this.buildIndentString(newLevel);
      return this.buffer.setTextInRange([[bufferRow, 0], [bufferRow, endColumn]], newIndentString);
    };

    Editor.prototype.indentLevelForLine = function(line) {
      return this.displayBuffer.indentLevelForLine(line);
    };

    Editor.prototype.buildIndentString = function(number) {
      if (this.getSoftTabs()) {
        return _.multiplyString(" ", Math.floor(number * this.getTabLength()));
      } else {
        return _.multiplyString("\t", Math.floor(number));
      }
    };

    Editor.prototype.save = function() {
      return this.buffer.save();
    };

    Editor.prototype.saveAs = function(filePath) {
      return this.buffer.saveAs(filePath);
    };

    Editor.prototype.checkoutHead = function() {
      var filePath, ref1;
      if (filePath = this.getPath()) {
        return (ref1 = atom.project.getRepo()) != null ? ref1.checkoutHead(filePath) : void 0;
      }
    };

    Editor.prototype.copyPathToClipboard = function() {
      var filePath;
      if (filePath = this.getPath()) {
        return atom.clipboard.write(filePath);
      }
    };

    Editor.prototype.getPath = function() {
      return this.buffer.getPath();
    };

    Editor.prototype.getText = function() {
      return this.buffer.getText();
    };

    Editor.prototype.setText = function(text) {
      return this.buffer.setText(text);
    };

    Editor.prototype.getTextInRange = function(range) {
      return this.buffer.getTextInRange(range);
    };

    Editor.prototype.getLineCount = function() {
      return this.buffer.getLineCount();
    };

    Editor.prototype.getBuffer = function() {
      return this.buffer;
    };

    Editor.prototype.getUri = function() {
      return this.buffer.getUri();
    };

    Editor.prototype.isBufferRowBlank = function(bufferRow) {
      return this.buffer.isRowBlank(bufferRow);
    };

    Editor.prototype.isBufferRowCommented = function(bufferRow) {
      var match, scopes;
      if (match = this.lineForBufferRow(bufferRow).match(/\S/)) {
        scopes = this.tokenForBufferPosition([bufferRow, match.index]).scopes;
        return new TextMateScopeSelector('comment.*').matches(scopes);
      }
    };

    Editor.prototype.nextNonBlankBufferRow = function(bufferRow) {
      return this.buffer.nextNonBlankRow(bufferRow);
    };

    Editor.prototype.getEofBufferPosition = function() {
      return this.buffer.getEndPosition();
    };

    Editor.prototype.getLastBufferRow = function() {
      return this.buffer.getLastRow();
    };

    Editor.prototype.bufferRangeForBufferRow = function(row, arg) {
      var includeNewline;
      includeNewline = (arg != null ? arg : {}).includeNewline;
      return this.buffer.rangeForRow(row, includeNewline);
    };

    Editor.prototype.lineForBufferRow = function(row) {
      return this.buffer.lineForRow(row);
    };

    Editor.prototype.lineLengthForBufferRow = function(row) {
      return this.buffer.lineLengthForRow(row);
    };

    Editor.prototype.scan = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.buffer).scan.apply(ref1, args);
    };

    Editor.prototype.scanInBufferRange = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.buffer).scanInRange.apply(ref1, args);
    };

    Editor.prototype.backwardsScanInBufferRange = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.buffer).backwardsScanInRange.apply(ref1, args);
    };

    Editor.prototype.isModified = function() {
      return this.buffer.isModified();
    };

    Editor.prototype.shouldPromptToSave = function() {
      return this.isModified() && !this.buffer.hasMultipleEditors();
    };

    Editor.prototype.screenPositionForBufferPosition = function(bufferPosition, options) {
      return this.displayBuffer.screenPositionForBufferPosition(bufferPosition, options);
    };

    Editor.prototype.bufferPositionForScreenPosition = function(screenPosition, options) {
      return this.displayBuffer.bufferPositionForScreenPosition(screenPosition, options);
    };

    Editor.prototype.screenRangeForBufferRange = function(bufferRange) {
      return this.displayBuffer.screenRangeForBufferRange(bufferRange);
    };

    Editor.prototype.bufferRangeForScreenRange = function(screenRange) {
      return this.displayBuffer.bufferRangeForScreenRange(screenRange);
    };

    Editor.prototype.clipScreenPosition = function(screenPosition, options) {
      return this.displayBuffer.clipScreenPosition(screenPosition, options);
    };

    Editor.prototype.lineForScreenRow = function(row) {
      return this.displayBuffer.lineForRow(row);
    };

    Editor.prototype.linesForScreenRows = function(start, end) {
      return this.displayBuffer.linesForRows(start, end);
    };

    Editor.prototype.getScreenLineCount = function() {
      return this.displayBuffer.getLineCount();
    };

    Editor.prototype.getMaxScreenLineLength = function() {
      return this.displayBuffer.getMaxLineLength();
    };

    Editor.prototype.getLastScreenRow = function() {
      return this.displayBuffer.getLastRow();
    };

    Editor.prototype.bufferRowsForScreenRows = function(startRow, endRow) {
      return this.displayBuffer.bufferRowsForScreenRows(startRow, endRow);
    };

    Editor.prototype.bufferRowForScreenRow = function(row) {
      return this.displayBuffer.bufferRowForScreenRow(row);
    };

    Editor.prototype.scopesForBufferPosition = function(bufferPosition) {
      return this.displayBuffer.scopesForBufferPosition(bufferPosition);
    };

    Editor.prototype.bufferRangeForScopeAtCursor = function(selector) {
      return this.displayBuffer.bufferRangeForScopeAtPosition(selector, this.getCursorBufferPosition());
    };

    Editor.prototype.tokenForBufferPosition = function(bufferPosition) {
      return this.displayBuffer.tokenForBufferPosition(bufferPosition);
    };

    Editor.prototype.getCursorScopes = function() {
      return this.getCursor().getScopes();
    };

    Editor.prototype.logCursorScope = function() {
      return console.log(this.getCursorScopes());
    };

    Editor.prototype.insertText = function(text, options) {
      if (options == null) {
        options = {};
      }
      if (options.autoIndentNewline == null) {
        options.autoIndentNewline = this.shouldAutoIndent();
      }
      if (options.autoDecreaseIndent == null) {
        options.autoDecreaseIndent = this.shouldAutoIndent();
      }
      return this.mutateSelectedText(function(selection) {
        return selection.insertText(text, options);
      });
    };

    Editor.prototype.insertNewline = function() {
      return this.insertText('\n');
    };

    Editor.prototype.insertNewlineBelow = function() {
      return this.transact((function(_this) {
        return function() {
          _this.moveCursorToEndOfLine();
          return _this.insertNewline();
        };
      })(this));
    };

    Editor.prototype.insertNewlineAbove = function() {
      return this.transact((function(_this) {
        return function() {
          var bufferRow, indentLevel, onFirstLine;
          bufferRow = _this.getCursorBufferPosition().row;
          indentLevel = _this.indentationForBufferRow(bufferRow);
          onFirstLine = bufferRow === 0;
          _this.moveCursorToBeginningOfLine();
          _this.moveCursorLeft();
          _this.insertNewline();
          if (_this.shouldAutoIndent() && _this.indentationForBufferRow(bufferRow) < indentLevel) {
            _this.setIndentationForBufferRow(bufferRow, indentLevel);
          }
          if (onFirstLine) {
            _this.moveCursorUp();
            return _this.moveCursorToEndOfLine();
          }
        };
      })(this));
    };

    Editor.prototype.indent = function(options) {
      if (options == null) {
        options = {};
      }
      if (options.autoIndent == null) {
        options.autoIndent = this.shouldAutoIndent();
      }
      return this.mutateSelectedText(function(selection) {
        return selection.indent(options);
      });
    };

    Editor.prototype.backspace = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.backspace();
      });
    };

    Editor.prototype.backspaceToBeginningOfWord = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.backspaceToBeginningOfWord();
      });
    };

    Editor.prototype.backspaceToBeginningOfLine = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.backspaceToBeginningOfLine();
      });
    };

    Editor.prototype["delete"] = function() {
      return this.mutateSelectedText(function(selection) {
        return selection["delete"]();
      });
    };

    Editor.prototype.deleteToEndOfWord = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.deleteToEndOfWord();
      });
    };

    Editor.prototype.deleteLine = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.deleteLine();
      });
    };

    Editor.prototype.indentSelectedRows = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.indentSelectedRows();
      });
    };

    Editor.prototype.outdentSelectedRows = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.outdentSelectedRows();
      });
    };

    Editor.prototype.toggleLineCommentsInSelection = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.toggleLineComments();
      });
    };

    Editor.prototype.autoIndentSelectedRows = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.autoIndentSelectedRows();
      });
    };

    Editor.prototype.normalizeTabsInBufferRange = function(bufferRange) {
      if (!this.getSoftTabs()) {
        return;
      }
      return this.scanInBufferRange(/\t/g, bufferRange, (function(_this) {
        return function(arg) {
          var replace;
          replace = arg.replace;
          return replace(_this.getTabText());
        };
      })(this));
    };

    Editor.prototype.cutToEndOfLine = function() {
      var maintainClipboard;
      maintainClipboard = false;
      return this.mutateSelectedText(function(selection) {
        selection.cutToEndOfLine(maintainClipboard);
        return maintainClipboard = true;
      });
    };

    Editor.prototype.cutSelectedText = function() {
      var maintainClipboard;
      maintainClipboard = false;
      return this.mutateSelectedText(function(selection) {
        selection.cut(maintainClipboard);
        return maintainClipboard = true;
      });
    };

    Editor.prototype.copySelectedText = function() {
      var j, len, maintainClipboard, ref1, results, selection;
      maintainClipboard = false;
      ref1 = this.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        selection.copy(maintainClipboard);
        results.push(maintainClipboard = true);
      }
      return results;
    };

    Editor.prototype.pasteText = function(options) {
      var containsNewlines, metadata, ref1, text;
      if (options == null) {
        options = {};
      }
      ref1 = atom.clipboard.readWithMetadata(), text = ref1.text, metadata = ref1.metadata;
      containsNewlines = text.indexOf('\n') !== -1;
      if (((metadata != null ? metadata.selections : void 0) != null) && metadata.selections.length === this.getSelections().length) {
        this.mutateSelectedText((function(_this) {
          return function(selection, index) {
            text = metadata.selections[index];
            return selection.insertText(text, options);
          };
        })(this));
        return;
      } else if (atom.config.get("editor.normalizeIndentOnPaste") && ((metadata != null ? metadata.indentBasis : void 0) != null)) {
        if (!this.getCursor().hasPrecedingCharactersOnLine() || containsNewlines) {
          if (options.indentBasis == null) {
            options.indentBasis = metadata.indentBasis;
          }
        }
      }
      return this.insertText(text, options);
    };

    Editor.prototype.undo = function() {
      this.getCursor().needsAutoscroll = true;
      return this.buffer.undo(this);
    };

    Editor.prototype.redo = function() {
      this.getCursor().needsAutoscroll = true;
      return this.buffer.redo(this);
    };

    Editor.prototype.foldCurrentRow = function() {
      var bufferRow;
      bufferRow = this.bufferPositionForScreenPosition(this.getCursorScreenPosition()).row;
      return this.foldBufferRow(bufferRow);
    };

    Editor.prototype.unfoldCurrentRow = function() {
      var bufferRow;
      bufferRow = this.bufferPositionForScreenPosition(this.getCursorScreenPosition()).row;
      return this.unfoldBufferRow(bufferRow);
    };

    Editor.prototype.foldSelectedLines = function() {
      var j, len, ref1, results, selection;
      ref1 = this.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        results.push(selection.fold());
      }
      return results;
    };

    Editor.prototype.foldAll = function() {
      return this.languageMode.foldAll();
    };

    Editor.prototype.unfoldAll = function() {
      return this.languageMode.unfoldAll();
    };

    Editor.prototype.foldAllAtIndentLevel = function(level) {
      return this.languageMode.foldAllAtIndentLevel(level);
    };

    Editor.prototype.foldBufferRow = function(bufferRow) {
      return this.languageMode.foldBufferRow(bufferRow);
    };

    Editor.prototype.unfoldBufferRow = function(bufferRow) {
      return this.displayBuffer.unfoldBufferRow(bufferRow);
    };

    Editor.prototype.isFoldableAtBufferRow = function(bufferRow) {
      return this.languageMode.isFoldableAtBufferRow(bufferRow);
    };

    Editor.prototype.createFold = function(startRow, endRow) {
      return this.displayBuffer.createFold(startRow, endRow);
    };

    Editor.prototype.destroyFoldWithId = function(id) {
      return this.displayBuffer.destroyFoldWithId(id);
    };

    Editor.prototype.destroyFoldsIntersectingBufferRange = function(bufferRange) {
      var j, ref1, ref2, results, row;
      results = [];
      for (row = j = ref1 = bufferRange.start.row, ref2 = bufferRange.end.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; row = ref1 <= ref2 ? ++j : --j) {
        results.push(this.unfoldBufferRow(row));
      }
      return results;
    };

    Editor.prototype.toggleFoldAtBufferRow = function(bufferRow) {
      if (this.isFoldedAtBufferRow(bufferRow)) {
        return this.unfoldBufferRow(bufferRow);
      } else {
        return this.foldBufferRow(bufferRow);
      }
    };

    Editor.prototype.isFoldedAtCursorRow = function() {
      return this.isFoldedAtScreenRow(this.getCursorScreenRow());
    };

    Editor.prototype.isFoldedAtBufferRow = function(bufferRow) {
      return this.displayBuffer.isFoldedAtBufferRow(bufferRow);
    };

    Editor.prototype.isFoldedAtScreenRow = function(screenRow) {
      return this.displayBuffer.isFoldedAtScreenRow(screenRow);
    };

    Editor.prototype.largestFoldContainingBufferRow = function(bufferRow) {
      return this.displayBuffer.largestFoldContainingBufferRow(bufferRow);
    };

    Editor.prototype.largestFoldStartingAtScreenRow = function(screenRow) {
      return this.displayBuffer.largestFoldStartingAtScreenRow(screenRow);
    };

    Editor.prototype.outermostFoldsInBufferRowRange = function(startRow, endRow) {
      return this.displayBuffer.outermostFoldsInBufferRowRange(startRow, endRow);
    };

    Editor.prototype.moveLineUp = function() {
      var lastRow, selection;
      selection = this.getSelectedBufferRange();
      if (selection.start.row === 0) {
        return;
      }
      lastRow = this.buffer.getLastRow();
      if (selection.isEmpty() && selection.start.row === lastRow && this.buffer.getLastLine() === '') {
        return;
      }
      return this.transact((function(_this) {
        return function() {
          var bufferRange, endPosition, endRow, fold, foldedRow, foldedRows, insertDelta, insertPosition, j, k, l, len, len1, lines, precedingBufferRow, precedingScreenRow, ref1, ref2, results, row, rows, startRow;
          foldedRows = [];
          rows = (function() {
            results = [];
            for (var j = ref1 = selection.start.row, ref2 = selection.end.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; ref1 <= ref2 ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this);
          if (selection.start.row !== selection.end.row && selection.end.column === 0) {
            if (!_this.isFoldedAtBufferRow(selection.end.row)) {
              rows.pop();
            }
          }
          precedingScreenRow = _this.screenPositionForBufferPosition([selection.start.row]).translate([-1]);
          precedingBufferRow = _this.bufferPositionForScreenPosition(precedingScreenRow).row;
          if (fold = _this.largestFoldContainingBufferRow(precedingBufferRow)) {
            insertDelta = fold.getBufferRange().getRowCount();
          } else {
            insertDelta = 1;
          }
          for (k = 0, len = rows.length; k < len; k++) {
            row = rows[k];
            if (fold = _this.displayBuffer.largestFoldStartingAtBufferRow(row)) {
              bufferRange = fold.getBufferRange();
              startRow = bufferRange.start.row;
              endRow = bufferRange.end.row;
              foldedRows.push(startRow - insertDelta);
            } else {
              startRow = row;
              endRow = row;
            }
            insertPosition = Point.fromObject([startRow - insertDelta]);
            endPosition = Point.min([endRow + 1], _this.buffer.getEndPosition());
            lines = _this.buffer.getTextInRange([[startRow], endPosition]);
            if (endPosition.row === lastRow && endPosition.column > 0 && !_this.buffer.lineEndingForRow(endPosition.row)) {
              lines = lines + "\n";
            }
            _this.buffer.deleteRows(startRow, endRow);
            if (fold = _this.displayBuffer.largestFoldStartingAtBufferRow(insertPosition.row)) {
              _this.unfoldBufferRow(insertPosition.row);
              foldedRows.push(insertPosition.row + endRow - startRow + fold.getBufferRange().getRowCount());
            }
            _this.buffer.insert(insertPosition, lines);
          }
          for (l = 0, len1 = foldedRows.length; l < len1; l++) {
            foldedRow = foldedRows[l];
            if ((0 <= foldedRow && foldedRow <= _this.getLastBufferRow())) {
              _this.foldBufferRow(foldedRow);
            }
          }
          return _this.setSelectedBufferRange(selection.translate([-insertDelta]), {
            preserveFolds: true,
            autoscroll: true
          });
        };
      })(this));
    };

    Editor.prototype.moveLineDown = function() {
      var lastRow, selection;
      selection = this.getSelectedBufferRange();
      lastRow = this.buffer.getLastRow();
      if (selection.end.row === lastRow) {
        return;
      }
      if (selection.end.row === lastRow - 1 && this.buffer.getLastLine() === '') {
        return;
      }
      return this.transact((function(_this) {
        return function() {
          var bufferRange, endPosition, endRow, fold, foldedRow, foldedRows, followingBufferRow, followingScreenRow, insertDelta, insertPosition, j, k, l, len, len1, lines, ref1, ref2, results, row, rows, startRow;
          foldedRows = [];
          rows = (function() {
            results = [];
            for (var j = ref1 = selection.end.row, ref2 = selection.start.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; ref1 <= ref2 ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this);
          if (selection.start.row !== selection.end.row && selection.end.column === 0) {
            if (!_this.isFoldedAtBufferRow(selection.end.row)) {
              rows.shift();
            }
          }
          followingScreenRow = _this.screenPositionForBufferPosition([selection.end.row]).translate([1]);
          followingBufferRow = _this.bufferPositionForScreenPosition(followingScreenRow).row;
          if (fold = _this.largestFoldContainingBufferRow(followingBufferRow)) {
            insertDelta = fold.getBufferRange().getRowCount();
          } else {
            insertDelta = 1;
          }
          for (k = 0, len = rows.length; k < len; k++) {
            row = rows[k];
            if (fold = _this.displayBuffer.largestFoldStartingAtBufferRow(row)) {
              bufferRange = fold.getBufferRange();
              startRow = bufferRange.start.row;
              endRow = bufferRange.end.row;
              foldedRows.push(endRow + insertDelta);
            } else {
              startRow = row;
              endRow = row;
            }
            if (endRow + 1 === lastRow) {
              endPosition = [endRow, _this.buffer.lineLengthForRow(endRow)];
            } else {
              endPosition = [endRow + 1];
            }
            lines = _this.buffer.getTextInRange([[startRow], endPosition]);
            _this.buffer.deleteRows(startRow, endRow);
            insertPosition = Point.min([startRow + insertDelta], _this.buffer.getEndPosition());
            if (insertPosition.row === _this.buffer.getLastRow() && insertPosition.column > 0) {
              lines = "\n" + lines;
            }
            if (fold = _this.displayBuffer.largestFoldStartingAtBufferRow(insertPosition.row)) {
              _this.unfoldBufferRow(insertPosition.row);
              foldedRows.push(insertPosition.row + fold.getBufferRange().getRowCount());
            }
            _this.buffer.insert(insertPosition, lines);
          }
          for (l = 0, len1 = foldedRows.length; l < len1; l++) {
            foldedRow = foldedRows[l];
            if ((0 <= foldedRow && foldedRow <= _this.getLastBufferRow())) {
              _this.foldBufferRow(foldedRow);
            }
          }
          return _this.setSelectedBufferRange(selection.translate([insertDelta]), {
            preserveFolds: true,
            autoscroll: true
          });
        };
      })(this));
    };

    Editor.prototype.duplicateLines = function() {
      return this.transact((function(_this) {
        return function() {
          var delta, endRow, foldEndRow, foldStartRow, foldedRowRanges, j, len, rangeToDuplicate, ref1, ref2, results, selectedBufferRange, selection, start, startRow, textToDuplicate;
          ref1 = _this.getSelectionsOrderedByBufferPosition().reverse();
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            selection = ref1[j];
            selectedBufferRange = selection.getBufferRange();
            if (selection.isEmpty()) {
              start = selection.getScreenRange().start;
              selection.selectToScreenPosition([start.row + 1, 0]);
            }
            ref2 = selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
            endRow++;
            foldedRowRanges = _this.outermostFoldsInBufferRowRange(startRow, endRow).map(function(fold) {
              return fold.getBufferRowRange();
            });
            rangeToDuplicate = [[startRow, 0], [endRow, 0]];
            textToDuplicate = _this.getTextInBufferRange(rangeToDuplicate);
            if (endRow > _this.getLastBufferRow()) {
              textToDuplicate = '\n' + textToDuplicate;
            }
            _this.buffer.insert([endRow, 0], textToDuplicate);
            delta = endRow - startRow;
            selection.setBufferRange(selectedBufferRange.translate([delta, 0]));
            results.push((function() {
              var k, len1, ref3, results1;
              results1 = [];
              for (k = 0, len1 = foldedRowRanges.length; k < len1; k++) {
                ref3 = foldedRowRanges[k], foldStartRow = ref3[0], foldEndRow = ref3[1];
                results1.push(this.createFold(foldStartRow + delta, foldEndRow + delta));
              }
              return results1;
            }).call(_this));
          }
          return results;
        };
      })(this));
    };

    Editor.prototype.duplicateLine = function() {
      deprecate("Use Editor::duplicateLines() instead");
      return this.duplicateLines();
    };

    Editor.prototype.mutateSelectedText = function(fn) {
      return this.transact((function(_this) {
        return function() {
          var index, j, len, ref1, results, selection;
          ref1 = _this.getSelections();
          results = [];
          for (index = j = 0, len = ref1.length; j < len; index = ++j) {
            selection = ref1[index];
            results.push(fn(selection, index));
          }
          return results;
        };
      })(this));
    };

    Editor.prototype.replaceSelectedText = function(options, fn) {
      var selectWordIfEmpty;
      if (options == null) {
        options = {};
      }
      selectWordIfEmpty = options.selectWordIfEmpty;
      return this.mutateSelectedText(function(selection) {
        var range, text;
        range = selection.getBufferRange();
        if (selectWordIfEmpty && selection.isEmpty()) {
          selection.selectWord();
        }
        text = selection.getText();
        selection.deleteSelectedText();
        selection.insertText(fn(text));
        return selection.setBufferRange(range);
      });
    };

    Editor.prototype.getMarker = function(id) {
      return this.displayBuffer.getMarker(id);
    };

    Editor.prototype.getMarkers = function() {
      return this.displayBuffer.getMarkers();
    };

    Editor.prototype.findMarkers = function(properties) {
      return this.displayBuffer.findMarkers(properties);
    };

    Editor.prototype.markScreenRange = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.displayBuffer).markScreenRange.apply(ref1, args);
    };

    Editor.prototype.markBufferRange = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.displayBuffer).markBufferRange.apply(ref1, args);
    };

    Editor.prototype.markScreenPosition = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.displayBuffer).markScreenPosition.apply(ref1, args);
    };

    Editor.prototype.markBufferPosition = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.displayBuffer).markBufferPosition.apply(ref1, args);
    };

    Editor.prototype.destroyMarker = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.displayBuffer).destroyMarker.apply(ref1, args);
    };

    Editor.prototype.getMarkerCount = function() {
      return this.buffer.getMarkerCount();
    };

    Editor.prototype.hasMultipleCursors = function() {
      return this.getCursors().length > 1;
    };

    Editor.prototype.getCursors = function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Array, this.cursors, function(){});
    };

    Editor.prototype.getCursor = function() {
      return _.last(this.cursors);
    };

    Editor.prototype.addCursorAtScreenPosition = function(screenPosition) {
      this.markScreenPosition(screenPosition, this.getSelectionMarkerAttributes());
      return this.getLastSelection().cursor;
    };

    Editor.prototype.addCursorAtBufferPosition = function(bufferPosition) {
      this.markBufferPosition(bufferPosition, this.getSelectionMarkerAttributes());
      return this.getLastSelection().cursor;
    };

    Editor.prototype.addCursor = function(marker) {
      var cursor;
      cursor = new Cursor({
        editor: this,
        marker: marker
      });
      this.cursors.push(cursor);
      this.emit('cursor-added', cursor);
      return cursor;
    };

    Editor.prototype.removeCursor = function(cursor) {
      return _.remove(this.cursors, cursor);
    };

    Editor.prototype.addSelection = function(marker, options) {
      var cursor, j, len, ref1, selection, selectionBufferRange;
      if (options == null) {
        options = {};
      }
      if (!marker.getAttributes().preserveFolds) {
        this.destroyFoldsIntersectingBufferRange(marker.getBufferRange());
      }
      cursor = this.addCursor(marker);
      selection = new Selection(_.extend({
        editor: this,
        marker: marker,
        cursor: cursor
      }, options));
      this.selections.push(selection);
      selectionBufferRange = selection.getBufferRange();
      this.mergeIntersectingSelections();
      if (selection.destroyed) {
        ref1 = this.getSelections();
        for (j = 0, len = ref1.length; j < len; j++) {
          selection = ref1[j];
          if (selection.intersectsBufferRange(selectionBufferRange)) {
            return selection;
          }
        }
      } else {
        this.emit('selection-added', selection);
        return selection;
      }
    };

    Editor.prototype.addSelectionForBufferRange = function(bufferRange, options) {
      if (options == null) {
        options = {};
      }
      this.markBufferRange(bufferRange, _.defaults(this.getSelectionMarkerAttributes(), options));
      return this.getLastSelection();
    };

    Editor.prototype.setSelectedBufferRange = function(bufferRange, options) {
      return this.setSelectedBufferRanges([bufferRange], options);
    };

    Editor.prototype.setSelectedScreenRange = function(screenRange, options) {
      return this.setSelectedBufferRange(this.bufferRangeForScreenRange(screenRange, options), options);
    };

    Editor.prototype.setSelectedBufferRanges = function(bufferRanges, options) {
      var j, len, ref1, selection, selections;
      if (options == null) {
        options = {};
      }
      if (!bufferRanges.length) {
        throw new Error("Passed an empty array to setSelectedBufferRanges");
      }
      selections = this.getSelections();
      ref1 = selections.slice(bufferRanges.length);
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        selection.destroy();
      }
      return this.mergeIntersectingSelections(options, (function(_this) {
        return function() {
          var bufferRange, i, k, len1, results;
          results = [];
          for (i = k = 0, len1 = bufferRanges.length; k < len1; i = ++k) {
            bufferRange = bufferRanges[i];
            bufferRange = Range.fromObject(bufferRange);
            if (selections[i]) {
              results.push(selections[i].setBufferRange(bufferRange, options));
            } else {
              results.push(_this.addSelectionForBufferRange(bufferRange, options));
            }
          }
          return results;
        };
      })(this));
    };

    Editor.prototype.removeSelection = function(selection) {
      _.remove(this.selections, selection);
      return this.emit('selection-removed', selection);
    };

    Editor.prototype.clearSelections = function() {
      this.consolidateSelections();
      return this.getSelection().clear();
    };

    Editor.prototype.consolidateSelections = function() {
      var j, len, ref1, selection, selections;
      selections = this.getSelections();
      if (selections.length > 1) {
        ref1 = selections.slice(0, -1);
        for (j = 0, len = ref1.length; j < len; j++) {
          selection = ref1[j];
          selection.destroy();
        }
        return true;
      } else {
        return false;
      }
    };

    Editor.prototype.selectionScreenRangeChanged = function(selection) {
      return this.emit('selection-screen-range-changed', selection);
    };

    Editor.prototype.getSelections = function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Array, this.selections, function(){});
    };

    Editor.prototype.getSelection = function(index) {
      if (index == null) {
        index = this.selections.length - 1;
      }
      return this.selections[index];
    };

    Editor.prototype.getLastSelection = function() {
      return _.last(this.selections);
    };

    Editor.prototype.getSelectionsOrderedByBufferPosition = function() {
      return this.getSelections().sort(function(a, b) {
        return a.compare(b);
      });
    };

    Editor.prototype.getLastSelectionInBuffer = function() {
      return _.last(this.getSelectionsOrderedByBufferPosition());
    };

    Editor.prototype.selectionIntersectsBufferRange = function(bufferRange) {
      return _.any(this.getSelections(), function(selection) {
        return selection.intersectsBufferRange(bufferRange);
      });
    };

    Editor.prototype.setCursorScreenPosition = function(position, options) {
      return this.moveCursors(function(cursor) {
        return cursor.setScreenPosition(position, options);
      });
    };

    Editor.prototype.getCursorScreenPosition = function() {
      return this.getCursor().getScreenPosition();
    };

    Editor.prototype.getCursorScreenRow = function() {
      return this.getCursor().getScreenRow();
    };

    Editor.prototype.setCursorBufferPosition = function(position, options) {
      return this.moveCursors(function(cursor) {
        return cursor.setBufferPosition(position, options);
      });
    };

    Editor.prototype.getCursorBufferPosition = function() {
      return this.getCursor().getBufferPosition();
    };

    Editor.prototype.getSelectedScreenRange = function() {
      return this.getLastSelection().getScreenRange();
    };

    Editor.prototype.getSelectedBufferRange = function() {
      return this.getLastSelection().getBufferRange();
    };

    Editor.prototype.getSelectedBufferRanges = function() {
      var j, len, ref1, results, selection;
      ref1 = this.getSelectionsOrderedByBufferPosition();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        results.push(selection.getBufferRange());
      }
      return results;
    };

    Editor.prototype.getSelectedScreenRanges = function() {
      var j, len, ref1, results, selection;
      ref1 = this.getSelectionsOrderedByBufferPosition();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        results.push(selection.getScreenRange());
      }
      return results;
    };

    Editor.prototype.getSelectedText = function() {
      return this.getLastSelection().getText();
    };

    Editor.prototype.getTextInBufferRange = function(range) {
      return this.buffer.getTextInRange(range);
    };

    Editor.prototype.setTextInBufferRange = function(range, text) {
      return this.getBuffer().setTextInRange(range, text);
    };

    Editor.prototype.getCurrentParagraphBufferRange = function() {
      return this.getCursor().getCurrentParagraphBufferRange();
    };

    Editor.prototype.getWordUnderCursor = function(options) {
      return this.getTextInBufferRange(this.getCursor().getCurrentWordBufferRange(options));
    };

    Editor.prototype.moveCursorUp = function(lineCount) {
      return this.moveCursors(function(cursor) {
        return cursor.moveUp(lineCount, {
          moveToEndOfSelection: true
        });
      });
    };

    Editor.prototype.moveCursorDown = function(lineCount) {
      return this.moveCursors(function(cursor) {
        return cursor.moveDown(lineCount, {
          moveToEndOfSelection: true
        });
      });
    };

    Editor.prototype.moveCursorLeft = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveLeft({
          moveToEndOfSelection: true
        });
      });
    };

    Editor.prototype.moveCursorRight = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveRight({
          moveToEndOfSelection: true
        });
      });
    };

    Editor.prototype.moveCursorToTop = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToTop();
      });
    };

    Editor.prototype.moveCursorToBottom = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToBottom();
      });
    };

    Editor.prototype.moveCursorToBeginningOfScreenLine = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToBeginningOfScreenLine();
      });
    };

    Editor.prototype.moveCursorToBeginningOfLine = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToBeginningOfLine();
      });
    };

    Editor.prototype.moveCursorToFirstCharacterOfLine = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToFirstCharacterOfLine();
      });
    };

    Editor.prototype.moveCursorToEndOfScreenLine = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToEndOfScreenLine();
      });
    };

    Editor.prototype.moveCursorToEndOfLine = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToEndOfLine();
      });
    };

    Editor.prototype.moveCursorToBeginningOfWord = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToBeginningOfWord();
      });
    };

    Editor.prototype.moveCursorToEndOfWord = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToEndOfWord();
      });
    };

    Editor.prototype.moveCursorToBeginningOfNextWord = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToBeginningOfNextWord();
      });
    };

    Editor.prototype.moveCursorToPreviousWordBoundary = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToPreviousWordBoundary();
      });
    };

    Editor.prototype.moveCursorToNextWordBoundary = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToNextWordBoundary();
      });
    };

    Editor.prototype.scrollToCursorPosition = function() {
      return this.getCursor().autoscroll();
    };

    Editor.prototype.pageUp = function() {
      return this.setScrollTop(this.getScrollTop() - this.getHeight());
    };

    Editor.prototype.pageDown = function() {
      return this.setScrollTop(this.getScrollTop() + this.getHeight());
    };

    Editor.prototype.moveCursors = function(fn) {
      this.movingCursors = true;
      return this.batchUpdates((function(_this) {
        return function() {
          var cursor, j, len, ref1;
          ref1 = _this.getCursors();
          for (j = 0, len = ref1.length; j < len; j++) {
            cursor = ref1[j];
            fn(cursor);
          }
          _this.mergeCursors();
          _this.movingCursors = false;
          return _this.emit('cursors-moved');
        };
      })(this));
    };

    Editor.prototype.cursorMoved = function(event) {
      this.emit('cursor-moved', event);
      if (!this.movingCursors) {
        return this.emit('cursors-moved');
      }
    };

    Editor.prototype.selectToScreenPosition = function(position) {
      var lastSelection;
      lastSelection = this.getLastSelection();
      lastSelection.selectToScreenPosition(position);
      return this.mergeIntersectingSelections({
        reversed: lastSelection.isReversed()
      });
    };

    Editor.prototype.selectRight = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectRight();
        };
      })(this));
    };

    Editor.prototype.selectLeft = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectLeft();
        };
      })(this));
    };

    Editor.prototype.selectUp = function(rowCount) {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectUp(rowCount);
        };
      })(this));
    };

    Editor.prototype.selectDown = function(rowCount) {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectDown(rowCount);
        };
      })(this));
    };

    Editor.prototype.selectToTop = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectToTop();
        };
      })(this));
    };

    Editor.prototype.selectAll = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectAll();
        };
      })(this));
    };

    Editor.prototype.selectToBottom = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectToBottom();
        };
      })(this));
    };

    Editor.prototype.selectToBeginningOfLine = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectToBeginningOfLine();
        };
      })(this));
    };

    Editor.prototype.selectToFirstCharacterOfLine = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectToFirstCharacterOfLine();
        };
      })(this));
    };

    Editor.prototype.selectToEndOfLine = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectToEndOfLine();
        };
      })(this));
    };

    Editor.prototype.selectToPreviousWordBoundary = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectToPreviousWordBoundary();
        };
      })(this));
    };

    Editor.prototype.selectToNextWordBoundary = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectToNextWordBoundary();
        };
      })(this));
    };

    Editor.prototype.selectLine = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectLine();
        };
      })(this));
    };

    Editor.prototype.addSelectionBelow = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.addSelectionBelow();
        };
      })(this));
    };

    Editor.prototype.addSelectionAbove = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.addSelectionAbove();
        };
      })(this));
    };

    Editor.prototype.splitSelectionsIntoLines = function() {
      var end, j, len, range, ref1, results, row, selection, start;
      ref1 = this.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        range = selection.getBufferRange();
        if (range.isSingleLine()) {
          continue;
        }
        selection.destroy();
        start = range.start, end = range.end;
        this.addSelectionForBufferRange([start, [start.row, 2e308]]);
        row = start.row;
        while (++row < end.row) {
          this.addSelectionForBufferRange([[row, 0], [row, 2e308]]);
        }
        results.push(this.addSelectionForBufferRange([[end.row, 0], [end.row, end.column]]));
      }
      return results;
    };

    Editor.prototype.transpose = function() {
      return this.mutateSelectedText((function(_this) {
        return function(selection) {
          var text;
          if (selection.isEmpty()) {
            selection.selectRight();
            text = selection.getText();
            selection["delete"]();
            selection.cursor.moveLeft();
            return selection.insertText(text);
          } else {
            return selection.insertText(selection.getText().split('').reverse().join(''));
          }
        };
      })(this));
    };

    Editor.prototype.upperCase = function() {
      return this.replaceSelectedText({
        selectWordIfEmpty: true
      }, (function(_this) {
        return function(text) {
          return text.toUpperCase();
        };
      })(this));
    };

    Editor.prototype.lowerCase = function() {
      return this.replaceSelectedText({
        selectWordIfEmpty: true
      }, (function(_this) {
        return function(text) {
          return text.toLowerCase();
        };
      })(this));
    };

    Editor.prototype.joinLines = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.joinLines();
      });
    };

    Editor.prototype.selectToBeginningOfWord = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectToBeginningOfWord();
        };
      })(this));
    };

    Editor.prototype.selectToEndOfWord = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectToEndOfWord();
        };
      })(this));
    };

    Editor.prototype.selectToBeginningOfNextWord = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectToBeginningOfNextWord();
        };
      })(this));
    };

    Editor.prototype.selectWord = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectWord();
        };
      })(this));
    };

    Editor.prototype.selectMarker = function(marker) {
      var range;
      if (marker.isValid()) {
        range = marker.getBufferRange();
        this.setSelectedBufferRange(range);
        return range;
      }
    };

    Editor.prototype.mergeCursors = function() {
      var cursor, j, len, position, positions, ref1, results;
      positions = [];
      ref1 = this.getCursors();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        cursor = ref1[j];
        position = cursor.getBufferPosition().toString();
        if (indexOf.call(positions, position) >= 0) {
          results.push(cursor.destroy());
        } else {
          results.push(positions.push(position));
        }
      }
      return results;
    };

    Editor.prototype.expandSelectionsForward = function(fn) {
      return this.mergeIntersectingSelections((function(_this) {
        return function() {
          var j, len, ref1, results, selection;
          ref1 = _this.getSelections();
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            selection = ref1[j];
            results.push(fn(selection));
          }
          return results;
        };
      })(this));
    };

    Editor.prototype.expandSelectionsBackward = function(fn) {
      return this.mergeIntersectingSelections({
        reversed: true
      }, (function(_this) {
        return function() {
          var j, len, ref1, results, selection;
          ref1 = _this.getSelections();
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            selection = ref1[j];
            results.push(fn(selection));
          }
          return results;
        };
      })(this));
    };

    Editor.prototype.finalizeSelections = function() {
      var j, len, ref1, results, selection;
      ref1 = this.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        results.push(selection.finalize());
      }
      return results;
    };

    Editor.prototype.mergeIntersectingSelections = function() {
      var args, fn, options, reducer, ref1, result;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (_.isFunction(_.last(args))) {
        fn = args.pop();
      }
      options = (ref1 = args.pop()) != null ? ref1 : {};
      if (this.suppressSelectionMerging) {
        return typeof fn === "function" ? fn() : void 0;
      }
      if (fn != null) {
        this.suppressSelectionMerging = true;
        result = fn();
        this.suppressSelectionMerging = false;
      }
      reducer = function(disjointSelections, selection) {
        var intersectingSelection;
        intersectingSelection = _.find(disjointSelections, function(s) {
          return s.intersectsWith(selection);
        });
        if (intersectingSelection != null) {
          intersectingSelection.merge(selection, options);
          return disjointSelections;
        } else {
          return disjointSelections.concat([selection]);
        }
      };
      return _.reduce(this.getSelections(), reducer, []);
    };

    Editor.prototype.preserveCursorPositionOnBufferReload = function() {
      var cursorPosition;
      cursorPosition = null;
      this.subscribe(this.buffer, "will-reload", (function(_this) {
        return function() {
          return cursorPosition = _this.getCursorBufferPosition();
        };
      })(this));
      return this.subscribe(this.buffer, "reloaded", (function(_this) {
        return function() {
          if (cursorPosition) {
            _this.setCursorBufferPosition(cursorPosition);
          }
          return cursorPosition = null;
        };
      })(this));
    };

    Editor.prototype.getGrammar = function() {
      return this.displayBuffer.getGrammar();
    };

    Editor.prototype.setGrammar = function(grammar) {
      return this.displayBuffer.setGrammar(grammar);
    };

    Editor.prototype.reloadGrammar = function() {
      return this.displayBuffer.reloadGrammar();
    };

    Editor.prototype.shouldAutoIndent = function() {
      return atom.config.get("editor.autoIndent");
    };

    Editor.prototype.transact = function(fn) {
      return this.batchUpdates((function(_this) {
        return function() {
          return _this.buffer.transact(fn);
        };
      })(this));
    };

    Editor.prototype.beginTransaction = function() {
      return this.buffer.beginTransaction();
    };

    Editor.prototype.commitTransaction = function() {
      return this.buffer.commitTransaction();
    };

    Editor.prototype.abortTransaction = function() {
      return this.buffer.abortTransaction();
    };

    Editor.prototype.batchUpdates = function(fn) {
      var result;
      this.emit('batched-updates-started');
      result = fn();
      this.emit('batched-updates-ended');
      return result;
    };

    Editor.prototype.inspect = function() {
      return "<Editor " + this.id + ">";
    };

    Editor.prototype.logScreenLines = function(start, end) {
      return this.displayBuffer.logLines(start, end);
    };

    Editor.prototype.handleGrammarChange = function() {
      this.unfoldAll();
      return this.emit('grammar-changed');
    };

    Editor.prototype.handleMarkerCreated = function(marker) {
      if (marker.matchesAttributes(this.getSelectionMarkerAttributes())) {
        return this.addSelection(marker);
      }
    };

    Editor.prototype.getSelectionMarkerAttributes = function() {
      return {
        type: 'selection',
        editorId: this.id,
        invalidate: 'never'
      };
    };

    Editor.prototype.getVerticalScrollMargin = function() {
      return this.displayBuffer.getVerticalScrollMargin();
    };

    Editor.prototype.setVerticalScrollMargin = function(verticalScrollMargin) {
      return this.displayBuffer.setVerticalScrollMargin(verticalScrollMargin);
    };

    Editor.prototype.getHorizontalScrollMargin = function() {
      return this.displayBuffer.getHorizontalScrollMargin();
    };

    Editor.prototype.setHorizontalScrollMargin = function(horizontalScrollMargin) {
      return this.displayBuffer.setHorizontalScrollMargin(horizontalScrollMargin);
    };

    Editor.prototype.getLineHeight = function() {
      return this.displayBuffer.getLineHeight();
    };

    Editor.prototype.setLineHeight = function(lineHeight) {
      return this.displayBuffer.setLineHeight(lineHeight);
    };

    Editor.prototype.getScopedCharWidth = function(scopeNames, char) {
      return this.displayBuffer.getScopedCharWidth(scopeNames, char);
    };

    Editor.prototype.setScopedCharWidth = function(scopeNames, char, width) {
      return this.displayBuffer.setScopedCharWidth(scopeNames, char, width);
    };

    Editor.prototype.getScopedCharWidths = function(scopeNames) {
      return this.displayBuffer.getScopedCharWidths(scopeNames);
    };

    Editor.prototype.clearScopedCharWidths = function() {
      return this.displayBuffer.clearScopedCharWidths();
    };

    Editor.prototype.getDefaultCharWidth = function() {
      return this.displayBuffer.getDefaultCharWidth();
    };

    Editor.prototype.setDefaultCharWidth = function(defaultCharWidth) {
      return this.displayBuffer.setDefaultCharWidth(defaultCharWidth);
    };

    Editor.prototype.setHeight = function(height) {
      return this.displayBuffer.setHeight(height);
    };

    Editor.prototype.getHeight = function() {
      return this.displayBuffer.getHeight();
    };

    Editor.prototype.setWidth = function(width) {
      return this.displayBuffer.setWidth(width);
    };

    Editor.prototype.getWidth = function() {
      return this.displayBuffer.getWidth();
    };

    Editor.prototype.getScrollTop = function() {
      return this.displayBuffer.getScrollTop();
    };

    Editor.prototype.setScrollTop = function(scrollTop) {
      return this.displayBuffer.setScrollTop(scrollTop);
    };

    Editor.prototype.getScrollBottom = function() {
      return this.displayBuffer.getScrollBottom();
    };

    Editor.prototype.setScrollBottom = function(scrollBottom) {
      return this.displayBuffer.setScrollBottom(scrollBottom);
    };

    Editor.prototype.getScrollLeft = function() {
      return this.displayBuffer.getScrollLeft();
    };

    Editor.prototype.setScrollLeft = function(scrollLeft) {
      return this.displayBuffer.setScrollLeft(scrollLeft);
    };

    Editor.prototype.getScrollRight = function() {
      return this.displayBuffer.getScrollRight();
    };

    Editor.prototype.setScrollRight = function(scrollRight) {
      return this.displayBuffer.setScrollRight(scrollRight);
    };

    Editor.prototype.getScrollHeight = function() {
      return this.displayBuffer.getScrollHeight();
    };

    Editor.prototype.getScrollWidth = function(scrollWidth) {
      return this.displayBuffer.getScrollWidth(scrollWidth);
    };

    Editor.prototype.getVisibleRowRange = function() {
      return this.displayBuffer.getVisibleRowRange();
    };

    Editor.prototype.intersectsVisibleRowRange = function(startRow, endRow) {
      return this.displayBuffer.intersectsVisibleRowRange(startRow, endRow);
    };

    Editor.prototype.selectionIntersectsVisibleRowRange = function(selection) {
      return this.displayBuffer.selectionIntersectsVisibleRowRange(selection);
    };

    Editor.prototype.pixelPositionForScreenPosition = function(screenPosition) {
      return this.displayBuffer.pixelPositionForScreenPosition(screenPosition);
    };

    Editor.prototype.pixelPositionForBufferPosition = function(bufferPosition) {
      return this.displayBuffer.pixelPositionForBufferPosition(bufferPosition);
    };

    Editor.prototype.screenPositionForPixelPosition = function(pixelPosition) {
      return this.displayBuffer.screenPositionForPixelPosition(pixelPosition);
    };

    Editor.prototype.pixelRectForScreenRange = function(screenRange) {
      return this.displayBuffer.pixelRectForScreenRange(screenRange);
    };

    Editor.prototype.scrollToScreenRange = function(screenRange) {
      return this.displayBuffer.scrollToScreenRange(screenRange);
    };

    Editor.prototype.scrollToScreenPosition = function(screenPosition) {
      return this.displayBuffer.scrollToScreenPosition(screenPosition);
    };

    Editor.prototype.scrollToBufferPosition = function(bufferPosition) {
      return this.displayBuffer.scrollToBufferPosition(bufferPosition);
    };

    Editor.prototype.joinLine = function() {
      deprecate("Use Editor::joinLines() instead");
      return this.joinLines();
    };

    return Editor;

  })(Model);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvZml4dHVyZXMvbGFyZ2UtZmlsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9KQUFBO0lBQUE7Ozs7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFlBQUEsR0FBZSxPQUFBLENBQVEsY0FBUjs7RUFDZixTQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0VBQ1gsWUFBYSxPQUFBLENBQVEsTUFBUjs7RUFDYixRQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUNWLE1BQWlCLE9BQUEsQ0FBUSxhQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSOztFQUNoQixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSOztFQUNaLHFCQUFBLEdBQXdCLE9BQUEsQ0FBUSxZQUFSLENBQXFCLENBQUM7O0VBeUg5QyxNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDSixZQUFZLENBQUMsV0FBYixDQUF5QixNQUF6Qjs7SUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQW5CLENBQXVCLE1BQXZCOztJQUNBLFNBQVMsQ0FBQyxXQUFWLENBQXNCLE1BQXRCOztxQkFFQSxhQUFBLEdBQWU7O3FCQUNmLDRCQUFBLEdBQThCOztxQkFDOUIsY0FBQSxHQUFnQjs7cUJBQ2hCLE1BQUEsR0FBUTs7cUJBQ1IsWUFBQSxHQUFjOztxQkFDZCxPQUFBLEdBQVM7O3FCQUNULFVBQUEsR0FBWTs7cUJBQ1osd0JBQUEsR0FBMEI7O0lBRTFCLE1BQUMsQ0FBQSxnQkFBRCxDQUFrQiw2QkFBbEIsRUFBaUQscUJBQWpELEVBQXdFLHNCQUF4RSxFQUNFLGdDQURGLEVBQ29DLCtCQURwQyxFQUNxRSxpQ0FEckUsRUFFRTtNQUFBLFVBQUEsRUFBWSxjQUFaO0tBRkY7O0lBSUEsTUFBQyxDQUFBLG1CQUFELENBQXFCLGFBQXJCLEVBQW9DLG1CQUFwQyxFQUF5RCxTQUF6RCxFQUFvRSxRQUFwRSxFQUNFLFlBREYsRUFDZ0IsYUFEaEIsRUFDK0Isc0JBRC9CLEVBQ3VEO01BQUEsVUFBQSxFQUFZLGVBQVo7S0FEdkQ7O0lBR2EsZ0JBQUMsR0FBRDtBQUNYLFVBQUE7TUFEYSxJQUFDLENBQUEsZUFBQSxVQUFVLCtCQUFhLG1DQUFlLDJCQUFXLHlCQUFVLElBQUMsQ0FBQSxvQkFBQSxlQUFlLHFCQUFRLHFDQUFnQjs7TUFDakgseUNBQUEsU0FBQTtNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFDWCxJQUFDLENBQUEsVUFBRCxHQUFjOztRQUVkLElBQUMsQ0FBQSxnQkFBaUIsSUFBSSxhQUFKLENBQWtCO1VBQUMsUUFBQSxNQUFEO1VBQVMsV0FBQSxTQUFUO1VBQW9CLFVBQUEsUUFBcEI7U0FBbEI7O01BQ2xCLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLGFBQWEsQ0FBQztNQUN6QixJQUFDLENBQUEsUUFBRCw2SkFBc0Y7QUFFdEY7QUFBQSxXQUFBLHNDQUFBOztRQUNFLE1BQU0sQ0FBQyxhQUFQLENBQXFCO1VBQUEsYUFBQSxFQUFlLElBQWY7U0FBckI7UUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQ7QUFGRjtNQUlBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHdCQUFELENBQUE7TUFFQSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLE1BQWQsS0FBd0IsQ0FBeEIsSUFBOEIsQ0FBSSxzQkFBckM7UUFDRSxXQUFBLEdBQWMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxRQUFBLENBQVMsV0FBVCxDQUFBLElBQXlCLENBQWxDLEVBQXFDLENBQXJDO1FBQ2QsYUFBQSxHQUFnQixJQUFJLENBQUMsR0FBTCxDQUFTLFFBQUEsQ0FBUyxhQUFULENBQUEsSUFBMkIsQ0FBcEMsRUFBdUMsQ0FBdkM7UUFDaEIsSUFBQyxDQUFBLHlCQUFELENBQTJCLENBQUMsV0FBRCxFQUFjLGFBQWQsQ0FBM0IsRUFIRjs7TUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFJLFlBQUosQ0FBaUIsSUFBakI7TUFFaEIsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsVUFBWixFQUF3QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRDtpQkFBZSxLQUFDLENBQUEsSUFBRCxDQUFNLG9CQUFOLEVBQTRCLFNBQTVCO1FBQWY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCO01BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsV0FBWixFQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsVUFBRDtpQkFBZ0IsS0FBQyxDQUFBLElBQUQsQ0FBTSxxQkFBTixFQUE2QixVQUE3QjtRQUFoQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7TUFFQSxJQUFxQyxjQUFyQzs7Y0FBYyxDQUFFLFdBQWhCLENBQTRCLElBQTVCO1NBQUE7O0lBM0JXOztxQkE2QmIsZUFBQSxHQUFpQixTQUFBO2FBQ2Y7UUFBQSxFQUFBLEVBQUksSUFBQyxDQUFBLEVBQUw7UUFDQSxRQUFBLEVBQVUsSUFBQyxDQUFBLFFBRFg7UUFFQSxTQUFBLEVBQVcsSUFBQyxDQUFBLFNBRlo7UUFHQSxVQUFBLEVBQVksSUFBQyxDQUFBLFVBSGI7UUFJQSxhQUFBLEVBQWUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFmLENBQUEsQ0FKZjs7SUFEZTs7cUJBT2pCLGlCQUFBLEdBQW1CLFNBQUMsTUFBRDtNQUNqQixNQUFNLENBQUMsYUFBUCxHQUF1QixhQUFhLENBQUMsV0FBZCxDQUEwQixNQUFNLENBQUMsYUFBakM7TUFDdkIsTUFBTSxDQUFDLGNBQVAsR0FBd0I7YUFDeEI7SUFIaUI7O3FCQUtuQixpQkFBQSxHQUFtQixTQUFBO01BQ2pCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBO01BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsTUFBWixFQUFvQixjQUFwQixFQUFvQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDbEMsSUFBTyw4QkFBUDtZQUNFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFxQixJQUFJLENBQUMsT0FBTCxDQUFhLEtBQUMsQ0FBQSxPQUFELENBQUEsQ0FBYixDQUFyQixFQURGOztVQUVBLEtBQUMsQ0FBQSxJQUFELENBQU0sZUFBTjtpQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLGNBQU47UUFKa0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDO01BS0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsTUFBWixFQUFvQixtQkFBcEIsRUFBeUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxJQUFELENBQU0sbUJBQU47UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekM7TUFDQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxNQUFaLEVBQW9CLHFCQUFwQixFQUEyQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBTSxxQkFBTjtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQztNQUNBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLE1BQVosRUFBb0IseUJBQXBCLEVBQStDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsSUFBRCxDQUFNLHlCQUFOO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9DO01BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsTUFBWixFQUFvQixXQUFwQixFQUFpQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQzthQUNBLElBQUMsQ0FBQSxvQ0FBRCxDQUFBO0lBWGlCOztxQkFhbkIsd0JBQUEsR0FBMEIsU0FBQTtNQUN4QixJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxhQUFaLEVBQTJCLGdCQUEzQixFQUE2QyxJQUFDLENBQUEsbUJBQTlDO01BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsYUFBWixFQUEyQixTQUEzQixFQUFzQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtpQkFBTyxLQUFDLENBQUEsSUFBRCxDQUFNLHNCQUFOLEVBQThCLENBQTlCO1FBQVA7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRDO01BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsYUFBWixFQUEyQixpQkFBM0IsRUFBOEMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSwyQkFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDO01BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsYUFBWixFQUEyQixpQkFBM0IsRUFBOEMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxtQkFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDO2FBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsYUFBWixFQUEyQixtQkFBM0IsRUFBZ0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQWEsY0FBQTtVQUFaO2lCQUFZLEtBQUMsQ0FBQSxJQUFELGNBQU0sQ0FBQSxtQkFBcUIsU0FBQSxXQUFBLElBQUEsQ0FBQSxDQUEzQjtRQUFiO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRDtJQUx3Qjs7cUJBTzFCLFlBQUEsR0FBYyxTQUFBO01BQ1osSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCLENBQUg7ZUFDRSxPQUFBLENBQVEscUJBQVIsRUFERjtPQUFBLE1BQUE7ZUFHRSxPQUFBLENBQVEsZUFBUixFQUhGOztJQURZOztxQkFNZCxTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBO0FBQ0E7QUFBQSxXQUFBLHNDQUFBOztRQUFBLFNBQVMsQ0FBQyxPQUFWLENBQUE7QUFBQTtNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7YUFDQSxJQUFDLENBQUEsWUFBWSxDQUFDLE9BQWQsQ0FBQTtJQUxTOztxQkFRWCxJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7TUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLFlBQUQsQ0FBQTtNQUNaLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQUE7TUFDaEIsUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUFELENBQUE7TUFDWCxTQUFBLEdBQVksSUFBSSxNQUFKLENBQVc7UUFBRSxRQUFELElBQUMsQ0FBQSxNQUFGO1FBQVUsZUFBQSxhQUFWO1FBQXlCLFdBQUEsU0FBekI7UUFBb0MsVUFBQSxRQUFwQztRQUE4QyxzQkFBQSxFQUF3QixJQUF0RTtRQUE0RSxjQUFBLEVBQWdCLElBQTVGO09BQVg7QUFDWjs7O0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxNQUFNLENBQUMsSUFBUCxDQUFZO1VBQUEsUUFBQSxFQUFVLFNBQVMsQ0FBQyxFQUFwQjtVQUF3QixhQUFBLEVBQWUsSUFBdkM7U0FBWjtBQURGO2FBRUE7SUFQSTs7cUJBZ0JOLFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUcsV0FBQSxHQUFjLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBakI7ZUFDRSxJQUFJLENBQUMsUUFBTCxDQUFjLFdBQWQsRUFERjtPQUFBLE1BQUE7ZUFHRSxXQUhGOztJQURROztxQkFhVixZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxJQUFHLFdBQUEsR0FBYyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQWpCO1FBQ0UsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFMLENBQWMsV0FBZDtRQUNYLFNBQUEsR0FBWSxJQUFJLENBQUMsUUFBTCxDQUFjLElBQUksQ0FBQyxPQUFMLENBQWEsV0FBYixDQUFkO2VBQ1QsUUFBRCxHQUFVLEtBQVYsR0FBZSxVQUhuQjtPQUFBLE1BQUE7ZUFLRSxXQUxGOztJQURZOztxQkFTZCxVQUFBLEdBQVksU0FBQyxPQUFEO2FBQWEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxVQUFmLENBQTBCLE9BQTFCO0lBQWI7O3FCQU9aLHFCQUFBLEdBQXVCLFNBQUMsa0JBQUQ7YUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxxQkFBZixDQUFxQyxrQkFBckM7SUFEcUI7O3FCQUl2QixpQkFBQSxHQUFtQixTQUFBO2FBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxpQkFBZixDQUFBO0lBQUg7O3FCQUluQixXQUFBLEdBQWEsU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKOztxQkFLYixXQUFBLEdBQWEsU0FBQyxTQUFEO01BQUMsSUFBQyxDQUFBLFdBQUQ7YUFBYyxJQUFDLENBQUE7SUFBaEI7O3FCQUdiLGNBQUEsR0FBZ0IsU0FBQTthQUFHLElBQUMsQ0FBQSxXQUFELENBQWEsQ0FBSSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQWpCO0lBQUg7O3FCQUdoQixXQUFBLEdBQWEsU0FBQTthQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsV0FBZixDQUFBO0lBQUg7O3FCQUtiLFdBQUEsR0FBYSxTQUFDLFFBQUQ7YUFBYyxJQUFDLENBQUEsYUFBYSxDQUFDLFdBQWYsQ0FBMkIsUUFBM0I7SUFBZDs7cUJBR2IsY0FBQSxHQUFnQixTQUFBO2FBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxDQUFJLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBakI7SUFBSDs7cUJBUWhCLFVBQUEsR0FBWSxTQUFBO2FBQUcsSUFBQyxDQUFBLGlCQUFELENBQW1CLENBQW5CO0lBQUg7O3FCQUtaLFlBQUEsR0FBYyxTQUFBO2FBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxZQUFmLENBQUE7SUFBSDs7cUJBR2QsWUFBQSxHQUFjLFNBQUMsU0FBRDthQUFlLElBQUMsQ0FBQSxhQUFhLENBQUMsWUFBZixDQUE0QixTQUE1QjtJQUFmOztxQkFpQmQsa0JBQUEsR0FBb0IsU0FBQyxjQUFEO2FBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixjQUFyQjtJQUFwQjs7cUJBUXBCLGVBQUEsR0FBaUIsU0FBQyxLQUFEO2FBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQWtCLEtBQWxCO0lBQVg7O3FCQVlqQix1QkFBQSxHQUF5QixTQUFDLFNBQUQ7YUFDdkIsSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixTQUFsQixDQUFwQjtJQUR1Qjs7cUJBZXpCLDBCQUFBLEdBQTRCLFNBQUMsU0FBRCxFQUFZLFFBQVosRUFBc0IsR0FBdEI7QUFDMUIsVUFBQTtNQURpRCwyQ0FBRCxNQUE0QjtNQUM1RSxJQUFHLHlCQUFIO1FBQ0UsU0FBQSxHQUFZLEVBRGQ7T0FBQSxNQUFBO1FBR0UsU0FBQSxHQUFZLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixTQUFsQixDQUE0QixDQUFDLEtBQTdCLENBQW1DLE1BQW5DLENBQTJDLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FINUQ7O01BSUEsZUFBQSxHQUFrQixJQUFDLENBQUEsaUJBQUQsQ0FBbUIsUUFBbkI7YUFDbEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLENBQUMsQ0FBQyxTQUFELEVBQVksQ0FBWixDQUFELEVBQWlCLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FBakIsQ0FBdkIsRUFBaUUsZUFBakU7SUFOMEI7O3FCQWtCNUIsa0JBQUEsR0FBb0IsU0FBQyxJQUFEO2FBQ2xCLElBQUMsQ0FBQSxhQUFhLENBQUMsa0JBQWYsQ0FBa0MsSUFBbEM7SUFEa0I7O3FCQUlwQixpQkFBQSxHQUFtQixTQUFDLE1BQUQ7TUFDakIsSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUg7ZUFDRSxDQUFDLENBQUMsY0FBRixDQUFpQixHQUFqQixFQUFzQixJQUFJLENBQUMsS0FBTCxDQUFXLE1BQUEsR0FBUyxJQUFDLENBQUEsWUFBRCxDQUFBLENBQXBCLENBQXRCLEVBREY7T0FBQSxNQUFBO2VBR0UsQ0FBQyxDQUFDLGNBQUYsQ0FBaUIsSUFBakIsRUFBdUIsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFYLENBQXZCLEVBSEY7O0lBRGlCOztxQkFTbkIsSUFBQSxHQUFNLFNBQUE7YUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBQTtJQUFIOztxQkFPTixNQUFBLEdBQVEsU0FBQyxRQUFEO2FBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsUUFBZjtJQUFkOztxQkFFUixZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxJQUFHLFFBQUEsR0FBVyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQWQ7NkRBQ3dCLENBQUUsWUFBeEIsQ0FBcUMsUUFBckMsV0FERjs7SUFEWTs7cUJBS2QsbUJBQUEsR0FBcUIsU0FBQTtBQUNuQixVQUFBO01BQUEsSUFBRyxRQUFBLEdBQVcsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFkO2VBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFmLENBQXFCLFFBQXJCLEVBREY7O0lBRG1COztxQkFLckIsT0FBQSxHQUFTLFNBQUE7YUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQTtJQUFIOztxQkFHVCxPQUFBLEdBQVMsU0FBQTthQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBO0lBQUg7O3FCQUdULE9BQUEsR0FBUyxTQUFDLElBQUQ7YUFBVSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEI7SUFBVjs7cUJBS1QsY0FBQSxHQUFnQixTQUFDLEtBQUQ7YUFBVyxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsS0FBdkI7SUFBWDs7cUJBR2hCLFlBQUEsR0FBYyxTQUFBO2FBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQUE7SUFBSDs7cUJBR2QsU0FBQSxHQUFXLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSjs7cUJBR1gsTUFBQSxHQUFRLFNBQUE7YUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBQTtJQUFIOztxQkFHUixnQkFBQSxHQUFrQixTQUFDLFNBQUQ7YUFBZSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsU0FBbkI7SUFBZjs7cUJBR2xCLG9CQUFBLEdBQXNCLFNBQUMsU0FBRDtBQUNwQixVQUFBO01BQUEsSUFBRyxLQUFBLEdBQVEsSUFBQyxDQUFBLGdCQUFELENBQWtCLFNBQWxCLENBQTRCLENBQUMsS0FBN0IsQ0FBbUMsSUFBbkMsQ0FBWDtRQUNFLE1BQUEsR0FBUyxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsQ0FBQyxTQUFELEVBQVksS0FBSyxDQUFDLEtBQWxCLENBQXhCLENBQWlELENBQUM7ZUFDM0QsSUFBSSxxQkFBSixDQUEwQixXQUExQixDQUFzQyxDQUFDLE9BQXZDLENBQStDLE1BQS9DLEVBRkY7O0lBRG9COztxQkFNdEIscUJBQUEsR0FBdUIsU0FBQyxTQUFEO2FBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQXdCLFNBQXhCO0lBQWY7O3FCQUd2QixvQkFBQSxHQUFzQixTQUFBO2FBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7SUFBSDs7cUJBSXRCLGdCQUFBLEdBQWtCLFNBQUE7YUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQTtJQUFIOztxQkFRbEIsdUJBQUEsR0FBeUIsU0FBQyxHQUFELEVBQU0sR0FBTjtBQUE4QixVQUFBO01BQXZCLGdDQUFELE1BQWlCO2FBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLEdBQXBCLEVBQXlCLGNBQXpCO0lBQTlCOztxQkFNekIsZ0JBQUEsR0FBa0IsU0FBQyxHQUFEO2FBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLEdBQW5CO0lBQVQ7O3FCQU1sQixzQkFBQSxHQUF3QixTQUFDLEdBQUQ7YUFBUyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLEdBQXpCO0lBQVQ7O3FCQUd4QixJQUFBLEdBQU0sU0FBQTtBQUFhLFVBQUE7TUFBWjthQUFZLFFBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBTyxDQUFDLElBQVIsYUFBYSxJQUFiO0lBQWI7O3FCQUdOLGlCQUFBLEdBQW1CLFNBQUE7QUFBYSxVQUFBO01BQVo7YUFBWSxRQUFBLElBQUMsQ0FBQSxNQUFELENBQU8sQ0FBQyxXQUFSLGFBQW9CLElBQXBCO0lBQWI7O3FCQUduQiwwQkFBQSxHQUE0QixTQUFBO0FBQWEsVUFBQTtNQUFaO2FBQVksUUFBQSxJQUFDLENBQUEsTUFBRCxDQUFPLENBQUMsb0JBQVIsYUFBNkIsSUFBN0I7SUFBYjs7cUJBRzVCLFVBQUEsR0FBWSxTQUFBO2FBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUE7SUFBSDs7cUJBSVosa0JBQUEsR0FBb0IsU0FBQTthQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxJQUFrQixDQUFJLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBQTtJQUF6Qjs7cUJBWXBCLCtCQUFBLEdBQWlDLFNBQUMsY0FBRCxFQUFpQixPQUFqQjthQUE2QixJQUFDLENBQUEsYUFBYSxDQUFDLCtCQUFmLENBQStDLGNBQS9DLEVBQStELE9BQS9EO0lBQTdCOztxQkFVakMsK0JBQUEsR0FBaUMsU0FBQyxjQUFELEVBQWlCLE9BQWpCO2FBQTZCLElBQUMsQ0FBQSxhQUFhLENBQUMsK0JBQWYsQ0FBK0MsY0FBL0MsRUFBK0QsT0FBL0Q7SUFBN0I7O3FCQUtqQyx5QkFBQSxHQUEyQixTQUFDLFdBQUQ7YUFBaUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyx5QkFBZixDQUF5QyxXQUF6QztJQUFqQjs7cUJBSzNCLHlCQUFBLEdBQTJCLFNBQUMsV0FBRDthQUFpQixJQUFDLENBQUEsYUFBYSxDQUFDLHlCQUFmLENBQXlDLFdBQXpDO0lBQWpCOztxQkFpQjNCLGtCQUFBLEdBQW9CLFNBQUMsY0FBRCxFQUFpQixPQUFqQjthQUE2QixJQUFDLENBQUEsYUFBYSxDQUFDLGtCQUFmLENBQWtDLGNBQWxDLEVBQWtELE9BQWxEO0lBQTdCOztxQkFHcEIsZ0JBQUEsR0FBa0IsU0FBQyxHQUFEO2FBQVMsSUFBQyxDQUFBLGFBQWEsQ0FBQyxVQUFmLENBQTBCLEdBQTFCO0lBQVQ7O3FCQUdsQixrQkFBQSxHQUFvQixTQUFDLEtBQUQsRUFBUSxHQUFSO2FBQWdCLElBQUMsQ0FBQSxhQUFhLENBQUMsWUFBZixDQUE0QixLQUE1QixFQUFtQyxHQUFuQztJQUFoQjs7cUJBR3BCLGtCQUFBLEdBQW9CLFNBQUE7YUFBRyxJQUFDLENBQUEsYUFBYSxDQUFDLFlBQWYsQ0FBQTtJQUFIOztxQkFHcEIsc0JBQUEsR0FBd0IsU0FBQTthQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsZ0JBQWYsQ0FBQTtJQUFIOztxQkFHeEIsZ0JBQUEsR0FBa0IsU0FBQTthQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBZixDQUFBO0lBQUg7O3FCQUdsQix1QkFBQSxHQUF5QixTQUFDLFFBQUQsRUFBVyxNQUFYO2FBQXNCLElBQUMsQ0FBQSxhQUFhLENBQUMsdUJBQWYsQ0FBdUMsUUFBdkMsRUFBaUQsTUFBakQ7SUFBdEI7O3FCQUV6QixxQkFBQSxHQUF1QixTQUFDLEdBQUQ7YUFBUyxJQUFDLENBQUEsYUFBYSxDQUFDLHFCQUFmLENBQXFDLEdBQXJDO0lBQVQ7O3FCQVl2Qix1QkFBQSxHQUF5QixTQUFDLGNBQUQ7YUFBb0IsSUFBQyxDQUFBLGFBQWEsQ0FBQyx1QkFBZixDQUF1QyxjQUF2QztJQUFwQjs7cUJBU3pCLDJCQUFBLEdBQTZCLFNBQUMsUUFBRDthQUMzQixJQUFDLENBQUEsYUFBYSxDQUFDLDZCQUFmLENBQTZDLFFBQTdDLEVBQXVELElBQUMsQ0FBQSx1QkFBRCxDQUFBLENBQXZEO0lBRDJCOztxQkFJN0Isc0JBQUEsR0FBd0IsU0FBQyxjQUFEO2FBQW9CLElBQUMsQ0FBQSxhQUFhLENBQUMsc0JBQWYsQ0FBc0MsY0FBdEM7SUFBcEI7O3FCQU14QixlQUFBLEdBQWlCLFNBQUE7YUFBRyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQVksQ0FBQyxTQUFiLENBQUE7SUFBSDs7cUJBRWpCLGNBQUEsR0FBZ0IsU0FBQTthQUNkLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFaO0lBRGM7O3FCQU9oQixVQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sT0FBUDs7UUFBTyxVQUFROzs7UUFDekIsT0FBTyxDQUFDLG9CQUFxQixJQUFDLENBQUEsZ0JBQUQsQ0FBQTs7O1FBQzdCLE9BQU8sQ0FBQyxxQkFBc0IsSUFBQyxDQUFBLGdCQUFELENBQUE7O2FBQzlCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixTQUFDLFNBQUQ7ZUFBZSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUEyQixPQUEzQjtNQUFmLENBQXBCO0lBSFU7O3FCQU1aLGFBQUEsR0FBZSxTQUFBO2FBQ2IsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaO0lBRGE7O3FCQUlmLGtCQUFBLEdBQW9CLFNBQUE7YUFDbEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDUixLQUFDLENBQUEscUJBQUQsQ0FBQTtpQkFDQSxLQUFDLENBQUEsYUFBRCxDQUFBO1FBRlE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVY7SUFEa0I7O3FCQU1wQixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ1IsY0FBQTtVQUFBLFNBQUEsR0FBWSxLQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUEwQixDQUFDO1VBQ3ZDLFdBQUEsR0FBYyxLQUFDLENBQUEsdUJBQUQsQ0FBeUIsU0FBekI7VUFDZCxXQUFBLEdBQWMsU0FBQSxLQUFhO1VBRTNCLEtBQUMsQ0FBQSwyQkFBRCxDQUFBO1VBQ0EsS0FBQyxDQUFBLGNBQUQsQ0FBQTtVQUNBLEtBQUMsQ0FBQSxhQUFELENBQUE7VUFFQSxJQUFHLEtBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQUEsSUFBd0IsS0FBQyxDQUFBLHVCQUFELENBQXlCLFNBQXpCLENBQUEsR0FBc0MsV0FBakU7WUFDRSxLQUFDLENBQUEsMEJBQUQsQ0FBNEIsU0FBNUIsRUFBdUMsV0FBdkMsRUFERjs7VUFHQSxJQUFHLFdBQUg7WUFDRSxLQUFDLENBQUEsWUFBRCxDQUFBO21CQUNBLEtBQUMsQ0FBQSxxQkFBRCxDQUFBLEVBRkY7O1FBWlE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVY7SUFEa0I7O3FCQW1CcEIsTUFBQSxHQUFRLFNBQUMsT0FBRDs7UUFBQyxVQUFROzs7UUFDZixPQUFPLENBQUMsYUFBYyxJQUFDLENBQUEsZ0JBQUQsQ0FBQTs7YUFDdEIsSUFBQyxDQUFBLGtCQUFELENBQW9CLFNBQUMsU0FBRDtlQUFlLFNBQVMsQ0FBQyxNQUFWLENBQWlCLE9BQWpCO01BQWYsQ0FBcEI7SUFGTTs7cUJBTVIsU0FBQSxHQUFXLFNBQUE7YUFDVCxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsU0FBQyxTQUFEO2VBQWUsU0FBUyxDQUFDLFNBQVYsQ0FBQTtNQUFmLENBQXBCO0lBRFM7O3FCQU1YLDBCQUFBLEdBQTRCLFNBQUE7YUFDMUIsSUFBQyxDQUFBLGtCQUFELENBQW9CLFNBQUMsU0FBRDtlQUFlLFNBQVMsQ0FBQywwQkFBVixDQUFBO01BQWYsQ0FBcEI7SUFEMEI7O3FCQU01QiwwQkFBQSxHQUE0QixTQUFBO2FBQzFCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixTQUFDLFNBQUQ7ZUFBZSxTQUFTLENBQUMsMEJBQVYsQ0FBQTtNQUFmLENBQXBCO0lBRDBCOztzQkFLNUIsUUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsU0FBQyxTQUFEO2VBQWUsU0FBUyxFQUFDLE1BQUQsRUFBVCxDQUFBO01BQWYsQ0FBcEI7SUFETTs7cUJBTVIsaUJBQUEsR0FBbUIsU0FBQTthQUNqQixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsU0FBQyxTQUFEO2VBQWUsU0FBUyxDQUFDLGlCQUFWLENBQUE7TUFBZixDQUFwQjtJQURpQjs7cUJBSW5CLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGtCQUFELENBQW9CLFNBQUMsU0FBRDtlQUFlLFNBQVMsQ0FBQyxVQUFWLENBQUE7TUFBZixDQUFwQjtJQURVOztxQkFJWixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixTQUFDLFNBQUQ7ZUFBZSxTQUFTLENBQUMsa0JBQVYsQ0FBQTtNQUFmLENBQXBCO0lBRGtCOztxQkFJcEIsbUJBQUEsR0FBcUIsU0FBQTthQUNuQixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsU0FBQyxTQUFEO2VBQWUsU0FBUyxDQUFDLG1CQUFWLENBQUE7TUFBZixDQUFwQjtJQURtQjs7cUJBUXJCLDZCQUFBLEdBQStCLFNBQUE7YUFDN0IsSUFBQyxDQUFBLGtCQUFELENBQW9CLFNBQUMsU0FBRDtlQUFlLFNBQVMsQ0FBQyxrQkFBVixDQUFBO01BQWYsQ0FBcEI7SUFENkI7O3FCQUsvQixzQkFBQSxHQUF3QixTQUFBO2FBQ3RCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixTQUFDLFNBQUQ7ZUFBZSxTQUFTLENBQUMsc0JBQVYsQ0FBQTtNQUFmLENBQXBCO0lBRHNCOztxQkFLeEIsMEJBQUEsR0FBNEIsU0FBQyxXQUFEO01BQzFCLElBQUEsQ0FBYyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQWQ7QUFBQSxlQUFBOzthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixLQUFuQixFQUEwQixXQUExQixFQUF1QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUFlLGNBQUE7VUFBYixVQUFEO2lCQUFjLE9BQUEsQ0FBUSxLQUFDLENBQUEsVUFBRCxDQUFBLENBQVI7UUFBZjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkM7SUFGMEI7O3FCQU81QixjQUFBLEdBQWdCLFNBQUE7QUFDZCxVQUFBO01BQUEsaUJBQUEsR0FBb0I7YUFDcEIsSUFBQyxDQUFBLGtCQUFELENBQW9CLFNBQUMsU0FBRDtRQUNsQixTQUFTLENBQUMsY0FBVixDQUF5QixpQkFBekI7ZUFDQSxpQkFBQSxHQUFvQjtNQUZGLENBQXBCO0lBRmM7O3FCQU9oQixlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsaUJBQUEsR0FBb0I7YUFDcEIsSUFBQyxDQUFBLGtCQUFELENBQW9CLFNBQUMsU0FBRDtRQUNsQixTQUFTLENBQUMsR0FBVixDQUFjLGlCQUFkO2VBQ0EsaUJBQUEsR0FBb0I7TUFGRixDQUFwQjtJQUZlOztxQkFPakIsZ0JBQUEsR0FBa0IsU0FBQTtBQUNoQixVQUFBO01BQUEsaUJBQUEsR0FBb0I7QUFDcEI7QUFBQTtXQUFBLHNDQUFBOztRQUNFLFNBQVMsQ0FBQyxJQUFWLENBQWUsaUJBQWY7cUJBQ0EsaUJBQUEsR0FBb0I7QUFGdEI7O0lBRmdCOztxQkFjbEIsU0FBQSxHQUFXLFNBQUMsT0FBRDtBQUNULFVBQUE7O1FBRFUsVUFBUTs7TUFDbEIsT0FBbUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZixDQUFBLENBQW5CLEVBQUMsZ0JBQUQsRUFBTztNQUVQLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYixDQUFBLEtBQXdCLENBQUM7TUFFNUMsSUFBRywyREFBQSxJQUEwQixRQUFRLENBQUMsVUFBVSxDQUFDLE1BQXBCLEtBQThCLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBZ0IsQ0FBQyxNQUE1RTtRQUNFLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLFNBQUQsRUFBWSxLQUFaO1lBQ2xCLElBQUEsR0FBTyxRQUFRLENBQUMsVUFBVyxDQUFBLEtBQUE7bUJBQzNCLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEVBQTJCLE9BQTNCO1VBRmtCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQjtBQUlBLGVBTEY7T0FBQSxNQU9LLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtCQUFoQixDQUFBLElBQXFELDREQUF4RDtRQUNILElBQUcsQ0FBQyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQVksQ0FBQyw0QkFBYixDQUFBLENBQUQsSUFBZ0QsZ0JBQW5EOztZQUNFLE9BQU8sQ0FBQyxjQUFlLFFBQVEsQ0FBQztXQURsQztTQURHOzthQUlMLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixPQUFsQjtJQWhCUzs7cUJBbUJYLElBQUEsR0FBTSxTQUFBO01BQ0osSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsZUFBYixHQUErQjthQUMvQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxJQUFiO0lBRkk7O3FCQUtOLElBQUEsR0FBTSxTQUFBO01BQ0osSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsZUFBYixHQUErQjthQUMvQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxJQUFiO0lBRkk7O3FCQVNOLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLFVBQUE7TUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLCtCQUFELENBQWlDLElBQUMsQ0FBQSx1QkFBRCxDQUFBLENBQWpDLENBQTRELENBQUM7YUFDekUsSUFBQyxDQUFBLGFBQUQsQ0FBZSxTQUFmO0lBRmM7O3FCQUtoQixnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLFVBQUE7TUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLCtCQUFELENBQWlDLElBQUMsQ0FBQSx1QkFBRCxDQUFBLENBQWpDLENBQTRELENBQUM7YUFDekUsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsU0FBakI7SUFGZ0I7O3FCQUtsQixpQkFBQSxHQUFtQixTQUFBO0FBQ2pCLFVBQUE7QUFBQTtBQUFBO1dBQUEsc0NBQUE7O3FCQUFBLFNBQVMsQ0FBQyxJQUFWLENBQUE7QUFBQTs7SUFEaUI7O3FCQUluQixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFBO0lBRE87O3FCQUlULFNBQUEsR0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBLFlBQVksQ0FBQyxTQUFkLENBQUE7SUFEUzs7cUJBTVgsb0JBQUEsR0FBc0IsU0FBQyxLQUFEO2FBQ3BCLElBQUMsQ0FBQSxZQUFZLENBQUMsb0JBQWQsQ0FBbUMsS0FBbkM7SUFEb0I7O3FCQVV0QixhQUFBLEdBQWUsU0FBQyxTQUFEO2FBQ2IsSUFBQyxDQUFBLFlBQVksQ0FBQyxhQUFkLENBQTRCLFNBQTVCO0lBRGE7O3FCQU1mLGVBQUEsR0FBaUIsU0FBQyxTQUFEO2FBQ2YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxlQUFmLENBQStCLFNBQS9CO0lBRGU7O3FCQVVqQixxQkFBQSxHQUF1QixTQUFDLFNBQUQ7YUFDckIsSUFBQyxDQUFBLFlBQVksQ0FBQyxxQkFBZCxDQUFvQyxTQUFwQztJQURxQjs7cUJBSXZCLFVBQUEsR0FBWSxTQUFDLFFBQUQsRUFBVyxNQUFYO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxVQUFmLENBQTBCLFFBQTFCLEVBQW9DLE1BQXBDO0lBRFU7O3FCQUlaLGlCQUFBLEdBQW1CLFNBQUMsRUFBRDthQUNqQixJQUFDLENBQUEsYUFBYSxDQUFDLGlCQUFmLENBQWlDLEVBQWpDO0lBRGlCOztxQkFJbkIsbUNBQUEsR0FBcUMsU0FBQyxXQUFEO0FBQ25DLFVBQUE7QUFBQTtXQUFXLHdJQUFYO3FCQUNFLElBQUMsQ0FBQSxlQUFELENBQWlCLEdBQWpCO0FBREY7O0lBRG1DOztxQkFNckMscUJBQUEsR0FBdUIsU0FBQyxTQUFEO01BQ3JCLElBQUcsSUFBQyxDQUFBLG1CQUFELENBQXFCLFNBQXJCLENBQUg7ZUFDRSxJQUFDLENBQUEsZUFBRCxDQUFpQixTQUFqQixFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxhQUFELENBQWUsU0FBZixFQUhGOztJQURxQjs7cUJBU3ZCLG1CQUFBLEdBQXFCLFNBQUE7YUFDbkIsSUFBQyxDQUFBLG1CQUFELENBQXFCLElBQUMsQ0FBQSxrQkFBRCxDQUFBLENBQXJCO0lBRG1COztxQkFRckIsbUJBQUEsR0FBcUIsU0FBQyxTQUFEO2FBQ25CLElBQUMsQ0FBQSxhQUFhLENBQUMsbUJBQWYsQ0FBbUMsU0FBbkM7SUFEbUI7O3FCQVFyQixtQkFBQSxHQUFxQixTQUFDLFNBQUQ7YUFDbkIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxtQkFBZixDQUFtQyxTQUFuQztJQURtQjs7cUJBSXJCLDhCQUFBLEdBQWdDLFNBQUMsU0FBRDthQUM5QixJQUFDLENBQUEsYUFBYSxDQUFDLDhCQUFmLENBQThDLFNBQTlDO0lBRDhCOztxQkFJaEMsOEJBQUEsR0FBZ0MsU0FBQyxTQUFEO2FBQzlCLElBQUMsQ0FBQSxhQUFhLENBQUMsOEJBQWYsQ0FBOEMsU0FBOUM7SUFEOEI7O3FCQUloQyw4QkFBQSxHQUFnQyxTQUFDLFFBQUQsRUFBVyxNQUFYO2FBQzlCLElBQUMsQ0FBQSxhQUFhLENBQUMsOEJBQWYsQ0FBOEMsUUFBOUMsRUFBd0QsTUFBeEQ7SUFEOEI7O3FCQUtoQyxVQUFBLEdBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLHNCQUFELENBQUE7TUFDWixJQUFVLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBaEIsS0FBdUIsQ0FBakM7QUFBQSxlQUFBOztNQUNBLE9BQUEsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQTtNQUNWLElBQVUsU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFBLElBQXdCLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBaEIsS0FBdUIsT0FBL0MsSUFBMkQsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FBQSxLQUF5QixFQUE5RjtBQUFBLGVBQUE7O2FBRUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDUixjQUFBO1VBQUEsVUFBQSxHQUFhO1VBQ2IsSUFBQSxHQUFPOzs7OztVQUNQLElBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFoQixLQUF5QixTQUFTLENBQUMsR0FBRyxDQUFDLEdBQXZDLElBQStDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBZCxLQUF3QixDQUExRTtZQUNFLElBQUEsQ0FBa0IsS0FBQyxDQUFBLG1CQUFELENBQXFCLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBbkMsQ0FBbEI7Y0FBQSxJQUFJLENBQUMsR0FBTCxDQUFBLEVBQUE7YUFERjs7VUFJQSxrQkFBQSxHQUFxQixLQUFDLENBQUEsK0JBQUQsQ0FBaUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQWpCLENBQWpDLENBQXVELENBQUMsU0FBeEQsQ0FBa0UsQ0FBQyxDQUFDLENBQUYsQ0FBbEU7VUFDckIsa0JBQUEsR0FBcUIsS0FBQyxDQUFBLCtCQUFELENBQWlDLGtCQUFqQyxDQUFvRCxDQUFDO1VBQzFFLElBQUcsSUFBQSxHQUFPLEtBQUMsQ0FBQSw4QkFBRCxDQUFnQyxrQkFBaEMsQ0FBVjtZQUNFLFdBQUEsR0FBYyxJQUFJLENBQUMsY0FBTCxDQUFBLENBQXFCLENBQUMsV0FBdEIsQ0FBQSxFQURoQjtXQUFBLE1BQUE7WUFHRSxXQUFBLEdBQWMsRUFIaEI7O0FBS0EsZUFBQSxzQ0FBQTs7WUFDRSxJQUFHLElBQUEsR0FBTyxLQUFDLENBQUEsYUFBYSxDQUFDLDhCQUFmLENBQThDLEdBQTlDLENBQVY7Y0FDRSxXQUFBLEdBQWMsSUFBSSxDQUFDLGNBQUwsQ0FBQTtjQUNkLFFBQUEsR0FBVyxXQUFXLENBQUMsS0FBSyxDQUFDO2NBQzdCLE1BQUEsR0FBUyxXQUFXLENBQUMsR0FBRyxDQUFDO2NBQ3pCLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFFBQUEsR0FBVyxXQUEzQixFQUpGO2FBQUEsTUFBQTtjQU1FLFFBQUEsR0FBVztjQUNYLE1BQUEsR0FBUyxJQVBYOztZQVNBLGNBQUEsR0FBaUIsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FBQyxRQUFBLEdBQVcsV0FBWixDQUFqQjtZQUNqQixXQUFBLEdBQWMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFDLE1BQUEsR0FBUyxDQUFWLENBQVYsRUFBd0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUEsQ0FBeEI7WUFDZCxLQUFBLEdBQVEsS0FBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLENBQUMsQ0FBQyxRQUFELENBQUQsRUFBYSxXQUFiLENBQXZCO1lBQ1IsSUFBRyxXQUFXLENBQUMsR0FBWixLQUFtQixPQUFuQixJQUErQixXQUFXLENBQUMsTUFBWixHQUFxQixDQUFwRCxJQUEwRCxDQUFJLEtBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsV0FBVyxDQUFDLEdBQXJDLENBQWpFO2NBQ0UsS0FBQSxHQUFXLEtBQUQsR0FBTyxLQURuQjs7WUFHQSxLQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsUUFBbkIsRUFBNkIsTUFBN0I7WUFHQSxJQUFHLElBQUEsR0FBTyxLQUFDLENBQUEsYUFBYSxDQUFDLDhCQUFmLENBQThDLGNBQWMsQ0FBQyxHQUE3RCxDQUFWO2NBQ0UsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsY0FBYyxDQUFDLEdBQWhDO2NBQ0EsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsY0FBYyxDQUFDLEdBQWYsR0FBcUIsTUFBckIsR0FBOEIsUUFBOUIsR0FBeUMsSUFBSSxDQUFDLGNBQUwsQ0FBQSxDQUFxQixDQUFDLFdBQXRCLENBQUEsQ0FBekQsRUFGRjs7WUFJQSxLQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxjQUFmLEVBQStCLEtBQS9CO0FBdkJGO0FBMEJBLGVBQUEsOENBQUE7O2dCQUFpQyxDQUFBLENBQUEsSUFBSyxTQUFMLElBQUssU0FBTCxJQUFrQixLQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUFsQjtjQUMvQixLQUFDLENBQUEsYUFBRCxDQUFlLFNBQWY7O0FBREY7aUJBR0EsS0FBQyxDQUFBLHNCQUFELENBQXdCLFNBQVMsQ0FBQyxTQUFWLENBQW9CLENBQUMsQ0FBQyxXQUFGLENBQXBCLENBQXhCLEVBQTZEO1lBQUEsYUFBQSxFQUFlLElBQWY7WUFBcUIsVUFBQSxFQUFZLElBQWpDO1dBQTdEO1FBM0NRO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWO0lBTlU7O3FCQXFEWixZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLHNCQUFELENBQUE7TUFDWixPQUFBLEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUE7TUFDVixJQUFVLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBZCxLQUFxQixPQUEvQjtBQUFBLGVBQUE7O01BQ0EsSUFBVSxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQWQsS0FBcUIsT0FBQSxHQUFVLENBQS9CLElBQXFDLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFBLENBQUEsS0FBeUIsRUFBeEU7QUFBQSxlQUFBOzthQUVBLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ1IsY0FBQTtVQUFBLFVBQUEsR0FBYTtVQUNiLElBQUEsR0FBTzs7Ozs7VUFDUCxJQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBaEIsS0FBeUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUF2QyxJQUErQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQWQsS0FBd0IsQ0FBMUU7WUFDRSxJQUFBLENBQW9CLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixTQUFTLENBQUMsR0FBRyxDQUFDLEdBQW5DLENBQXBCO2NBQUEsSUFBSSxDQUFDLEtBQUwsQ0FBQSxFQUFBO2FBREY7O1VBSUEsa0JBQUEsR0FBcUIsS0FBQyxDQUFBLCtCQUFELENBQWlDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFmLENBQWpDLENBQXFELENBQUMsU0FBdEQsQ0FBZ0UsQ0FBQyxDQUFELENBQWhFO1VBQ3JCLGtCQUFBLEdBQXFCLEtBQUMsQ0FBQSwrQkFBRCxDQUFpQyxrQkFBakMsQ0FBb0QsQ0FBQztVQUMxRSxJQUFHLElBQUEsR0FBTyxLQUFDLENBQUEsOEJBQUQsQ0FBZ0Msa0JBQWhDLENBQVY7WUFDRSxXQUFBLEdBQWMsSUFBSSxDQUFDLGNBQUwsQ0FBQSxDQUFxQixDQUFDLFdBQXRCLENBQUEsRUFEaEI7V0FBQSxNQUFBO1lBR0UsV0FBQSxHQUFjLEVBSGhCOztBQUtBLGVBQUEsc0NBQUE7O1lBQ0UsSUFBRyxJQUFBLEdBQU8sS0FBQyxDQUFBLGFBQWEsQ0FBQyw4QkFBZixDQUE4QyxHQUE5QyxDQUFWO2NBQ0UsV0FBQSxHQUFjLElBQUksQ0FBQyxjQUFMLENBQUE7Y0FDZCxRQUFBLEdBQVcsV0FBVyxDQUFDLEtBQUssQ0FBQztjQUM3QixNQUFBLEdBQVMsV0FBVyxDQUFDLEdBQUcsQ0FBQztjQUN6QixVQUFVLENBQUMsSUFBWCxDQUFnQixNQUFBLEdBQVMsV0FBekIsRUFKRjthQUFBLE1BQUE7Y0FNRSxRQUFBLEdBQVc7Y0FDWCxNQUFBLEdBQVMsSUFQWDs7WUFTQSxJQUFHLE1BQUEsR0FBUyxDQUFULEtBQWMsT0FBakI7Y0FDRSxXQUFBLEdBQWMsQ0FBQyxNQUFELEVBQVMsS0FBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QixDQUFULEVBRGhCO2FBQUEsTUFBQTtjQUdFLFdBQUEsR0FBYyxDQUFDLE1BQUEsR0FBUyxDQUFWLEVBSGhCOztZQUlBLEtBQUEsR0FBUSxLQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsQ0FBQyxDQUFDLFFBQUQsQ0FBRCxFQUFhLFdBQWIsQ0FBdkI7WUFDUixLQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsUUFBbkIsRUFBNkIsTUFBN0I7WUFFQSxjQUFBLEdBQWlCLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBQyxRQUFBLEdBQVcsV0FBWixDQUFWLEVBQW9DLEtBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBLENBQXBDO1lBQ2pCLElBQUcsY0FBYyxDQUFDLEdBQWYsS0FBc0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBdEIsSUFBK0MsY0FBYyxDQUFDLE1BQWYsR0FBd0IsQ0FBMUU7Y0FDRSxLQUFBLEdBQVEsSUFBQSxHQUFLLE1BRGY7O1lBSUEsSUFBRyxJQUFBLEdBQU8sS0FBQyxDQUFBLGFBQWEsQ0FBQyw4QkFBZixDQUE4QyxjQUFjLENBQUMsR0FBN0QsQ0FBVjtjQUNFLEtBQUMsQ0FBQSxlQUFELENBQWlCLGNBQWMsQ0FBQyxHQUFoQztjQUNBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLGNBQWMsQ0FBQyxHQUFmLEdBQXFCLElBQUksQ0FBQyxjQUFMLENBQUEsQ0FBcUIsQ0FBQyxXQUF0QixDQUFBLENBQXJDLEVBRkY7O1lBSUEsS0FBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsY0FBZixFQUErQixLQUEvQjtBQTFCRjtBQTZCQSxlQUFBLDhDQUFBOztnQkFBaUMsQ0FBQSxDQUFBLElBQUssU0FBTCxJQUFLLFNBQUwsSUFBa0IsS0FBQyxDQUFBLGdCQUFELENBQUEsQ0FBbEI7Y0FDL0IsS0FBQyxDQUFBLGFBQUQsQ0FBZSxTQUFmOztBQURGO2lCQUdBLEtBQUMsQ0FBQSxzQkFBRCxDQUF3QixTQUFTLENBQUMsU0FBVixDQUFvQixDQUFDLFdBQUQsQ0FBcEIsQ0FBeEIsRUFBNEQ7WUFBQSxhQUFBLEVBQWUsSUFBZjtZQUFxQixVQUFBLEVBQVksSUFBakM7V0FBNUQ7UUE5Q1E7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVY7SUFOWTs7cUJBdURkLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ1IsY0FBQTtBQUFBO0FBQUE7ZUFBQSxzQ0FBQTs7WUFDRSxtQkFBQSxHQUFzQixTQUFTLENBQUMsY0FBVixDQUFBO1lBQ3RCLElBQUcsU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFIO2NBQ0csUUFBUyxTQUFTLENBQUMsY0FBVixDQUFBO2NBQ1YsU0FBUyxDQUFDLHNCQUFWLENBQWlDLENBQUMsS0FBSyxDQUFDLEdBQU4sR0FBWSxDQUFiLEVBQWdCLENBQWhCLENBQWpDLEVBRkY7O1lBSUEsT0FBcUIsU0FBUyxDQUFDLGlCQUFWLENBQUEsQ0FBckIsRUFBQyxrQkFBRCxFQUFXO1lBQ1gsTUFBQTtZQUVBLGVBQUEsR0FDRSxLQUFDLENBQUEsOEJBQUQsQ0FBZ0MsUUFBaEMsRUFBMEMsTUFBMUMsQ0FDRSxDQUFDLEdBREgsQ0FDTyxTQUFDLElBQUQ7cUJBQVUsSUFBSSxDQUFDLGlCQUFMLENBQUE7WUFBVixDQURQO1lBR0YsZ0JBQUEsR0FBbUIsQ0FBQyxDQUFDLFFBQUQsRUFBVyxDQUFYLENBQUQsRUFBZ0IsQ0FBQyxNQUFELEVBQVMsQ0FBVCxDQUFoQjtZQUNuQixlQUFBLEdBQWtCLEtBQUMsQ0FBQSxvQkFBRCxDQUFzQixnQkFBdEI7WUFDbEIsSUFBNEMsTUFBQSxHQUFTLEtBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQXJEO2NBQUEsZUFBQSxHQUFrQixJQUFBLEdBQU8sZ0JBQXpCOztZQUNBLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLENBQUMsTUFBRCxFQUFTLENBQVQsQ0FBZixFQUE0QixlQUE1QjtZQUVBLEtBQUEsR0FBUSxNQUFBLEdBQVM7WUFDakIsU0FBUyxDQUFDLGNBQVYsQ0FBeUIsbUJBQW1CLENBQUMsU0FBcEIsQ0FBOEIsQ0FBQyxLQUFELEVBQVEsQ0FBUixDQUE5QixDQUF6Qjs7O0FBQ0E7bUJBQUEsbURBQUE7MkNBQUssd0JBQWM7OEJBQ2pCLElBQUMsQ0FBQSxVQUFELENBQVksWUFBQSxHQUFlLEtBQTNCLEVBQWtDLFVBQUEsR0FBYSxLQUEvQztBQURGOzs7QUFwQkY7O1FBRFE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVY7SUFEYzs7cUJBMEJoQixhQUFBLEdBQWUsU0FBQTtNQUNiLFNBQUEsQ0FBVSxzQ0FBVjthQUNBLElBQUMsQ0FBQSxjQUFELENBQUE7SUFGYTs7cUJBVWYsa0JBQUEsR0FBb0IsU0FBQyxFQUFEO2FBQ2xCLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQUcsY0FBQTtBQUFBO0FBQUE7ZUFBQSxzREFBQTs7eUJBQUEsRUFBQSxDQUFHLFNBQUgsRUFBYSxLQUFiO0FBQUE7O1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVY7SUFEa0I7O3FCQUdwQixtQkFBQSxHQUFxQixTQUFDLE9BQUQsRUFBYSxFQUFiO0FBQ25CLFVBQUE7O1FBRG9CLFVBQVE7O01BQzNCLG9CQUFxQjthQUN0QixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsU0FBQyxTQUFEO0FBQ2xCLFlBQUE7UUFBQSxLQUFBLEdBQVEsU0FBUyxDQUFDLGNBQVYsQ0FBQTtRQUNSLElBQUcsaUJBQUEsSUFBc0IsU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUF6QjtVQUNFLFNBQVMsQ0FBQyxVQUFWLENBQUEsRUFERjs7UUFFQSxJQUFBLEdBQU8sU0FBUyxDQUFDLE9BQVYsQ0FBQTtRQUNQLFNBQVMsQ0FBQyxrQkFBVixDQUFBO1FBQ0EsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsRUFBQSxDQUFHLElBQUgsQ0FBckI7ZUFDQSxTQUFTLENBQUMsY0FBVixDQUF5QixLQUF6QjtNQVBrQixDQUFwQjtJQUZtQjs7cUJBWXJCLFNBQUEsR0FBVyxTQUFDLEVBQUQ7YUFDVCxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQWYsQ0FBeUIsRUFBekI7SUFEUzs7cUJBSVgsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLFVBQWYsQ0FBQTtJQURVOztxQkFzQlosV0FBQSxHQUFhLFNBQUMsVUFBRDthQUNYLElBQUMsQ0FBQSxhQUFhLENBQUMsV0FBZixDQUEyQixVQUEzQjtJQURXOztxQkFTYixlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BRGdCO2FBQ2hCLFFBQUEsSUFBQyxDQUFBLGFBQUQsQ0FBYyxDQUFDLGVBQWYsYUFBK0IsSUFBL0I7SUFEZTs7cUJBU2pCLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7TUFEZ0I7YUFDaEIsUUFBQSxJQUFDLENBQUEsYUFBRCxDQUFjLENBQUMsZUFBZixhQUErQixJQUEvQjtJQURlOztxQkFTakIsa0JBQUEsR0FBb0IsU0FBQTtBQUNsQixVQUFBO01BRG1CO2FBQ25CLFFBQUEsSUFBQyxDQUFBLGFBQUQsQ0FBYyxDQUFDLGtCQUFmLGFBQWtDLElBQWxDO0lBRGtCOztxQkFTcEIsa0JBQUEsR0FBb0IsU0FBQTtBQUNsQixVQUFBO01BRG1CO2FBQ25CLFFBQUEsSUFBQyxDQUFBLGFBQUQsQ0FBYyxDQUFDLGtCQUFmLGFBQWtDLElBQWxDO0lBRGtCOztxQkFJcEIsYUFBQSxHQUFlLFNBQUE7QUFDYixVQUFBO01BRGM7YUFDZCxRQUFBLElBQUMsQ0FBQSxhQUFELENBQWMsQ0FBQyxhQUFmLGFBQTZCLElBQTdCO0lBRGE7O3FCQU1mLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO0lBRGM7O3FCQUloQixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLE1BQWQsR0FBdUI7SUFETDs7cUJBSXBCLFVBQUEsR0FBWSxTQUFBO2FBQUc7Ozs7U0FBSSxLQUFKLEVBQVUsSUFBQyxDQUFBLE9BQVg7SUFBSDs7cUJBR1osU0FBQSxHQUFXLFNBQUE7YUFDVCxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxPQUFSO0lBRFM7O3FCQU1YLHlCQUFBLEdBQTJCLFNBQUMsY0FBRDtNQUN6QixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsY0FBcEIsRUFBb0MsSUFBQyxDQUFBLDRCQUFELENBQUEsQ0FBcEM7YUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUFtQixDQUFDO0lBRks7O3FCQU8zQix5QkFBQSxHQUEyQixTQUFDLGNBQUQ7TUFDekIsSUFBQyxDQUFBLGtCQUFELENBQW9CLGNBQXBCLEVBQW9DLElBQUMsQ0FBQSw0QkFBRCxDQUFBLENBQXBDO2FBQ0EsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBbUIsQ0FBQztJQUZLOztxQkFLM0IsU0FBQSxHQUFXLFNBQUMsTUFBRDtBQUNULFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBSSxNQUFKLENBQVc7UUFBQSxNQUFBLEVBQVEsSUFBUjtRQUFjLE1BQUEsRUFBUSxNQUF0QjtPQUFYO01BQ1QsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsTUFBZDtNQUNBLElBQUMsQ0FBQSxJQUFELENBQU0sY0FBTixFQUFzQixNQUF0QjthQUNBO0lBSlM7O3FCQU9YLFlBQUEsR0FBYyxTQUFDLE1BQUQ7YUFDWixDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxPQUFWLEVBQW1CLE1BQW5CO0lBRFk7O3FCQVNkLFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ1osVUFBQTs7UUFEcUIsVUFBUTs7TUFDN0IsSUFBQSxDQUFPLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBc0IsQ0FBQyxhQUE5QjtRQUNFLElBQUMsQ0FBQSxtQ0FBRCxDQUFxQyxNQUFNLENBQUMsY0FBUCxDQUFBLENBQXJDLEVBREY7O01BRUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWDtNQUNULFNBQUEsR0FBWSxJQUFJLFNBQUosQ0FBYyxDQUFDLENBQUMsTUFBRixDQUFTO1FBQUMsTUFBQSxFQUFRLElBQVQ7UUFBZSxRQUFBLE1BQWY7UUFBdUIsUUFBQSxNQUF2QjtPQUFULEVBQXlDLE9BQXpDLENBQWQ7TUFDWixJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsU0FBakI7TUFDQSxvQkFBQSxHQUF1QixTQUFTLENBQUMsY0FBVixDQUFBO01BQ3ZCLElBQUMsQ0FBQSwyQkFBRCxDQUFBO01BQ0EsSUFBRyxTQUFTLENBQUMsU0FBYjtBQUNFO0FBQUEsYUFBQSxzQ0FBQTs7VUFDRSxJQUFHLFNBQVMsQ0FBQyxxQkFBVixDQUFnQyxvQkFBaEMsQ0FBSDtBQUNFLG1CQUFPLFVBRFQ7O0FBREYsU0FERjtPQUFBLE1BQUE7UUFLRSxJQUFDLENBQUEsSUFBRCxDQUFNLGlCQUFOLEVBQXlCLFNBQXpCO2VBQ0EsVUFORjs7SUFSWTs7cUJBd0JkLDBCQUFBLEdBQTRCLFNBQUMsV0FBRCxFQUFjLE9BQWQ7O1FBQWMsVUFBUTs7TUFDaEQsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsV0FBakIsRUFBOEIsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFDLENBQUEsNEJBQUQsQ0FBQSxDQUFYLEVBQTRDLE9BQTVDLENBQTlCO2FBQ0EsSUFBQyxDQUFBLGdCQUFELENBQUE7SUFGMEI7O3FCQVc1QixzQkFBQSxHQUF3QixTQUFDLFdBQUQsRUFBYyxPQUFkO2FBQ3RCLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixDQUFDLFdBQUQsQ0FBekIsRUFBd0MsT0FBeEM7SUFEc0I7O3FCQVV4QixzQkFBQSxHQUF3QixTQUFDLFdBQUQsRUFBYyxPQUFkO2FBQ3RCLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixJQUFDLENBQUEseUJBQUQsQ0FBMkIsV0FBM0IsRUFBd0MsT0FBeEMsQ0FBeEIsRUFBMEUsT0FBMUU7SUFEc0I7O3FCQVV4Qix1QkFBQSxHQUF5QixTQUFDLFlBQUQsRUFBZSxPQUFmO0FBQ3ZCLFVBQUE7O1FBRHNDLFVBQVE7O01BQzlDLElBQUEsQ0FBMkUsWUFBWSxDQUFDLE1BQXhGO0FBQUEsY0FBTSxJQUFJLEtBQUosQ0FBVSxrREFBVixFQUFOOztNQUVBLFVBQUEsR0FBYSxJQUFDLENBQUEsYUFBRCxDQUFBO0FBQ2I7QUFBQSxXQUFBLHNDQUFBOztRQUFBLFNBQVMsQ0FBQyxPQUFWLENBQUE7QUFBQTthQUVBLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixPQUE3QixFQUFzQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDcEMsY0FBQTtBQUFBO2VBQUEsd0RBQUE7O1lBQ0UsV0FBQSxHQUFjLEtBQUssQ0FBQyxVQUFOLENBQWlCLFdBQWpCO1lBQ2QsSUFBRyxVQUFXLENBQUEsQ0FBQSxDQUFkOzJCQUNFLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxjQUFkLENBQTZCLFdBQTdCLEVBQTBDLE9BQTFDLEdBREY7YUFBQSxNQUFBOzJCQUdFLEtBQUMsQ0FBQSwwQkFBRCxDQUE0QixXQUE1QixFQUF5QyxPQUF6QyxHQUhGOztBQUZGOztRQURvQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEM7SUFOdUI7O3FCQWV6QixlQUFBLEdBQWlCLFNBQUMsU0FBRDtNQUNmLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLFVBQVYsRUFBc0IsU0FBdEI7YUFDQSxJQUFDLENBQUEsSUFBRCxDQUFNLG1CQUFOLEVBQTJCLFNBQTNCO0lBRmU7O3FCQU1qQixlQUFBLEdBQWlCLFNBQUE7TUFDZixJQUFDLENBQUEscUJBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBZSxDQUFDLEtBQWhCLENBQUE7SUFGZTs7cUJBS2pCLHFCQUFBLEdBQXVCLFNBQUE7QUFDckIsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsYUFBRCxDQUFBO01BQ2IsSUFBRyxVQUFVLENBQUMsTUFBWCxHQUFvQixDQUF2QjtBQUNFO0FBQUEsYUFBQSxzQ0FBQTs7VUFBQSxTQUFTLENBQUMsT0FBVixDQUFBO0FBQUE7ZUFDQSxLQUZGO09BQUEsTUFBQTtlQUlFLE1BSkY7O0lBRnFCOztxQkFRdkIsMkJBQUEsR0FBNkIsU0FBQyxTQUFEO2FBQzNCLElBQUMsQ0FBQSxJQUFELENBQU0sZ0NBQU4sRUFBd0MsU0FBeEM7SUFEMkI7O3FCQU03QixhQUFBLEdBQWUsU0FBQTthQUFHOzs7O1NBQUksS0FBSixFQUFVLElBQUMsQ0FBQSxVQUFYO0lBQUg7O3FCQVVmLFlBQUEsR0FBYyxTQUFDLEtBQUQ7O1FBQ1osUUFBUyxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosR0FBcUI7O2FBQzlCLElBQUMsQ0FBQSxVQUFXLENBQUEsS0FBQTtJQUZBOztxQkFPZCxnQkFBQSxHQUFrQixTQUFBO2FBQ2hCLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLFVBQVI7SUFEZ0I7O3FCQU9sQixvQ0FBQSxHQUFzQyxTQUFBO2FBQ3BDLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixTQUFDLENBQUQsRUFBSSxDQUFKO2VBQVUsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxDQUFWO01BQVYsQ0FBdEI7SUFEb0M7O3FCQU10Qyx3QkFBQSxHQUEwQixTQUFBO2FBQ3hCLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLG9DQUFELENBQUEsQ0FBUDtJQUR3Qjs7cUJBUzFCLDhCQUFBLEdBQWdDLFNBQUMsV0FBRDthQUM5QixDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBTixFQUF3QixTQUFDLFNBQUQ7ZUFDdEIsU0FBUyxDQUFDLHFCQUFWLENBQWdDLFdBQWhDO01BRHNCLENBQXhCO0lBRDhCOztxQkFZaEMsdUJBQUEsR0FBeUIsU0FBQyxRQUFELEVBQVcsT0FBWDthQUN2QixJQUFDLENBQUEsV0FBRCxDQUFhLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixRQUF6QixFQUFtQyxPQUFuQztNQUFaLENBQWI7SUFEdUI7O3FCQU96Qix1QkFBQSxHQUF5QixTQUFBO2FBQ3ZCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBWSxDQUFDLGlCQUFiLENBQUE7SUFEdUI7O3FCQU16QixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBWSxDQUFDLFlBQWIsQ0FBQTtJQURrQjs7cUJBV3BCLHVCQUFBLEdBQXlCLFNBQUMsUUFBRCxFQUFXLE9BQVg7YUFDdkIsSUFBQyxDQUFBLFdBQUQsQ0FBYSxTQUFDLE1BQUQ7ZUFBWSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsUUFBekIsRUFBbUMsT0FBbkM7TUFBWixDQUFiO0lBRHVCOztxQkFPekIsdUJBQUEsR0FBeUIsU0FBQTthQUN2QixJQUFDLENBQUEsU0FBRCxDQUFBLENBQVksQ0FBQyxpQkFBYixDQUFBO0lBRHVCOztxQkFPekIsc0JBQUEsR0FBd0IsU0FBQTthQUN0QixJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUFtQixDQUFDLGNBQXBCLENBQUE7SUFEc0I7O3FCQU94QixzQkFBQSxHQUF3QixTQUFBO2FBQ3RCLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQW1CLENBQUMsY0FBcEIsQ0FBQTtJQURzQjs7cUJBUXhCLHVCQUFBLEdBQXlCLFNBQUE7QUFDdkIsVUFBQTtBQUFBO0FBQUE7V0FBQSxzQ0FBQTs7cUJBQUEsU0FBUyxDQUFDLGNBQVYsQ0FBQTtBQUFBOztJQUR1Qjs7cUJBUXpCLHVCQUFBLEdBQXlCLFNBQUE7QUFDdkIsVUFBQTtBQUFBO0FBQUE7V0FBQSxzQ0FBQTs7cUJBQUEsU0FBUyxDQUFDLGNBQVYsQ0FBQTtBQUFBOztJQUR1Qjs7cUJBTXpCLGVBQUEsR0FBaUIsU0FBQTthQUNmLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQW1CLENBQUMsT0FBcEIsQ0FBQTtJQURlOztxQkFRakIsb0JBQUEsR0FBc0IsU0FBQyxLQUFEO2FBQ3BCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixLQUF2QjtJQURvQjs7cUJBU3RCLG9CQUFBLEdBQXNCLFNBQUMsS0FBRCxFQUFRLElBQVI7YUFBaUIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsY0FBYixDQUE0QixLQUE1QixFQUFtQyxJQUFuQztJQUFqQjs7cUJBTXRCLDhCQUFBLEdBQWdDLFNBQUE7YUFDOUIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsOEJBQWIsQ0FBQTtJQUQ4Qjs7cUJBTWhDLGtCQUFBLEdBQW9CLFNBQUMsT0FBRDthQUNsQixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMseUJBQWIsQ0FBdUMsT0FBdkMsQ0FBdEI7SUFEa0I7O3FCQUlwQixZQUFBLEdBQWMsU0FBQyxTQUFEO2FBQ1osSUFBQyxDQUFBLFdBQUQsQ0FBYSxTQUFDLE1BQUQ7ZUFBWSxNQUFNLENBQUMsTUFBUCxDQUFjLFNBQWQsRUFBeUI7VUFBQSxvQkFBQSxFQUFzQixJQUF0QjtTQUF6QjtNQUFaLENBQWI7SUFEWTs7cUJBSWQsY0FBQSxHQUFnQixTQUFDLFNBQUQ7YUFDZCxJQUFDLENBQUEsV0FBRCxDQUFhLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFNBQWhCLEVBQTJCO1VBQUEsb0JBQUEsRUFBc0IsSUFBdEI7U0FBM0I7TUFBWixDQUFiO0lBRGM7O3FCQUloQixjQUFBLEdBQWdCLFNBQUE7YUFDZCxJQUFDLENBQUEsV0FBRCxDQUFhLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxRQUFQLENBQWdCO1VBQUEsb0JBQUEsRUFBc0IsSUFBdEI7U0FBaEI7TUFBWixDQUFiO0lBRGM7O3FCQUloQixlQUFBLEdBQWlCLFNBQUE7YUFDZixJQUFDLENBQUEsV0FBRCxDQUFhLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxTQUFQLENBQWlCO1VBQUEsb0JBQUEsRUFBc0IsSUFBdEI7U0FBakI7TUFBWixDQUFiO0lBRGU7O3FCQU1qQixlQUFBLEdBQWlCLFNBQUE7YUFDZixJQUFDLENBQUEsV0FBRCxDQUFhLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxTQUFQLENBQUE7TUFBWixDQUFiO0lBRGU7O3FCQU1qQixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLElBQUMsQ0FBQSxXQUFELENBQWEsU0FBQyxNQUFEO2VBQVksTUFBTSxDQUFDLFlBQVAsQ0FBQTtNQUFaLENBQWI7SUFEa0I7O3FCQUlwQixpQ0FBQSxHQUFtQyxTQUFBO2FBQ2pDLElBQUMsQ0FBQSxXQUFELENBQWEsU0FBQyxNQUFEO2VBQVksTUFBTSxDQUFDLDJCQUFQLENBQUE7TUFBWixDQUFiO0lBRGlDOztxQkFJbkMsMkJBQUEsR0FBNkIsU0FBQTthQUMzQixJQUFDLENBQUEsV0FBRCxDQUFhLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxxQkFBUCxDQUFBO01BQVosQ0FBYjtJQUQyQjs7cUJBSTdCLGdDQUFBLEdBQWtDLFNBQUE7YUFDaEMsSUFBQyxDQUFBLFdBQUQsQ0FBYSxTQUFDLE1BQUQ7ZUFBWSxNQUFNLENBQUMsMEJBQVAsQ0FBQTtNQUFaLENBQWI7SUFEZ0M7O3FCQUlsQywyQkFBQSxHQUE2QixTQUFBO2FBQzNCLElBQUMsQ0FBQSxXQUFELENBQWEsU0FBQyxNQUFEO2VBQVksTUFBTSxDQUFDLHFCQUFQLENBQUE7TUFBWixDQUFiO0lBRDJCOztxQkFJN0IscUJBQUEsR0FBdUIsU0FBQTthQUNyQixJQUFDLENBQUEsV0FBRCxDQUFhLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxlQUFQLENBQUE7TUFBWixDQUFiO0lBRHFCOztxQkFJdkIsMkJBQUEsR0FBNkIsU0FBQTthQUMzQixJQUFDLENBQUEsV0FBRCxDQUFhLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxxQkFBUCxDQUFBO01BQVosQ0FBYjtJQUQyQjs7cUJBSTdCLHFCQUFBLEdBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBLFdBQUQsQ0FBYSxTQUFDLE1BQUQ7ZUFBWSxNQUFNLENBQUMsZUFBUCxDQUFBO01BQVosQ0FBYjtJQURxQjs7cUJBSXZCLCtCQUFBLEdBQWlDLFNBQUE7YUFDL0IsSUFBQyxDQUFBLFdBQUQsQ0FBYSxTQUFDLE1BQUQ7ZUFBWSxNQUFNLENBQUMseUJBQVAsQ0FBQTtNQUFaLENBQWI7SUFEK0I7O3FCQUlqQyxnQ0FBQSxHQUFrQyxTQUFBO2FBQ2hDLElBQUMsQ0FBQSxXQUFELENBQWEsU0FBQyxNQUFEO2VBQVksTUFBTSxDQUFDLDBCQUFQLENBQUE7TUFBWixDQUFiO0lBRGdDOztxQkFJbEMsNEJBQUEsR0FBOEIsU0FBQTthQUM1QixJQUFDLENBQUEsV0FBRCxDQUFhLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxzQkFBUCxDQUFBO01BQVosQ0FBYjtJQUQ0Qjs7cUJBRzlCLHNCQUFBLEdBQXdCLFNBQUE7YUFDdEIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsVUFBYixDQUFBO0lBRHNCOztxQkFHeEIsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxHQUFrQixJQUFDLENBQUEsU0FBRCxDQUFBLENBQWhDO0lBRE07O3FCQUdSLFFBQUEsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsWUFBRCxDQUFBLENBQUEsR0FBa0IsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFoQztJQURROztxQkFHVixXQUFBLEdBQWEsU0FBQyxFQUFEO01BQ1gsSUFBQyxDQUFBLGFBQUQsR0FBaUI7YUFDakIsSUFBQyxDQUFBLFlBQUQsQ0FBYyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDWixjQUFBO0FBQUE7QUFBQSxlQUFBLHNDQUFBOztZQUFBLEVBQUEsQ0FBRyxNQUFIO0FBQUE7VUFDQSxLQUFDLENBQUEsWUFBRCxDQUFBO1VBQ0EsS0FBQyxDQUFBLGFBQUQsR0FBaUI7aUJBQ2pCLEtBQUMsQ0FBQSxJQUFELENBQU0sZUFBTjtRQUpZO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkO0lBRlc7O3FCQVFiLFdBQUEsR0FBYSxTQUFDLEtBQUQ7TUFDWCxJQUFDLENBQUEsSUFBRCxDQUFNLGNBQU4sRUFBc0IsS0FBdEI7TUFDQSxJQUFBLENBQTZCLElBQUMsQ0FBQSxhQUE5QjtlQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sZUFBTixFQUFBOztJQUZXOztxQkFVYixzQkFBQSxHQUF3QixTQUFDLFFBQUQ7QUFDdEIsVUFBQTtNQUFBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGdCQUFELENBQUE7TUFDaEIsYUFBYSxDQUFDLHNCQUFkLENBQXFDLFFBQXJDO2FBQ0EsSUFBQyxDQUFBLDJCQUFELENBQTZCO1FBQUEsUUFBQSxFQUFVLGFBQWEsQ0FBQyxVQUFkLENBQUEsQ0FBVjtPQUE3QjtJQUhzQjs7cUJBU3hCLFdBQUEsR0FBYSxTQUFBO2FBQ1gsSUFBQyxDQUFBLHVCQUFELENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO2lCQUFlLFNBQVMsQ0FBQyxXQUFWLENBQUE7UUFBZjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7SUFEVzs7cUJBT2IsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsd0JBQUQsQ0FBMEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7aUJBQWUsU0FBUyxDQUFDLFVBQVYsQ0FBQTtRQUFmO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtJQURVOztxQkFPWixRQUFBLEdBQVUsU0FBQyxRQUFEO2FBQ1IsSUFBQyxDQUFBLHdCQUFELENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO2lCQUFlLFNBQVMsQ0FBQyxRQUFWLENBQW1CLFFBQW5CO1FBQWY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCO0lBRFE7O3FCQU9WLFVBQUEsR0FBWSxTQUFDLFFBQUQ7YUFDVixJQUFDLENBQUEsdUJBQUQsQ0FBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7aUJBQWUsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsUUFBckI7UUFBZjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7SUFEVTs7cUJBT1osV0FBQSxHQUFhLFNBQUE7YUFDWCxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7aUJBQWUsU0FBUyxDQUFDLFdBQVYsQ0FBQTtRQUFmO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtJQURXOztxQkFNYixTQUFBLEdBQVcsU0FBQTthQUNULElBQUMsQ0FBQSx1QkFBRCxDQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRDtpQkFBZSxTQUFTLENBQUMsU0FBVixDQUFBO1FBQWY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0lBRFM7O3FCQU9YLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRDtpQkFBZSxTQUFTLENBQUMsY0FBVixDQUFBO1FBQWY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0lBRGM7O3FCQU9oQix1QkFBQSxHQUF5QixTQUFBO2FBQ3ZCLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRDtpQkFBZSxTQUFTLENBQUMsdUJBQVYsQ0FBQTtRQUFmO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtJQUR1Qjs7cUJBU3pCLDRCQUFBLEdBQThCLFNBQUE7YUFDNUIsSUFBQyxDQUFBLHdCQUFELENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO2lCQUFlLFNBQVMsQ0FBQyw0QkFBVixDQUFBO1FBQWY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCO0lBRDRCOztxQkFPOUIsaUJBQUEsR0FBbUIsU0FBQTthQUNqQixJQUFDLENBQUEsdUJBQUQsQ0FBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7aUJBQWUsU0FBUyxDQUFDLGlCQUFWLENBQUE7UUFBZjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7SUFEaUI7O3FCQU9uQiw0QkFBQSxHQUE4QixTQUFBO2FBQzVCLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRDtpQkFBZSxTQUFTLENBQUMsNEJBQVYsQ0FBQTtRQUFmO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtJQUQ0Qjs7cUJBTzlCLHdCQUFBLEdBQTBCLFNBQUE7YUFDeEIsSUFBQyxDQUFBLHVCQUFELENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO2lCQUFlLFNBQVMsQ0FBQyx3QkFBVixDQUFBO1FBQWY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0lBRHdCOztxQkFNMUIsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsdUJBQUQsQ0FBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7aUJBQWUsU0FBUyxDQUFDLFVBQVYsQ0FBQTtRQUFmO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtJQURVOztxQkFXWixpQkFBQSxHQUFtQixTQUFBO2FBQ2pCLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRDtpQkFBZSxTQUFTLENBQUMsaUJBQVYsQ0FBQTtRQUFmO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtJQURpQjs7cUJBV25CLGlCQUFBLEdBQW1CLFNBQUE7YUFDakIsSUFBQyxDQUFBLHdCQUFELENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO2lCQUFlLFNBQVMsQ0FBQyxpQkFBVixDQUFBO1FBQWY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCO0lBRGlCOztxQkFRbkIsd0JBQUEsR0FBMEIsU0FBQTtBQUN4QixVQUFBO0FBQUE7QUFBQTtXQUFBLHNDQUFBOztRQUNFLEtBQUEsR0FBUSxTQUFTLENBQUMsY0FBVixDQUFBO1FBQ1IsSUFBWSxLQUFLLENBQUMsWUFBTixDQUFBLENBQVo7QUFBQSxtQkFBQTs7UUFFQSxTQUFTLENBQUMsT0FBVixDQUFBO1FBQ0MsbUJBQUQsRUFBUTtRQUNSLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixDQUFDLEtBQUQsRUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFQLEVBQVksS0FBWixDQUFSLENBQTVCO1FBQ0MsTUFBTztBQUNSLGVBQU0sRUFBRSxHQUFGLEdBQVEsR0FBRyxDQUFDLEdBQWxCO1VBQ0UsSUFBQyxDQUFBLDBCQUFELENBQTRCLENBQUMsQ0FBQyxHQUFELEVBQU0sQ0FBTixDQUFELEVBQVcsQ0FBQyxHQUFELEVBQU0sS0FBTixDQUFYLENBQTVCO1FBREY7cUJBRUEsSUFBQyxDQUFBLDBCQUFELENBQTRCLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBTCxFQUFVLENBQVYsQ0FBRCxFQUFlLENBQUMsR0FBRyxDQUFDLEdBQUwsRUFBVSxHQUFHLENBQUMsTUFBZCxDQUFmLENBQTVCO0FBVkY7O0lBRHdCOztxQkFpQjFCLFNBQUEsR0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBLGtCQUFELENBQW9CLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO0FBQ2xCLGNBQUE7VUFBQSxJQUFHLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBSDtZQUNFLFNBQVMsQ0FBQyxXQUFWLENBQUE7WUFDQSxJQUFBLEdBQU8sU0FBUyxDQUFDLE9BQVYsQ0FBQTtZQUNQLFNBQVMsRUFBQyxNQUFELEVBQVQsQ0FBQTtZQUNBLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBQTttQkFDQSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUxGO1dBQUEsTUFBQTttQkFPRSxTQUFTLENBQUMsVUFBVixDQUFxQixTQUFTLENBQUMsT0FBVixDQUFBLENBQW1CLENBQUMsS0FBcEIsQ0FBMEIsRUFBMUIsQ0FBNkIsQ0FBQyxPQUE5QixDQUFBLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsRUFBN0MsQ0FBckIsRUFQRjs7UUFEa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCO0lBRFM7O3FCQWVYLFNBQUEsR0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBLG1CQUFELENBQXFCO1FBQUEsaUJBQUEsRUFBa0IsSUFBbEI7T0FBckIsRUFBNkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7aUJBQVUsSUFBSSxDQUFDLFdBQUwsQ0FBQTtRQUFWO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QztJQURTOztxQkFPWCxTQUFBLEdBQVcsU0FBQTthQUNULElBQUMsQ0FBQSxtQkFBRCxDQUFxQjtRQUFBLGlCQUFBLEVBQWtCLElBQWxCO09BQXJCLEVBQTZDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUFVLElBQUksQ0FBQyxXQUFMLENBQUE7UUFBVjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0M7SUFEUzs7cUJBV1gsU0FBQSxHQUFXLFNBQUE7YUFDVCxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsU0FBQyxTQUFEO2VBQWUsU0FBUyxDQUFDLFNBQVYsQ0FBQTtNQUFmLENBQXBCO0lBRFM7O3FCQU9YLHVCQUFBLEdBQXlCLFNBQUE7YUFDdkIsSUFBQyxDQUFBLHdCQUFELENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO2lCQUFlLFNBQVMsQ0FBQyx1QkFBVixDQUFBO1FBQWY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCO0lBRHVCOztxQkFPekIsaUJBQUEsR0FBbUIsU0FBQTthQUNqQixJQUFDLENBQUEsdUJBQUQsQ0FBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7aUJBQWUsU0FBUyxDQUFDLGlCQUFWLENBQUE7UUFBZjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7SUFEaUI7O3FCQU9uQiwyQkFBQSxHQUE2QixTQUFBO2FBQzNCLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRDtpQkFBZSxTQUFTLENBQUMsMkJBQVYsQ0FBQTtRQUFmO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtJQUQyQjs7cUJBSTdCLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLHVCQUFELENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO2lCQUFlLFNBQVMsQ0FBQyxVQUFWLENBQUE7UUFBZjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7SUFEVTs7cUJBUVosWUFBQSxHQUFjLFNBQUMsTUFBRDtBQUNaLFVBQUE7TUFBQSxJQUFHLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBSDtRQUNFLEtBQUEsR0FBUSxNQUFNLENBQUMsY0FBUCxDQUFBO1FBQ1IsSUFBQyxDQUFBLHNCQUFELENBQXdCLEtBQXhCO2VBQ0EsTUFIRjs7SUFEWTs7cUJBT2QsWUFBQSxHQUFjLFNBQUE7QUFDWixVQUFBO01BQUEsU0FBQSxHQUFZO0FBQ1o7QUFBQTtXQUFBLHNDQUFBOztRQUNFLFFBQUEsR0FBVyxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUEwQixDQUFDLFFBQTNCLENBQUE7UUFDWCxJQUFHLGFBQVksU0FBWixFQUFBLFFBQUEsTUFBSDt1QkFDRSxNQUFNLENBQUMsT0FBUCxDQUFBLEdBREY7U0FBQSxNQUFBO3VCQUdFLFNBQVMsQ0FBQyxJQUFWLENBQWUsUUFBZixHQUhGOztBQUZGOztJQUZZOztxQkFVZCx1QkFBQSxHQUF5QixTQUFDLEVBQUQ7YUFDdkIsSUFBQyxDQUFBLDJCQUFELENBQTZCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUMzQixjQUFBO0FBQUE7QUFBQTtlQUFBLHNDQUFBOzt5QkFBQSxFQUFBLENBQUcsU0FBSDtBQUFBOztRQUQyQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0I7SUFEdUI7O3FCQU16Qix3QkFBQSxHQUEwQixTQUFDLEVBQUQ7YUFDeEIsSUFBQyxDQUFBLDJCQUFELENBQTZCO1FBQUEsUUFBQSxFQUFVLElBQVY7T0FBN0IsRUFBNkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQzNDLGNBQUE7QUFBQTtBQUFBO2VBQUEsc0NBQUE7O3lCQUFBLEVBQUEsQ0FBRyxTQUFIO0FBQUE7O1FBRDJDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QztJQUR3Qjs7cUJBSTFCLGtCQUFBLEdBQW9CLFNBQUE7QUFDbEIsVUFBQTtBQUFBO0FBQUE7V0FBQSxzQ0FBQTs7cUJBQUEsU0FBUyxDQUFDLFFBQVYsQ0FBQTtBQUFBOztJQURrQjs7cUJBTXBCLDJCQUFBLEdBQTZCLFNBQUE7QUFDM0IsVUFBQTtNQUQ0QjtNQUM1QixJQUFtQixDQUFDLENBQUMsVUFBRixDQUFhLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBUCxDQUFiLENBQW5CO1FBQUEsRUFBQSxHQUFLLElBQUksQ0FBQyxHQUFMLENBQUEsRUFBTDs7TUFDQSxPQUFBLHdDQUF1QjtNQUV2QixJQUFnQixJQUFDLENBQUEsd0JBQWpCO0FBQUEsMENBQU8sY0FBUDs7TUFFQSxJQUFHLFVBQUg7UUFDRSxJQUFDLENBQUEsd0JBQUQsR0FBNEI7UUFDNUIsTUFBQSxHQUFTLEVBQUEsQ0FBQTtRQUNULElBQUMsQ0FBQSx3QkFBRCxHQUE0QixNQUg5Qjs7TUFLQSxPQUFBLEdBQVUsU0FBQyxrQkFBRCxFQUFxQixTQUFyQjtBQUNSLFlBQUE7UUFBQSxxQkFBQSxHQUF3QixDQUFDLENBQUMsSUFBRixDQUFPLGtCQUFQLEVBQTJCLFNBQUMsQ0FBRDtpQkFBTyxDQUFDLENBQUMsY0FBRixDQUFpQixTQUFqQjtRQUFQLENBQTNCO1FBQ3hCLElBQUcsNkJBQUg7VUFDRSxxQkFBcUIsQ0FBQyxLQUF0QixDQUE0QixTQUE1QixFQUF1QyxPQUF2QztpQkFDQSxtQkFGRjtTQUFBLE1BQUE7aUJBSUUsa0JBQWtCLENBQUMsTUFBbkIsQ0FBMEIsQ0FBQyxTQUFELENBQTFCLEVBSkY7O01BRlE7YUFRVixDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBVCxFQUEyQixPQUEzQixFQUFvQyxFQUFwQztJQW5CMkI7O3FCQXFCN0Isb0NBQUEsR0FBc0MsU0FBQTtBQUNwQyxVQUFBO01BQUEsY0FBQSxHQUFpQjtNQUNqQixJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxNQUFaLEVBQW9CLGFBQXBCLEVBQW1DLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDakMsY0FBQSxHQUFpQixLQUFDLENBQUEsdUJBQUQsQ0FBQTtRQURnQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkM7YUFFQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxNQUFaLEVBQW9CLFVBQXBCLEVBQWdDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUM5QixJQUE0QyxjQUE1QztZQUFBLEtBQUMsQ0FBQSx1QkFBRCxDQUF5QixjQUF6QixFQUFBOztpQkFDQSxjQUFBLEdBQWlCO1FBRmE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDO0lBSm9DOztxQkFTdEMsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLFVBQWYsQ0FBQTtJQURVOztxQkFPWixVQUFBLEdBQVksU0FBQyxPQUFEO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxVQUFmLENBQTBCLE9BQTFCO0lBRFU7O3FCQUlaLGFBQUEsR0FBZSxTQUFBO2FBQ2IsSUFBQyxDQUFBLGFBQWEsQ0FBQyxhQUFmLENBQUE7SUFEYTs7cUJBR2YsZ0JBQUEsR0FBa0IsU0FBQTthQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCO0lBRGdCOztxQkFXbEIsUUFBQSxHQUFVLFNBQUMsRUFBRDthQUNSLElBQUMsQ0FBQSxZQUFELENBQWMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNaLEtBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixFQUFqQjtRQURZO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkO0lBRFE7O3FCQVVWLGdCQUFBLEdBQWtCLFNBQUE7YUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUE7SUFBSDs7cUJBTWxCLGlCQUFBLEdBQW1CLFNBQUE7YUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQUE7SUFBSDs7cUJBSW5CLGdCQUFBLEdBQWtCLFNBQUE7YUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUE7SUFBSDs7cUJBRWxCLFlBQUEsR0FBYyxTQUFDLEVBQUQ7QUFDWixVQUFBO01BQUEsSUFBQyxDQUFBLElBQUQsQ0FBTSx5QkFBTjtNQUNBLE1BQUEsR0FBUyxFQUFBLENBQUE7TUFDVCxJQUFDLENBQUEsSUFBRCxDQUFNLHVCQUFOO2FBQ0E7SUFKWTs7cUJBTWQsT0FBQSxHQUFTLFNBQUE7YUFDUCxVQUFBLEdBQVcsSUFBQyxDQUFBLEVBQVosR0FBZTtJQURSOztxQkFHVCxjQUFBLEdBQWdCLFNBQUMsS0FBRCxFQUFRLEdBQVI7YUFBZ0IsSUFBQyxDQUFBLGFBQWEsQ0FBQyxRQUFmLENBQXdCLEtBQXhCLEVBQStCLEdBQS9CO0lBQWhCOztxQkFFaEIsbUJBQUEsR0FBcUIsU0FBQTtNQUNuQixJQUFDLENBQUEsU0FBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxpQkFBTjtJQUZtQjs7cUJBSXJCLG1CQUFBLEdBQXFCLFNBQUMsTUFBRDtNQUNuQixJQUFHLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixJQUFDLENBQUEsNEJBQUQsQ0FBQSxDQUF6QixDQUFIO2VBQ0UsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLEVBREY7O0lBRG1COztxQkFJckIsNEJBQUEsR0FBOEIsU0FBQTthQUM1QjtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQW1CLFFBQUEsRUFBVSxJQUFDLENBQUEsRUFBOUI7UUFBa0MsVUFBQSxFQUFZLE9BQTlDOztJQUQ0Qjs7cUJBRzlCLHVCQUFBLEdBQXlCLFNBQUE7YUFBRyxJQUFDLENBQUEsYUFBYSxDQUFDLHVCQUFmLENBQUE7SUFBSDs7cUJBQ3pCLHVCQUFBLEdBQXlCLFNBQUMsb0JBQUQ7YUFBMEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyx1QkFBZixDQUF1QyxvQkFBdkM7SUFBMUI7O3FCQUV6Qix5QkFBQSxHQUEyQixTQUFBO2FBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyx5QkFBZixDQUFBO0lBQUg7O3FCQUMzQix5QkFBQSxHQUEyQixTQUFDLHNCQUFEO2FBQTRCLElBQUMsQ0FBQSxhQUFhLENBQUMseUJBQWYsQ0FBeUMsc0JBQXpDO0lBQTVCOztxQkFFM0IsYUFBQSxHQUFlLFNBQUE7YUFBRyxJQUFDLENBQUEsYUFBYSxDQUFDLGFBQWYsQ0FBQTtJQUFIOztxQkFDZixhQUFBLEdBQWUsU0FBQyxVQUFEO2FBQWdCLElBQUMsQ0FBQSxhQUFhLENBQUMsYUFBZixDQUE2QixVQUE3QjtJQUFoQjs7cUJBRWYsa0JBQUEsR0FBb0IsU0FBQyxVQUFELEVBQWEsSUFBYjthQUFzQixJQUFDLENBQUEsYUFBYSxDQUFDLGtCQUFmLENBQWtDLFVBQWxDLEVBQThDLElBQTlDO0lBQXRCOztxQkFDcEIsa0JBQUEsR0FBb0IsU0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixLQUFuQjthQUE2QixJQUFDLENBQUEsYUFBYSxDQUFDLGtCQUFmLENBQWtDLFVBQWxDLEVBQThDLElBQTlDLEVBQW9ELEtBQXBEO0lBQTdCOztxQkFFcEIsbUJBQUEsR0FBcUIsU0FBQyxVQUFEO2FBQWdCLElBQUMsQ0FBQSxhQUFhLENBQUMsbUJBQWYsQ0FBbUMsVUFBbkM7SUFBaEI7O3FCQUVyQixxQkFBQSxHQUF1QixTQUFBO2FBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxxQkFBZixDQUFBO0lBQUg7O3FCQUV2QixtQkFBQSxHQUFxQixTQUFBO2FBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxtQkFBZixDQUFBO0lBQUg7O3FCQUNyQixtQkFBQSxHQUFxQixTQUFDLGdCQUFEO2FBQXNCLElBQUMsQ0FBQSxhQUFhLENBQUMsbUJBQWYsQ0FBbUMsZ0JBQW5DO0lBQXRCOztxQkFFckIsU0FBQSxHQUFXLFNBQUMsTUFBRDthQUFZLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBZixDQUF5QixNQUF6QjtJQUFaOztxQkFDWCxTQUFBLEdBQVcsU0FBQTthQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBZixDQUFBO0lBQUg7O3FCQUVYLFFBQUEsR0FBVSxTQUFDLEtBQUQ7YUFBVyxJQUFDLENBQUEsYUFBYSxDQUFDLFFBQWYsQ0FBd0IsS0FBeEI7SUFBWDs7cUJBQ1YsUUFBQSxHQUFVLFNBQUE7YUFBRyxJQUFDLENBQUEsYUFBYSxDQUFDLFFBQWYsQ0FBQTtJQUFIOztxQkFFVixZQUFBLEdBQWMsU0FBQTthQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsWUFBZixDQUFBO0lBQUg7O3FCQUNkLFlBQUEsR0FBYyxTQUFDLFNBQUQ7YUFBZSxJQUFDLENBQUEsYUFBYSxDQUFDLFlBQWYsQ0FBNEIsU0FBNUI7SUFBZjs7cUJBRWQsZUFBQSxHQUFpQixTQUFBO2FBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxlQUFmLENBQUE7SUFBSDs7cUJBQ2pCLGVBQUEsR0FBaUIsU0FBQyxZQUFEO2FBQWtCLElBQUMsQ0FBQSxhQUFhLENBQUMsZUFBZixDQUErQixZQUEvQjtJQUFsQjs7cUJBRWpCLGFBQUEsR0FBZSxTQUFBO2FBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxhQUFmLENBQUE7SUFBSDs7cUJBQ2YsYUFBQSxHQUFlLFNBQUMsVUFBRDthQUFnQixJQUFDLENBQUEsYUFBYSxDQUFDLGFBQWYsQ0FBNkIsVUFBN0I7SUFBaEI7O3FCQUVmLGNBQUEsR0FBZ0IsU0FBQTthQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsY0FBZixDQUFBO0lBQUg7O3FCQUNoQixjQUFBLEdBQWdCLFNBQUMsV0FBRDthQUFpQixJQUFDLENBQUEsYUFBYSxDQUFDLGNBQWYsQ0FBOEIsV0FBOUI7SUFBakI7O3FCQUVoQixlQUFBLEdBQWlCLFNBQUE7YUFBRyxJQUFDLENBQUEsYUFBYSxDQUFDLGVBQWYsQ0FBQTtJQUFIOztxQkFDakIsY0FBQSxHQUFnQixTQUFDLFdBQUQ7YUFBaUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxjQUFmLENBQThCLFdBQTlCO0lBQWpCOztxQkFFaEIsa0JBQUEsR0FBb0IsU0FBQTthQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsa0JBQWYsQ0FBQTtJQUFIOztxQkFFcEIseUJBQUEsR0FBMkIsU0FBQyxRQUFELEVBQVcsTUFBWDthQUFzQixJQUFDLENBQUEsYUFBYSxDQUFDLHlCQUFmLENBQXlDLFFBQXpDLEVBQW1ELE1BQW5EO0lBQXRCOztxQkFFM0Isa0NBQUEsR0FBb0MsU0FBQyxTQUFEO2FBQWUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxrQ0FBZixDQUFrRCxTQUFsRDtJQUFmOztxQkFFcEMsOEJBQUEsR0FBZ0MsU0FBQyxjQUFEO2FBQW9CLElBQUMsQ0FBQSxhQUFhLENBQUMsOEJBQWYsQ0FBOEMsY0FBOUM7SUFBcEI7O3FCQUVoQyw4QkFBQSxHQUFnQyxTQUFDLGNBQUQ7YUFBb0IsSUFBQyxDQUFBLGFBQWEsQ0FBQyw4QkFBZixDQUE4QyxjQUE5QztJQUFwQjs7cUJBRWhDLDhCQUFBLEdBQWdDLFNBQUMsYUFBRDthQUFtQixJQUFDLENBQUEsYUFBYSxDQUFDLDhCQUFmLENBQThDLGFBQTlDO0lBQW5COztxQkFFaEMsdUJBQUEsR0FBeUIsU0FBQyxXQUFEO2FBQWlCLElBQUMsQ0FBQSxhQUFhLENBQUMsdUJBQWYsQ0FBdUMsV0FBdkM7SUFBakI7O3FCQUV6QixtQkFBQSxHQUFxQixTQUFDLFdBQUQ7YUFBaUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxtQkFBZixDQUFtQyxXQUFuQztJQUFqQjs7cUJBRXJCLHNCQUFBLEdBQXdCLFNBQUMsY0FBRDthQUFvQixJQUFDLENBQUEsYUFBYSxDQUFDLHNCQUFmLENBQXNDLGNBQXRDO0lBQXBCOztxQkFFeEIsc0JBQUEsR0FBd0IsU0FBQyxjQUFEO2FBQW9CLElBQUMsQ0FBQSxhQUFhLENBQUMsc0JBQWYsQ0FBc0MsY0FBdEM7SUFBcEI7O3FCQUd4QixRQUFBLEdBQVUsU0FBQTtNQUNSLFNBQUEsQ0FBVSxpQ0FBVjthQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7SUFGUTs7OztLQTd0RFM7QUF0SXJCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuU2VyaWFsaXphYmxlID0gcmVxdWlyZSAnc2VyaWFsaXphYmxlJ1xuRGVsZWdhdG9yID0gcmVxdWlyZSAnZGVsZWdhdG8nXG57ZGVwcmVjYXRlfSA9IHJlcXVpcmUgJ2dyaW0nXG57TW9kZWx9ID0gcmVxdWlyZSAndGhlb3Jpc3QnXG57UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUgJ3RleHQtYnVmZmVyJ1xuTGFuZ3VhZ2VNb2RlID0gcmVxdWlyZSAnLi9sYW5ndWFnZS1tb2RlJ1xuRGlzcGxheUJ1ZmZlciA9IHJlcXVpcmUgJy4vZGlzcGxheS1idWZmZXInXG5DdXJzb3IgPSByZXF1aXJlICcuL2N1cnNvcidcblxuU2VsZWN0aW9uID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24nXG5UZXh0TWF0ZVNjb3BlU2VsZWN0b3IgPSByZXF1aXJlKCdmaXJzdC1tYXRlJykuU2NvcGVTZWxlY3RvclxuXG4jIFB1YmxpYzogVGhpcyBjbGFzcyByZXByZXNlbnRzIGFsbCBlc3NlbnRpYWwgZWRpdGluZyBzdGF0ZSBmb3IgYSBzaW5nbGVcbiMge1RleHRCdWZmZXJ9LCBpbmNsdWRpbmcgY3Vyc29yIGFuZCBzZWxlY3Rpb24gcG9zaXRpb25zLCBmb2xkcywgYW5kIHNvZnQgd3JhcHMuXG4jIElmIHlvdSdyZSBtYW5pcHVsYXRpbmcgdGhlIHN0YXRlIG9mIGFuIGVkaXRvciwgdXNlIHRoaXMgY2xhc3MuIElmIHlvdSdyZVxuIyBpbnRlcmVzdGVkIGluIHRoZSB2aXN1YWwgYXBwZWFyYW5jZSBvZiBlZGl0b3JzLCB1c2Uge0VkaXRvclZpZXd9IGluc3RlYWQuXG4jXG4jIEEgc2luZ2xlIHtUZXh0QnVmZmVyfSBjYW4gYmVsb25nIHRvIG11bHRpcGxlIGVkaXRvcnMuIEZvciBleGFtcGxlLCBpZiB0aGVcbiMgc2FtZSBmaWxlIGlzIG9wZW4gaW4gdHdvIGRpZmZlcmVudCBwYW5lcywgQXRvbSBjcmVhdGVzIGEgc2VwYXJhdGUgZWRpdG9yIGZvclxuIyBlYWNoIHBhbmUuIElmIHRoZSBidWZmZXIgaXMgbWFuaXB1bGF0ZWQgdGhlIGNoYW5nZXMgYXJlIHJlZmxlY3RlZCBpbiBib3RoXG4jIGVkaXRvcnMsIGJ1dCBlYWNoIG1haW50YWlucyBpdHMgb3duIGN1cnNvciBwb3NpdGlvbiwgZm9sZGVkIGxpbmVzLCBldGMuXG4jXG4jICMjIEFjY2Vzc2luZyBFZGl0b3IgSW5zdGFuY2VzXG4jXG4jIFRoZSBlYXNpZXN0IHdheSB0byBnZXQgaG9sZCBvZiBgRWRpdG9yYCBvYmplY3RzIGlzIGJ5IHJlZ2lzdGVyaW5nIGEgY2FsbGJhY2tcbiMgd2l0aCBgOjplYWNoRWRpdG9yYCBvbiB0aGUgYGF0b20ud29ya3NwYWNlYCBnbG9iYWwuIFlvdXIgY2FsbGJhY2sgd2lsbCB0aGVuXG4jIGJlIGNhbGxlZCB3aXRoIGFsbCBjdXJyZW50IGVkaXRvciBpbnN0YW5jZXMgYW5kIGFsc28gd2hlbiBhbnkgZWRpdG9yIGlzXG4jIGNyZWF0ZWQgaW4gdGhlIGZ1dHVyZS5cbiNcbiMgYGBgY29mZmVlc2NyaXB0XG4jICAgYXRvbS53b3Jrc3BhY2UuZWFjaEVkaXRvciAoZWRpdG9yKSAtPlxuIyAgICAgZWRpdG9yLmluc2VydFRleHQoJ0hlbGxvIFdvcmxkJylcbiMgYGBgXG4jXG4jICMjIEJ1ZmZlciB2cy4gU2NyZWVuIENvb3JkaW5hdGVzXG4jXG4jIEJlY2F1c2UgZWRpdG9ycyBzdXBwb3J0IGZvbGRzIGFuZCBzb2Z0LXdyYXBwaW5nLCB0aGUgbGluZXMgb24gc2NyZWVuIGRvbid0XG4jIGFsd2F5cyBtYXRjaCB0aGUgbGluZXMgaW4gdGhlIGJ1ZmZlci4gRm9yIGV4YW1wbGUsIGEgbG9uZyBsaW5lIHRoYXQgc29mdCB3cmFwc1xuIyB0d2ljZSByZW5kZXJzIGFzIHRocmVlIGxpbmVzIG9uIHNjcmVlbiwgYnV0IG9ubHkgcmVwcmVzZW50cyBvbmUgbGluZSBpbiB0aGVcbiMgYnVmZmVyLiBTaW1pbGFybHksIGlmIHJvd3MgNS0xMCBhcmUgZm9sZGVkLCB0aGVuIHJvdyA2IG9uIHNjcmVlbiBjb3JyZXNwb25kc1xuIyB0byByb3cgMTEgaW4gdGhlIGJ1ZmZlci5cbiNcbiMgWW91ciBjaG9pY2Ugb2YgY29vcmRpbmF0ZXMgc3lzdGVtcyB3aWxsIGRlcGVuZCBvbiB3aGF0IHlvdSdyZSB0cnlpbmcgdG9cbiMgYWNoaWV2ZS4gRm9yIGV4YW1wbGUsIGlmIHlvdSdyZSB3cml0aW5nIGEgY29tbWFuZCB0aGF0IGp1bXBzIHRoZSBjdXJzb3IgdXAgb3JcbiMgZG93biBieSAxMCBsaW5lcywgeW91J2xsIHdhbnQgdG8gdXNlIHNjcmVlbiBjb29yZGluYXRlcyBiZWNhdXNlIHRoZSB1c2VyXG4jIHByb2JhYmx5IHdhbnRzIHRvIHNraXAgbGluZXMgKm9uIHNjcmVlbiouIEhvd2V2ZXIsIGlmIHlvdSdyZSB3cml0aW5nIGEgcGFja2FnZVxuIyB0aGF0IGp1bXBzIGJldHdlZW4gbWV0aG9kIGRlZmluaXRpb25zLCB5b3UnbGwgd2FudCB0byB3b3JrIGluIGJ1ZmZlclxuIyBjb29yZGluYXRlcy5cbiNcbiMgKipXaGVuIGluIGRvdWJ0LCBqdXN0IGRlZmF1bHQgdG8gYnVmZmVyIGNvb3JkaW5hdGVzKiosIHRoZW4gZXhwZXJpbWVudCB3aXRoXG4jIHNvZnQgd3JhcHMgYW5kIGZvbGRzIHRvIGVuc3VyZSB5b3VyIGNvZGUgaW50ZXJhY3RzIHdpdGggdGhlbSBjb3JyZWN0bHkuXG4jXG4jICMjIENvbW1vbiBUYXNrc1xuI1xuIyBUaGlzIGlzIGEgc3Vic2V0IG9mIG1ldGhvZHMgb24gdGhpcyBjbGFzcy4gUmVmZXIgdG8gdGhlIGNvbXBsZXRlIHN1bW1hcnkgZm9yXG4jIGl0cyBmdWxsIGNhcGFiaWxpdGllcy5cbiNcbiMgIyMjIEN1cnNvcnNcbiMgLSB7OjpzZXRDdXJzb3JCdWZmZXJQb3NpdGlvbn1cbiMgLSB7OjpzZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbn1cbiMgLSB7Ojptb3ZlQ3Vyc29yVXB9XG4jIC0gezo6bW92ZUN1cnNvckRvd259XG4jIC0gezo6bW92ZUN1cnNvckxlZnR9XG4jIC0gezo6bW92ZUN1cnNvclJpZ2h0fVxuIyAtIHs6Om1vdmVDdXJzb3JUb0JlZ2lubmluZ09mV29yZH1cbiMgLSB7Ojptb3ZlQ3Vyc29yVG9FbmRPZldvcmR9XG4jIC0gezo6bW92ZUN1cnNvclRvUHJldmlvdXNXb3JkQm91bmRhcnl9XG4jIC0gezo6bW92ZUN1cnNvclRvTmV4dFdvcmRCb3VuZGFyeX1cbiMgLSB7Ojptb3ZlQ3Vyc29yVG9CZWdpbm5pbmdPZk5leHRXb3JkfVxuIyAtIHs6Om1vdmVDdXJzb3JUb0JlZ2lubmluZ09mTGluZX1cbiMgLSB7Ojptb3ZlQ3Vyc29yVG9FbmRPZkxpbmV9XG4jIC0gezo6bW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJPZkxpbmV9XG4jIC0gezo6bW92ZUN1cnNvclRvVG9wfVxuIyAtIHs6Om1vdmVDdXJzb3JUb0JvdHRvbX1cbiNcbiMgIyMjIFNlbGVjdGlvbnNcbiMgLSB7OjpnZXRTZWxlY3RlZEJ1ZmZlclJhbmdlfVxuIyAtIHs6OmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzfVxuIyAtIHs6OnNldFNlbGVjdGVkQnVmZmVyUmFuZ2V9XG4jIC0gezo6c2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXN9XG4jIC0gezo6c2VsZWN0VXB9XG4jIC0gezo6c2VsZWN0RG93bn1cbiMgLSB7OjpzZWxlY3RMZWZ0fVxuIyAtIHs6OnNlbGVjdFJpZ2h0fVxuIyAtIHs6OnNlbGVjdFRvQmVnaW5uaW5nT2ZXb3JkfVxuIyAtIHs6OnNlbGVjdFRvRW5kT2ZXb3JkfVxuIyAtIHs6OnNlbGVjdFRvUHJldmlvdXNXb3JkQm91bmRhcnl9XG4jIC0gezo6c2VsZWN0VG9OZXh0V29yZEJvdW5kYXJ5fVxuIyAtIHs6OnNlbGVjdFdvcmR9XG4jIC0gezo6c2VsZWN0VG9CZWdpbm5pbmdPZkxpbmV9XG4jIC0gezo6c2VsZWN0VG9FbmRPZkxpbmV9XG4jIC0gezo6c2VsZWN0VG9GaXJzdENoYXJhY3Rlck9mTGluZX1cbiMgLSB7OjpzZWxlY3RUb1RvcH1cbiMgLSB7OjpzZWxlY3RUb0JvdHRvbX1cbiMgLSB7OjpzZWxlY3RBbGx9XG4jIC0gezo6YWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2V9XG4jIC0gezo6YWRkU2VsZWN0aW9uQWJvdmV9XG4jIC0gezo6YWRkU2VsZWN0aW9uQmVsb3d9XG4jIC0gezo6c3BsaXRTZWxlY3Rpb25zSW50b0xpbmVzfVxuI1xuIyAjIyMgTWFuaXB1bGF0aW5nIFRleHRcbiMgLSB7OjpnZXRUZXh0fVxuIyAtIHs6OmdldFNlbGVjdGVkVGV4dH1cbiMgLSB7OjpzZXRUZXh0fVxuIyAtIHs6OnNldFRleHRJbkJ1ZmZlclJhbmdlfVxuIyAtIHs6Omluc2VydFRleHR9XG4jIC0gezo6aW5zZXJ0TmV3bGluZX1cbiMgLSB7OjppbnNlcnROZXdsaW5lQWJvdmV9XG4jIC0gezo6aW5zZXJ0TmV3bGluZUJlbG93fVxuIyAtIHs6OmJhY2tzcGFjZX1cbiMgLSB7OjpiYWNrc3BhY2VUb0JlZ2lubmluZ09mV29yZH1cbiMgLSB7OjpiYWNrc3BhY2VUb0JlZ2lubmluZ09mTGluZX1cbiMgLSB7OjpkZWxldGV9XG4jIC0gezo6ZGVsZXRlVG9FbmRPZldvcmR9XG4jIC0gezo6ZGVsZXRlTGluZX1cbiMgLSB7OjpjdXRTZWxlY3RlZFRleHR9XG4jIC0gezo6Y3V0VG9FbmRPZkxpbmV9XG4jIC0gezo6Y29weVNlbGVjdGVkVGV4dH1cbiMgLSB7OjpwYXN0ZVRleHR9XG4jXG4jICMjIyBVbmRvLCBSZWRvLCBhbmQgVHJhbnNhY3Rpb25zXG4jIC0gezo6dW5kb31cbiMgLSB7OjpyZWRvfVxuIyAtIHs6OnRyYW5zYWN0fVxuIyAtIHs6OmFib3J0VHJhbnNhY3Rpb259XG4jXG4jICMjIyBNYXJrZXJzXG4jIC0gezo6bWFya0J1ZmZlclJhbmdlfVxuIyAtIHs6Om1hcmtTY3JlZW5SYW5nZX1cbiMgLSB7OjpnZXRNYXJrZXJ9XG4jIC0gezo6ZmluZE1hcmtlcnN9XG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBFZGl0b3IgZXh0ZW5kcyBNb2RlbFxuICBTZXJpYWxpemFibGUuaW5jbHVkZUludG8odGhpcylcbiAgYXRvbS5kZXNlcmlhbGl6ZXJzLmFkZCh0aGlzKVxuICBEZWxlZ2F0b3IuaW5jbHVkZUludG8odGhpcylcblxuICBkZXNlcmlhbGl6aW5nOiBmYWxzZVxuICBjYWxsRGlzcGxheUJ1ZmZlckNyZWF0ZWRIb29rOiBmYWxzZVxuICByZWdpc3RlckVkaXRvcjogZmFsc2VcbiAgYnVmZmVyOiBudWxsXG4gIGxhbmd1YWdlTW9kZTogbnVsbFxuICBjdXJzb3JzOiBudWxsXG4gIHNlbGVjdGlvbnM6IG51bGxcbiAgc3VwcHJlc3NTZWxlY3Rpb25NZXJnaW5nOiBmYWxzZVxuXG4gIEBkZWxlZ2F0ZXNNZXRob2RzICdzdWdnZXN0ZWRJbmRlbnRGb3JCdWZmZXJSb3cnLCAnYXV0b0luZGVudEJ1ZmZlclJvdycsICdhdXRvSW5kZW50QnVmZmVyUm93cycsXG4gICAgJ2F1dG9EZWNyZWFzZUluZGVudEZvckJ1ZmZlclJvdycsICd0b2dnbGVMaW5lQ29tbWVudEZvckJ1ZmZlclJvdycsICd0b2dnbGVMaW5lQ29tbWVudHNGb3JCdWZmZXJSb3dzJyxcbiAgICB0b1Byb3BlcnR5OiAnbGFuZ3VhZ2VNb2RlJ1xuXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0aWVzICckbGluZUhlaWdodCcsICckZGVmYXVsdENoYXJXaWR0aCcsICckaGVpZ2h0JywgJyR3aWR0aCcsXG4gICAgJyRzY3JvbGxUb3AnLCAnJHNjcm9sbExlZnQnLCAnbWFuYWdlU2Nyb2xsUG9zaXRpb24nLCB0b1Byb3BlcnR5OiAnZGlzcGxheUJ1ZmZlcidcblxuICBjb25zdHJ1Y3RvcjogKHtAc29mdFRhYnMsIGluaXRpYWxMaW5lLCBpbml0aWFsQ29sdW1uLCB0YWJMZW5ndGgsIHNvZnRXcmFwLCBAZGlzcGxheUJ1ZmZlciwgYnVmZmVyLCByZWdpc3RlckVkaXRvciwgc3VwcHJlc3NDdXJzb3JDcmVhdGlvbn0pIC0+XG4gICAgc3VwZXJcblxuICAgIEBjdXJzb3JzID0gW11cbiAgICBAc2VsZWN0aW9ucyA9IFtdXG5cbiAgICBAZGlzcGxheUJ1ZmZlciA/PSBuZXcgRGlzcGxheUJ1ZmZlcih7YnVmZmVyLCB0YWJMZW5ndGgsIHNvZnRXcmFwfSlcbiAgICBAYnVmZmVyID0gQGRpc3BsYXlCdWZmZXIuYnVmZmVyXG4gICAgQHNvZnRUYWJzID0gQGJ1ZmZlci51c2VzU29mdFRhYnMoKSA/IEBzb2Z0VGFicyA/IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNvZnRUYWJzJykgPyB0cnVlXG5cbiAgICBmb3IgbWFya2VyIGluIEBmaW5kTWFya2VycyhAZ2V0U2VsZWN0aW9uTWFya2VyQXR0cmlidXRlcygpKVxuICAgICAgbWFya2VyLnNldEF0dHJpYnV0ZXMocHJlc2VydmVGb2xkczogdHJ1ZSlcbiAgICAgIEBhZGRTZWxlY3Rpb24obWFya2VyKVxuXG4gICAgQHN1YnNjcmliZVRvQnVmZmVyKClcbiAgICBAc3Vic2NyaWJlVG9EaXNwbGF5QnVmZmVyKClcblxuICAgIGlmIEBnZXRDdXJzb3JzKCkubGVuZ3RoIGlzIDAgYW5kIG5vdCBzdXBwcmVzc0N1cnNvckNyZWF0aW9uXG4gICAgICBpbml0aWFsTGluZSA9IE1hdGgubWF4KHBhcnNlSW50KGluaXRpYWxMaW5lKSBvciAwLCAwKVxuICAgICAgaW5pdGlhbENvbHVtbiA9IE1hdGgubWF4KHBhcnNlSW50KGluaXRpYWxDb2x1bW4pIG9yIDAsIDApXG4gICAgICBAYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihbaW5pdGlhbExpbmUsIGluaXRpYWxDb2x1bW5dKVxuXG4gICAgQGxhbmd1YWdlTW9kZSA9IG5ldyBMYW5ndWFnZU1vZGUodGhpcylcblxuICAgIEBzdWJzY3JpYmUgQCRzY3JvbGxUb3AsIChzY3JvbGxUb3ApID0+IEBlbWl0ICdzY3JvbGwtdG9wLWNoYW5nZWQnLCBzY3JvbGxUb3BcbiAgICBAc3Vic2NyaWJlIEAkc2Nyb2xsTGVmdCwgKHNjcm9sbExlZnQpID0+IEBlbWl0ICdzY3JvbGwtbGVmdC1jaGFuZ2VkJywgc2Nyb2xsTGVmdFxuXG4gICAgYXRvbS53b3Jrc3BhY2U/LmVkaXRvckFkZGVkKHRoaXMpIGlmIHJlZ2lzdGVyRWRpdG9yXG5cbiAgc2VyaWFsaXplUGFyYW1zOiAtPlxuICAgIGlkOiBAaWRcbiAgICBzb2Z0VGFiczogQHNvZnRUYWJzXG4gICAgc2Nyb2xsVG9wOiBAc2Nyb2xsVG9wXG4gICAgc2Nyb2xsTGVmdDogQHNjcm9sbExlZnRcbiAgICBkaXNwbGF5QnVmZmVyOiBAZGlzcGxheUJ1ZmZlci5zZXJpYWxpemUoKVxuXG4gIGRlc2VyaWFsaXplUGFyYW1zOiAocGFyYW1zKSAtPlxuICAgIHBhcmFtcy5kaXNwbGF5QnVmZmVyID0gRGlzcGxheUJ1ZmZlci5kZXNlcmlhbGl6ZShwYXJhbXMuZGlzcGxheUJ1ZmZlcilcbiAgICBwYXJhbXMucmVnaXN0ZXJFZGl0b3IgPSB0cnVlXG4gICAgcGFyYW1zXG5cbiAgc3Vic2NyaWJlVG9CdWZmZXI6IC0+XG4gICAgQGJ1ZmZlci5yZXRhaW4oKVxuICAgIEBzdWJzY3JpYmUgQGJ1ZmZlciwgXCJwYXRoLWNoYW5nZWRcIiwgPT5cbiAgICAgIHVubGVzcyBhdG9tLnByb2plY3QuZ2V0UGF0aCgpP1xuICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aChwYXRoLmRpcm5hbWUoQGdldFBhdGgoKSkpXG4gICAgICBAZW1pdCBcInRpdGxlLWNoYW5nZWRcIlxuICAgICAgQGVtaXQgXCJwYXRoLWNoYW5nZWRcIlxuICAgIEBzdWJzY3JpYmUgQGJ1ZmZlciwgXCJjb250ZW50cy1tb2RpZmllZFwiLCA9PiBAZW1pdCBcImNvbnRlbnRzLW1vZGlmaWVkXCJcbiAgICBAc3Vic2NyaWJlIEBidWZmZXIsIFwiY29udGVudHMtY29uZmxpY3RlZFwiLCA9PiBAZW1pdCBcImNvbnRlbnRzLWNvbmZsaWN0ZWRcIlxuICAgIEBzdWJzY3JpYmUgQGJ1ZmZlciwgXCJtb2RpZmllZC1zdGF0dXMtY2hhbmdlZFwiLCA9PiBAZW1pdCBcIm1vZGlmaWVkLXN0YXR1cy1jaGFuZ2VkXCJcbiAgICBAc3Vic2NyaWJlIEBidWZmZXIsIFwiZGVzdHJveWVkXCIsID0+IEBkZXN0cm95KClcbiAgICBAcHJlc2VydmVDdXJzb3JQb3NpdGlvbk9uQnVmZmVyUmVsb2FkKClcblxuICBzdWJzY3JpYmVUb0Rpc3BsYXlCdWZmZXI6IC0+XG4gICAgQHN1YnNjcmliZSBAZGlzcGxheUJ1ZmZlciwgJ21hcmtlci1jcmVhdGVkJywgQGhhbmRsZU1hcmtlckNyZWF0ZWRcbiAgICBAc3Vic2NyaWJlIEBkaXNwbGF5QnVmZmVyLCBcImNoYW5nZWRcIiwgKGUpID0+IEBlbWl0ICdzY3JlZW4tbGluZXMtY2hhbmdlZCcsIGVcbiAgICBAc3Vic2NyaWJlIEBkaXNwbGF5QnVmZmVyLCBcIm1hcmtlcnMtdXBkYXRlZFwiLCA9PiBAbWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICBAc3Vic2NyaWJlIEBkaXNwbGF5QnVmZmVyLCAnZ3JhbW1hci1jaGFuZ2VkJywgPT4gQGhhbmRsZUdyYW1tYXJDaGFuZ2UoKVxuICAgIEBzdWJzY3JpYmUgQGRpc3BsYXlCdWZmZXIsICdzb2Z0LXdyYXAtY2hhbmdlZCcsIChhcmdzLi4uKSA9PiBAZW1pdCAnc29mdC13cmFwLWNoYW5nZWQnLCBhcmdzLi4uXG5cbiAgZ2V0Vmlld0NsYXNzOiAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnY29yZS51c2VSZWFjdEVkaXRvcicpXG4gICAgICByZXF1aXJlICcuL3JlYWN0LWVkaXRvci12aWV3J1xuICAgIGVsc2VcbiAgICAgIHJlcXVpcmUgJy4vZWRpdG9yLXZpZXcnXG5cbiAgZGVzdHJveWVkOiAtPlxuICAgIEB1bnN1YnNjcmliZSgpXG4gICAgc2VsZWN0aW9uLmRlc3Ryb3koKSBmb3Igc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKClcbiAgICBAYnVmZmVyLnJlbGVhc2UoKVxuICAgIEBkaXNwbGF5QnVmZmVyLmRlc3Ryb3koKVxuICAgIEBsYW5ndWFnZU1vZGUuZGVzdHJveSgpXG5cbiAgIyBDcmVhdGUgYW4ge0VkaXRvcn0gd2l0aCBpdHMgaW5pdGlhbCBzdGF0ZSBiYXNlZCBvbiB0aGlzIG9iamVjdFxuICBjb3B5OiAtPlxuICAgIHRhYkxlbmd0aCA9IEBnZXRUYWJMZW5ndGgoKVxuICAgIGRpc3BsYXlCdWZmZXIgPSBAZGlzcGxheUJ1ZmZlci5jb3B5KClcbiAgICBzb2Z0VGFicyA9IEBnZXRTb2Z0VGFicygpXG4gICAgbmV3RWRpdG9yID0gbmV3IEVkaXRvcih7QGJ1ZmZlciwgZGlzcGxheUJ1ZmZlciwgdGFiTGVuZ3RoLCBzb2Z0VGFicywgc3VwcHJlc3NDdXJzb3JDcmVhdGlvbjogdHJ1ZSwgcmVnaXN0ZXJFZGl0b3I6IHRydWV9KVxuICAgIGZvciBtYXJrZXIgaW4gQGZpbmRNYXJrZXJzKGVkaXRvcklkOiBAaWQpXG4gICAgICBtYXJrZXIuY29weShlZGl0b3JJZDogbmV3RWRpdG9yLmlkLCBwcmVzZXJ2ZUZvbGRzOiB0cnVlKVxuICAgIG5ld0VkaXRvclxuXG4gICMgUHVibGljOiBHZXQgdGhlIHRpdGxlIHRoZSBlZGl0b3IncyB0aXRsZSBmb3IgZGlzcGxheSBpbiBvdGhlciBwYXJ0cyBvZiB0aGVcbiAgIyBVSSBzdWNoIGFzIHRoZSB0YWJzLlxuICAjXG4gICMgSWYgdGhlIGVkaXRvcidzIGJ1ZmZlciBpcyBzYXZlZCwgaXRzIHRpdGxlIGlzIHRoZSBmaWxlIG5hbWUuIElmIGl0IGlzXG4gICMgdW5zYXZlZCwgaXRzIHRpdGxlIGlzIFwidW50aXRsZWRcIi5cbiAgI1xuICAjIFJldHVybnMgYSB7U3RyaW5nfS5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgaWYgc2Vzc2lvblBhdGggPSBAZ2V0UGF0aCgpXG4gICAgICBwYXRoLmJhc2VuYW1lKHNlc3Npb25QYXRoKVxuICAgIGVsc2VcbiAgICAgICd1bnRpdGxlZCdcblxuICAjIFB1YmxpYzogR2V0IHRoZSBlZGl0b3IncyBsb25nIHRpdGxlIGZvciBkaXNwbGF5IGluIG90aGVyIHBhcnRzIG9mIHRoZSBVSVxuICAjIHN1Y2ggYXMgdGhlIHdpbmRvdyB0aXRsZS5cbiAgI1xuICAjIElmIHRoZSBlZGl0b3IncyBidWZmZXIgaXMgc2F2ZWQsIGl0cyBsb25nIHRpdGxlIGlzIGZvcm1hdHRlZCBhc1xuICAjIFwiPGZpbGVuYW1lPiAtIDxkaXJlY3Rvcnk+XCIuIElmIGl0IGlzIHVuc2F2ZWQsIGl0cyB0aXRsZSBpcyBcInVudGl0bGVkXCJcbiAgI1xuICAjIFJldHVybnMgYSB7U3RyaW5nfS5cbiAgZ2V0TG9uZ1RpdGxlOiAtPlxuICAgIGlmIHNlc3Npb25QYXRoID0gQGdldFBhdGgoKVxuICAgICAgZmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNlc3Npb25QYXRoKVxuICAgICAgZGlyZWN0b3J5ID0gcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUoc2Vzc2lvblBhdGgpKVxuICAgICAgXCIje2ZpbGVOYW1lfSAtICN7ZGlyZWN0b3J5fVwiXG4gICAgZWxzZVxuICAgICAgJ3VudGl0bGVkJ1xuXG4gICMgQ29udHJvbHMgdmlzaWJsaXR5IGJhc2VkIG9uIHRoZSBnaXZlbiB7Qm9vbGVhbn0uXG4gIHNldFZpc2libGU6ICh2aXNpYmxlKSAtPiBAZGlzcGxheUJ1ZmZlci5zZXRWaXNpYmxlKHZpc2libGUpXG5cbiAgIyBTZXQgdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgY2FuIGJlIGRpc3BsYXllZCBob3Jpem9udGFsbHkgaW4gdGhlXG4gICMgZWRpdG9yLlxuICAjXG4gICMgZWRpdG9yV2lkdGhJbkNoYXJzIC0gQSB7TnVtYmVyfSByZXByZXNlbnRpbmcgdGhlIHdpZHRoIG9mIHRoZSB7RWRpdG9yVmlld31cbiAgIyBpbiBjaGFyYWN0ZXJzLlxuICBzZXRFZGl0b3JXaWR0aEluQ2hhcnM6IChlZGl0b3JXaWR0aEluQ2hhcnMpIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIuc2V0RWRpdG9yV2lkdGhJbkNoYXJzKGVkaXRvcldpZHRoSW5DaGFycylcblxuICAjIFB1YmxpYzogU2V0cyB0aGUgY29sdW1uIGF0IHdoaWNoIGNvbHVtc24gd2lsbCBzb2Z0IHdyYXBcbiAgZ2V0U29mdFdyYXBDb2x1bW46IC0+IEBkaXNwbGF5QnVmZmVyLmdldFNvZnRXcmFwQ29sdW1uKClcblxuICAjIFB1YmxpYzogUmV0dXJucyBhIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgc29mdFRhYnMgYXJlIGVuYWJsZWQgZm9yIHRoaXNcbiAgIyBlZGl0b3IuXG4gIGdldFNvZnRUYWJzOiAtPiBAc29mdFRhYnNcblxuICAjIFB1YmxpYzogRW5hYmxlIG9yIGRpc2FibGUgc29mdCB0YWJzIGZvciB0aGlzIGVkaXRvci5cbiAgI1xuICAjIHNvZnRUYWJzIC0gQSB7Qm9vbGVhbn1cbiAgc2V0U29mdFRhYnM6IChAc29mdFRhYnMpIC0+IEBzb2Z0VGFic1xuXG4gICMgUHVibGljOiBUb2dnbGUgc29mdCB0YWJzIGZvciB0aGlzIGVkaXRvclxuICB0b2dnbGVTb2Z0VGFiczogLT4gQHNldFNvZnRUYWJzKG5vdCBAZ2V0U29mdFRhYnMoKSlcblxuICAjIFB1YmxpYzogR2V0IHdoZXRoZXIgc29mdCB3cmFwIGlzIGVuYWJsZWQgZm9yIHRoaXMgZWRpdG9yLlxuICBnZXRTb2Z0V3JhcDogLT4gQGRpc3BsYXlCdWZmZXIuZ2V0U29mdFdyYXAoKVxuXG4gICMgUHVibGljOiBFbmFibGUgb3IgZGlzYWJsZSBzb2Z0IHdyYXAgZm9yIHRoaXMgZWRpdG9yLlxuICAjXG4gICMgc29mdFdyYXAgLSBBIHtCb29sZWFufVxuICBzZXRTb2Z0V3JhcDogKHNvZnRXcmFwKSAtPiBAZGlzcGxheUJ1ZmZlci5zZXRTb2Z0V3JhcChzb2Z0V3JhcClcblxuICAjIFB1YmxpYzogVG9nZ2xlIHNvZnQgd3JhcCBmb3IgdGhpcyBlZGl0b3JcbiAgdG9nZ2xlU29mdFdyYXA6IC0+IEBzZXRTb2Z0V3JhcChub3QgQGdldFNvZnRXcmFwKCkpXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgdGV4dCByZXByZXNlbnRpbmcgYSBzaW5nbGUgbGV2ZWwgb2YgaW5kZW50LlxuICAjXG4gICMgSWYgc29mdCB0YWJzIGFyZSBlbmFibGVkLCB0aGUgdGV4dCBpcyBjb21wb3NlZCBvZiBOIHNwYWNlcywgd2hlcmUgTiBpcyB0aGVcbiAgIyB0YWIgbGVuZ3RoLiBPdGhlcndpc2UgdGhlIHRleHQgaXMgYSB0YWIgY2hhcmFjdGVyIChgXFx0YCkuXG4gICNcbiAgIyBSZXR1cm5zIGEge1N0cmluZ30uXG4gIGdldFRhYlRleHQ6IC0+IEBidWlsZEluZGVudFN0cmluZygxKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIG9uLXNjcmVlbiBsZW5ndGggb2YgdGFiIGNoYXJhY3RlcnMuXG4gICNcbiAgIyBSZXR1cm5zIGEge051bWJlcn0uXG4gIGdldFRhYkxlbmd0aDogLT4gQGRpc3BsYXlCdWZmZXIuZ2V0VGFiTGVuZ3RoKClcblxuICAjIFB1YmxpYzogU2V0IHRoZSBvbi1zY3JlZW4gbGVuZ3RoIG9mIHRhYiBjaGFyYWN0ZXJzLlxuICBzZXRUYWJMZW5ndGg6ICh0YWJMZW5ndGgpIC0+IEBkaXNwbGF5QnVmZmVyLnNldFRhYkxlbmd0aCh0YWJMZW5ndGgpXG5cbiAgIyBQdWJsaWM6IENsaXAgdGhlIGdpdmVuIHtQb2ludH0gdG8gYSB2YWxpZCBwb3NpdGlvbiBpbiB0aGUgYnVmZmVyLlxuICAjXG4gICMgSWYgdGhlIGdpdmVuIHtQb2ludH0gZGVzY3JpYmVzIGEgcG9zaXRpb24gdGhhdCBpcyBhY3R1YWxseSByZWFjaGFibGUgYnkgdGhlXG4gICMgY3Vyc29yIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbnRlbnRzIG9mIHRoZSBidWZmZXIsIGl0IGlzIHJldHVybmVkXG4gICMgdW5jaGFuZ2VkLiBJZiB0aGUge1BvaW50fSBkb2VzIG5vdCBkZXNjcmliZSBhIHZhbGlkIHBvc2l0aW9uLCB0aGUgY2xvc2VzdFxuICAjIHZhbGlkIHBvc2l0aW9uIGlzIHJldHVybmVkIGluc3RlYWQuXG4gICNcbiAgIyBGb3IgZXhhbXBsZTpcbiAgIyAgICogYFstMSwgLTFdYCBpcyBjb252ZXJ0ZWQgdG8gYFswLCAwXWAuXG4gICMgICAqIElmIHRoZSBsaW5lIGF0IHJvdyAyIGlzIDEwIGxvbmcsIGBbMiwgSW5maW5pdHldYCBpcyBjb252ZXJ0ZWQgdG9cbiAgIyAgICAgYFsyLCAxMF1gLlxuICAjXG4gICMgYnVmZmVyUG9zaXRpb24gLSBUaGUge1BvaW50fSByZXByZXNlbnRpbmcgdGhlIHBvc2l0aW9uIHRvIGNsaXAuXG4gICNcbiAgIyBSZXR1cm5zIGEge1BvaW50fS5cbiAgY2xpcEJ1ZmZlclBvc2l0aW9uOiAoYnVmZmVyUG9zaXRpb24pIC0+IEBidWZmZXIuY2xpcFBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuXG4gICMgUHVibGljOiBDbGlwIHRoZSBzdGFydCBhbmQgZW5kIG9mIHRoZSBnaXZlbiByYW5nZSB0byB2YWxpZCBwb3NpdGlvbnMgaW4gdGhlXG4gICMgYnVmZmVyLiBTZWUgezo6Y2xpcEJ1ZmZlclBvc2l0aW9ufSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgI1xuICAjIHJhbmdlIC0gVGhlIHtSYW5nZX0gdG8gY2xpcC5cbiAgI1xuICAjIFJldHVybnMgYSB7UmFuZ2V9LlxuICBjbGlwQnVmZmVyUmFuZ2U6IChyYW5nZSkgLT4gQGJ1ZmZlci5jbGlwUmFuZ2UocmFuZ2UpXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgaW5kZW50YXRpb24gbGV2ZWwgb2YgdGhlIGdpdmVuIGEgYnVmZmVyIHJvdy5cbiAgI1xuICAjIFJldHVybnMgaG93IGRlZXBseSB0aGUgZ2l2ZW4gcm93IGlzIGluZGVudGVkIGJhc2VkIG9uIHRoZSBzb2Z0IHRhYnMgYW5kXG4gICMgdGFiIGxlbmd0aCBzZXR0aW5ncyBvZiB0aGlzIGVkaXRvci4gTm90ZSB0aGF0IGlmIHNvZnQgdGFicyBhcmUgZW5hYmxlZCBhbmRcbiAgIyB0aGUgdGFiIGxlbmd0aCBpcyAyLCBhIHJvdyB3aXRoIDQgbGVhZGluZyBzcGFjZXMgd291bGQgaGF2ZSBhbiBpbmRlbnRhdGlvblxuICAjIGxldmVsIG9mIDIuXG4gICNcbiAgIyBidWZmZXJSb3cgLSBBIHtOdW1iZXJ9IGluZGljYXRpbmcgdGhlIGJ1ZmZlciByb3cuXG4gICNcbiAgIyBSZXR1cm5zIGEge051bWJlcn0uXG4gIGluZGVudGF0aW9uRm9yQnVmZmVyUm93OiAoYnVmZmVyUm93KSAtPlxuICAgIEBpbmRlbnRMZXZlbEZvckxpbmUoQGxpbmVGb3JCdWZmZXJSb3coYnVmZmVyUm93KSlcblxuICAjIFB1YmxpYzogU2V0IHRoZSBpbmRlbnRhdGlvbiBsZXZlbCBmb3IgdGhlIGdpdmVuIGJ1ZmZlciByb3cuXG4gICNcbiAgIyBJbnNlcnRzIG9yIHJlbW92ZXMgaGFyZCB0YWJzIG9yIHNwYWNlcyBiYXNlZCBvbiB0aGUgc29mdCB0YWJzIGFuZCB0YWIgbGVuZ3RoXG4gICMgc2V0dGluZ3Mgb2YgdGhpcyBlZGl0b3IgaW4gb3JkZXIgdG8gYnJpbmcgaXQgdG8gdGhlIGdpdmVuIGluZGVudGF0aW9uIGxldmVsLlxuICAjIE5vdGUgdGhhdCBpZiBzb2Z0IHRhYnMgYXJlIGVuYWJsZWQgYW5kIHRoZSB0YWIgbGVuZ3RoIGlzIDIsIGEgcm93IHdpdGggNFxuICAjIGxlYWRpbmcgc3BhY2VzIHdvdWxkIGhhdmUgYW4gaW5kZW50YXRpb24gbGV2ZWwgb2YgMi5cbiAgI1xuICAjIGJ1ZmZlclJvdyAtIEEge051bWJlcn0gaW5kaWNhdGluZyB0aGUgYnVmZmVyIHJvdy5cbiAgIyBuZXdMZXZlbCAtIEEge051bWJlcn0gaW5kaWNhdGluZyB0aGUgbmV3IGluZGVudGF0aW9uIGxldmVsLlxuICAjIG9wdGlvbnMgLSBBbiB7T2JqZWN0fSB3aXRoIHRoZSBmb2xsb3dpbmcga2V5czpcbiAgIyAgIDpwcmVzZXJ2ZUxlYWRpbmdXaGl0ZXNwYWNlIC0gdHJ1ZSB0byBwcmVzZXJ2ZSBhbnkgd2hpdGVzcGFjZSBhbHJlYWR5IGF0XG4gICMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUgKGRlZmF1bHQ6IGZhbHNlKS5cbiAgc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3c6IChidWZmZXJSb3csIG5ld0xldmVsLCB7cHJlc2VydmVMZWFkaW5nV2hpdGVzcGFjZX09e30pIC0+XG4gICAgaWYgcHJlc2VydmVMZWFkaW5nV2hpdGVzcGFjZVxuICAgICAgZW5kQ29sdW1uID0gMFxuICAgIGVsc2VcbiAgICAgIGVuZENvbHVtbiA9IEBsaW5lRm9yQnVmZmVyUm93KGJ1ZmZlclJvdykubWF0Y2goL15cXHMqLylbMF0ubGVuZ3RoXG4gICAgbmV3SW5kZW50U3RyaW5nID0gQGJ1aWxkSW5kZW50U3RyaW5nKG5ld0xldmVsKVxuICAgIEBidWZmZXIuc2V0VGV4dEluUmFuZ2UoW1tidWZmZXJSb3csIDBdLCBbYnVmZmVyUm93LCBlbmRDb2x1bW5dXSwgbmV3SW5kZW50U3RyaW5nKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIGluZGVudGF0aW9uIGxldmVsIG9mIHRoZSBnaXZlbiBsaW5lIG9mIHRleHQuXG4gICNcbiAgIyBSZXR1cm5zIGhvdyBkZWVwbHkgdGhlIGdpdmVuIGxpbmUgaXMgaW5kZW50ZWQgYmFzZWQgb24gdGhlIHNvZnQgdGFicyBhbmRcbiAgIyB0YWIgbGVuZ3RoIHNldHRpbmdzIG9mIHRoaXMgZWRpdG9yLiBOb3RlIHRoYXQgaWYgc29mdCB0YWJzIGFyZSBlbmFibGVkIGFuZFxuICAjIHRoZSB0YWIgbGVuZ3RoIGlzIDIsIGEgcm93IHdpdGggNCBsZWFkaW5nIHNwYWNlcyB3b3VsZCBoYXZlIGFuIGluZGVudGF0aW9uXG4gICMgbGV2ZWwgb2YgMi5cbiAgI1xuICAjIGxpbmUgLSBBIHtTdHJpbmd9IHJlcHJlc2VudGluZyBhIGxpbmUgb2YgdGV4dC5cbiAgI1xuICAjIFJldHVybnMgYSB7TnVtYmVyfS5cbiAgaW5kZW50TGV2ZWxGb3JMaW5lOiAobGluZSkgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5pbmRlbnRMZXZlbEZvckxpbmUobGluZSlcblxuICAjIENvbnN0cnVjdHMgdGhlIHN0cmluZyB1c2VkIGZvciB0YWJzLlxuICBidWlsZEluZGVudFN0cmluZzogKG51bWJlcikgLT5cbiAgICBpZiBAZ2V0U29mdFRhYnMoKVxuICAgICAgXy5tdWx0aXBseVN0cmluZyhcIiBcIiwgTWF0aC5mbG9vcihudW1iZXIgKiBAZ2V0VGFiTGVuZ3RoKCkpKVxuICAgIGVsc2VcbiAgICAgIF8ubXVsdGlwbHlTdHJpbmcoXCJcXHRcIiwgTWF0aC5mbG9vcihudW1iZXIpKVxuXG4gICMgUHVibGljOiBTYXZlcyB0aGUgZWRpdG9yJ3MgdGV4dCBidWZmZXIuXG4gICNcbiAgIyBTZWUge1RleHRCdWZmZXI6OnNhdmV9IGZvciBtb3JlIGRldGFpbHMuXG4gIHNhdmU6IC0+IEBidWZmZXIuc2F2ZSgpXG5cbiAgIyBQdWJsaWM6IFNhdmVzIHRoZSBlZGl0b3IncyB0ZXh0IGJ1ZmZlciBhcyB0aGUgZ2l2ZW4gcGF0aC5cbiAgI1xuICAjIFNlZSB7VGV4dEJ1ZmZlcjo6c2F2ZUFzfSBmb3IgbW9yZSBkZXRhaWxzLlxuICAjXG4gICMgZmlsZVBhdGggLSBBIHtTdHJpbmd9IHBhdGguXG4gIHNhdmVBczogKGZpbGVQYXRoKSAtPiBAYnVmZmVyLnNhdmVBcyhmaWxlUGF0aClcblxuICBjaGVja291dEhlYWQ6IC0+XG4gICAgaWYgZmlsZVBhdGggPSBAZ2V0UGF0aCgpXG4gICAgICBhdG9tLnByb2plY3QuZ2V0UmVwbygpPy5jaGVja291dEhlYWQoZmlsZVBhdGgpXG5cbiAgIyBDb3BpZXMgdGhlIGN1cnJlbnQgZmlsZSBwYXRoIHRvIHRoZSBuYXRpdmUgY2xpcGJvYXJkLlxuICBjb3B5UGF0aFRvQ2xpcGJvYXJkOiAtPlxuICAgIGlmIGZpbGVQYXRoID0gQGdldFBhdGgoKVxuICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoZmlsZVBhdGgpXG5cbiAgIyBQdWJsaWM6IFJldHVybnMgdGhlIHtTdHJpbmd9IHBhdGggb2YgdGhpcyBlZGl0b3IncyB0ZXh0IGJ1ZmZlci5cbiAgZ2V0UGF0aDogLT4gQGJ1ZmZlci5nZXRQYXRoKClcblxuICAjIFB1YmxpYzogUmV0dXJucyBhIHtTdHJpbmd9IHJlcHJlc2VudGluZyB0aGUgZW50aXJlIGNvbnRlbnRzIG9mIHRoZSBlZGl0b3IuXG4gIGdldFRleHQ6IC0+IEBidWZmZXIuZ2V0VGV4dCgpXG5cbiAgIyBQdWJsaWM6IFJlcGxhY2VzIHRoZSBlbnRpcmUgY29udGVudHMgb2YgdGhlIGJ1ZmZlciB3aXRoIHRoZSBnaXZlbiB7U3RyaW5nfS5cbiAgc2V0VGV4dDogKHRleHQpIC0+IEBidWZmZXIuc2V0VGV4dCh0ZXh0KVxuXG4gICMgR2V0IHRoZSB0ZXh0IGluIHRoZSBnaXZlbiB7UmFuZ2V9LlxuICAjXG4gICMgUmV0dXJucyBhIHtTdHJpbmd9LlxuICBnZXRUZXh0SW5SYW5nZTogKHJhbmdlKSAtPiBAYnVmZmVyLmdldFRleHRJblJhbmdlKHJhbmdlKVxuXG4gICMgUHVibGljOiBSZXR1cm5zIGEge051bWJlcn0gcmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2YgbGluZXMgaW4gdGhlIGVkaXRvci5cbiAgZ2V0TGluZUNvdW50OiAtPiBAYnVmZmVyLmdldExpbmVDb3VudCgpXG5cbiAgIyBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQge1RleHRCdWZmZXJ9LlxuICBnZXRCdWZmZXI6IC0+IEBidWZmZXJcblxuICAjIFB1YmxpYzogUmV0cmlldmVzIHRoZSBjdXJyZW50IGJ1ZmZlcidzIFVSSS5cbiAgZ2V0VXJpOiAtPiBAYnVmZmVyLmdldFVyaSgpXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBUZXh0QnVmZmVyLmlzUm93Qmxhbmt9XG4gIGlzQnVmZmVyUm93Qmxhbms6IChidWZmZXJSb3cpIC0+IEBidWZmZXIuaXNSb3dCbGFuayhidWZmZXJSb3cpXG5cbiAgIyBQdWJsaWM6IERldGVybWluZSBpZiB0aGUgZ2l2ZW4gcm93IGlzIGVudGlyZWx5IGEgY29tbWVudFxuICBpc0J1ZmZlclJvd0NvbW1lbnRlZDogKGJ1ZmZlclJvdykgLT5cbiAgICBpZiBtYXRjaCA9IEBsaW5lRm9yQnVmZmVyUm93KGJ1ZmZlclJvdykubWF0Y2goL1xcUy8pXG4gICAgICBzY29wZXMgPSBAdG9rZW5Gb3JCdWZmZXJQb3NpdGlvbihbYnVmZmVyUm93LCBtYXRjaC5pbmRleF0pLnNjb3Blc1xuICAgICAgbmV3IFRleHRNYXRlU2NvcGVTZWxlY3RvcignY29tbWVudC4qJykubWF0Y2hlcyhzY29wZXMpXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBUZXh0QnVmZmVyLm5leHROb25CbGFua1Jvd31cbiAgbmV4dE5vbkJsYW5rQnVmZmVyUm93OiAoYnVmZmVyUm93KSAtPiBAYnVmZmVyLm5leHROb25CbGFua1JvdyhidWZmZXJSb3cpXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBUZXh0QnVmZmVyLmdldEVuZFBvc2l0aW9ufVxuICBnZXRFb2ZCdWZmZXJQb3NpdGlvbjogLT4gQGJ1ZmZlci5nZXRFbmRQb3NpdGlvbigpXG5cbiAgIyBQdWJsaWM6IFJldHVybnMgYSB7TnVtYmVyfSByZXByZXNlbnRpbmcgdGhlIGxhc3QgemVyby1pbmRleGVkIGJ1ZmZlciByb3dcbiAgIyBudW1iZXIgb2YgdGhlIGVkaXRvci5cbiAgZ2V0TGFzdEJ1ZmZlclJvdzogLT4gQGJ1ZmZlci5nZXRMYXN0Um93KClcblxuICAjIFJldHVybnMgdGhlIHJhbmdlIGZvciB0aGUgZ2l2ZW4gYnVmZmVyIHJvdy5cbiAgI1xuICAjIHJvdyAtIEEgcm93IHtOdW1iZXJ9LlxuICAjIG9wdGlvbnMgLSBBbiBvcHRpb25zIGhhc2ggd2l0aCBhbiBgaW5jbHVkZU5ld2xpbmVgIGtleS5cbiAgI1xuICAjIFJldHVybnMgYSB7UmFuZ2V9LlxuICBidWZmZXJSYW5nZUZvckJ1ZmZlclJvdzogKHJvdywge2luY2x1ZGVOZXdsaW5lfT17fSkgLT4gQGJ1ZmZlci5yYW5nZUZvclJvdyhyb3csIGluY2x1ZGVOZXdsaW5lKVxuXG4gICMgUHVibGljOiBSZXR1cm5zIGEge1N0cmluZ30gcmVwcmVzZW50aW5nIHRoZSBjb250ZW50cyBvZiB0aGUgbGluZSBhdCB0aGVcbiAgIyBnaXZlbiBidWZmZXIgcm93LlxuICAjXG4gICMgcm93IC0gQSB7TnVtYmVyfSByZXByZXNlbnRpbmcgYSB6ZXJvLWluZGV4ZWQgYnVmZmVyIHJvdy5cbiAgbGluZUZvckJ1ZmZlclJvdzogKHJvdykgLT4gQGJ1ZmZlci5saW5lRm9yUm93KHJvdylcblxuICAjIFB1YmxpYzogUmV0dXJucyBhIHtOdW1iZXJ9IHJlcHJlc2VudGluZyB0aGUgbGluZSBsZW5ndGggZm9yIHRoZSBnaXZlblxuICAjIGJ1ZmZlciByb3csIGV4Y2x1c2l2ZSBvZiBpdHMgbGluZS1lbmRpbmcgY2hhcmFjdGVyKHMpLlxuICAjXG4gICMgcm93IC0gQSB7TnVtYmVyfSBpbmRpY2F0aW5nIHRoZSBidWZmZXIgcm93LlxuICBsaW5lTGVuZ3RoRm9yQnVmZmVyUm93OiAocm93KSAtPiBAYnVmZmVyLmxpbmVMZW5ndGhGb3JSb3cocm93KVxuXG4gICMge0RlbGVnYXRlcyB0bzogVGV4dEJ1ZmZlci5zY2FufVxuICBzY2FuOiAoYXJncy4uLikgLT4gQGJ1ZmZlci5zY2FuKGFyZ3MuLi4pXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBUZXh0QnVmZmVyLnNjYW5JblJhbmdlfVxuICBzY2FuSW5CdWZmZXJSYW5nZTogKGFyZ3MuLi4pIC0+IEBidWZmZXIuc2NhbkluUmFuZ2UoYXJncy4uLilcblxuICAjIHtEZWxlZ2F0ZXMgdG86IFRleHRCdWZmZXIuYmFja3dhcmRzU2NhbkluUmFuZ2V9XG4gIGJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlOiAoYXJncy4uLikgLT4gQGJ1ZmZlci5iYWNrd2FyZHNTY2FuSW5SYW5nZShhcmdzLi4uKVxuXG4gICMge0RlbGVnYXRlcyB0bzogVGV4dEJ1ZmZlci5pc01vZGlmaWVkfVxuICBpc01vZGlmaWVkOiAtPiBAYnVmZmVyLmlzTW9kaWZpZWQoKVxuXG4gICMgUHVibGljOiBEZXRlcm1pbmUgd2hldGhlciB0aGUgdXNlciBzaG91bGQgYmUgcHJvbXB0ZWQgdG8gc2F2ZSBiZWZvcmUgY2xvc2luZ1xuICAjIHRoaXMgZWRpdG9yLlxuICBzaG91bGRQcm9tcHRUb1NhdmU6IC0+IEBpc01vZGlmaWVkKCkgYW5kIG5vdCBAYnVmZmVyLmhhc011bHRpcGxlRWRpdG9ycygpXG5cbiAgIyBQdWJsaWM6IENvbnZlcnQgYSBwb3NpdGlvbiBpbiBidWZmZXItY29vcmRpbmF0ZXMgdG8gc2NyZWVuLWNvb3JkaW5hdGVzLlxuICAjXG4gICMgVGhlIHBvc2l0aW9uIGlzIGNsaXBwZWQgdmlhIHs6OmNsaXBCdWZmZXJQb3NpdGlvbn0gcHJpb3IgdG8gdGhlIGNvbnZlcnNpb24uXG4gICMgVGhlIHBvc2l0aW9uIGlzIGFsc28gY2xpcHBlZCB2aWEgezo6Y2xpcFNjcmVlblBvc2l0aW9ufSBmb2xsb3dpbmcgdGhlXG4gICMgY29udmVyc2lvbiwgd2hpY2ggb25seSBtYWtlcyBhIGRpZmZlcmVuY2Ugd2hlbiBgb3B0aW9uc2AgYXJlIHN1cHBsaWVkLlxuICAjXG4gICMgYnVmZmVyUG9zaXRpb24gLSBBIHtQb2ludH0gb3Ige0FycmF5fSBvZiBbcm93LCBjb2x1bW5dLlxuICAjIG9wdGlvbnMgLSBBbiBvcHRpb25zIGhhc2ggZm9yIHs6OmNsaXBTY3JlZW5Qb3NpdGlvbn0uXG4gICNcbiAgIyBSZXR1cm5zIGEge1BvaW50fS5cbiAgc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbjogKGJ1ZmZlclBvc2l0aW9uLCBvcHRpb25zKSAtPiBAZGlzcGxheUJ1ZmZlci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uLCBvcHRpb25zKVxuXG4gICMgUHVibGljOiBDb252ZXJ0IGEgcG9zaXRpb24gaW4gc2NyZWVuLWNvb3JkaW5hdGVzIHRvIGJ1ZmZlci1jb29yZGluYXRlcy5cbiAgI1xuICAjIFRoZSBwb3NpdGlvbiBpcyBjbGlwcGVkIHZpYSB7OjpjbGlwU2NyZWVuUG9zaXRpb259IHByaW9yIHRvIHRoZSBjb252ZXJzaW9uLlxuICAjXG4gICMgYnVmZmVyUG9zaXRpb24gLSBBIHtQb2ludH0gb3Ige0FycmF5fSBvZiBbcm93LCBjb2x1bW5dLlxuICAjIG9wdGlvbnMgLSBBbiBvcHRpb25zIGhhc2ggZm9yIHs6OmNsaXBTY3JlZW5Qb3NpdGlvbn0uXG4gICNcbiAgIyBSZXR1cm5zIGEge1BvaW50fS5cbiAgYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbjogKHNjcmVlblBvc2l0aW9uLCBvcHRpb25zKSAtPiBAZGlzcGxheUJ1ZmZlci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uLCBvcHRpb25zKVxuXG4gICMgUHVibGljOiBDb252ZXJ0IGEgcmFuZ2UgaW4gYnVmZmVyLWNvb3JkaW5hdGVzIHRvIHNjcmVlbi1jb29yZGluYXRlcy5cbiAgI1xuICAjIFJldHVybnMgYSB7UmFuZ2V9LlxuICBzY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlOiAoYnVmZmVyUmFuZ2UpIC0+IEBkaXNwbGF5QnVmZmVyLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UoYnVmZmVyUmFuZ2UpXG5cbiAgIyBQdWJsaWM6IENvbnZlcnQgYSByYW5nZSBpbiBzY3JlZW4tY29vcmRpbmF0ZXMgdG8gYnVmZmVyLWNvb3JkaW5hdGVzLlxuICAjXG4gICMgUmV0dXJucyBhIHtSYW5nZX0uXG4gIGJ1ZmZlclJhbmdlRm9yU2NyZWVuUmFuZ2U6IChzY3JlZW5SYW5nZSkgLT4gQGRpc3BsYXlCdWZmZXIuYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZShzY3JlZW5SYW5nZSlcblxuICAjIFB1YmxpYzogQ2xpcCB0aGUgZ2l2ZW4ge1BvaW50fSB0byBhIHZhbGlkIHBvc2l0aW9uIG9uIHNjcmVlbi5cbiAgI1xuICAjIElmIHRoZSBnaXZlbiB7UG9pbnR9IGRlc2NyaWJlcyBhIHBvc2l0aW9uIHRoYXQgaXMgYWN0dWFsbHkgcmVhY2hhYmxlIGJ5IHRoZVxuICAjIGN1cnNvciBiYXNlZCBvbiB0aGUgY3VycmVudCBjb250ZW50cyBvZiB0aGUgc2NyZWVuLCBpdCBpcyByZXR1cm5lZFxuICAjIHVuY2hhbmdlZC4gSWYgdGhlIHtQb2ludH0gZG9lcyBub3QgZGVzY3JpYmUgYSB2YWxpZCBwb3NpdGlvbiwgdGhlIGNsb3Nlc3RcbiAgIyB2YWxpZCBwb3NpdGlvbiBpcyByZXR1cm5lZCBpbnN0ZWFkLlxuICAjXG4gICMgRm9yIGV4YW1wbGU6XG4gICMgICAqIGBbLTEsIC0xXWAgaXMgY29udmVydGVkIHRvIGBbMCwgMF1gLlxuICAjICAgKiBJZiB0aGUgbGluZSBhdCBzY3JlZW4gcm93IDIgaXMgMTAgbG9uZywgYFsyLCBJbmZpbml0eV1gIGlzIGNvbnZlcnRlZCB0b1xuICAjICAgICBgWzIsIDEwXWAuXG4gICNcbiAgIyBidWZmZXJQb3NpdGlvbiAtIFRoZSB7UG9pbnR9IHJlcHJlc2VudGluZyB0aGUgcG9zaXRpb24gdG8gY2xpcC5cbiAgI1xuICAjIFJldHVybnMgYSB7UG9pbnR9LlxuICBjbGlwU2NyZWVuUG9zaXRpb246IChzY3JlZW5Qb3NpdGlvbiwgb3B0aW9ucykgLT4gQGRpc3BsYXlCdWZmZXIuY2xpcFNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uLCBvcHRpb25zKVxuXG4gICMge0RlbGVnYXRlcyB0bzogRGlzcGxheUJ1ZmZlci5saW5lRm9yUm93fVxuICBsaW5lRm9yU2NyZWVuUm93OiAocm93KSAtPiBAZGlzcGxheUJ1ZmZlci5saW5lRm9yUm93KHJvdylcblxuICAjIHtEZWxlZ2F0ZXMgdG86IERpc3BsYXlCdWZmZXIubGluZXNGb3JSb3dzfVxuICBsaW5lc0ZvclNjcmVlblJvd3M6IChzdGFydCwgZW5kKSAtPiBAZGlzcGxheUJ1ZmZlci5saW5lc0ZvclJvd3Moc3RhcnQsIGVuZClcblxuICAjIHtEZWxlZ2F0ZXMgdG86IERpc3BsYXlCdWZmZXIuZ2V0TGluZUNvdW50fVxuICBnZXRTY3JlZW5MaW5lQ291bnQ6IC0+IEBkaXNwbGF5QnVmZmVyLmdldExpbmVDb3VudCgpXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBEaXNwbGF5QnVmZmVyLmdldE1heExpbmVMZW5ndGh9XG4gIGdldE1heFNjcmVlbkxpbmVMZW5ndGg6IC0+IEBkaXNwbGF5QnVmZmVyLmdldE1heExpbmVMZW5ndGgoKVxuXG4gICMge0RlbGVnYXRlcyB0bzogRGlzcGxheUJ1ZmZlci5nZXRMYXN0Um93fVxuICBnZXRMYXN0U2NyZWVuUm93OiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRMYXN0Um93KClcblxuICAjIHtEZWxlZ2F0ZXMgdG86IERpc3BsYXlCdWZmZXIuYnVmZmVyUm93c0ZvclNjcmVlblJvd3N9XG4gIGJ1ZmZlclJvd3NGb3JTY3JlZW5Sb3dzOiAoc3RhcnRSb3csIGVuZFJvdykgLT4gQGRpc3BsYXlCdWZmZXIuYnVmZmVyUm93c0ZvclNjcmVlblJvd3Moc3RhcnRSb3csIGVuZFJvdylcblxuICBidWZmZXJSb3dGb3JTY3JlZW5Sb3c6IChyb3cpIC0+IEBkaXNwbGF5QnVmZmVyLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhyb3cpXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgc3ludGFjdGljIHNjb3BlcyBmb3IgdGhlIG1vc3QgdGhlIGdpdmVuIHBvc2l0aW9uIGluIGJ1ZmZlclxuICAjIGNvb3JkaXRhbmF0ZXMuXG4gICNcbiAgIyBGb3IgZXhhbXBsZSwgaWYgY2FsbGVkIHdpdGggYSBwb3NpdGlvbiBpbnNpZGUgdGhlIHBhcmFtZXRlciBsaXN0IG9mIGFuXG4gICMgYW5vbnltb3VzIENvZmZlZVNjcmlwdCBmdW5jdGlvbiwgdGhlIG1ldGhvZCByZXR1cm5zIHRoZSBmb2xsb3dpbmcgYXJyYXk6XG4gICMgYFtcInNvdXJjZS5jb2ZmZWVcIiwgXCJtZXRhLmlubGluZS5mdW5jdGlvbi5jb2ZmZWVcIiwgXCJ2YXJpYWJsZS5wYXJhbWV0ZXIuZnVuY3Rpb24uY29mZmVlXCJdYFxuICAjXG4gICMgYnVmZmVyUG9zaXRpb24gLSBBIHtQb2ludH0gb3Ige0FycmF5fSBvZiBbcm93LCBjb2x1bW5dLlxuICAjXG4gICMgUmV0dXJucyBhbiB7QXJyYXl9IG9mIHtTdHJpbmd9cy5cbiAgc2NvcGVzRm9yQnVmZmVyUG9zaXRpb246IChidWZmZXJQb3NpdGlvbikgLT4gQGRpc3BsYXlCdWZmZXIuc2NvcGVzRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgcmFuZ2UgaW4gYnVmZmVyIGNvb3JkaW5hdGVzIG9mIGFsbCB0b2tlbnMgc3Vycm91bmRpbmcgdGhlXG4gICMgY3Vyc29yIHRoYXQgbWF0Y2ggdGhlIGdpdmVuIHNjb3BlIHNlbGVjdG9yLlxuICAjXG4gICMgRm9yIGV4YW1wbGUsIGlmIHlvdSB3YW50ZWQgdG8gZmluZCB0aGUgc3RyaW5nIHN1cnJvdW5kaW5nIHRoZSBjdXJzb3IsIHlvdVxuICAjIGNvdWxkIGNhbGwgYGVkaXRvci5idWZmZXJSYW5nZUZvclNjb3BlQXRDdXJzb3IoXCIuc3RyaW5nLnF1b3RlZFwiKWAuXG4gICNcbiAgIyBSZXR1cm5zIGEge1JhbmdlfS5cbiAgYnVmZmVyUmFuZ2VGb3JTY29wZUF0Q3Vyc29yOiAoc2VsZWN0b3IpIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIuYnVmZmVyUmFuZ2VGb3JTY29wZUF0UG9zaXRpb24oc2VsZWN0b3IsIEBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuXG4gICMge0RlbGVnYXRlcyB0bzogRGlzcGxheUJ1ZmZlci50b2tlbkZvckJ1ZmZlclBvc2l0aW9ufVxuICB0b2tlbkZvckJ1ZmZlclBvc2l0aW9uOiAoYnVmZmVyUG9zaXRpb24pIC0+IEBkaXNwbGF5QnVmZmVyLnRva2VuRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgc3ludGFjdGljIHNjb3BlcyBmb3IgdGhlIG1vc3QgcmVjZW50bHkgYWRkZWQgY3Vyc29yJ3NcbiAgIyBwb3NpdGlvbi4gU2VlIHs6OnNjb3Blc0ZvckJ1ZmZlclBvc2l0aW9ufSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgI1xuICAjIFJldHVybnMgYW4ge0FycmF5fSBvZiB7U3RyaW5nfXMuXG4gIGdldEN1cnNvclNjb3BlczogLT4gQGdldEN1cnNvcigpLmdldFNjb3BlcygpXG5cbiAgbG9nQ3Vyc29yU2NvcGU6IC0+XG4gICAgY29uc29sZS5sb2cgQGdldEN1cnNvclNjb3BlcygpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgcmVwbGFjZSB0aGUgc2VsZWN0ZWQgdGV4dCB3aXRoIHRoZSBnaXZlbiB0ZXh0LlxuICAjXG4gICMgdGV4dCAtIEEge1N0cmluZ30gcmVwcmVzZW50aW5nIHRoZSB0ZXh0IHRvIGluc2VydC5cbiAgIyBvcHRpb25zIC0gU2VlIHtTZWxlY3Rpb246Omluc2VydFRleHR9LlxuICBpbnNlcnRUZXh0OiAodGV4dCwgb3B0aW9ucz17fSkgLT5cbiAgICBvcHRpb25zLmF1dG9JbmRlbnROZXdsaW5lID89IEBzaG91bGRBdXRvSW5kZW50KClcbiAgICBvcHRpb25zLmF1dG9EZWNyZWFzZUluZGVudCA/PSBAc2hvdWxkQXV0b0luZGVudCgpXG4gICAgQG11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCBvcHRpb25zKVxuXG4gICMgUHVibGljOiBGb3IgZWFjaCBzZWxlY3Rpb24sIHJlcGxhY2UgdGhlIHNlbGVjdGVkIHRleHQgd2l0aCBhIG5ld2xpbmUuXG4gIGluc2VydE5ld2xpbmU6IC0+XG4gICAgQGluc2VydFRleHQoJ1xcbicpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIGN1cnNvciwgaW5zZXJ0IGEgbmV3bGluZSBhdCBiZWdpbm5pbmcgdGhlIGZvbGxvd2luZyBsaW5lLlxuICBpbnNlcnROZXdsaW5lQmVsb3c6IC0+XG4gICAgQHRyYW5zYWN0ID0+XG4gICAgICBAbW92ZUN1cnNvclRvRW5kT2ZMaW5lKClcbiAgICAgIEBpbnNlcnROZXdsaW5lKClcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggY3Vyc29yLCBpbnNlcnQgYSBuZXdsaW5lIGF0IHRoZSBlbmQgb2YgdGhlIHByZWNlZGluZyBsaW5lLlxuICBpbnNlcnROZXdsaW5lQWJvdmU6IC0+XG4gICAgQHRyYW5zYWN0ID0+XG4gICAgICBidWZmZXJSb3cgPSBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICAgIGluZGVudExldmVsID0gQGluZGVudGF0aW9uRm9yQnVmZmVyUm93KGJ1ZmZlclJvdylcbiAgICAgIG9uRmlyc3RMaW5lID0gYnVmZmVyUm93IGlzIDBcblxuICAgICAgQG1vdmVDdXJzb3JUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgICBAbW92ZUN1cnNvckxlZnQoKVxuICAgICAgQGluc2VydE5ld2xpbmUoKVxuXG4gICAgICBpZiBAc2hvdWxkQXV0b0luZGVudCgpIGFuZCBAaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coYnVmZmVyUm93KSA8IGluZGVudExldmVsXG4gICAgICAgIEBzZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhidWZmZXJSb3csIGluZGVudExldmVsKVxuXG4gICAgICBpZiBvbkZpcnN0TGluZVxuICAgICAgICBAbW92ZUN1cnNvclVwKClcbiAgICAgICAgQG1vdmVDdXJzb3JUb0VuZE9mTGluZSgpXG5cbiAgIyBJbmRlbnQgYWxsIGxpbmVzIGludGVyc2VjdGluZyBzZWxlY3Rpb25zLiBTZWUge1NlbGVjdGlvbjo6aW5kZW50fSBmb3IgbW9yZVxuICAjIGluZm9ybWF0aW9uLlxuICBpbmRlbnQ6IChvcHRpb25zPXt9KS0+XG4gICAgb3B0aW9ucy5hdXRvSW5kZW50ID89IEBzaG91bGRBdXRvSW5kZW50KClcbiAgICBAbXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pIC0+IHNlbGVjdGlvbi5pbmRlbnQob3B0aW9ucylcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggc2VsZWN0aW9uLCBpZiB0aGUgc2VsZWN0aW9uIGlzIGVtcHR5LCBkZWxldGUgdGhlIGNoYXJhY3RlclxuICAjIHByZWNlZGluZyB0aGUgY3Vyc29yLiBPdGhlcndpc2UgZGVsZXRlIHRoZSBzZWxlY3RlZCB0ZXh0LlxuICBiYWNrc3BhY2U6IC0+XG4gICAgQG11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24uYmFja3NwYWNlKClcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggc2VsZWN0aW9uLCBpZiB0aGUgc2VsZWN0aW9uIGlzIGVtcHR5LCBkZWxldGUgYWxsIGNoYXJhY3RlcnNcbiAgIyBvZiB0aGUgY29udGFpbmluZyB3b3JkIHRoYXQgcHJlY2VkZSB0aGUgY3Vyc29yLiBPdGhlcndpc2UgZGVsZXRlIHRoZVxuICAjIHNlbGVjdGVkIHRleHQuXG4gIGJhY2tzcGFjZVRvQmVnaW5uaW5nT2ZXb3JkOiAtPlxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmJhY2tzcGFjZVRvQmVnaW5uaW5nT2ZXb3JkKClcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggc2VsZWN0aW9uLCBpZiB0aGUgc2VsZWN0aW9uIGlzIGVtcHR5LCBkZWxldGUgYWxsIGNoYXJhY3RlcnNcbiAgIyBvZiB0aGUgY29udGFpbmluZyBsaW5lIHRoYXQgcHJlY2VkZSB0aGUgY3Vyc29yLiBPdGhlcndpc2UgZGVsZXRlIHRoZVxuICAjIHNlbGVjdGVkIHRleHQuXG4gIGJhY2tzcGFjZVRvQmVnaW5uaW5nT2ZMaW5lOiAtPlxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmJhY2tzcGFjZVRvQmVnaW5uaW5nT2ZMaW5lKClcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggc2VsZWN0aW9uLCBpZiB0aGUgc2VsZWN0aW9uIGlzIGVtcHR5LCBkZWxldGUgdGhlIGNoYXJhY3RlclxuICAjIHByZWNlZGluZyB0aGUgY3Vyc29yLiBPdGhlcndpc2UgZGVsZXRlIHRoZSBzZWxlY3RlZCB0ZXh0LlxuICBkZWxldGU6IC0+XG4gICAgQG11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24uZGVsZXRlKClcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggc2VsZWN0aW9uLCBpZiB0aGUgc2VsZWN0aW9uIGlzIGVtcHR5LCBkZWxldGUgYWxsIGNoYXJhY3RlcnNcbiAgIyBvZiB0aGUgY29udGFpbmluZyB3b3JkIGZvbGxvd2luZyB0aGUgY3Vyc29yLiBPdGhlcndpc2UgZGVsZXRlIHRoZSBzZWxlY3RlZFxuICAjIHRleHQuXG4gIGRlbGV0ZVRvRW5kT2ZXb3JkOiAtPlxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmRlbGV0ZVRvRW5kT2ZXb3JkKClcblxuICAjIFB1YmxpYzogRGVsZXRlIGFsbCBsaW5lcyBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9ucy5cbiAgZGVsZXRlTGluZTogLT5cbiAgICBAbXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pIC0+IHNlbGVjdGlvbi5kZWxldGVMaW5lKClcblxuICAjIFB1YmxpYzogSW5kZW50IHJvd3MgaW50ZXJzZWN0aW5nIHNlbGVjdGlvbnMgYnkgb25lIGxldmVsLlxuICBpbmRlbnRTZWxlY3RlZFJvd3M6IC0+XG4gICAgQG11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24uaW5kZW50U2VsZWN0ZWRSb3dzKClcblxuICAjIFB1YmxpYzogT3V0ZGVudCByb3dzIGludGVyc2VjdGluZyBzZWxlY3Rpb25zIGJ5IG9uZSBsZXZlbC5cbiAgb3V0ZGVudFNlbGVjdGVkUm93czogLT5cbiAgICBAbXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pIC0+IHNlbGVjdGlvbi5vdXRkZW50U2VsZWN0ZWRSb3dzKClcblxuICAjIFB1YmxpYzogVG9nZ2xlIGxpbmUgY29tbWVudHMgZm9yIHJvd3MgaW50ZXJzZWN0aW5nIHNlbGVjdGlvbnMuXG4gICNcbiAgIyBJZiB0aGUgY3VycmVudCBncmFtbWFyIGRvZXNuJ3Qgc3VwcG9ydCBjb21tZW50cywgZG9lcyBub3RoaW5nLlxuICAjXG4gICMgUmV0dXJucyBhbiB7QXJyYXl9IG9mIHRoZSBjb21tZW50ZWQge1JhbmdlfXMuXG4gIHRvZ2dsZUxpbmVDb21tZW50c0luU2VsZWN0aW9uOiAtPlxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLnRvZ2dsZUxpbmVDb21tZW50cygpXG5cbiAgIyBQdWJsaWM6IEluZGVudCByb3dzIGludGVyc2VjdGluZyBzZWxlY3Rpb25zIGJhc2VkIG9uIHRoZSBncmFtbWFyJ3Mgc3VnZ2VzdGVkXG4gICMgaW5kZW50IGxldmVsLlxuICBhdXRvSW5kZW50U2VsZWN0ZWRSb3dzOiAtPlxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoKVxuXG4gICMgSWYgc29mdCB0YWJzIGFyZSBlbmFibGVkLCBjb252ZXJ0IGFsbCBoYXJkIHRhYnMgdG8gc29mdCB0YWJzIGluIHRoZSBnaXZlblxuICAjIHtSYW5nZX0uXG4gIG5vcm1hbGl6ZVRhYnNJbkJ1ZmZlclJhbmdlOiAoYnVmZmVyUmFuZ2UpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZ2V0U29mdFRhYnMoKVxuICAgIEBzY2FuSW5CdWZmZXJSYW5nZSAvXFx0L2csIGJ1ZmZlclJhbmdlLCAoe3JlcGxhY2V9KSA9PiByZXBsYWNlKEBnZXRUYWJUZXh0KCkpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgaWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgY3V0IGFsbCBjaGFyYWN0ZXJzXG4gICMgb2YgdGhlIGNvbnRhaW5pbmcgbGluZSBmb2xsb3dpbmcgdGhlIGN1cnNvci4gT3RoZXJ3aXNlIGN1dCB0aGUgc2VsZWN0ZWRcbiAgIyB0ZXh0LlxuICBjdXRUb0VuZE9mTGluZTogLT5cbiAgICBtYWludGFpbkNsaXBib2FyZCA9IGZhbHNlXG4gICAgQG11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSAtPlxuICAgICAgc2VsZWN0aW9uLmN1dFRvRW5kT2ZMaW5lKG1haW50YWluQ2xpcGJvYXJkKVxuICAgICAgbWFpbnRhaW5DbGlwYm9hcmQgPSB0cnVlXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgY3V0IHRoZSBzZWxlY3RlZCB0ZXh0LlxuICBjdXRTZWxlY3RlZFRleHQ6IC0+XG4gICAgbWFpbnRhaW5DbGlwYm9hcmQgPSBmYWxzZVxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT5cbiAgICAgIHNlbGVjdGlvbi5jdXQobWFpbnRhaW5DbGlwYm9hcmQpXG4gICAgICBtYWludGFpbkNsaXBib2FyZCA9IHRydWVcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggc2VsZWN0aW9uLCBjb3B5IHRoZSBzZWxlY3RlZCB0ZXh0LlxuICBjb3B5U2VsZWN0ZWRUZXh0OiAtPlxuICAgIG1haW50YWluQ2xpcGJvYXJkID0gZmFsc2VcbiAgICBmb3Igc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5jb3B5KG1haW50YWluQ2xpcGJvYXJkKVxuICAgICAgbWFpbnRhaW5DbGlwYm9hcmQgPSB0cnVlXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgcmVwbGFjZSB0aGUgc2VsZWN0ZWQgdGV4dCB3aXRoIHRoZSBjb250ZW50cyBvZlxuICAjIHRoZSBjbGlwYm9hcmQuXG4gICNcbiAgIyBJZiB0aGUgY2xpcGJvYXJkIGNvbnRhaW5zIHRoZSBzYW1lIG51bWJlciBvZiBzZWxlY3Rpb25zIGFzIHRoZSBjdXJyZW50XG4gICMgZWRpdG9yLCBlYWNoIHNlbGVjdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdpdGggdGhlIGNvbnRlbnQgb2YgdGhlXG4gICMgY29ycmVzcG9uZGluZyBjbGlwYm9hcmQgc2VsZWN0aW9uIHRleHQuXG4gICNcbiAgIyBvcHRpb25zIC0gU2VlIHtTZWxlY3Rpb246Omluc2VydFRleHR9LlxuICBwYXN0ZVRleHQ6IChvcHRpb25zPXt9KSAtPlxuICAgIHt0ZXh0LCBtZXRhZGF0YX0gPSBhdG9tLmNsaXBib2FyZC5yZWFkV2l0aE1ldGFkYXRhKClcblxuICAgIGNvbnRhaW5zTmV3bGluZXMgPSB0ZXh0LmluZGV4T2YoJ1xcbicpIGlzbnQgLTFcblxuICAgIGlmIG1ldGFkYXRhPy5zZWxlY3Rpb25zPyBhbmQgbWV0YWRhdGEuc2VsZWN0aW9ucy5sZW5ndGggaXMgQGdldFNlbGVjdGlvbnMoKS5sZW5ndGhcbiAgICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbiwgaW5kZXgpID0+XG4gICAgICAgIHRleHQgPSBtZXRhZGF0YS5zZWxlY3Rpb25zW2luZGV4XVxuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCBvcHRpb25zKVxuXG4gICAgICByZXR1cm5cblxuICAgIGVsc2UgaWYgYXRvbS5jb25maWcuZ2V0KFwiZWRpdG9yLm5vcm1hbGl6ZUluZGVudE9uUGFzdGVcIikgYW5kIG1ldGFkYXRhPy5pbmRlbnRCYXNpcz9cbiAgICAgIGlmICFAZ2V0Q3Vyc29yKCkuaGFzUHJlY2VkaW5nQ2hhcmFjdGVyc09uTGluZSgpIG9yIGNvbnRhaW5zTmV3bGluZXNcbiAgICAgICAgb3B0aW9ucy5pbmRlbnRCYXNpcyA/PSBtZXRhZGF0YS5pbmRlbnRCYXNpc1xuXG4gICAgQGluc2VydFRleHQodGV4dCwgb3B0aW9ucylcblxuICAjIFB1YmxpYzogVW5kbyB0aGUgbGFzdCBjaGFuZ2UuXG4gIHVuZG86IC0+XG4gICAgQGdldEN1cnNvcigpLm5lZWRzQXV0b3Njcm9sbCA9IHRydWVcbiAgICBAYnVmZmVyLnVuZG8odGhpcylcblxuICAjIFB1YmxpYzogUmVkbyB0aGUgbGFzdCBjaGFuZ2UuXG4gIHJlZG86IC0+XG4gICAgQGdldEN1cnNvcigpLm5lZWRzQXV0b3Njcm9sbCA9IHRydWVcbiAgICBAYnVmZmVyLnJlZG8odGhpcylcblxuICAjIFB1YmxpYzogRm9sZCB0aGUgbW9zdCByZWNlbnQgY3Vyc29yJ3Mgcm93IGJhc2VkIG9uIGl0cyBpbmRlbnRhdGlvbiBsZXZlbC5cbiAgI1xuICAjIFRoZSBmb2xkIHdpbGwgZXh0ZW5kIGZyb20gdGhlIG5lYXJlc3QgcHJlY2VkaW5nIGxpbmUgd2l0aCBhIGxvd2VyXG4gICMgaW5kZW50YXRpb24gbGV2ZWwgdXAgdG8gdGhlIG5lYXJlc3QgZm9sbG93aW5nIHJvdyB3aXRoIGEgbG93ZXIgaW5kZW50YXRpb25cbiAgIyBsZXZlbC5cbiAgZm9sZEN1cnJlbnRSb3c6IC0+XG4gICAgYnVmZmVyUm93ID0gQGJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oQGdldEN1cnNvclNjcmVlblBvc2l0aW9uKCkpLnJvd1xuICAgIEBmb2xkQnVmZmVyUm93KGJ1ZmZlclJvdylcblxuICAjIFB1YmxpYzogVW5mb2xkIHRoZSBtb3N0IHJlY2VudCBjdXJzb3IncyByb3cgYnkgb25lIGxldmVsLlxuICB1bmZvbGRDdXJyZW50Um93OiAtPlxuICAgIGJ1ZmZlclJvdyA9IEBidWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKEBnZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpKS5yb3dcbiAgICBAdW5mb2xkQnVmZmVyUm93KGJ1ZmZlclJvdylcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggc2VsZWN0aW9uLCBmb2xkIHRoZSByb3dzIGl0IGludGVyc2VjdHMuXG4gIGZvbGRTZWxlY3RlZExpbmVzOiAtPlxuICAgIHNlbGVjdGlvbi5mb2xkKCkgZm9yIHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpXG5cbiAgIyBQdWJsaWM6IEZvbGQgYWxsIGZvbGRhYmxlIGxpbmVzLlxuICBmb2xkQWxsOiAtPlxuICAgIEBsYW5ndWFnZU1vZGUuZm9sZEFsbCgpXG5cbiAgIyBQdWJsaWM6IFVuZm9sZCBhbGwgZXhpc3RpbmcgZm9sZHMuXG4gIHVuZm9sZEFsbDogLT5cbiAgICBAbGFuZ3VhZ2VNb2RlLnVuZm9sZEFsbCgpXG5cbiAgIyBQdWJsaWM6IEZvbGQgYWxsIGZvbGRhYmxlIGxpbmVzIGF0IHRoZSBnaXZlbiBpbmRlbnQgbGV2ZWwuXG4gICNcbiAgIyBsZXZlbCAtIEEge051bWJlcn0uXG4gIGZvbGRBbGxBdEluZGVudExldmVsOiAobGV2ZWwpIC0+XG4gICAgQGxhbmd1YWdlTW9kZS5mb2xkQWxsQXRJbmRlbnRMZXZlbChsZXZlbClcblxuICAjIFB1YmxpYzogRm9sZCB0aGUgZ2l2ZW4gcm93IGluIGJ1ZmZlciBjb29yZGluYXRlcyBiYXNlZCBvbiBpdHMgaW5kZW50YXRpb25cbiAgIyBsZXZlbC5cbiAgI1xuICAjIElmIHRoZSBnaXZlbiByb3cgaXMgZm9sZGFibGUsIHRoZSBmb2xkIHdpbGwgYmVnaW4gdGhlcmUuIE90aGVyd2lzZSwgaXQgd2lsbFxuICAjIGJlZ2luIGF0IHRoZSBmaXJzdCBmb2xkYWJsZSByb3cgcHJlY2VkaW5nIHRoZSBnaXZlbiByb3cuXG4gICNcbiAgIyBidWZmZXJSb3cgLSBBIHtOdW1iZXJ9LlxuICBmb2xkQnVmZmVyUm93OiAoYnVmZmVyUm93KSAtPlxuICAgIEBsYW5ndWFnZU1vZGUuZm9sZEJ1ZmZlclJvdyhidWZmZXJSb3cpXG5cbiAgIyBQdWJsaWM6IFVuZm9sZCBhbGwgZm9sZHMgY29udGFpbmluZyB0aGUgZ2l2ZW4gcm93IGluIGJ1ZmZlciBjb29yZGluYXRlcy5cbiAgI1xuICAjIGJ1ZmZlclJvdyAtIEEge051bWJlcn1cbiAgdW5mb2xkQnVmZmVyUm93OiAoYnVmZmVyUm93KSAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLnVuZm9sZEJ1ZmZlclJvdyhidWZmZXJSb3cpXG5cbiAgIyBQdWJsaWM6IERldGVybWluZSB3aGV0aGVyIHRoZSBnaXZlbiByb3cgaW4gYnVmZmVyIGNvb3JkaW5hdGVzIGlzIGZvbGRhYmxlLlxuICAjXG4gICMgQSAqZm9sZGFibGUqIHJvdyBpcyBhIHJvdyB0aGF0ICpzdGFydHMqIGEgcm93IHJhbmdlIHRoYXQgY2FuIGJlIGZvbGRlZC5cbiAgI1xuICAjIGJ1ZmZlclJvdyAtIEEge051bWJlcn1cbiAgI1xuICAjIFJldHVybnMgYSB7Qm9vbGVhbn0uXG4gIGlzRm9sZGFibGVBdEJ1ZmZlclJvdzogKGJ1ZmZlclJvdykgLT5cbiAgICBAbGFuZ3VhZ2VNb2RlLmlzRm9sZGFibGVBdEJ1ZmZlclJvdyhidWZmZXJSb3cpXG5cbiAgIyBUT0RPOiBSZW5hbWUgdG8gZm9sZFJvd1JhbmdlP1xuICBjcmVhdGVGb2xkOiAoc3RhcnRSb3csIGVuZFJvdykgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5jcmVhdGVGb2xkKHN0YXJ0Um93LCBlbmRSb3cpXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBEaXNwbGF5QnVmZmVyLmRlc3Ryb3lGb2xkV2l0aElkfVxuICBkZXN0cm95Rm9sZFdpdGhJZDogKGlkKSAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLmRlc3Ryb3lGb2xkV2l0aElkKGlkKVxuXG4gICMgUmVtb3ZlIGFueSB7Rm9sZH1zIGZvdW5kIHRoYXQgaW50ZXJzZWN0IHRoZSBnaXZlbiBidWZmZXIgcm93LlxuICBkZXN0cm95Rm9sZHNJbnRlcnNlY3RpbmdCdWZmZXJSYW5nZTogKGJ1ZmZlclJhbmdlKSAtPlxuICAgIGZvciByb3cgaW4gW2J1ZmZlclJhbmdlLnN0YXJ0LnJvdy4uYnVmZmVyUmFuZ2UuZW5kLnJvd11cbiAgICAgIEB1bmZvbGRCdWZmZXJSb3cocm93KVxuXG4gICMgUHVibGljOiBGb2xkIHRoZSBnaXZlbiBidWZmZXIgcm93IGlmIGl0IGlzbid0IGN1cnJlbnRseSBmb2xkZWQsIGFuZCB1bmZvbGRcbiAgIyBpdCBvdGhlcndpc2UuXG4gIHRvZ2dsZUZvbGRBdEJ1ZmZlclJvdzogKGJ1ZmZlclJvdykgLT5cbiAgICBpZiBAaXNGb2xkZWRBdEJ1ZmZlclJvdyhidWZmZXJSb3cpXG4gICAgICBAdW5mb2xkQnVmZmVyUm93KGJ1ZmZlclJvdylcbiAgICBlbHNlXG4gICAgICBAZm9sZEJ1ZmZlclJvdyhidWZmZXJSb3cpXG5cbiAgIyBQdWJsaWM6IERldGVybWluZSB3aGV0aGVyIHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIGN1cnNvcidzIHJvdyBpcyBmb2xkZWQuXG4gICNcbiAgIyBSZXR1cm5zIGEge0Jvb2xlYW59LlxuICBpc0ZvbGRlZEF0Q3Vyc29yUm93OiAtPlxuICAgIEBpc0ZvbGRlZEF0U2NyZWVuUm93KEBnZXRDdXJzb3JTY3JlZW5Sb3coKSlcblxuICAjIFB1YmxpYzogRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGdpdmVuIHJvdyBpbiBidWZmZXIgY29vcmRpbmF0ZXMgaXMgZm9sZGVkLlxuICAjXG4gICMgYnVmZmVyUm93IC0gQSB7TnVtYmVyfVxuICAjXG4gICMgUmV0dXJucyBhIHtCb29sZWFufS5cbiAgaXNGb2xkZWRBdEJ1ZmZlclJvdzogKGJ1ZmZlclJvdykgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5pc0ZvbGRlZEF0QnVmZmVyUm93KGJ1ZmZlclJvdylcblxuICAjIFB1YmxpYzogRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGdpdmVuIHJvdyBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgaXMgZm9sZGVkLlxuICAjXG4gICMgc2NyZWVuUm93IC0gQSB7TnVtYmVyfVxuICAjXG4gICMgUmV0dXJucyBhIHtCb29sZWFufS5cbiAgaXNGb2xkZWRBdFNjcmVlblJvdzogKHNjcmVlblJvdykgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5pc0ZvbGRlZEF0U2NyZWVuUm93KHNjcmVlblJvdylcblxuICAjIHtEZWxlZ2F0ZXMgdG86IERpc3BsYXlCdWZmZXIubGFyZ2VzdEZvbGRDb250YWluaW5nQnVmZmVyUm93fVxuICBsYXJnZXN0Rm9sZENvbnRhaW5pbmdCdWZmZXJSb3c6IChidWZmZXJSb3cpIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIubGFyZ2VzdEZvbGRDb250YWluaW5nQnVmZmVyUm93KGJ1ZmZlclJvdylcblxuICAjIHtEZWxlZ2F0ZXMgdG86IERpc3BsYXlCdWZmZXIubGFyZ2VzdEZvbGRTdGFydGluZ0F0U2NyZWVuUm93fVxuICBsYXJnZXN0Rm9sZFN0YXJ0aW5nQXRTY3JlZW5Sb3c6IChzY3JlZW5Sb3cpIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIubGFyZ2VzdEZvbGRTdGFydGluZ0F0U2NyZWVuUm93KHNjcmVlblJvdylcblxuICAjIHtEZWxlZ2F0ZXMgdG86IERpc3BsYXlCdWZmZXIub3V0ZXJtb3N0Rm9sZHNGb3JCdWZmZXJSb3dSYW5nZX1cbiAgb3V0ZXJtb3N0Rm9sZHNJbkJ1ZmZlclJvd1JhbmdlOiAoc3RhcnRSb3csIGVuZFJvdykgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5vdXRlcm1vc3RGb2xkc0luQnVmZmVyUm93UmFuZ2Uoc3RhcnRSb3csIGVuZFJvdylcblxuICAjIE1vdmUgbGluZXMgaW50ZXJzZWN0aW9uIHRoZSBtb3N0IHJlY2VudCBzZWxlY3Rpb24gdXAgYnkgb25lIHJvdyBpbiBzY3JlZW5cbiAgIyBjb29yZGluYXRlcy5cbiAgbW92ZUxpbmVVcDogLT5cbiAgICBzZWxlY3Rpb24gPSBAZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpXG4gICAgcmV0dXJuIGlmIHNlbGVjdGlvbi5zdGFydC5yb3cgaXMgMFxuICAgIGxhc3RSb3cgPSBAYnVmZmVyLmdldExhc3RSb3coKVxuICAgIHJldHVybiBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpIGFuZCBzZWxlY3Rpb24uc3RhcnQucm93IGlzIGxhc3RSb3cgYW5kIEBidWZmZXIuZ2V0TGFzdExpbmUoKSBpcyAnJ1xuXG4gICAgQHRyYW5zYWN0ID0+XG4gICAgICBmb2xkZWRSb3dzID0gW11cbiAgICAgIHJvd3MgPSBbc2VsZWN0aW9uLnN0YXJ0LnJvdy4uc2VsZWN0aW9uLmVuZC5yb3ddXG4gICAgICBpZiBzZWxlY3Rpb24uc3RhcnQucm93IGlzbnQgc2VsZWN0aW9uLmVuZC5yb3cgYW5kIHNlbGVjdGlvbi5lbmQuY29sdW1uIGlzIDBcbiAgICAgICAgcm93cy5wb3AoKSB1bmxlc3MgQGlzRm9sZGVkQXRCdWZmZXJSb3coc2VsZWN0aW9uLmVuZC5yb3cpXG5cbiAgICAgICMgTW92ZSBsaW5lIGFyb3VuZCB0aGUgZm9sZCB0aGF0IGlzIGRpcmVjdGx5IGFib3ZlIHRoZSBzZWxlY3Rpb25cbiAgICAgIHByZWNlZGluZ1NjcmVlblJvdyA9IEBzY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKFtzZWxlY3Rpb24uc3RhcnQucm93XSkudHJhbnNsYXRlKFstMV0pXG4gICAgICBwcmVjZWRpbmdCdWZmZXJSb3cgPSBAYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihwcmVjZWRpbmdTY3JlZW5Sb3cpLnJvd1xuICAgICAgaWYgZm9sZCA9IEBsYXJnZXN0Rm9sZENvbnRhaW5pbmdCdWZmZXJSb3cocHJlY2VkaW5nQnVmZmVyUm93KVxuICAgICAgICBpbnNlcnREZWx0YSA9IGZvbGQuZ2V0QnVmZmVyUmFuZ2UoKS5nZXRSb3dDb3VudCgpXG4gICAgICBlbHNlXG4gICAgICAgIGluc2VydERlbHRhID0gMVxuXG4gICAgICBmb3Igcm93IGluIHJvd3NcbiAgICAgICAgaWYgZm9sZCA9IEBkaXNwbGF5QnVmZmVyLmxhcmdlc3RGb2xkU3RhcnRpbmdBdEJ1ZmZlclJvdyhyb3cpXG4gICAgICAgICAgYnVmZmVyUmFuZ2UgPSBmb2xkLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgICBzdGFydFJvdyA9IGJ1ZmZlclJhbmdlLnN0YXJ0LnJvd1xuICAgICAgICAgIGVuZFJvdyA9IGJ1ZmZlclJhbmdlLmVuZC5yb3dcbiAgICAgICAgICBmb2xkZWRSb3dzLnB1c2goc3RhcnRSb3cgLSBpbnNlcnREZWx0YSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHN0YXJ0Um93ID0gcm93XG4gICAgICAgICAgZW5kUm93ID0gcm93XG5cbiAgICAgICAgaW5zZXJ0UG9zaXRpb24gPSBQb2ludC5mcm9tT2JqZWN0KFtzdGFydFJvdyAtIGluc2VydERlbHRhXSlcbiAgICAgICAgZW5kUG9zaXRpb24gPSBQb2ludC5taW4oW2VuZFJvdyArIDFdLCBAYnVmZmVyLmdldEVuZFBvc2l0aW9uKCkpXG4gICAgICAgIGxpbmVzID0gQGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShbW3N0YXJ0Um93XSwgZW5kUG9zaXRpb25dKVxuICAgICAgICBpZiBlbmRQb3NpdGlvbi5yb3cgaXMgbGFzdFJvdyBhbmQgZW5kUG9zaXRpb24uY29sdW1uID4gMCBhbmQgbm90IEBidWZmZXIubGluZUVuZGluZ0ZvclJvdyhlbmRQb3NpdGlvbi5yb3cpXG4gICAgICAgICAgbGluZXMgPSBcIiN7bGluZXN9XFxuXCJcblxuICAgICAgICBAYnVmZmVyLmRlbGV0ZVJvd3Moc3RhcnRSb3csIGVuZFJvdylcblxuICAgICAgICAjIE1ha2Ugc3VyZSB0aGUgaW5zZXJ0ZWQgdGV4dCBkb2Vzbid0IGdvIGludG8gYW4gZXhpc3RpbmcgZm9sZFxuICAgICAgICBpZiBmb2xkID0gQGRpc3BsYXlCdWZmZXIubGFyZ2VzdEZvbGRTdGFydGluZ0F0QnVmZmVyUm93KGluc2VydFBvc2l0aW9uLnJvdylcbiAgICAgICAgICBAdW5mb2xkQnVmZmVyUm93KGluc2VydFBvc2l0aW9uLnJvdylcbiAgICAgICAgICBmb2xkZWRSb3dzLnB1c2goaW5zZXJ0UG9zaXRpb24ucm93ICsgZW5kUm93IC0gc3RhcnRSb3cgKyBmb2xkLmdldEJ1ZmZlclJhbmdlKCkuZ2V0Um93Q291bnQoKSlcblxuICAgICAgICBAYnVmZmVyLmluc2VydChpbnNlcnRQb3NpdGlvbiwgbGluZXMpXG5cbiAgICAgICMgUmVzdG9yZSBmb2xkcyB0aGF0IGV4aXN0ZWQgYmVmb3JlIHRoZSBsaW5lcyB3ZXJlIG1vdmVkXG4gICAgICBmb3IgZm9sZGVkUm93IGluIGZvbGRlZFJvd3Mgd2hlbiAwIDw9IGZvbGRlZFJvdyA8PSBAZ2V0TGFzdEJ1ZmZlclJvdygpXG4gICAgICAgIEBmb2xkQnVmZmVyUm93KGZvbGRlZFJvdylcblxuICAgICAgQHNldFNlbGVjdGVkQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uLnRyYW5zbGF0ZShbLWluc2VydERlbHRhXSksIHByZXNlcnZlRm9sZHM6IHRydWUsIGF1dG9zY3JvbGw6IHRydWUpXG5cbiAgIyBNb3ZlIGxpbmVzIGludGVyc2VjdGluZyB0aGUgbW9zdCByZWNlbnQgc2VsZWN0aW9uIGRvd24gYnkgb25lIHJvdyBpbiBzY3JlZW5cbiAgIyBjb29yZGluYXRlcy5cbiAgbW92ZUxpbmVEb3duOiAtPlxuICAgIHNlbGVjdGlvbiA9IEBnZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKClcbiAgICBsYXN0Um93ID0gQGJ1ZmZlci5nZXRMYXN0Um93KClcbiAgICByZXR1cm4gaWYgc2VsZWN0aW9uLmVuZC5yb3cgaXMgbGFzdFJvd1xuICAgIHJldHVybiBpZiBzZWxlY3Rpb24uZW5kLnJvdyBpcyBsYXN0Um93IC0gMSBhbmQgQGJ1ZmZlci5nZXRMYXN0TGluZSgpIGlzICcnXG5cbiAgICBAdHJhbnNhY3QgPT5cbiAgICAgIGZvbGRlZFJvd3MgPSBbXVxuICAgICAgcm93cyA9IFtzZWxlY3Rpb24uZW5kLnJvdy4uc2VsZWN0aW9uLnN0YXJ0LnJvd11cbiAgICAgIGlmIHNlbGVjdGlvbi5zdGFydC5yb3cgaXNudCBzZWxlY3Rpb24uZW5kLnJvdyBhbmQgc2VsZWN0aW9uLmVuZC5jb2x1bW4gaXMgMFxuICAgICAgICByb3dzLnNoaWZ0KCkgdW5sZXNzIEBpc0ZvbGRlZEF0QnVmZmVyUm93KHNlbGVjdGlvbi5lbmQucm93KVxuXG4gICAgICAjIE1vdmUgbGluZSBhcm91bmQgdGhlIGZvbGQgdGhhdCBpcyBkaXJlY3RseSBiZWxvdyB0aGUgc2VsZWN0aW9uXG4gICAgICBmb2xsb3dpbmdTY3JlZW5Sb3cgPSBAc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihbc2VsZWN0aW9uLmVuZC5yb3ddKS50cmFuc2xhdGUoWzFdKVxuICAgICAgZm9sbG93aW5nQnVmZmVyUm93ID0gQGJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oZm9sbG93aW5nU2NyZWVuUm93KS5yb3dcbiAgICAgIGlmIGZvbGQgPSBAbGFyZ2VzdEZvbGRDb250YWluaW5nQnVmZmVyUm93KGZvbGxvd2luZ0J1ZmZlclJvdylcbiAgICAgICAgaW5zZXJ0RGVsdGEgPSBmb2xkLmdldEJ1ZmZlclJhbmdlKCkuZ2V0Um93Q291bnQoKVxuICAgICAgZWxzZVxuICAgICAgICBpbnNlcnREZWx0YSA9IDFcblxuICAgICAgZm9yIHJvdyBpbiByb3dzXG4gICAgICAgIGlmIGZvbGQgPSBAZGlzcGxheUJ1ZmZlci5sYXJnZXN0Rm9sZFN0YXJ0aW5nQXRCdWZmZXJSb3cocm93KVxuICAgICAgICAgIGJ1ZmZlclJhbmdlID0gZm9sZC5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgICAgc3RhcnRSb3cgPSBidWZmZXJSYW5nZS5zdGFydC5yb3dcbiAgICAgICAgICBlbmRSb3cgPSBidWZmZXJSYW5nZS5lbmQucm93XG4gICAgICAgICAgZm9sZGVkUm93cy5wdXNoKGVuZFJvdyArIGluc2VydERlbHRhKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgc3RhcnRSb3cgPSByb3dcbiAgICAgICAgICBlbmRSb3cgPSByb3dcblxuICAgICAgICBpZiBlbmRSb3cgKyAxIGlzIGxhc3RSb3dcbiAgICAgICAgICBlbmRQb3NpdGlvbiA9IFtlbmRSb3csIEBidWZmZXIubGluZUxlbmd0aEZvclJvdyhlbmRSb3cpXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZW5kUG9zaXRpb24gPSBbZW5kUm93ICsgMV1cbiAgICAgICAgbGluZXMgPSBAYnVmZmVyLmdldFRleHRJblJhbmdlKFtbc3RhcnRSb3ddLCBlbmRQb3NpdGlvbl0pXG4gICAgICAgIEBidWZmZXIuZGVsZXRlUm93cyhzdGFydFJvdywgZW5kUm93KVxuXG4gICAgICAgIGluc2VydFBvc2l0aW9uID0gUG9pbnQubWluKFtzdGFydFJvdyArIGluc2VydERlbHRhXSwgQGJ1ZmZlci5nZXRFbmRQb3NpdGlvbigpKVxuICAgICAgICBpZiBpbnNlcnRQb3NpdGlvbi5yb3cgaXMgQGJ1ZmZlci5nZXRMYXN0Um93KCkgYW5kIGluc2VydFBvc2l0aW9uLmNvbHVtbiA+IDBcbiAgICAgICAgICBsaW5lcyA9IFwiXFxuI3tsaW5lc31cIlxuXG4gICAgICAgICMgTWFrZSBzdXJlIHRoZSBpbnNlcnRlZCB0ZXh0IGRvZXNuJ3QgZ28gaW50byBhbiBleGlzdGluZyBmb2xkXG4gICAgICAgIGlmIGZvbGQgPSBAZGlzcGxheUJ1ZmZlci5sYXJnZXN0Rm9sZFN0YXJ0aW5nQXRCdWZmZXJSb3coaW5zZXJ0UG9zaXRpb24ucm93KVxuICAgICAgICAgIEB1bmZvbGRCdWZmZXJSb3coaW5zZXJ0UG9zaXRpb24ucm93KVxuICAgICAgICAgIGZvbGRlZFJvd3MucHVzaChpbnNlcnRQb3NpdGlvbi5yb3cgKyBmb2xkLmdldEJ1ZmZlclJhbmdlKCkuZ2V0Um93Q291bnQoKSlcblxuICAgICAgICBAYnVmZmVyLmluc2VydChpbnNlcnRQb3NpdGlvbiwgbGluZXMpXG5cbiAgICAgICMgUmVzdG9yZSBmb2xkcyB0aGF0IGV4aXN0ZWQgYmVmb3JlIHRoZSBsaW5lcyB3ZXJlIG1vdmVkXG4gICAgICBmb3IgZm9sZGVkUm93IGluIGZvbGRlZFJvd3Mgd2hlbiAwIDw9IGZvbGRlZFJvdyA8PSBAZ2V0TGFzdEJ1ZmZlclJvdygpXG4gICAgICAgIEBmb2xkQnVmZmVyUm93KGZvbGRlZFJvdylcblxuICAgICAgQHNldFNlbGVjdGVkQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uLnRyYW5zbGF0ZShbaW5zZXJ0RGVsdGFdKSwgcHJlc2VydmVGb2xkczogdHJ1ZSwgYXV0b3Njcm9sbDogdHJ1ZSlcblxuICAjIER1cGxpY2F0ZSB0aGUgbW9zdCByZWNlbnQgY3Vyc29yJ3MgY3VycmVudCBsaW5lLlxuICBkdXBsaWNhdGVMaW5lczogLT5cbiAgICBAdHJhbnNhY3QgPT5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpLnJldmVyc2UoKVxuICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgICAgIHtzdGFydH0gPSBzZWxlY3Rpb24uZ2V0U2NyZWVuUmFuZ2UoKVxuICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3RUb1NjcmVlblBvc2l0aW9uKFtzdGFydC5yb3cgKyAxLCAwXSlcblxuICAgICAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgICAgICBlbmRSb3crK1xuXG4gICAgICAgIGZvbGRlZFJvd1JhbmdlcyA9XG4gICAgICAgICAgQG91dGVybW9zdEZvbGRzSW5CdWZmZXJSb3dSYW5nZShzdGFydFJvdywgZW5kUm93KVxuICAgICAgICAgICAgLm1hcCAoZm9sZCkgLT4gZm9sZC5nZXRCdWZmZXJSb3dSYW5nZSgpXG5cbiAgICAgICAgcmFuZ2VUb0R1cGxpY2F0ZSA9IFtbc3RhcnRSb3csIDBdLCBbZW5kUm93LCAwXV1cbiAgICAgICAgdGV4dFRvRHVwbGljYXRlID0gQGdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlVG9EdXBsaWNhdGUpXG4gICAgICAgIHRleHRUb0R1cGxpY2F0ZSA9ICdcXG4nICsgdGV4dFRvRHVwbGljYXRlIGlmIGVuZFJvdyA+IEBnZXRMYXN0QnVmZmVyUm93KClcbiAgICAgICAgQGJ1ZmZlci5pbnNlcnQoW2VuZFJvdywgMF0sIHRleHRUb0R1cGxpY2F0ZSlcblxuICAgICAgICBkZWx0YSA9IGVuZFJvdyAtIHN0YXJ0Um93XG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShzZWxlY3RlZEJ1ZmZlclJhbmdlLnRyYW5zbGF0ZShbZGVsdGEsIDBdKSlcbiAgICAgICAgZm9yIFtmb2xkU3RhcnRSb3csIGZvbGRFbmRSb3ddIGluIGZvbGRlZFJvd1Jhbmdlc1xuICAgICAgICAgIEBjcmVhdGVGb2xkKGZvbGRTdGFydFJvdyArIGRlbHRhLCBmb2xkRW5kUm93ICsgZGVsdGEpXG5cbiAgIyBEZXByZWNhdGVkOiBVc2Ugezo6ZHVwbGljYXRlTGluZXN9IGluc3RlYWQuXG4gIGR1cGxpY2F0ZUxpbmU6IC0+XG4gICAgZGVwcmVjYXRlKFwiVXNlIEVkaXRvcjo6ZHVwbGljYXRlTGluZXMoKSBpbnN0ZWFkXCIpXG4gICAgQGR1cGxpY2F0ZUxpbmVzKClcblxuICAjIFB1YmxpYzogTXV0YXRlIHRoZSB0ZXh0IG9mIGFsbCB0aGUgc2VsZWN0aW9ucyBpbiBhIHNpbmdsZSB0cmFuc2FjdGlvbi5cbiAgI1xuICAjIEFsbCB0aGUgY2hhbmdlcyBtYWRlIGluc2lkZSB0aGUgZ2l2ZW4ge0Z1bmN0aW9ufSBjYW4gYmUgcmV2ZXJ0ZWQgd2l0aCBhXG4gICMgc2luZ2xlIGNhbGwgdG8gezo6dW5kb30uXG4gICNcbiAgIyBmbiAtIEEge0Z1bmN0aW9ufSB0aGF0IHdpbGwgYmUgY2FsbGVkIHdpdGggZWFjaCB7U2VsZWN0aW9ufS5cbiAgbXV0YXRlU2VsZWN0ZWRUZXh0OiAoZm4pIC0+XG4gICAgQHRyYW5zYWN0ID0+IGZuKHNlbGVjdGlvbixpbmRleCkgZm9yIHNlbGVjdGlvbixpbmRleCBpbiBAZ2V0U2VsZWN0aW9ucygpXG5cbiAgcmVwbGFjZVNlbGVjdGVkVGV4dDogKG9wdGlvbnM9e30sIGZuKSAtPlxuICAgIHtzZWxlY3RXb3JkSWZFbXB0eX0gPSBvcHRpb25zXG4gICAgQG11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSAtPlxuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgaWYgc2VsZWN0V29yZElmRW1wdHkgYW5kIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgICAgc2VsZWN0aW9uLnNlbGVjdFdvcmQoKVxuICAgICAgdGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgIHNlbGVjdGlvbi5kZWxldGVTZWxlY3RlZFRleHQoKVxuICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoZm4odGV4dCkpXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUge0Rpc3BsYXlCdWZmZXJNYXJrZXJ9IGZvciB0aGUgZ2l2ZW4gbWFya2VyIGlkLlxuICBnZXRNYXJrZXI6IChpZCkgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5nZXRNYXJrZXIoaWQpXG5cbiAgIyBQdWJsaWM6IEdldCBhbGwge0Rpc3BsYXlCdWZmZXJNYXJrZXJ9cy5cbiAgZ2V0TWFya2VyczogLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5nZXRNYXJrZXJzKClcblxuICAjIFB1YmxpYzogRmluZCBhbGwge0Rpc3BsYXlCdWZmZXJNYXJrZXJ9cyB0aGF0IG1hdGNoIHRoZSBnaXZlbiBwcm9wZXJ0aWVzLlxuICAjXG4gICMgVGhpcyBtZXRob2QgZmluZHMgbWFya2VycyBiYXNlZCBvbiB0aGUgZ2l2ZW4gcHJvcGVydGllcy4gTWFya2VycyBjYW4gYmVcbiAgIyBhc3NvY2lhdGVkIHdpdGggY3VzdG9tIHByb3BlcnRpZXMgdGhhdCB3aWxsIGJlIGNvbXBhcmVkIHdpdGggYmFzaWMgZXF1YWxpdHkuXG4gICMgSW4gYWRkaXRpb24sIHRoZXJlIGFyZSBzZXZlcmFsIHNwZWNpYWwgcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgY29tcGFyZWRcbiAgIyB3aXRoIHRoZSByYW5nZSBvZiB0aGUgbWFya2VycyByYXRoZXIgdGhhbiB0aGVpciBwcm9wZXJ0aWVzLlxuICAjXG4gICMgcHJvcGVydGllcyAtIEFuIHtPYmplY3R9IGNvbnRhaW5pbmcgcHJvcGVydGllcyB0aGF0IGVhY2ggcmV0dXJuZWQgbWFya2VyXG4gICMgICBtdXN0IHNhdGlzZnkuIE1hcmtlcnMgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCBjdXN0b20gcHJvcGVydGllcywgd2hpY2ggYXJlXG4gICMgICBjb21wYXJlZCB3aXRoIGJhc2ljIGVxdWFsaXR5LiBJbiBhZGRpdGlvbiwgc2V2ZXJhbCByZXNlcnZlZCBwcm9wZXJ0aWVzXG4gICMgICBjYW4gYmUgdXNlZCB0byBmaWx0ZXIgbWFya2VycyBiYXNlZCBvbiB0aGVpciBjdXJyZW50IHJhbmdlOlxuICAjICAgICA6c3RhcnRCdWZmZXJSb3cgLSBPbmx5IGluY2x1ZGUgbWFya2VycyBzdGFydGluZyBhdCB0aGlzIHJvdyBpbiBidWZmZXJcbiAgIyAgICAgICBjb29yZGluYXRlcy5cbiAgIyAgICAgOmVuZEJ1ZmZlclJvdyAtIE9ubHkgaW5jbHVkZSBtYXJrZXJzIGVuZGluZyBhdCB0aGlzIHJvdyBpbiBidWZmZXJcbiAgIyAgICAgICBjb29yZGluYXRlcy5cbiAgIyAgICAgOmNvbnRhaW5zQnVmZmVyUmFuZ2UgLSBPbmx5IGluY2x1ZGUgbWFya2VycyBjb250YWluaW5nIHRoaXMge1JhbmdlfSBvclxuICAjICAgICAgIGluIHJhbmdlLWNvbXBhdGlibGUge0FycmF5fSBpbiBidWZmZXIgY29vcmRpbmF0ZXMuXG4gICMgICAgIDpjb250YWluc0J1ZmZlclBvc2l0aW9uIC0gT25seSBpbmNsdWRlIG1hcmtlcnMgY29udGFpbmluZyB0aGlzIHtQb2ludH1cbiAgIyAgICAgICBvciB7QXJyYXl9IG9mIGBbcm93LCBjb2x1bW5dYCBpbiBidWZmZXIgY29vcmRpbmF0ZXMuXG4gIGZpbmRNYXJrZXJzOiAocHJvcGVydGllcykgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5maW5kTWFya2Vycyhwcm9wZXJ0aWVzKVxuXG4gICMgUHVibGljOiBNYXJrIHRoZSBnaXZlbiByYW5nZSBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gICNcbiAgIyByYW5nZSAtIEEge1JhbmdlfSBvciByYW5nZS1jb21wYXRpYmxlIHtBcnJheX0uXG4gICMgb3B0aW9ucyAtIFNlZSB7VGV4dEJ1ZmZlcjo6bWFya1JhbmdlfS5cbiAgI1xuICAjIFJldHVybnMgYSB7RGlzcGxheUJ1ZmZlck1hcmtlcn0uXG4gIG1hcmtTY3JlZW5SYW5nZTogKGFyZ3MuLi4pIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIubWFya1NjcmVlblJhbmdlKGFyZ3MuLi4pXG5cbiAgIyBQdWJsaWM6IE1hcmsgdGhlIGdpdmVuIHJhbmdlIGluIGJ1ZmZlciBjb29yZGluYXRlcy5cbiAgI1xuICAjIHJhbmdlIC0gQSB7UmFuZ2V9IG9yIHJhbmdlLWNvbXBhdGlibGUge0FycmF5fS5cbiAgIyBvcHRpb25zIC0gU2VlIHtUZXh0QnVmZmVyOjptYXJrUmFuZ2V9LlxuICAjXG4gICMgUmV0dXJucyBhIHtEaXNwbGF5QnVmZmVyTWFya2VyfS5cbiAgbWFya0J1ZmZlclJhbmdlOiAoYXJncy4uLikgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5tYXJrQnVmZmVyUmFuZ2UoYXJncy4uLilcblxuICAjIFB1YmxpYzogTWFyayB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzLlxuICAjXG4gICMgcG9zaXRpb24gLSBBIHtQb2ludH0gb3Ige0FycmF5fSBvZiBgW3JvdywgY29sdW1uXWAuXG4gICMgb3B0aW9ucyAtIFNlZSB7VGV4dEJ1ZmZlcjo6bWFya1JhbmdlfS5cbiAgI1xuICAjIFJldHVybnMgYSB7RGlzcGxheUJ1ZmZlck1hcmtlcn0uXG4gIG1hcmtTY3JlZW5Qb3NpdGlvbjogKGFyZ3MuLi4pIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIubWFya1NjcmVlblBvc2l0aW9uKGFyZ3MuLi4pXG5cbiAgIyBQdWJsaWM6IE1hcmsgdGhlIGdpdmVuIHBvc2l0aW9uIGluIGJ1ZmZlciBjb29yZGluYXRlcy5cbiAgI1xuICAjIHBvc2l0aW9uIC0gQSB7UG9pbnR9IG9yIHtBcnJheX0gb2YgYFtyb3csIGNvbHVtbl1gLlxuICAjIG9wdGlvbnMgLSBTZWUge1RleHRCdWZmZXI6Om1hcmtSYW5nZX0uXG4gICNcbiAgIyBSZXR1cm5zIGEge0Rpc3BsYXlCdWZmZXJNYXJrZXJ9LlxuICBtYXJrQnVmZmVyUG9zaXRpb246IChhcmdzLi4uKSAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLm1hcmtCdWZmZXJQb3NpdGlvbihhcmdzLi4uKVxuXG4gICMge0RlbGVnYXRlcyB0bzogRGlzcGxheUJ1ZmZlci5kZXN0cm95TWFya2VyfVxuICBkZXN0cm95TWFya2VyOiAoYXJncy4uLikgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5kZXN0cm95TWFya2VyKGFyZ3MuLi4pXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgbnVtYmVyIG9mIG1hcmtlcnMgaW4gdGhpcyBlZGl0b3IncyBidWZmZXIuXG4gICNcbiAgIyBSZXR1cm5zIGEge051bWJlcn0uXG4gIGdldE1hcmtlckNvdW50OiAtPlxuICAgIEBidWZmZXIuZ2V0TWFya2VyQ291bnQoKVxuXG4gICMgUHVibGljOiBEZXRlcm1pbmUgaWYgdGhlcmUgYXJlIG11bHRpcGxlIGN1cnNvcnMuXG4gIGhhc011bHRpcGxlQ3Vyc29yczogLT5cbiAgICBAZ2V0Q3Vyc29ycygpLmxlbmd0aCA+IDFcblxuICAjIFB1YmxpYzogR2V0IGFuIEFycmF5IG9mIGFsbCB7Q3Vyc29yfXMuXG4gIGdldEN1cnNvcnM6IC0+IG5ldyBBcnJheShAY3Vyc29ycy4uLilcblxuICAjIFB1YmxpYzogR2V0IHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIHtDdXJzb3J9LlxuICBnZXRDdXJzb3I6IC0+XG4gICAgXy5sYXN0KEBjdXJzb3JzKVxuXG4gICMgUHVibGljOiBBZGQgYSBjdXJzb3IgYXQgdGhlIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgI1xuICAjIFJldHVybnMgYSB7Q3Vyc29yfS5cbiAgYWRkQ3Vyc29yQXRTY3JlZW5Qb3NpdGlvbjogKHNjcmVlblBvc2l0aW9uKSAtPlxuICAgIEBtYXJrU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24sIEBnZXRTZWxlY3Rpb25NYXJrZXJBdHRyaWJ1dGVzKCkpXG4gICAgQGdldExhc3RTZWxlY3Rpb24oKS5jdXJzb3JcblxuICAjIFB1YmxpYzogQWRkIGEgY3Vyc29yIGF0IHRoZSBnaXZlbiBwb3NpdGlvbiBpbiBidWZmZXIgY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBSZXR1cm5zIGEge0N1cnNvcn0uXG4gIGFkZEN1cnNvckF0QnVmZmVyUG9zaXRpb246IChidWZmZXJQb3NpdGlvbikgLT5cbiAgICBAbWFya0J1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uLCBAZ2V0U2VsZWN0aW9uTWFya2VyQXR0cmlidXRlcygpKVxuICAgIEBnZXRMYXN0U2VsZWN0aW9uKCkuY3Vyc29yXG5cbiAgIyBBZGQgYSBjdXJzb3IgYmFzZWQgb24gdGhlIGdpdmVuIHtEaXNwbGF5QnVmZmVyTWFya2VyfS5cbiAgYWRkQ3Vyc29yOiAobWFya2VyKSAtPlxuICAgIGN1cnNvciA9IG5ldyBDdXJzb3IoZWRpdG9yOiB0aGlzLCBtYXJrZXI6IG1hcmtlcilcbiAgICBAY3Vyc29ycy5wdXNoKGN1cnNvcilcbiAgICBAZW1pdCAnY3Vyc29yLWFkZGVkJywgY3Vyc29yXG4gICAgY3Vyc29yXG5cbiAgIyBSZW1vdmUgdGhlIGdpdmVuIGN1cnNvciBmcm9tIHRoaXMgZWRpdG9yLlxuICByZW1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgXy5yZW1vdmUoQGN1cnNvcnMsIGN1cnNvcilcblxuICAjIEFkZCBhIHtTZWxlY3Rpb259IGJhc2VkIG9uIHRoZSBnaXZlbiB7RGlzcGxheUJ1ZmZlck1hcmtlcn0uXG4gICNcbiAgIyBtYXJrZXIgIC0gVGhlIHtEaXNwbGF5QnVmZmVyTWFya2VyfSB0byBoaWdobGlnaHRcbiAgIyBvcHRpb25zIC0gQW4ge09iamVjdH0gdGhhdCBwZXJ0YWlucyB0byB0aGUge1NlbGVjdGlvbn0gY29uc3RydWN0b3IuXG4gICNcbiAgIyBSZXR1cm5zIHRoZSBuZXcge1NlbGVjdGlvbn0uXG4gIGFkZFNlbGVjdGlvbjogKG1hcmtlciwgb3B0aW9ucz17fSkgLT5cbiAgICB1bmxlc3MgbWFya2VyLmdldEF0dHJpYnV0ZXMoKS5wcmVzZXJ2ZUZvbGRzXG4gICAgICBAZGVzdHJveUZvbGRzSW50ZXJzZWN0aW5nQnVmZmVyUmFuZ2UobWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpXG4gICAgY3Vyc29yID0gQGFkZEN1cnNvcihtYXJrZXIpXG4gICAgc2VsZWN0aW9uID0gbmV3IFNlbGVjdGlvbihfLmV4dGVuZCh7ZWRpdG9yOiB0aGlzLCBtYXJrZXIsIGN1cnNvcn0sIG9wdGlvbnMpKVxuICAgIEBzZWxlY3Rpb25zLnB1c2goc2VsZWN0aW9uKVxuICAgIHNlbGVjdGlvbkJ1ZmZlclJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBAbWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICBpZiBzZWxlY3Rpb24uZGVzdHJveWVkXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKClcbiAgICAgICAgaWYgc2VsZWN0aW9uLmludGVyc2VjdHNCdWZmZXJSYW5nZShzZWxlY3Rpb25CdWZmZXJSYW5nZSlcbiAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uXG4gICAgZWxzZVxuICAgICAgQGVtaXQgJ3NlbGVjdGlvbi1hZGRlZCcsIHNlbGVjdGlvblxuICAgICAgc2VsZWN0aW9uXG5cbiAgIyBQdWJsaWM6IEFkZCBhIHNlbGVjdGlvbiBmb3IgdGhlIGdpdmVuIHJhbmdlIGluIGJ1ZmZlciBjb29yZGluYXRlcy5cbiAgI1xuICAjIGJ1ZmZlclJhbmdlIC0gQSB7UmFuZ2V9XG4gICMgb3B0aW9ucyAtIEFuIG9wdGlvbnMge09iamVjdH06XG4gICMgICA6cmV2ZXJzZWQgLSBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gY3JlYXRlIHRoZSBzZWxlY3Rpb24gaW4gYVxuICAjICAgICByZXZlcnNlZCBvcmllbnRhdGlvbi5cbiAgI1xuICAjIFJldHVybnMgdGhlIGFkZGVkIHtTZWxlY3Rpb259LlxuICBhZGRTZWxlY3Rpb25Gb3JCdWZmZXJSYW5nZTogKGJ1ZmZlclJhbmdlLCBvcHRpb25zPXt9KSAtPlxuICAgIEBtYXJrQnVmZmVyUmFuZ2UoYnVmZmVyUmFuZ2UsIF8uZGVmYXVsdHMoQGdldFNlbGVjdGlvbk1hcmtlckF0dHJpYnV0ZXMoKSwgb3B0aW9ucykpXG4gICAgQGdldExhc3RTZWxlY3Rpb24oKVxuXG4gICMgUHVibGljOiBTZXQgdGhlIHNlbGVjdGVkIHJhbmdlIGluIGJ1ZmZlciBjb29yZGluYXRlcy4gSWYgdGhlcmUgYXJlIG11bHRpcGxlXG4gICMgc2VsZWN0aW9ucywgdGhleSBhcmUgcmVkdWNlZCB0byBhIHNpbmdsZSBzZWxlY3Rpb24gd2l0aCB0aGUgZ2l2ZW4gcmFuZ2UuXG4gICNcbiAgIyBidWZmZXJSYW5nZSAtIEEge1JhbmdlfSBvciByYW5nZS1jb21wYXRpYmxlIHtBcnJheX0uXG4gICMgb3B0aW9ucyAtIEFuIG9wdGlvbnMge09iamVjdH06XG4gICMgICA6cmV2ZXJzZWQgLSBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gY3JlYXRlIHRoZSBzZWxlY3Rpb24gaW4gYVxuICAjICAgICByZXZlcnNlZCBvcmllbnRhdGlvbi5cbiAgc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZTogKGJ1ZmZlclJhbmdlLCBvcHRpb25zKSAtPlxuICAgIEBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhbYnVmZmVyUmFuZ2VdLCBvcHRpb25zKVxuXG4gICMgUHVibGljOiBTZXQgdGhlIHNlbGVjdGVkIHJhbmdlIGluIHNjcmVlbiBjb29yZGluYXRlcy4gSWYgdGhlcmUgYXJlIG11bHRpcGxlXG4gICMgc2VsZWN0aW9ucywgdGhleSBhcmUgcmVkdWNlZCB0byBhIHNpbmdsZSBzZWxlY3Rpb24gd2l0aCB0aGUgZ2l2ZW4gcmFuZ2UuXG4gICNcbiAgIyBzY3JlZW5SYW5nZSAtIEEge1JhbmdlfSBvciByYW5nZS1jb21wYXRpYmxlIHtBcnJheX0uXG4gICMgb3B0aW9ucyAtIEFuIG9wdGlvbnMge09iamVjdH06XG4gICMgICA6cmV2ZXJzZWQgLSBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gY3JlYXRlIHRoZSBzZWxlY3Rpb24gaW4gYVxuICAjICAgICByZXZlcnNlZCBvcmllbnRhdGlvbi5cbiAgc2V0U2VsZWN0ZWRTY3JlZW5SYW5nZTogKHNjcmVlblJhbmdlLCBvcHRpb25zKSAtPlxuICAgIEBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKEBidWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKHNjcmVlblJhbmdlLCBvcHRpb25zKSwgb3B0aW9ucylcblxuICAjIFB1YmxpYzogU2V0IHRoZSBzZWxlY3RlZCByYW5nZXMgaW4gYnVmZmVyIGNvb3JkaW5hdGVzLiBJZiB0aGVyZSBhcmUgbXVsdGlwbGVcbiAgIyBzZWxlY3Rpb25zLCB0aGV5IGFyZSByZXBsYWNlZCBieSBuZXcgc2VsZWN0aW9ucyB3aXRoIHRoZSBnaXZlbiByYW5nZXMuXG4gICNcbiAgIyBidWZmZXJSYW5nZXMgLSBBbiB7QXJyYXl9IG9mIHtSYW5nZX1zIG9yIHJhbmdlLWNvbXBhdGlibGUge0FycmF5fXMuXG4gICMgb3B0aW9ucyAtIEFuIG9wdGlvbnMge09iamVjdH06XG4gICMgICA6cmV2ZXJzZWQgLSBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gY3JlYXRlIHRoZSBzZWxlY3Rpb24gaW4gYVxuICAjICAgICByZXZlcnNlZCBvcmllbnRhdGlvbi5cbiAgc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXM6IChidWZmZXJSYW5nZXMsIG9wdGlvbnM9e30pIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUGFzc2VkIGFuIGVtcHR5IGFycmF5IHRvIHNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzXCIpIHVubGVzcyBidWZmZXJSYW5nZXMubGVuZ3RoXG5cbiAgICBzZWxlY3Rpb25zID0gQGdldFNlbGVjdGlvbnMoKVxuICAgIHNlbGVjdGlvbi5kZXN0cm95KCkgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zW2J1ZmZlclJhbmdlcy5sZW5ndGguLi5dXG5cbiAgICBAbWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zIG9wdGlvbnMsID0+XG4gICAgICBmb3IgYnVmZmVyUmFuZ2UsIGkgaW4gYnVmZmVyUmFuZ2VzXG4gICAgICAgIGJ1ZmZlclJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChidWZmZXJSYW5nZSlcbiAgICAgICAgaWYgc2VsZWN0aW9uc1tpXVxuICAgICAgICAgIHNlbGVjdGlvbnNbaV0uc2V0QnVmZmVyUmFuZ2UoYnVmZmVyUmFuZ2UsIG9wdGlvbnMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UoYnVmZmVyUmFuZ2UsIG9wdGlvbnMpXG5cbiAgIyBSZW1vdmUgdGhlIGdpdmVuIHNlbGVjdGlvbi5cbiAgcmVtb3ZlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIF8ucmVtb3ZlKEBzZWxlY3Rpb25zLCBzZWxlY3Rpb24pXG4gICAgQGVtaXQgJ3NlbGVjdGlvbi1yZW1vdmVkJywgc2VsZWN0aW9uXG5cbiAgIyBSZWR1Y2Ugb25lIG9yIG1vcmUgc2VsZWN0aW9ucyB0byBhIHNpbmdsZSBlbXB0eSBzZWxlY3Rpb24gYmFzZWQgb24gdGhlIG1vc3RcbiAgIyByZWNlbnRseSBhZGRlZCBjdXJzb3IuXG4gIGNsZWFyU2VsZWN0aW9uczogLT5cbiAgICBAY29uc29saWRhdGVTZWxlY3Rpb25zKClcbiAgICBAZ2V0U2VsZWN0aW9uKCkuY2xlYXIoKVxuXG4gICMgUmVkdWNlIG11bHRpcGxlIHNlbGVjdGlvbnMgdG8gdGhlIG1vc3QgcmVjZW50bHkgYWRkZWQgc2VsZWN0aW9uLlxuICBjb25zb2xpZGF0ZVNlbGVjdGlvbnM6IC0+XG4gICAgc2VsZWN0aW9ucyA9IEBnZXRTZWxlY3Rpb25zKClcbiAgICBpZiBzZWxlY3Rpb25zLmxlbmd0aCA+IDFcbiAgICAgIHNlbGVjdGlvbi5kZXN0cm95KCkgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zWzAuLi4tMV1cbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIHNlbGVjdGlvblNjcmVlblJhbmdlQ2hhbmdlZDogKHNlbGVjdGlvbikgLT5cbiAgICBAZW1pdCAnc2VsZWN0aW9uLXNjcmVlbi1yYW5nZS1jaGFuZ2VkJywgc2VsZWN0aW9uXG5cbiAgIyBQdWJsaWM6IEdldCBjdXJyZW50IHtTZWxlY3Rpb259cy5cbiAgI1xuICAjIFJldHVybnM6IEFuIHtBcnJheX0gb2Yge1NlbGVjdGlvbn1zLlxuICBnZXRTZWxlY3Rpb25zOiAtPiBuZXcgQXJyYXkoQHNlbGVjdGlvbnMuLi4pXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgbW9zdCByZWNlbnQge1NlbGVjdGlvbn0gb3IgdGhlIHNlbGVjdGlvbiBhdCB0aGUgZ2l2ZW5cbiAgIyBpbmRleC5cbiAgI1xuICAjIGluZGV4IC0gT3B0aW9uYWwuIFRoZSBpbmRleCBvZiB0aGUgc2VsZWN0aW9uIHRvIHJldHVybiwgYmFzZWQgb24gdGhlIG9yZGVyXG4gICMgICBpbiB3aGljaCB0aGUgc2VsZWN0aW9ucyB3ZXJlIGFkZGVkLlxuICAjXG4gICMgUmV0dXJucyBhIHtTZWxlY3Rpb259LlxuICAjIG9yIHRoZSAgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgZ2V0U2VsZWN0aW9uOiAoaW5kZXgpIC0+XG4gICAgaW5kZXggPz0gQHNlbGVjdGlvbnMubGVuZ3RoIC0gMVxuICAgIEBzZWxlY3Rpb25zW2luZGV4XVxuXG4gICMgUHVibGljOiBHZXQgdGhlIG1vc3QgcmVjZW50bHkgYWRkZWQge1NlbGVjdGlvbn0uXG4gICNcbiAgIyBSZXR1cm5zIGEge1NlbGVjdGlvbn0uXG4gIGdldExhc3RTZWxlY3Rpb246IC0+XG4gICAgXy5sYXN0KEBzZWxlY3Rpb25zKVxuXG4gICMgUHVibGljOiBHZXQgYWxsIHtTZWxlY3Rpb259cywgb3JkZXJlZCBieSB0aGVpciBwb3NpdGlvbiBpbiB0aGUgYnVmZmVyXG4gICMgaW5zdGVhZCBvZiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSB3ZXJlIGFkZGVkLlxuICAjXG4gICMgUmV0dXJucyBhbiB7QXJyYXl9IG9mIHtTZWxlY3Rpb259cy5cbiAgZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEBnZXRTZWxlY3Rpb25zKCkuc29ydCAoYSwgYikgLT4gYS5jb21wYXJlKGIpXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgbGFzdCB7U2VsZWN0aW9ufSBiYXNlZCBvbiBpdHMgcG9zaXRpb24gaW4gdGhlIGJ1ZmZlci5cbiAgI1xuICAjIFJldHVybnMgYSB7U2VsZWN0aW9ufS5cbiAgZ2V0TGFzdFNlbGVjdGlvbkluQnVmZmVyOiAtPlxuICAgIF8ubGFzdChAZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgIyBQdWJsaWM6IERldGVybWluZSBpZiBhIGdpdmVuIHJhbmdlIGluIGJ1ZmZlciBjb29yZGluYXRlcyBpbnRlcnNlY3RzIGFcbiAgIyBzZWxlY3Rpb24uXG4gICNcbiAgIyBidWZmZXJSYW5nZSAtIEEge1JhbmdlfSBvciByYW5nZS1jb21wdGF0aWJsZSB7QXJyYXl9LlxuICAjXG4gICMgUmV0dXJucyBhIHtCb29sZWFufS5cbiAgc2VsZWN0aW9uSW50ZXJzZWN0c0J1ZmZlclJhbmdlOiAoYnVmZmVyUmFuZ2UpIC0+XG4gICAgXy5hbnkgQGdldFNlbGVjdGlvbnMoKSwgKHNlbGVjdGlvbikgLT5cbiAgICAgIHNlbGVjdGlvbi5pbnRlcnNlY3RzQnVmZmVyUmFuZ2UoYnVmZmVyUmFuZ2UpXG5cbiAgIyBQdWJsaWM6IE1vdmUgdGhlIGN1cnNvciB0byB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzLlxuICAjXG4gICMgSWYgdGhlcmUgYXJlIG11bHRpcGxlIGN1cnNvcnMsIHRoZXkgd2lsbCBiZSBjb25zb2xpZGF0ZWQgdG8gYSBzaW5nbGUgY3Vyc29yLlxuICAjXG4gICMgcG9zaXRpb24gLSBBIHtQb2ludH0gb3Ige0FycmF5fSBvZiBgW3JvdywgY29sdW1uXWBcbiAgIyBvcHRpb25zICAtIEFuIHtPYmplY3R9IGNvbWJpbmluZyBvcHRpb25zIGZvciB7OjpjbGlwU2NyZWVuUG9zaXRpb259IHdpdGg6XG4gICMgICA6YXV0b3Njcm9sbCAtIERldGVybWluZXMgd2hldGhlciB0aGUgZWRpdG9yIHNjcm9sbHMgdG8gdGhlIG5ldyBjdXJzb3Inc1xuICAjICAgICBwb3NpdGlvbi4gRGVmYXVsdHMgdG8gdHJ1ZS5cbiAgc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb246IChwb3NpdGlvbiwgb3B0aW9ucykgLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKHBvc2l0aW9uLCBvcHRpb25zKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIGN1cnNvciBpbiBzY3JlZW5cbiAgIyBjb29yZGluYXRlcy5cbiAgI1xuICAjIFJldHVybnMgYSB7UG9pbnR9LlxuICBnZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbjogLT5cbiAgICBAZ2V0Q3Vyc29yKCkuZ2V0U2NyZWVuUG9zaXRpb24oKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHJvdyBvZiB0aGUgbW9zdCByZWNlbnRseSBhZGRlZCBjdXJzb3IgaW4gc2NyZWVuIGNvb3JkaW5hdGVzLlxuICAjXG4gICMgUmV0dXJucyB0aGUgc2NyZWVuIHJvdyB7TnVtYmVyfS5cbiAgZ2V0Q3Vyc29yU2NyZWVuUm93OiAtPlxuICAgIEBnZXRDdXJzb3IoKS5nZXRTY3JlZW5Sb3coKVxuXG4gICMgUHVibGljOiBNb3ZlIHRoZSBjdXJzb3IgdG8gdGhlIGdpdmVuIHBvc2l0aW9uIGluIGJ1ZmZlciBjb29yZGluYXRlcy5cbiAgI1xuICAjIElmIHRoZXJlIGFyZSBtdWx0aXBsZSBjdXJzb3JzLCB0aGV5IHdpbGwgYmUgY29uc29saWRhdGVkIHRvIGEgc2luZ2xlIGN1cnNvci5cbiAgI1xuICAjIHBvc2l0aW9uIC0gQSB7UG9pbnR9IG9yIHtBcnJheX0gb2YgYFtyb3csIGNvbHVtbl1gXG4gICMgb3B0aW9ucyAgLSBBbiB7T2JqZWN0fSBjb21iaW5pbmcgb3B0aW9ucyBmb3Igezo6Y2xpcFNjcmVlblBvc2l0aW9ufSB3aXRoOlxuICAjICAgOmF1dG9zY3JvbGwgLSBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGVkaXRvciBzY3JvbGxzIHRvIHRoZSBuZXcgY3Vyc29yJ3NcbiAgIyAgICAgcG9zaXRpb24uIERlZmF1bHRzIHRvIHRydWUuXG4gIHNldEN1cnNvckJ1ZmZlclBvc2l0aW9uOiAocG9zaXRpb24sIG9wdGlvbnMpIC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb3NpdGlvbiwgb3B0aW9ucylcblxuICAjIFB1YmxpYzogR2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbW9zdCByZWNlbnRseSBhZGRlZCBjdXJzb3IgaW4gYnVmZmVyXG4gICMgY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBSZXR1cm5zIGEge1BvaW50fS5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb246IC0+XG4gICAgQGdldEN1cnNvcigpLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAjIFB1YmxpYzogR2V0IHRoZSB7UmFuZ2V9IG9mIHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIHNlbGVjdGlvbiBpbiBzY3JlZW5cbiAgIyBjb29yZGluYXRlcy5cbiAgI1xuICAjIFJldHVybnMgYSB7UmFuZ2V9LlxuICBnZXRTZWxlY3RlZFNjcmVlblJhbmdlOiAtPlxuICAgIEBnZXRMYXN0U2VsZWN0aW9uKCkuZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHtSYW5nZX0gb2YgdGhlIG1vc3QgcmVjZW50bHkgYWRkZWQgc2VsZWN0aW9uIGluIGJ1ZmZlclxuICAjIGNvb3JkaW5hdGVzLlxuICAjXG4gICMgUmV0dXJucyBhIHtSYW5nZX0uXG4gIGdldFNlbGVjdGVkQnVmZmVyUmFuZ2U6IC0+XG4gICAgQGdldExhc3RTZWxlY3Rpb24oKS5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUge1JhbmdlfXMgb2YgYWxsIHNlbGVjdGlvbnMgaW4gYnVmZmVyIGNvb3JkaW5hdGVzLlxuICAjXG4gICMgVGhlIHJhbmdlcyBhcmUgc29ydGVkIGJ5IHRoZWlyIHBvc2l0aW9uIGluIHRoZSBidWZmZXIuXG4gICNcbiAgIyBSZXR1cm5zIGFuIHtBcnJheX0gb2Yge1JhbmdlfXMuXG4gIGdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzOiAtPlxuICAgIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpIGZvciBzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUge1JhbmdlfXMgb2YgYWxsIHNlbGVjdGlvbnMgaW4gc2NyZWVuIGNvb3JkaW5hdGVzLlxuICAjXG4gICMgVGhlIHJhbmdlcyBhcmUgc29ydGVkIGJ5IHRoZWlyIHBvc2l0aW9uIGluIHRoZSBidWZmZXIuXG4gICNcbiAgIyBSZXR1cm5zIGFuIHtBcnJheX0gb2Yge1JhbmdlfXMuXG4gIGdldFNlbGVjdGVkU2NyZWVuUmFuZ2VzOiAtPlxuICAgIHNlbGVjdGlvbi5nZXRTY3JlZW5SYW5nZSgpIGZvciBzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgc2VsZWN0ZWQgdGV4dCBvZiB0aGUgbW9zdCByZWNlbnRseSBhZGRlZCBzZWxlY3Rpb24uXG4gICNcbiAgIyBSZXR1cm5zIGEge1N0cmluZ30uXG4gIGdldFNlbGVjdGVkVGV4dDogLT5cbiAgICBAZ2V0TGFzdFNlbGVjdGlvbigpLmdldFRleHQoKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHRleHQgaW4gdGhlIGdpdmVuIHtSYW5nZX0gaW4gYnVmZmVyIGNvb3JkaW5hdGVzLlxuICAjXG4gICMgcmFuZ2UgLSBBIHtSYW5nZX0gb3IgcmFuZ2UtY29tcGF0aWJsZSB7QXJyYXl9LlxuICAjXG4gICMgUmV0dXJucyBhIHtTdHJpbmd9LlxuICBnZXRUZXh0SW5CdWZmZXJSYW5nZTogKHJhbmdlKSAtPlxuICAgIEBidWZmZXIuZ2V0VGV4dEluUmFuZ2UocmFuZ2UpXG5cbiAgIyBQdWJsaWM6IFNldCB0aGUgdGV4dCBpbiB0aGUgZ2l2ZW4ge1JhbmdlfSBpbiBidWZmZXIgY29vcmRpbmF0ZXMuXG4gICNcbiAgIyByYW5nZSAtIEEge1JhbmdlfSBvciByYW5nZS1jb21wYXRpYmxlIHtBcnJheX0uXG4gICMgdGV4dCAtIEEge1N0cmluZ31cbiAgI1xuICAjIFJldHVybnMgdGhlIHtSYW5nZX0gb2YgdGhlIG5ld2x5LWluc2VydGVkIHRleHQuXG4gIHNldFRleHRJbkJ1ZmZlclJhbmdlOiAocmFuZ2UsIHRleHQpIC0+IEBnZXRCdWZmZXIoKS5zZXRUZXh0SW5SYW5nZShyYW5nZSwgdGV4dClcblxuICAjIFB1YmxpYzogR2V0IHRoZSB7UmFuZ2V9IG9mIHRoZSBwYXJhZ3JhcGggc3Vycm91bmRpbmcgdGhlIG1vc3QgcmVjZW50bHkgYWRkZWRcbiAgIyBjdXJzb3IuXG4gICNcbiAgIyBSZXR1cm5zIGEge1JhbmdlfS5cbiAgZ2V0Q3VycmVudFBhcmFncmFwaEJ1ZmZlclJhbmdlOiAtPlxuICAgIEBnZXRDdXJzb3IoKS5nZXRDdXJyZW50UGFyYWdyYXBoQnVmZmVyUmFuZ2UoKVxuXG4gICMgUHVibGljOiBSZXR1cm5zIHRoZSB3b3JkIHN1cnJvdW5kaW5nIHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIGN1cnNvci5cbiAgI1xuICAjIG9wdGlvbnMgLSBTZWUge0N1cnNvcjo6Z2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9ufS5cbiAgZ2V0V29yZFVuZGVyQ3Vyc29yOiAob3B0aW9ucykgLT5cbiAgICBAZ2V0VGV4dEluQnVmZmVyUmFuZ2UoQGdldEN1cnNvcigpLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2Uob3B0aW9ucykpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIHVwIG9uZSByb3cgaW4gc2NyZWVuIGNvb3JkaW5hdGVzLlxuICBtb3ZlQ3Vyc29yVXA6IChsaW5lQ291bnQpIC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVXAobGluZUNvdW50LCBtb3ZlVG9FbmRPZlNlbGVjdGlvbjogdHJ1ZSlcblxuICAjIFB1YmxpYzogTW92ZSBldmVyeSBjdXJzb3IgZG93biBvbmUgcm93IGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgbW92ZUN1cnNvckRvd246IChsaW5lQ291bnQpIC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlRG93bihsaW5lQ291bnQsIG1vdmVUb0VuZE9mU2VsZWN0aW9uOiB0cnVlKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciBsZWZ0IG9uZSBjb2x1bW4uXG4gIG1vdmVDdXJzb3JMZWZ0OiAtPlxuICAgIEBtb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZUxlZnQobW92ZVRvRW5kT2ZTZWxlY3Rpb246IHRydWUpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIHJpZ2h0IG9uZSBjb2x1bW4uXG4gIG1vdmVDdXJzb3JSaWdodDogLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVSaWdodChtb3ZlVG9FbmRPZlNlbGVjdGlvbjogdHJ1ZSlcblxuICAjIFB1YmxpYzogTW92ZSBldmVyeSBjdXJzb3IgdG8gdGhlIHRvcCBvZiB0aGUgYnVmZmVyLlxuICAjXG4gICMgSWYgdGhlcmUgYXJlIG11bHRpcGxlIGN1cnNvcnMsIHRoZXkgd2lsbCBiZSBtZXJnZWQgaW50byBhIHNpbmdsZSBjdXJzb3IuXG4gIG1vdmVDdXJzb3JUb1RvcDogLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVUb1RvcCgpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIHRvIHRoZSBib3R0b20gb2YgdGhlIGJ1ZmZlci5cbiAgI1xuICAjIElmIHRoZXJlIGFyZSBtdWx0aXBsZSBjdXJzb3JzLCB0aGV5IHdpbGwgYmUgbWVyZ2VkIGludG8gYSBzaW5nbGUgY3Vyc29yLlxuICBtb3ZlQ3Vyc29yVG9Cb3R0b206IC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVG9Cb3R0b20oKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIGl0cyBsaW5lIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgbW92ZUN1cnNvclRvQmVnaW5uaW5nT2ZTY3JlZW5MaW5lOiAtPlxuICAgIEBtb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVRvQmVnaW5uaW5nT2ZTY3JlZW5MaW5lKClcblxuICAjIFB1YmxpYzogTW92ZSBldmVyeSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiBpdHMgbGluZSBpbiBidWZmZXIgY29vcmRpbmF0ZXMuXG4gIG1vdmVDdXJzb3JUb0JlZ2lubmluZ09mTGluZTogLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIHRvIHRoZSBmaXJzdCBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXIgb2YgaXRzIGxpbmUuXG4gIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiAtPlxuICAgIEBtb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciB0byB0aGUgZW5kIG9mIGl0cyBsaW5lIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgbW92ZUN1cnNvclRvRW5kT2ZTY3JlZW5MaW5lOiAtPlxuICAgIEBtb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVRvRW5kT2ZTY3JlZW5MaW5lKClcblxuICAjIFB1YmxpYzogTW92ZSBldmVyeSBjdXJzb3IgdG8gdGhlIGVuZCBvZiBpdHMgbGluZSBpbiBidWZmZXIgY29vcmRpbmF0ZXMuXG4gIG1vdmVDdXJzb3JUb0VuZE9mTGluZTogLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVUb0VuZE9mTGluZSgpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgaXRzIHN1cnJvdW5kaW5nIHdvcmQuXG4gIG1vdmVDdXJzb3JUb0JlZ2lubmluZ09mV29yZDogLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVUb0JlZ2lubmluZ09mV29yZCgpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIHRvIHRoZSBlbmQgb2YgaXRzIHN1cnJvdW5kaW5nIHdvcmQuXG4gIG1vdmVDdXJzb3JUb0VuZE9mV29yZDogLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVUb0VuZE9mV29yZCgpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZC5cbiAgbW92ZUN1cnNvclRvQmVnaW5uaW5nT2ZOZXh0V29yZDogLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVUb0JlZ2lubmluZ09mTmV4dFdvcmQoKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciB0byB0aGUgcHJldmlvdXMgd29yZCBib3VuZGFyeS5cbiAgbW92ZUN1cnNvclRvUHJldmlvdXNXb3JkQm91bmRhcnk6IC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVG9QcmV2aW91c1dvcmRCb3VuZGFyeSgpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIHRvIHRoZSBuZXh0IHdvcmQgYm91bmRhcnkuXG4gIG1vdmVDdXJzb3JUb05leHRXb3JkQm91bmRhcnk6IC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVG9OZXh0V29yZEJvdW5kYXJ5KClcblxuICBzY3JvbGxUb0N1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBnZXRDdXJzb3IoKS5hdXRvc2Nyb2xsKClcblxuICBwYWdlVXA6IC0+XG4gICAgQHNldFNjcm9sbFRvcChAZ2V0U2Nyb2xsVG9wKCkgLSBAZ2V0SGVpZ2h0KCkpXG5cbiAgcGFnZURvd246IC0+XG4gICAgQHNldFNjcm9sbFRvcChAZ2V0U2Nyb2xsVG9wKCkgKyBAZ2V0SGVpZ2h0KCkpXG5cbiAgbW92ZUN1cnNvcnM6IChmbikgLT5cbiAgICBAbW92aW5nQ3Vyc29ycyA9IHRydWVcbiAgICBAYmF0Y2hVcGRhdGVzID0+XG4gICAgICBmbihjdXJzb3IpIGZvciBjdXJzb3IgaW4gQGdldEN1cnNvcnMoKVxuICAgICAgQG1lcmdlQ3Vyc29ycygpXG4gICAgICBAbW92aW5nQ3Vyc29ycyA9IGZhbHNlXG4gICAgICBAZW1pdCAnY3Vyc29ycy1tb3ZlZCdcblxuICBjdXJzb3JNb3ZlZDogKGV2ZW50KSAtPlxuICAgIEBlbWl0ICdjdXJzb3ItbW92ZWQnLCBldmVudFxuICAgIEBlbWl0ICdjdXJzb3JzLW1vdmVkJyB1bmxlc3MgQG1vdmluZ0N1cnNvcnNcblxuICAjIFB1YmxpYzogU2VsZWN0IGZyb20gdGhlIGN1cnJlbnQgY3Vyc29yIHBvc2l0aW9uIHRvIHRoZSBnaXZlbiBwb3NpdGlvbiBpblxuICAjIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIG1heSBtZXJnZSBzZWxlY3Rpb25zIHRoYXQgZW5kIHVwIGludGVzZWN0aW5nLlxuICAjXG4gICMgcG9zaXRpb24gLSBBbiBpbnN0YW5jZSBvZiB7UG9pbnR9LCB3aXRoIGEgZ2l2ZW4gYHJvd2AgYW5kIGBjb2x1bW5gLlxuICBzZWxlY3RUb1NjcmVlblBvc2l0aW9uOiAocG9zaXRpb24pIC0+XG4gICAgbGFzdFNlbGVjdGlvbiA9IEBnZXRMYXN0U2VsZWN0aW9uKClcbiAgICBsYXN0U2VsZWN0aW9uLnNlbGVjdFRvU2NyZWVuUG9zaXRpb24ocG9zaXRpb24pXG4gICAgQG1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucyhyZXZlcnNlZDogbGFzdFNlbGVjdGlvbi5pc1JldmVyc2VkKCkpXG5cbiAgIyBQdWJsaWM6IE1vdmUgdGhlIGN1cnNvciBvZiBlYWNoIHNlbGVjdGlvbiBvbmUgY2hhcmFjdGVyIHJpZ2h0d2FyZCB3aGlsZVxuICAjIHByZXNlcnZpbmcgdGhlIHNlbGVjdGlvbidzIHRhaWwgcG9zaXRpb24uXG4gICNcbiAgIyBUaGlzIG1ldGhvZCBtYXkgbWVyZ2Ugc2VsZWN0aW9ucyB0aGF0IGVuZCB1cCBpbnRlc2VjdGluZy5cbiAgc2VsZWN0UmlnaHQ6IC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNGb3J3YXJkIChzZWxlY3Rpb24pID0+IHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG5cbiAgIyBQdWJsaWM6IE1vdmUgdGhlIGN1cnNvciBvZiBlYWNoIHNlbGVjdGlvbiBvbmUgY2hhcmFjdGVyIGxlZnR3YXJkIHdoaWxlXG4gICMgcHJlc2VydmluZyB0aGUgc2VsZWN0aW9uJ3MgdGFpbCBwb3NpdGlvbi5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIG1heSBtZXJnZSBzZWxlY3Rpb25zIHRoYXQgZW5kIHVwIGludGVzZWN0aW5nLlxuICBzZWxlY3RMZWZ0OiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zQmFja3dhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdExlZnQoKVxuXG4gICMgUHVibGljOiBNb3ZlIHRoZSBjdXJzb3Igb2YgZWFjaCBzZWxlY3Rpb24gb25lIGNoYXJhY3RlciB1cHdhcmQgd2hpbGVcbiAgIyBwcmVzZXJ2aW5nIHRoZSBzZWxlY3Rpb24ncyB0YWlsIHBvc2l0aW9uLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbWF5IG1lcmdlIHNlbGVjdGlvbnMgdGhhdCBlbmQgdXAgaW50ZXNlY3RpbmcuXG4gIHNlbGVjdFVwOiAocm93Q291bnQpIC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNCYWNrd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0VXAocm93Q291bnQpXG5cbiAgIyBQdWJsaWM6IE1vdmUgdGhlIGN1cnNvciBvZiBlYWNoIHNlbGVjdGlvbiBvbmUgY2hhcmFjdGVyIGRvd253YXJkIHdoaWxlXG4gICMgcHJlc2VydmluZyB0aGUgc2VsZWN0aW9uJ3MgdGFpbCBwb3NpdGlvbi5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIG1heSBtZXJnZSBzZWxlY3Rpb25zIHRoYXQgZW5kIHVwIGludGVzZWN0aW5nLlxuICBzZWxlY3REb3duOiAocm93Q291bnQpIC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNGb3J3YXJkIChzZWxlY3Rpb24pID0+IHNlbGVjdGlvbi5zZWxlY3REb3duKHJvd0NvdW50KVxuXG4gICMgUHVibGljOiBTZWxlY3QgZnJvbSB0aGUgdG9wIG9mIHRoZSBidWZmZXIgdG8gdGhlIGVuZCBvZiB0aGUgbGFzdCBzZWxlY3Rpb25cbiAgIyBpbiB0aGUgYnVmZmVyLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbWVyZ2VzIG11bHRpcGxlIHNlbGVjdGlvbnMgaW50byBhIHNpbmdsZSBzZWxlY3Rpb24uXG4gIHNlbGVjdFRvVG9wOiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zQmFja3dhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdFRvVG9wKClcblxuICAjIFB1YmxpYzogU2VsZWN0IGFsbCB0ZXh0IGluIHRoZSBidWZmZXIuXG4gICNcbiAgIyBUaGlzIG1ldGhvZCBtZXJnZXMgbXVsdGlwbGUgc2VsZWN0aW9ucyBpbnRvIGEgc2luZ2xlIHNlbGVjdGlvbi5cbiAgc2VsZWN0QWxsOiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zRm9yd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0QWxsKClcblxuICAjIFB1YmxpYzogU2VsZWN0cyBmcm9tIHRoZSB0b3Agb2YgdGhlIGZpcnN0IHNlbGVjdGlvbiBpbiB0aGUgYnVmZmVyIHRvIHRoZSBlbmRcbiAgIyBvZiB0aGUgYnVmZmVyLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbWVyZ2VzIG11bHRpcGxlIHNlbGVjdGlvbnMgaW50byBhIHNpbmdsZSBzZWxlY3Rpb24uXG4gIHNlbGVjdFRvQm90dG9tOiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zRm9yd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0VG9Cb3R0b20oKVxuXG4gICMgUHVibGljOiBNb3ZlIHRoZSBjdXJzb3Igb2YgZWFjaCBzZWxlY3Rpb24gdG8gdGhlIGJlZ2lubmluZyBvZiBpdHMgbGluZVxuICAjIHdoaWxlIHByZXNlcnZpbmcgdGhlIHNlbGVjdGlvbidzIHRhaWwgcG9zaXRpb24uXG4gICNcbiAgIyBUaGlzIG1ldGhvZCBtYXkgbWVyZ2Ugc2VsZWN0aW9ucyB0aGF0IGVuZCB1cCBpbnRlc2VjdGluZy5cbiAgc2VsZWN0VG9CZWdpbm5pbmdPZkxpbmU6IC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNCYWNrd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0VG9CZWdpbm5pbmdPZkxpbmUoKVxuXG4gICMgUHVibGljOiBNb3ZlIHRoZSBjdXJzb3Igb2YgZWFjaCBzZWxlY3Rpb24gdG8gdGhlIGZpcnN0IG5vbi13aGl0ZXNwYWNlXG4gICMgY2hhcmFjdGVyIG9mIGl0cyBsaW5lIHdoaWxlIHByZXNlcnZpbmcgdGhlIHNlbGVjdGlvbidzIHRhaWwgcG9zaXRpb24uIElmIHRoZVxuICAjIGN1cnNvciBpcyBhbHJlYWR5IG9uIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmUsIG1vdmUgaXQgdG8gdGhlXG4gICMgYmVnaW5uaW5nIG9mIHRoZSBsaW5lLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbWF5IG1lcmdlIHNlbGVjdGlvbnMgdGhhdCBlbmQgdXAgaW50ZXNlY3RpbmcuXG4gIHNlbGVjdFRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU6IC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNCYWNrd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0VG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG5cbiAgIyBQdWJsaWM6IE1vdmUgdGhlIGN1cnNvciBvZiBlYWNoIHNlbGVjdGlvbiB0byB0aGUgZW5kIG9mIGl0cyBsaW5lIHdoaWxlXG4gICMgcHJlc2VydmluZyB0aGUgc2VsZWN0aW9uJ3MgdGFpbCBwb3NpdGlvbi5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIG1heSBtZXJnZSBzZWxlY3Rpb25zIHRoYXQgZW5kIHVwIGludGVzZWN0aW5nLlxuICBzZWxlY3RUb0VuZE9mTGluZTogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0ZvcndhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdFRvRW5kT2ZMaW5lKClcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggc2VsZWN0aW9uLCBtb3ZlIGl0cyBjdXJzb3IgdG8gdGhlIHByZWNlZGluZyB3b3JkIGJvdW5kYXJ5XG4gICMgd2hpbGUgbWFpbnRhaW5pbmcgdGhlIHNlbGVjdGlvbidzIHRhaWwgcG9zaXRpb24uXG4gICNcbiAgIyBUaGlzIG1ldGhvZCBtYXkgbWVyZ2Ugc2VsZWN0aW9ucyB0aGF0IGVuZCB1cCBpbnRlc2VjdGluZy5cbiAgc2VsZWN0VG9QcmV2aW91c1dvcmRCb3VuZGFyeTogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0JhY2t3YXJkIChzZWxlY3Rpb24pID0+IHNlbGVjdGlvbi5zZWxlY3RUb1ByZXZpb3VzV29yZEJvdW5kYXJ5KClcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggc2VsZWN0aW9uLCBtb3ZlIGl0cyBjdXJzb3IgdG8gdGhlIG5leHQgd29yZCBib3VuZGFyeSB3aGlsZVxuICAjIG1haW50YWluaW5nIHRoZSBzZWxlY3Rpb24ncyB0YWlsIHBvc2l0aW9uLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbWF5IG1lcmdlIHNlbGVjdGlvbnMgdGhhdCBlbmQgdXAgaW50ZXNlY3RpbmcuXG4gIHNlbGVjdFRvTmV4dFdvcmRCb3VuZGFyeTogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0ZvcndhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdFRvTmV4dFdvcmRCb3VuZGFyeSgpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIGN1cnNvciwgc2VsZWN0IHRoZSBjb250YWluaW5nIGxpbmUuXG4gICNcbiAgIyBUaGlzIG1ldGhvZCBtZXJnZXMgc2VsZWN0aW9ucyBvbiBzdWNjZXNzaXZlIGxpbmVzLlxuICBzZWxlY3RMaW5lOiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zRm9yd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0TGluZSgpXG5cbiAgIyBQdWJsaWM6IEFkZCBhIHNpbWlsYXJseS1zaGFwZWQgc2VsZWN0aW9uIHRvIHRoZSBuZXh0IGVsaWJpYmxlIGxpbmUgYmVsb3dcbiAgIyBlYWNoIHNlbGVjdGlvbi5cbiAgI1xuICAjIE9wZXJhdGVzIG9uIGFsbCBzZWxlY3Rpb25zLiBJZiB0aGUgc2VsZWN0aW9uIGlzIGVtcHR5LCBhZGRzIGFuIGVtcHR5XG4gICMgc2VsZWN0aW9uIHRvIHRoZSBuZXh0IGZvbGxvd2luZyBub24tZW1wdHkgbGluZSBhcyBjbG9zZSB0byB0aGUgY3VycmVudFxuICAjIHNlbGVjdGlvbidzIGNvbHVtbiBhcyBwb3NzaWJsZS4gSWYgdGhlIHNlbGVjdGlvbiBpcyBub24tZW1wdHksIGFkZHMgYVxuICAjIHNlbGVjdGlvbiB0byB0aGUgbmV4dCBsaW5lIHRoYXQgaXMgbG9uZyBlbm91Z2ggZm9yIGEgbm9uLWVtcHR5IHNlbGVjdGlvblxuICAjIHN0YXJ0aW5nIGF0IHRoZSBzYW1lIGNvbHVtbiBhcyB0aGUgY3VycmVudCBzZWxlY3Rpb24gdG8gYmUgYWRkZWQgdG8gaXQuXG4gIGFkZFNlbGVjdGlvbkJlbG93OiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zRm9yd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uYWRkU2VsZWN0aW9uQmVsb3coKVxuXG4gICMgUHVibGljOiBBZGQgYSBzaW1pbGFybHktc2hhcGVkIHNlbGVjdGlvbiB0byB0aGUgbmV4dCBlbGliaWJsZSBsaW5lIGFib3ZlXG4gICMgZWFjaCBzZWxlY3Rpb24uXG4gICNcbiAgIyBPcGVyYXRlcyBvbiBhbGwgc2VsZWN0aW9ucy4gSWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgYWRkcyBhbiBlbXB0eVxuICAjIHNlbGVjdGlvbiB0byB0aGUgbmV4dCBwcmVjZWRpbmcgbm9uLWVtcHR5IGxpbmUgYXMgY2xvc2UgdG8gdGhlIGN1cnJlbnRcbiAgIyBzZWxlY3Rpb24ncyBjb2x1bW4gYXMgcG9zc2libGUuIElmIHRoZSBzZWxlY3Rpb24gaXMgbm9uLWVtcHR5LCBhZGRzIGFcbiAgIyBzZWxlY3Rpb24gdG8gdGhlIG5leHQgbGluZSB0aGF0IGlzIGxvbmcgZW5vdWdoIGZvciBhIG5vbi1lbXB0eSBzZWxlY3Rpb25cbiAgIyBzdGFydGluZyBhdCB0aGUgc2FtZSBjb2x1bW4gYXMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIHRvIGJlIGFkZGVkIHRvIGl0LlxuICBhZGRTZWxlY3Rpb25BYm92ZTogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0JhY2t3YXJkIChzZWxlY3Rpb24pID0+IHNlbGVjdGlvbi5hZGRTZWxlY3Rpb25BYm92ZSgpXG5cbiAgIyBQdWJsaWM6IFNwbGl0IG11bHRpLWxpbmUgc2VsZWN0aW9ucyBpbnRvIG9uZSBzZWxlY3Rpb24gcGVyIGxpbmUuXG4gICNcbiAgIyBPcGVyYXRlcyBvbiBhbGwgc2VsZWN0aW9ucy4gVGhpcyBtZXRob2QgYnJlYWtzIGFwYXJ0IGFsbCBtdWx0aS1saW5lXG4gICMgc2VsZWN0aW9ucyB0byBjcmVhdGUgbXVsdGlwbGUgc2luZ2xlLWxpbmUgc2VsZWN0aW9ucyB0aGF0IGN1bXVsYXRpdmVseSBjb3ZlclxuICAjIHRoZSBzYW1lIG9yaWdpbmFsIGFyZWEuXG4gIHNwbGl0U2VsZWN0aW9uc0ludG9MaW5lczogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKClcbiAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIGNvbnRpbnVlIGlmIHJhbmdlLmlzU2luZ2xlTGluZSgpXG5cbiAgICAgIHNlbGVjdGlvbi5kZXN0cm95KClcbiAgICAgIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gICAgICBAYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UoW3N0YXJ0LCBbc3RhcnQucm93LCBJbmZpbml0eV1dKVxuICAgICAge3Jvd30gPSBzdGFydFxuICAgICAgd2hpbGUgKytyb3cgPCBlbmQucm93XG4gICAgICAgIEBhZGRTZWxlY3Rpb25Gb3JCdWZmZXJSYW5nZShbW3JvdywgMF0sIFtyb3csIEluZmluaXR5XV0pXG4gICAgICBAYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UoW1tlbmQucm93LCAwXSwgW2VuZC5yb3csIGVuZC5jb2x1bW5dXSlcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggc2VsZWN0aW9uLCB0cmFuc3Bvc2UgdGhlIHNlbGVjdGVkIHRleHQuXG4gICNcbiAgIyBJZiB0aGUgc2VsZWN0aW9uIGlzIGVtcHR5LCB0aGUgY2hhcmFjdGVycyBwcmVjZWRpbmcgYW5kIGZvbGxvd2luZyB0aGUgY3Vyc29yXG4gICMgYXJlIHN3YXBwZWQuIE90aGVyd2lzZSwgdGhlIHNlbGVjdGVkIGNoYXJhY3RlcnMgYXJlIHJldmVyc2VkLlxuICB0cmFuc3Bvc2U6IC0+XG4gICAgQG11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSA9PlxuICAgICAgaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgICBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgICAgICB0ZXh0ID0gc2VsZWN0aW9uLmdldFRleHQoKVxuICAgICAgICBzZWxlY3Rpb24uZGVsZXRlKClcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0IHRleHRcbiAgICAgIGVsc2VcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQgc2VsZWN0aW9uLmdldFRleHQoKS5zcGxpdCgnJykucmV2ZXJzZSgpLmpvaW4oJycpXG5cbiAgIyBQdWJsaWM6IENvbnZlcnQgdGhlIHNlbGVjdGVkIHRleHQgdG8gdXBwZXIgY2FzZS5cbiAgI1xuICAjIEZvciBlYWNoIHNlbGVjdGlvbiwgaWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgY29udmVydHMgdGhlIGNvbnRhaW5pbmcgd29yZFxuICAjIHRvIHVwcGVyIGNhc2UuIE90aGVyd2lzZSBjb252ZXJ0IHRoZSBzZWxlY3RlZCB0ZXh0IHRvIHVwcGVyIGNhc2UuXG4gIHVwcGVyQ2FzZTogLT5cbiAgICBAcmVwbGFjZVNlbGVjdGVkVGV4dCBzZWxlY3RXb3JkSWZFbXB0eTp0cnVlLCAodGV4dCkgPT4gdGV4dC50b1VwcGVyQ2FzZSgpXG5cbiAgIyBQdWJsaWM6IENvbnZlcnQgdGhlIHNlbGVjdGVkIHRleHQgdG8gbG93ZXIgY2FzZS5cbiAgI1xuICAjIEZvciBlYWNoIHNlbGVjdGlvbiwgaWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgY29udmVydHMgdGhlIGNvbnRhaW5pbmcgd29yZFxuICAjIHRvIHVwcGVyIGNhc2UuIE90aGVyd2lzZSBjb252ZXJ0IHRoZSBzZWxlY3RlZCB0ZXh0IHRvIHVwcGVyIGNhc2UuXG4gIGxvd2VyQ2FzZTogLT5cbiAgICBAcmVwbGFjZVNlbGVjdGVkVGV4dCBzZWxlY3RXb3JkSWZFbXB0eTp0cnVlLCAodGV4dCkgPT4gdGV4dC50b0xvd2VyQ2FzZSgpXG5cbiAgIyBDb252ZXJ0IG11bHRpcGxlIGxpbmVzIHRvIGEgc2luZ2xlIGxpbmUuXG4gICNcbiAgIyBPcGVyYXRlcyBvbiBhbGwgc2VsZWN0aW9ucy4gSWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgam9pbnMgdGhlIGN1cnJlbnRcbiAgIyBsaW5lIHdpdGggdGhlIG5leHQgbGluZS4gT3RoZXJ3aXNlIGl0IGpvaW5zIGFsbCBsaW5lcyB0aGF0IGludGVyc2VjdCB0aGVcbiAgIyBzZWxlY3Rpb24uXG4gICNcbiAgIyBKb2luaW5nIGEgbGluZSBtZWFucyB0aGF0IG11bHRpcGxlIGxpbmVzIGFyZSBjb252ZXJ0ZWQgdG8gYSBzaW5nbGUgbGluZSB3aXRoXG4gICMgdGhlIGNvbnRlbnRzIG9mIGVhY2ggb2YgdGhlIG9yaWdpbmFsIG5vbi1lbXB0eSBsaW5lcyBzZXBhcmF0ZWQgYnkgYSBzcGFjZS5cbiAgam9pbkxpbmVzOiAtPlxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmpvaW5MaW5lcygpXG5cbiAgIyBQdWJsaWM6IEV4cGFuZCBzZWxlY3Rpb25zIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlaXIgY29udGFpbmluZyB3b3JkLlxuICAjXG4gICMgT3BlcmF0ZXMgb24gYWxsIHNlbGVjdGlvbnMuIE1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGVcbiAgIyBjb250YWluaW5nIHdvcmQgd2hpbGUgcHJlc2VydmluZyB0aGUgc2VsZWN0aW9uJ3MgdGFpbCBwb3NpdGlvbi5cbiAgc2VsZWN0VG9CZWdpbm5pbmdPZldvcmQ6IC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNCYWNrd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0VG9CZWdpbm5pbmdPZldvcmQoKVxuXG4gICMgUHVibGljOiBFeHBhbmQgc2VsZWN0aW9ucyB0byB0aGUgZW5kIG9mIHRoZWlyIGNvbnRhaW5pbmcgd29yZC5cbiAgI1xuICAjIE9wZXJhdGVzIG9uIGFsbCBzZWxlY3Rpb25zLiBNb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIGNvbnRhaW5pbmdcbiAgIyB3b3JkIHdoaWxlIHByZXNlcnZpbmcgdGhlIHNlbGVjdGlvbidzIHRhaWwgcG9zaXRpb24uXG4gIHNlbGVjdFRvRW5kT2ZXb3JkOiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zRm9yd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0VG9FbmRPZldvcmQoKVxuXG4gICMgUHVibGljOiBFeHBhbmQgc2VsZWN0aW9ucyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHdvcmQuXG4gICNcbiAgIyBPcGVyYXRlcyBvbiBhbGwgc2VsZWN0aW9ucy4gTW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0XG4gICMgd29yZCB3aGlsZSBwcmVzZXJ2aW5nIHRoZSBzZWxlY3Rpb24ncyB0YWlsIHBvc2l0aW9uLlxuICBzZWxlY3RUb0JlZ2lubmluZ09mTmV4dFdvcmQ6IC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNGb3J3YXJkIChzZWxlY3Rpb24pID0+IHNlbGVjdGlvbi5zZWxlY3RUb0JlZ2lubmluZ09mTmV4dFdvcmQoKVxuXG4gICMgUHVibGljOiBTZWxlY3QgdGhlIHdvcmQgY29udGFpbmluZyBlYWNoIGN1cnNvci5cbiAgc2VsZWN0V29yZDogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0ZvcndhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdFdvcmQoKVxuXG4gICMgUHVibGljOiBTZWxlY3QgdGhlIHJhbmdlIG9mIHRoZSBnaXZlbiBtYXJrZXIgaWYgaXQgaXMgdmFsaWQuXG4gICNcbiAgIyBtYXJrZXIgLSBBIHtEaXNwbGF5QnVmZmVyTWFya2VyfVxuICAjXG4gICMgUmV0dXJucyB0aGUgc2VsZWN0ZWQge1JhbmdlfSBvciBgdW5kZWZpbmVkYCBpZiB0aGUgbWFya2VyIGlzIGludmFsaWQuXG4gIHNlbGVjdE1hcmtlcjogKG1hcmtlcikgLT5cbiAgICBpZiBtYXJrZXIuaXNWYWxpZCgpXG4gICAgICByYW5nZSA9IG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBAc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgIHJhbmdlXG5cbiAgIyBNZXJnZSBjdXJzb3JzIHRoYXQgaGF2ZSB0aGUgc2FtZSBzY3JlZW4gcG9zaXRpb25cbiAgbWVyZ2VDdXJzb3JzOiAtPlxuICAgIHBvc2l0aW9ucyA9IFtdXG4gICAgZm9yIGN1cnNvciBpbiBAZ2V0Q3Vyc29ycygpXG4gICAgICBwb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRvU3RyaW5nKClcbiAgICAgIGlmIHBvc2l0aW9uIGluIHBvc2l0aW9uc1xuICAgICAgICBjdXJzb3IuZGVzdHJveSgpXG4gICAgICBlbHNlXG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uKVxuXG4gICMgQ2FsbHMgdGhlIGdpdmVuIGZ1bmN0aW9uIHdpdGggZWFjaCBzZWxlY3Rpb24sIHRoZW4gbWVyZ2VzIHNlbGVjdGlvbnNcbiAgZXhwYW5kU2VsZWN0aW9uc0ZvcndhcmQ6IChmbikgLT5cbiAgICBAbWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zID0+XG4gICAgICBmbihzZWxlY3Rpb24pIGZvciBzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoKVxuXG4gICMgQ2FsbHMgdGhlIGdpdmVuIGZ1bmN0aW9uIHdpdGggZWFjaCBzZWxlY3Rpb24sIHRoZW4gbWVyZ2VzIHNlbGVjdGlvbnMgaW4gdGhlXG4gICMgcmV2ZXJzZWQgb3JpZW50YXRpb25cbiAgZXhwYW5kU2VsZWN0aW9uc0JhY2t3YXJkOiAoZm4pIC0+XG4gICAgQG1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucyByZXZlcnNlZDogdHJ1ZSwgPT5cbiAgICAgIGZuKHNlbGVjdGlvbikgZm9yIHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpXG5cbiAgZmluYWxpemVTZWxlY3Rpb25zOiAtPlxuICAgIHNlbGVjdGlvbi5maW5hbGl6ZSgpIGZvciBzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoKVxuXG4gICMgTWVyZ2VzIGludGVyc2VjdGluZyBzZWxlY3Rpb25zLiBJZiBwYXNzZWQgYSBmdW5jdGlvbiwgaXQgZXhlY3V0ZXNcbiAgIyB0aGUgZnVuY3Rpb24gd2l0aCBtZXJnaW5nIHN1cHByZXNzZWQsIHRoZW4gbWVyZ2VzIGludGVyc2VjdGluZyBzZWxlY3Rpb25zXG4gICMgYWZ0ZXJ3YXJkLlxuICBtZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnM6IChhcmdzLi4uKSAtPlxuICAgIGZuID0gYXJncy5wb3AoKSBpZiBfLmlzRnVuY3Rpb24oXy5sYXN0KGFyZ3MpKVxuICAgIG9wdGlvbnMgPSBhcmdzLnBvcCgpID8ge31cblxuICAgIHJldHVybiBmbj8oKSBpZiBAc3VwcHJlc3NTZWxlY3Rpb25NZXJnaW5nXG5cbiAgICBpZiBmbj9cbiAgICAgIEBzdXBwcmVzc1NlbGVjdGlvbk1lcmdpbmcgPSB0cnVlXG4gICAgICByZXN1bHQgPSBmbigpXG4gICAgICBAc3VwcHJlc3NTZWxlY3Rpb25NZXJnaW5nID0gZmFsc2VcblxuICAgIHJlZHVjZXIgPSAoZGlzam9pbnRTZWxlY3Rpb25zLCBzZWxlY3Rpb24pIC0+XG4gICAgICBpbnRlcnNlY3RpbmdTZWxlY3Rpb24gPSBfLmZpbmQoZGlzam9pbnRTZWxlY3Rpb25zLCAocykgLT4gcy5pbnRlcnNlY3RzV2l0aChzZWxlY3Rpb24pKVxuICAgICAgaWYgaW50ZXJzZWN0aW5nU2VsZWN0aW9uP1xuICAgICAgICBpbnRlcnNlY3RpbmdTZWxlY3Rpb24ubWVyZ2Uoc2VsZWN0aW9uLCBvcHRpb25zKVxuICAgICAgICBkaXNqb2ludFNlbGVjdGlvbnNcbiAgICAgIGVsc2VcbiAgICAgICAgZGlzam9pbnRTZWxlY3Rpb25zLmNvbmNhdChbc2VsZWN0aW9uXSlcblxuICAgIF8ucmVkdWNlKEBnZXRTZWxlY3Rpb25zKCksIHJlZHVjZXIsIFtdKVxuXG4gIHByZXNlcnZlQ3Vyc29yUG9zaXRpb25PbkJ1ZmZlclJlbG9hZDogLT5cbiAgICBjdXJzb3JQb3NpdGlvbiA9IG51bGxcbiAgICBAc3Vic2NyaWJlIEBidWZmZXIsIFwid2lsbC1yZWxvYWRcIiwgPT5cbiAgICAgIGN1cnNvclBvc2l0aW9uID0gQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAc3Vic2NyaWJlIEBidWZmZXIsIFwicmVsb2FkZWRcIiwgPT5cbiAgICAgIEBzZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbikgaWYgY3Vyc29yUG9zaXRpb25cbiAgICAgIGN1cnNvclBvc2l0aW9uID0gbnVsbFxuXG4gICMgUHVibGljOiBHZXQgdGhlIGN1cnJlbnQge0dyYW1tYXJ9IG9mIHRoaXMgZWRpdG9yLlxuICBnZXRHcmFtbWFyOiAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLmdldEdyYW1tYXIoKVxuXG4gICMgUHVibGljOiBTZXQgdGhlIGN1cnJlbnQge0dyYW1tYXJ9IG9mIHRoaXMgZWRpdG9yLlxuICAjXG4gICMgQXNzaWduaW5nIGEgZ3JhbW1hciB3aWxsIGNhdXNlIHRoZSBlZGl0b3IgdG8gcmUtdG9rZW5pemUgYmFzZWQgb24gdGhlIG5ld1xuICAjIGdyYW1tYXIuXG4gIHNldEdyYW1tYXI6IChncmFtbWFyKSAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLnNldEdyYW1tYXIoZ3JhbW1hcilcblxuICAjIFJlbG9hZCB0aGUgZ3JhbW1hciBiYXNlZCBvbiB0aGUgZmlsZSBuYW1lLlxuICByZWxvYWRHcmFtbWFyOiAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLnJlbG9hZEdyYW1tYXIoKVxuXG4gIHNob3VsZEF1dG9JbmRlbnQ6IC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KFwiZWRpdG9yLmF1dG9JbmRlbnRcIilcblxuICAjIFB1YmxpYzogQmF0Y2ggbXVsdGlwbGUgb3BlcmF0aW9ucyBhcyBhIHNpbmdsZSB1bmRvL3JlZG8gc3RlcC5cbiAgI1xuICAjIEFueSBncm91cCBvZiBvcGVyYXRpb25zIHRoYXQgYXJlIGxvZ2ljYWxseSBncm91cGVkIGZyb20gdGhlIHBlcnNwZWN0aXZlIG9mXG4gICMgdW5kb2luZyBhbmQgcmVkb2luZyBzaG91bGQgYmUgcGVyZm9ybWVkIGluIGEgdHJhbnNhY3Rpb24uIElmIHlvdSB3YW50IHRvXG4gICMgYWJvcnQgdGhlIHRyYW5zYWN0aW9uLCBjYWxsIHs6OmFib3J0VHJhbnNhY3Rpb259IHRvIHRlcm1pbmF0ZSB0aGUgZnVuY3Rpb24nc1xuICAjIGV4ZWN1dGlvbiBhbmQgcmV2ZXJ0IGFueSBjaGFuZ2VzIHBlcmZvcm1lZCB1cCB0byB0aGUgYWJvcnRpb24uXG4gICNcbiAgIyBmbiAtIEEge0Z1bmN0aW9ufSB0byBjYWxsIGluc2lkZSB0aGUgdHJhbnNhY3Rpb24uXG4gIHRyYW5zYWN0OiAoZm4pIC0+XG4gICAgQGJhdGNoVXBkYXRlcyA9PlxuICAgICAgQGJ1ZmZlci50cmFuc2FjdChmbilcblxuICAjIFB1YmxpYzogU3RhcnQgYW4gb3Blbi1lbmRlZCB0cmFuc2FjdGlvbi5cbiAgI1xuICAjIENhbGwgezo6Y29tbWl0VHJhbnNhY3Rpb259IG9yIHs6OmFib3J0VHJhbnNhY3Rpb259IHRvIHRlcm1pbmF0ZSB0aGVcbiAgIyB0cmFuc2FjdGlvbi4gSWYgeW91IG5lc3QgY2FsbHMgdG8gdHJhbnNhY3Rpb25zLCBvbmx5IHRoZSBvdXRlcm1vc3RcbiAgIyB0cmFuc2FjdGlvbiBpcyBjb25zaWRlcmVkLiBZb3UgbXVzdCBtYXRjaCBldmVyeSBiZWdpbiB3aXRoIGEgbWF0Y2hpbmdcbiAgIyBjb21taXQsIGJ1dCBhIHNpbmdsZSBjYWxsIHRvIGFib3J0IHdpbGwgY2FuY2VsIGFsbCBuZXN0ZWQgdHJhbnNhY3Rpb25zLlxuICBiZWdpblRyYW5zYWN0aW9uOiAtPiBAYnVmZmVyLmJlZ2luVHJhbnNhY3Rpb24oKVxuXG4gICMgUHVibGljOiBDb21taXQgYW4gb3Blbi1lbmRlZCB0cmFuc2FjdGlvbiBzdGFydGVkIHdpdGggezo6YmVnaW5UcmFuc2FjdGlvbn1cbiAgIyBhbmQgcHVzaCBpdCB0byB0aGUgdW5kbyBzdGFjay5cbiAgI1xuICAjIElmIHRyYW5zYWN0aW9ucyBhcmUgbmVzdGVkLCBvbmx5IHRoZSBvdXRlcm1vc3QgY29tbWl0IHRha2VzIGVmZmVjdC5cbiAgY29tbWl0VHJhbnNhY3Rpb246IC0+IEBidWZmZXIuY29tbWl0VHJhbnNhY3Rpb24oKVxuXG4gICMgUHVibGljOiBBYm9ydCBhbiBvcGVuIHRyYW5zYWN0aW9uLCB1bmRvaW5nIGFueSBvcGVyYXRpb25zIHBlcmZvcm1lZCBzbyBmYXJcbiAgIyB3aXRoaW4gdGhlIHRyYW5zYWN0aW9uLlxuICBhYm9ydFRyYW5zYWN0aW9uOiAtPiBAYnVmZmVyLmFib3J0VHJhbnNhY3Rpb24oKVxuXG4gIGJhdGNoVXBkYXRlczogKGZuKSAtPlxuICAgIEBlbWl0ICdiYXRjaGVkLXVwZGF0ZXMtc3RhcnRlZCdcbiAgICByZXN1bHQgPSBmbigpXG4gICAgQGVtaXQgJ2JhdGNoZWQtdXBkYXRlcy1lbmRlZCdcbiAgICByZXN1bHRcblxuICBpbnNwZWN0OiAtPlxuICAgIFwiPEVkaXRvciAje0BpZH0+XCJcblxuICBsb2dTY3JlZW5MaW5lczogKHN0YXJ0LCBlbmQpIC0+IEBkaXNwbGF5QnVmZmVyLmxvZ0xpbmVzKHN0YXJ0LCBlbmQpXG5cbiAgaGFuZGxlR3JhbW1hckNoYW5nZTogLT5cbiAgICBAdW5mb2xkQWxsKClcbiAgICBAZW1pdCAnZ3JhbW1hci1jaGFuZ2VkJ1xuXG4gIGhhbmRsZU1hcmtlckNyZWF0ZWQ6IChtYXJrZXIpID0+XG4gICAgaWYgbWFya2VyLm1hdGNoZXNBdHRyaWJ1dGVzKEBnZXRTZWxlY3Rpb25NYXJrZXJBdHRyaWJ1dGVzKCkpXG4gICAgICBAYWRkU2VsZWN0aW9uKG1hcmtlcilcblxuICBnZXRTZWxlY3Rpb25NYXJrZXJBdHRyaWJ1dGVzOiAtPlxuICAgIHR5cGU6ICdzZWxlY3Rpb24nLCBlZGl0b3JJZDogQGlkLCBpbnZhbGlkYXRlOiAnbmV2ZXInXG5cbiAgZ2V0VmVydGljYWxTY3JvbGxNYXJnaW46IC0+IEBkaXNwbGF5QnVmZmVyLmdldFZlcnRpY2FsU2Nyb2xsTWFyZ2luKClcbiAgc2V0VmVydGljYWxTY3JvbGxNYXJnaW46ICh2ZXJ0aWNhbFNjcm9sbE1hcmdpbikgLT4gQGRpc3BsYXlCdWZmZXIuc2V0VmVydGljYWxTY3JvbGxNYXJnaW4odmVydGljYWxTY3JvbGxNYXJnaW4pXG5cbiAgZ2V0SG9yaXpvbnRhbFNjcm9sbE1hcmdpbjogLT4gQGRpc3BsYXlCdWZmZXIuZ2V0SG9yaXpvbnRhbFNjcm9sbE1hcmdpbigpXG4gIHNldEhvcml6b250YWxTY3JvbGxNYXJnaW46IChob3Jpem9udGFsU2Nyb2xsTWFyZ2luKSAtPiBAZGlzcGxheUJ1ZmZlci5zZXRIb3Jpem9udGFsU2Nyb2xsTWFyZ2luKGhvcml6b250YWxTY3JvbGxNYXJnaW4pXG5cbiAgZ2V0TGluZUhlaWdodDogLT4gQGRpc3BsYXlCdWZmZXIuZ2V0TGluZUhlaWdodCgpXG4gIHNldExpbmVIZWlnaHQ6IChsaW5lSGVpZ2h0KSAtPiBAZGlzcGxheUJ1ZmZlci5zZXRMaW5lSGVpZ2h0KGxpbmVIZWlnaHQpXG5cbiAgZ2V0U2NvcGVkQ2hhcldpZHRoOiAoc2NvcGVOYW1lcywgY2hhcikgLT4gQGRpc3BsYXlCdWZmZXIuZ2V0U2NvcGVkQ2hhcldpZHRoKHNjb3BlTmFtZXMsIGNoYXIpXG4gIHNldFNjb3BlZENoYXJXaWR0aDogKHNjb3BlTmFtZXMsIGNoYXIsIHdpZHRoKSAtPiBAZGlzcGxheUJ1ZmZlci5zZXRTY29wZWRDaGFyV2lkdGgoc2NvcGVOYW1lcywgY2hhciwgd2lkdGgpXG5cbiAgZ2V0U2NvcGVkQ2hhcldpZHRoczogKHNjb3BlTmFtZXMpIC0+IEBkaXNwbGF5QnVmZmVyLmdldFNjb3BlZENoYXJXaWR0aHMoc2NvcGVOYW1lcylcblxuICBjbGVhclNjb3BlZENoYXJXaWR0aHM6IC0+IEBkaXNwbGF5QnVmZmVyLmNsZWFyU2NvcGVkQ2hhcldpZHRocygpXG5cbiAgZ2V0RGVmYXVsdENoYXJXaWR0aDogLT4gQGRpc3BsYXlCdWZmZXIuZ2V0RGVmYXVsdENoYXJXaWR0aCgpXG4gIHNldERlZmF1bHRDaGFyV2lkdGg6IChkZWZhdWx0Q2hhcldpZHRoKSAtPiBAZGlzcGxheUJ1ZmZlci5zZXREZWZhdWx0Q2hhcldpZHRoKGRlZmF1bHRDaGFyV2lkdGgpXG5cbiAgc2V0SGVpZ2h0OiAoaGVpZ2h0KSAtPiBAZGlzcGxheUJ1ZmZlci5zZXRIZWlnaHQoaGVpZ2h0KVxuICBnZXRIZWlnaHQ6IC0+IEBkaXNwbGF5QnVmZmVyLmdldEhlaWdodCgpXG5cbiAgc2V0V2lkdGg6ICh3aWR0aCkgLT4gQGRpc3BsYXlCdWZmZXIuc2V0V2lkdGgod2lkdGgpXG4gIGdldFdpZHRoOiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRXaWR0aCgpXG5cbiAgZ2V0U2Nyb2xsVG9wOiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRTY3JvbGxUb3AoKVxuICBzZXRTY3JvbGxUb3A6IChzY3JvbGxUb3ApIC0+IEBkaXNwbGF5QnVmZmVyLnNldFNjcm9sbFRvcChzY3JvbGxUb3ApXG5cbiAgZ2V0U2Nyb2xsQm90dG9tOiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRTY3JvbGxCb3R0b20oKVxuICBzZXRTY3JvbGxCb3R0b206IChzY3JvbGxCb3R0b20pIC0+IEBkaXNwbGF5QnVmZmVyLnNldFNjcm9sbEJvdHRvbShzY3JvbGxCb3R0b20pXG5cbiAgZ2V0U2Nyb2xsTGVmdDogLT4gQGRpc3BsYXlCdWZmZXIuZ2V0U2Nyb2xsTGVmdCgpXG4gIHNldFNjcm9sbExlZnQ6IChzY3JvbGxMZWZ0KSAtPiBAZGlzcGxheUJ1ZmZlci5zZXRTY3JvbGxMZWZ0KHNjcm9sbExlZnQpXG5cbiAgZ2V0U2Nyb2xsUmlnaHQ6IC0+IEBkaXNwbGF5QnVmZmVyLmdldFNjcm9sbFJpZ2h0KClcbiAgc2V0U2Nyb2xsUmlnaHQ6IChzY3JvbGxSaWdodCkgLT4gQGRpc3BsYXlCdWZmZXIuc2V0U2Nyb2xsUmlnaHQoc2Nyb2xsUmlnaHQpXG5cbiAgZ2V0U2Nyb2xsSGVpZ2h0OiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRTY3JvbGxIZWlnaHQoKVxuICBnZXRTY3JvbGxXaWR0aDogKHNjcm9sbFdpZHRoKSAtPiBAZGlzcGxheUJ1ZmZlci5nZXRTY3JvbGxXaWR0aChzY3JvbGxXaWR0aClcblxuICBnZXRWaXNpYmxlUm93UmFuZ2U6IC0+IEBkaXNwbGF5QnVmZmVyLmdldFZpc2libGVSb3dSYW5nZSgpXG5cbiAgaW50ZXJzZWN0c1Zpc2libGVSb3dSYW5nZTogKHN0YXJ0Um93LCBlbmRSb3cpIC0+IEBkaXNwbGF5QnVmZmVyLmludGVyc2VjdHNWaXNpYmxlUm93UmFuZ2Uoc3RhcnRSb3csIGVuZFJvdylcblxuICBzZWxlY3Rpb25JbnRlcnNlY3RzVmlzaWJsZVJvd1JhbmdlOiAoc2VsZWN0aW9uKSAtPiBAZGlzcGxheUJ1ZmZlci5zZWxlY3Rpb25JbnRlcnNlY3RzVmlzaWJsZVJvd1JhbmdlKHNlbGVjdGlvbilcblxuICBwaXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb246IChzY3JlZW5Qb3NpdGlvbikgLT4gQGRpc3BsYXlCdWZmZXIucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKVxuXG4gIHBpeGVsUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbjogKGJ1ZmZlclBvc2l0aW9uKSAtPiBAZGlzcGxheUJ1ZmZlci5waXhlbFBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG5cbiAgc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uOiAocGl4ZWxQb3NpdGlvbikgLT4gQGRpc3BsYXlCdWZmZXIuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uKHBpeGVsUG9zaXRpb24pXG5cbiAgcGl4ZWxSZWN0Rm9yU2NyZWVuUmFuZ2U6IChzY3JlZW5SYW5nZSkgLT4gQGRpc3BsYXlCdWZmZXIucGl4ZWxSZWN0Rm9yU2NyZWVuUmFuZ2Uoc2NyZWVuUmFuZ2UpXG5cbiAgc2Nyb2xsVG9TY3JlZW5SYW5nZTogKHNjcmVlblJhbmdlKSAtPiBAZGlzcGxheUJ1ZmZlci5zY3JvbGxUb1NjcmVlblJhbmdlKHNjcmVlblJhbmdlKVxuXG4gIHNjcm9sbFRvU2NyZWVuUG9zaXRpb246IChzY3JlZW5Qb3NpdGlvbikgLT4gQGRpc3BsYXlCdWZmZXIuc2Nyb2xsVG9TY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbilcblxuICBzY3JvbGxUb0J1ZmZlclBvc2l0aW9uOiAoYnVmZmVyUG9zaXRpb24pIC0+IEBkaXNwbGF5QnVmZmVyLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG5cbiAgIyBEZXByZWNhdGVkOiBDYWxsIHs6OmpvaW5MaW5lc30gaW5zdGVhZC5cbiAgam9pbkxpbmU6IC0+XG4gICAgZGVwcmVjYXRlKFwiVXNlIEVkaXRvcjo6am9pbkxpbmVzKCkgaW5zdGVhZFwiKVxuICAgIEBqb2luTGluZXMoKVxuIl19
