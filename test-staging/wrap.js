"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrap = exports.getEffectiveWidth = void 0;
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var tagBreakers = ['<', ' ', '\n'];
/**
* Determines the effective considering any indent and invisible tags.
*/
var getEffectiveWidth = function getEffectiveWidth(_ref) {
  var text = _ref.text,
    width = _ref.width,
    indent = _ref.indent,
    ignoreTags = _ref.ignoreTags;
  if (ignoreTags === false) return width - indent;else {
    width = width - indent; // adjust width
    var charCount = 0;
    var tagChars = 0;
    var sawLtAt = -1;
    var cursor = 0;
    //         v have we run out of text?         v once we've counted width chars, we're done
    for (; cursor < text.length && charCount < width; cursor += 1) {
      var _char = text.charAt(cursor);
      if (sawLtAt > -1) {
        // maybe in a tag
        if (_char === '>') {
          tagChars += cursor - sawLtAt + 1;
          sawLtAt = -1;
        } else if (tagBreakers.includes(_char)) {
          // false alarm, not really a tag
          // charCount += cursor - sawLtAt + 1
          charCount += 1; // count the '<'
          cursor = sawLtAt + 1; // reset the cursor
          sawLtAt = -1;
        }
      } else {
        // not in a tag
        if (_char === '<') {
          sawLtAt = cursor;
        } else {
          charCount += 1;
        }
      }
    }
    if (sawLtAt > -1) {
      // then we've run off the end without finding a closing tag
      charCount += cursor - sawLtAt + 1;
      if (charCount - tagChars > width) {
        // then we had a '<' and then chars to the end of the line
        return width + tagChars;
      }
    }
    return charCount + tagChars;
  }
};
exports.getEffectiveWidth = getEffectiveWidth;
var wrap = function wrap(text) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref2$hangingIndent = _ref2.hangingIndent,
    hangingIndent = _ref2$hangingIndent === void 0 ? false : _ref2$hangingIndent,
    _ref2$ignoreTags = _ref2.ignoreTags,
    ignoreTags = _ref2$ignoreTags === void 0 ? false : _ref2$ignoreTags,
    _ref2$indent = _ref2.indent,
    indent = _ref2$indent === void 0 ? 0 : _ref2$indent,
    _ref2$smartIndent = _ref2.smartIndent,
    smartIndent = _ref2$smartIndent === void 0 ? false : _ref2$smartIndent,
    _ref2$width = _ref2.width,
    width = _ref2$width === void 0 ? 80 : _ref2$width;
  var indentModesActive = (hangingIndent === true ? 1 : 0) + (indent > 0 ? 1 : 0) + (smartIndent === true ? 1 : 0);
  if (indentModesActive > 1) {
    throw new Error("Multiple indent modes active; only one 'hangingIndent', 'indent', or 'smartIndent' may be active.");
  }
  if (!text) return '';
  // text = text.replace(/\s+$/, '') // we'll trim the front inside the while loop

  var lines = [];
  var _iterator = _createForOfIteratorHelper(text.split('\n')),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var iLine = _step.value;
      var newPp = true;
      var inList = 0;
      // at the start of each paragraph, we check if we have an empty line
      if (iLine.length === 0) {
        lines.push('');
        continue;
      } // then we checke if we're in a list
      else if (iLine.match(/^ *[-*] +/)) {
        // count the depth of indentation (sub-lists)
        inList = iLine.replace(/^( *- +).*/, '$1').length;
      }

      // new we process the rest ef the line; there are multiple exit or re-loop points, where we set the 'newPp' false 
      // indicating that we're no longer at the front of the line.
      while (iLine.length > 0) {
        // usually we 'break' the flow, but this could happen if we trim the text exactly.
        // determine how many spaces to add before the current line
        var effectiveIndent = !hangingIndent && !smartIndent ? indent : hangingIndent && !newPp ? indent : smartIndent && inList > 0 && !newPp ? inList : 0;
        var ew = getEffectiveWidth({
          text: iLine,
          width: width,
          indent: effectiveIndent,
          ignoreTags: ignoreTags
        });
        var spcs = ' '.repeat(effectiveIndent);
        var initSpaces = 0;
        if (newPp === false) {
          // trim any whitespace (like the ' ' in front of the last inserted line break)
          // unless we're at the start of a PP, in which case we want to preserve the initial indent or list indent
          iLine = iLine.trimStart();
        } else {
          initSpaces = iLine.replace(/^( *).*/, '$1').length;
        }
        if (ew >= iLine.length) {
          lines.push(spcs + iLine);
          newPp = false;
          // lines.push('a23456790' + '123456790'.repeat(7))
          break; // we're done
        } else if (iLine.charAt(ew) === ' ') {
          lines.push(spcs + iLine.slice(0, ew));
          iLine = iLine.slice(ew);
          newPp = false;
          // lines.push('b23456790' + '123456790'.repeat(7))
          continue;
        } else if (iLine.charAt(ew - 1) === '-') {
          lines.push(spcs + iLine.slice(0, ew));
          iLine = iLine.slice(ew);
          newPp = false;
          // lines.push('c23456790' + '123456790'.repeat(7))
          continue;
        }

        // what's the last index of our break points within the effective width range?
        var iSpace = iLine.lastIndexOf(' ', ew);
        if (iSpace > -1 && newPp === true && initSpaces >= iSpace) {
          iSpace = -1;
        }
        var iDash = iLine.lastIndexOf('-', ew);
        if (iDash > -1) {
          if (inList && iDash <= inList) {
            // if we find the '-' at the head of the list, we reset the iDash
            iDash = -1;
          } else {
            // we want to keep the dash, so we push our break point out by one
            iDash += 1;
          }
        }
        var i = Math.max(iSpace, iDash);
        if (i === -1 || i > ew) {
          // there's no ' '/'-' or it's past our effective width so we force a hard break.
          i = ew;
        }
        if (i > iLine.length) {
          i = iLine.length;
        }
        lines.push(spcs + iLine.slice(0, i));
        // lines.push('d23456790' + '123456790'.repeat(7))
        iLine = iLine.slice(i);
        newPp = false;
      } // while input line
    } // for each input line
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return lines.join('\n');
};
exports.wrap = wrap;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0YWdCcmVha2VycyIsImdldEVmZmVjdGl2ZVdpZHRoIiwiX3JlZiIsInRleHQiLCJ3aWR0aCIsImluZGVudCIsImlnbm9yZVRhZ3MiLCJjaGFyQ291bnQiLCJ0YWdDaGFycyIsInNhd0x0QXQiLCJjdXJzb3IiLCJsZW5ndGgiLCJjaGFyIiwiY2hhckF0IiwiaW5jbHVkZXMiLCJleHBvcnRzIiwid3JhcCIsIl9yZWYyIiwiYXJndW1lbnRzIiwidW5kZWZpbmVkIiwiX3JlZjIkaGFuZ2luZ0luZGVudCIsImhhbmdpbmdJbmRlbnQiLCJfcmVmMiRpZ25vcmVUYWdzIiwiX3JlZjIkaW5kZW50IiwiX3JlZjIkc21hcnRJbmRlbnQiLCJzbWFydEluZGVudCIsIl9yZWYyJHdpZHRoIiwiaW5kZW50TW9kZXNBY3RpdmUiLCJFcnJvciIsImxpbmVzIiwiX2l0ZXJhdG9yIiwiX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIiLCJzcGxpdCIsIl9zdGVwIiwicyIsIm4iLCJkb25lIiwiaUxpbmUiLCJ2YWx1ZSIsIm5ld1BwIiwiaW5MaXN0IiwicHVzaCIsIm1hdGNoIiwicmVwbGFjZSIsImVmZmVjdGl2ZUluZGVudCIsImV3Iiwic3BjcyIsInJlcGVhdCIsImluaXRTcGFjZXMiLCJ0cmltU3RhcnQiLCJzbGljZSIsImlTcGFjZSIsImxhc3RJbmRleE9mIiwiaURhc2giLCJpIiwiTWF0aCIsIm1heCIsImVyciIsImUiLCJmIiwiam9pbiJdLCJzb3VyY2VzIjpbIi4uL3NyYy93cmFwLm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB0YWdCcmVha2VycyA9IFsnPCcsICcgJywgJ1xcbiddXG4vKipcbiogRGV0ZXJtaW5lcyB0aGUgZWZmZWN0aXZlIGNvbnNpZGVyaW5nIGFueSBpbmRlbnQgYW5kIGludmlzaWJsZSB0YWdzLlxuKi9cbmNvbnN0IGdldEVmZmVjdGl2ZVdpZHRoID0gKHsgdGV4dCwgd2lkdGgsIGluZGVudCwgaWdub3JlVGFncyB9KSA9PiB7XG4gIGlmIChpZ25vcmVUYWdzID09PSBmYWxzZSkgcmV0dXJuIHdpZHRoIC0gaW5kZW50XG4gIGVsc2Uge1xuICAgIHdpZHRoID0gd2lkdGggLSBpbmRlbnQgLy8gYWRqdXN0IHdpZHRoXG4gICAgbGV0IGNoYXJDb3VudCA9IDBcbiAgICBsZXQgdGFnQ2hhcnMgPSAwXG4gICAgbGV0IHNhd0x0QXQgPSAtMVxuICAgIGxldCBjdXJzb3IgPSAwXG4gICAgLy8gICAgICAgICB2IGhhdmUgd2UgcnVuIG91dCBvZiB0ZXh0PyAgICAgICAgIHYgb25jZSB3ZSd2ZSBjb3VudGVkIHdpZHRoIGNoYXJzLCB3ZSdyZSBkb25lXG4gICAgZm9yICg7IGN1cnNvciA8IHRleHQubGVuZ3RoICYmIGNoYXJDb3VudCA8IHdpZHRoOyBjdXJzb3IgKz0gMSkge1xuICAgICAgY29uc3QgY2hhciA9IHRleHQuY2hhckF0KGN1cnNvcilcbiAgICAgIGlmIChzYXdMdEF0ID4gLTEpIHsgLy8gbWF5YmUgaW4gYSB0YWdcbiAgICAgICAgaWYgKGNoYXIgPT09ICc+Jykge1xuICAgICAgICAgIHRhZ0NoYXJzICs9IGN1cnNvciAtIHNhd0x0QXQgKyAxXG4gICAgICAgICAgc2F3THRBdCA9IC0xXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGFnQnJlYWtlcnMuaW5jbHVkZXMoY2hhcikpIHsgLy8gZmFsc2UgYWxhcm0sIG5vdCByZWFsbHkgYSB0YWdcbiAgICAgICAgICAvLyBjaGFyQ291bnQgKz0gY3Vyc29yIC0gc2F3THRBdCArIDFcbiAgICAgICAgICBjaGFyQ291bnQgKz0gMSAvLyBjb3VudCB0aGUgJzwnXG4gICAgICAgICAgY3Vyc29yID0gc2F3THRBdCArIDEgLy8gcmVzZXQgdGhlIGN1cnNvclxuICAgICAgICAgIHNhd0x0QXQgPSAtMVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHsgLy8gbm90IGluIGEgdGFnXG4gICAgICAgIGlmIChjaGFyID09PSAnPCcpIHtcbiAgICAgICAgICBzYXdMdEF0ID0gY3Vyc29yXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY2hhckNvdW50ICs9IDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2F3THRBdCA+IC0xKSB7IC8vIHRoZW4gd2UndmUgcnVuIG9mZiB0aGUgZW5kIHdpdGhvdXQgZmluZGluZyBhIGNsb3NpbmcgdGFnXG4gICAgICBjaGFyQ291bnQgKz0gY3Vyc29yIC0gc2F3THRBdCArIDFcbiAgICAgIGlmICgoY2hhckNvdW50IC0gdGFnQ2hhcnMpID4gd2lkdGgpIHsgLy8gdGhlbiB3ZSBoYWQgYSAnPCcgYW5kIHRoZW4gY2hhcnMgdG8gdGhlIGVuZCBvZiB0aGUgbGluZVxuICAgICAgICByZXR1cm4gd2lkdGggKyB0YWdDaGFyc1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjaGFyQ291bnQgKyB0YWdDaGFyc1xuICB9XG59XG5cbmNvbnN0IHdyYXAgPSAodGV4dCwgeyBcbiAgaGFuZ2luZ0luZGVudCA9IGZhbHNlLCBcbiAgaWdub3JlVGFncyA9IGZhbHNlLCBcbiAgaW5kZW50ID0gMCwgXG4gIHNtYXJ0SW5kZW50ID0gZmFsc2UsIFxuICB3aWR0aCA9IDgwIFxufSA9IHt9KSA9PiB7XG4gIGNvbnN0IGluZGVudE1vZGVzQWN0aXZlID0gKGhhbmdpbmdJbmRlbnQgPT09IHRydWUgPyAxIDogMCkgKyAoaW5kZW50ID4gMCA/IDEgOiAwKSArIChzbWFydEluZGVudCA9PT0gdHJ1ZSA/IDEgOiAwKVxuICBpZiAoaW5kZW50TW9kZXNBY3RpdmUgPiAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTXVsdGlwbGUgaW5kZW50IG1vZGVzIGFjdGl2ZTsgb25seSBvbmUgJ2hhbmdpbmdJbmRlbnQnLCAnaW5kZW50Jywgb3IgJ3NtYXJ0SW5kZW50JyBtYXkgYmUgYWN0aXZlLlwiKVxuICB9XG5cbiAgaWYgKCF0ZXh0KSByZXR1cm4gJydcbiAgLy8gdGV4dCA9IHRleHQucmVwbGFjZSgvXFxzKyQvLCAnJykgLy8gd2UnbGwgdHJpbSB0aGUgZnJvbnQgaW5zaWRlIHRoZSB3aGlsZSBsb29wXG5cbiAgY29uc3QgbGluZXMgPSBbXVxuXG4gIGZvciAobGV0IGlMaW5lIG9mIHRleHQuc3BsaXQoJ1xcbicpKSB7XG4gICAgbGV0IG5ld1BwID0gdHJ1ZVxuICAgIGxldCBpbkxpc3QgPSAwXG4gICAgLy8gYXQgdGhlIHN0YXJ0IG9mIGVhY2ggcGFyYWdyYXBoLCB3ZSBjaGVjayBpZiB3ZSBoYXZlIGFuIGVtcHR5IGxpbmVcbiAgICBpZiAoaUxpbmUubGVuZ3RoID09PSAwKSB7XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgICAgY29udGludWVcbiAgICB9IC8vIHRoZW4gd2UgY2hlY2tlIGlmIHdlJ3JlIGluIGEgbGlzdFxuICAgIGVsc2UgaWYgKGlMaW5lLm1hdGNoKC9eICpbLSpdICsvKSkge1xuICAgICAgLy8gY291bnQgdGhlIGRlcHRoIG9mIGluZGVudGF0aW9uIChzdWItbGlzdHMpXG4gICAgICBpbkxpc3QgPSBpTGluZS5yZXBsYWNlKC9eKCAqLSArKS4qLywgJyQxJykubGVuZ3RoXG4gICAgfVxuXG4gICAgLy8gbmV3IHdlIHByb2Nlc3MgdGhlIHJlc3QgZWYgdGhlIGxpbmU7IHRoZXJlIGFyZSBtdWx0aXBsZSBleGl0IG9yIHJlLWxvb3AgcG9pbnRzLCB3aGVyZSB3ZSBzZXQgdGhlICduZXdQcCcgZmFsc2UgXG4gICAgLy8gaW5kaWNhdGluZyB0aGF0IHdlJ3JlIG5vIGxvbmdlciBhdCB0aGUgZnJvbnQgb2YgdGhlIGxpbmUuXG4gICAgd2hpbGUgKGlMaW5lLmxlbmd0aCA+IDApIHsgLy8gdXN1YWxseSB3ZSAnYnJlYWsnIHRoZSBmbG93LCBidXQgdGhpcyBjb3VsZCBoYXBwZW4gaWYgd2UgdHJpbSB0aGUgdGV4dCBleGFjdGx5LlxuICAgICAgLy8gZGV0ZXJtaW5lIGhvdyBtYW55IHNwYWNlcyB0byBhZGQgYmVmb3JlIHRoZSBjdXJyZW50IGxpbmVcbiAgICAgIGNvbnN0IGVmZmVjdGl2ZUluZGVudCA9ICFoYW5naW5nSW5kZW50ICYmICFzbWFydEluZGVudFxuICAgICAgICA/IGluZGVudFxuICAgICAgICA6IGhhbmdpbmdJbmRlbnQgJiYgIW5ld1BwXG4gICAgICAgICAgPyBpbmRlbnRcbiAgICAgICAgICA6IHNtYXJ0SW5kZW50ICYmIGluTGlzdCA+IDAgJiYgIW5ld1BwXG4gICAgICAgICAgICA/IGluTGlzdCBcbiAgICAgICAgICAgIDogMFxuICAgICAgY29uc3QgZXcgPSBnZXRFZmZlY3RpdmVXaWR0aCh7IHRleHQgOiBpTGluZSwgd2lkdGgsIGluZGVudCA6IGVmZmVjdGl2ZUluZGVudCwgaWdub3JlVGFncyB9KVxuICAgICAgY29uc3Qgc3BjcyA9ICcgJy5yZXBlYXQoZWZmZWN0aXZlSW5kZW50KVxuICAgICAgbGV0IGluaXRTcGFjZXMgPSAwXG4gICAgICBpZiAobmV3UHAgPT09IGZhbHNlKSB7IC8vIHRyaW0gYW55IHdoaXRlc3BhY2UgKGxpa2UgdGhlICcgJyBpbiBmcm9udCBvZiB0aGUgbGFzdCBpbnNlcnRlZCBsaW5lIGJyZWFrKVxuICAgICAgICAvLyB1bmxlc3Mgd2UncmUgYXQgdGhlIHN0YXJ0IG9mIGEgUFAsIGluIHdoaWNoIGNhc2Ugd2Ugd2FudCB0byBwcmVzZXJ2ZSB0aGUgaW5pdGlhbCBpbmRlbnQgb3IgbGlzdCBpbmRlbnRcbiAgICAgICAgaUxpbmUgPSBpTGluZS50cmltU3RhcnQoKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGluaXRTcGFjZXMgPSBpTGluZS5yZXBsYWNlKC9eKCAqKS4qLywgJyQxJykubGVuZ3RoXG4gICAgICB9XG5cbiAgICAgIGlmIChldyA+PSBpTGluZS5sZW5ndGgpIHtcbiAgICAgICAgbGluZXMucHVzaChzcGNzICsgaUxpbmUpXG4gICAgICAgIG5ld1BwID0gZmFsc2VcbiAgICAgICAgLy8gbGluZXMucHVzaCgnYTIzNDU2NzkwJyArICcxMjM0NTY3OTAnLnJlcGVhdCg3KSlcbiAgICAgICAgYnJlYWsgLy8gd2UncmUgZG9uZVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaUxpbmUuY2hhckF0KGV3KSA9PT0gJyAnKSB7XG4gICAgICAgIGxpbmVzLnB1c2goc3BjcyArIGlMaW5lLnNsaWNlKDAsIGV3KSlcbiAgICAgICAgaUxpbmUgPSBpTGluZS5zbGljZShldylcbiAgICAgICAgbmV3UHAgPSBmYWxzZVxuICAgICAgICAvLyBsaW5lcy5wdXNoKCdiMjM0NTY3OTAnICsgJzEyMzQ1Njc5MCcucmVwZWF0KDcpKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaUxpbmUuY2hhckF0KGV3IC0gMSkgPT09ICctJykge1xuICAgICAgICBsaW5lcy5wdXNoKHNwY3MgKyBpTGluZS5zbGljZSgwLCBldykpXG4gICAgICAgIGlMaW5lID0gaUxpbmUuc2xpY2UoZXcpXG4gICAgICAgIG5ld1BwID0gZmFsc2VcbiAgICAgICAgLy8gbGluZXMucHVzaCgnYzIzNDU2NzkwJyArICcxMjM0NTY3OTAnLnJlcGVhdCg3KSlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gd2hhdCdzIHRoZSBsYXN0IGluZGV4IG9mIG91ciBicmVhayBwb2ludHMgd2l0aGluIHRoZSBlZmZlY3RpdmUgd2lkdGggcmFuZ2U/XG4gICAgICBsZXQgaVNwYWNlID0gaUxpbmUubGFzdEluZGV4T2YoJyAnLCBldylcbiAgICAgIGlmIChpU3BhY2UgPiAtMSAmJiBuZXdQcCA9PT0gdHJ1ZSAmJiBpbml0U3BhY2VzID49IGlTcGFjZSkge1xuICAgICAgICBpU3BhY2UgPSAtMVxuICAgICAgfVxuXG4gICAgICBsZXQgaURhc2ggPSBpTGluZS5sYXN0SW5kZXhPZignLScsIGV3KVxuICAgICAgaWYgKGlEYXNoID4gLTEpIHtcbiAgICAgICAgaWYgKGluTGlzdCAmJiBpRGFzaCA8PSBpbkxpc3QpIHsgLy8gaWYgd2UgZmluZCB0aGUgJy0nIGF0IHRoZSBoZWFkIG9mIHRoZSBsaXN0LCB3ZSByZXNldCB0aGUgaURhc2hcbiAgICAgICAgICBpRGFzaCA9IC0xXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIHdlIHdhbnQgdG8ga2VlcCB0aGUgZGFzaCwgc28gd2UgcHVzaCBvdXIgYnJlYWsgcG9pbnQgb3V0IGJ5IG9uZVxuICAgICAgICAgIGlEYXNoICs9IDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBsZXQgaSA9IE1hdGgubWF4KGlTcGFjZSwgaURhc2gpXG4gICAgICBpZiAoaSA9PT0gLTEgfHwgaSA+IGV3KSB7IC8vIHRoZXJlJ3Mgbm8gJyAnLyctJyBvciBpdCdzIHBhc3Qgb3VyIGVmZmVjdGl2ZSB3aWR0aCBzbyB3ZSBmb3JjZSBhIGhhcmQgYnJlYWsuXG4gICAgICAgIGkgPSBld1xuICAgICAgfVxuICAgICAgaWYgKGkgPiBpTGluZS5sZW5ndGgpIHtcbiAgICAgICAgaSA9IGlMaW5lLmxlbmd0aFxuICAgICAgfVxuXG4gICAgICBsaW5lcy5wdXNoKHNwY3MgKyBpTGluZS5zbGljZSgwLCBpKSlcbiAgICAgIC8vIGxpbmVzLnB1c2goJ2QyMzQ1Njc5MCcgKyAnMTIzNDU2NzkwJy5yZXBlYXQoNykpXG4gICAgICBpTGluZSA9IGlMaW5lLnNsaWNlKGkpXG5cbiAgICAgIG5ld1BwID0gZmFsc2VcbiAgICB9IC8vIHdoaWxlIGlucHV0IGxpbmVcbiAgfSAvLyBmb3IgZWFjaCBpbnB1dCBsaW5lXG5cbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG59XG5cbmV4cG9ydCB7IGdldEVmZmVjdGl2ZVdpZHRoLCB3cmFwIH1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsSUFBTUEsV0FBVyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM7QUFDcEM7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsaUJBQWlCLEdBQUcsU0FBcEJBLGlCQUFpQkEsQ0FBQUMsSUFBQSxFQUE0QztFQUFBLElBQXRDQyxJQUFJLEdBQUFELElBQUEsQ0FBSkMsSUFBSTtJQUFFQyxLQUFLLEdBQUFGLElBQUEsQ0FBTEUsS0FB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