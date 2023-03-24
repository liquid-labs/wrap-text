"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrap = void 0;
var _getEffectiveWidth = require("./get-effective-width");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var wrap = function wrap(text) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref$hangingIndent = _ref.hangingIndent,
    hangingIndent = _ref$hangingIndent === void 0 ? false : _ref$hangingIndent,
    _ref$ignoreTags = _ref.ignoreTags,
    ignoreTags = _ref$ignoreTags === void 0 ? false : _ref$ignoreTags,
    _ref$indent = _ref.indent,
    indent = _ref$indent === void 0 ? 0 : _ref$indent,
    _ref$smartIndent = _ref.smartIndent,
    smartIndent = _ref$smartIndent === void 0 ? false : _ref$smartIndent,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? 80 : _ref$width;
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
        var ew = (0, _getEffectiveWidth.getEffectiveWidth)({
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
          // if we're new PP, we want to preserve the initial indent and not break on spaces within
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZ2V0RWZmZWN0aXZlV2lkdGgiLCJyZXF1aXJlIiwiX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIiLCJvIiwiYWxsb3dBcnJheUxpa2UiLCJpdCIsIlN5bWJvbCIsIml0ZXJhdG9yIiwiQXJyYXkiLCJpc0FycmF5IiwiX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5IiwibGVuZ3RoIiwiaSIsIkYiLCJzIiwibiIsImRvbmUiLCJ2YWx1ZSIsImUiLCJfZSIsImYiLCJUeXBlRXJyb3IiLCJub3JtYWxDb21wbGV0aW9uIiwiZGlkRXJyIiwiZXJyIiwiY2FsbCIsInN0ZXAiLCJuZXh0IiwiX2UyIiwibWluTGVuIiwiX2FycmF5TGlrZVRvQXJyYXkiLCJPYmplY3QiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsInNsaWNlIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiZnJvbSIsInRlc3QiLCJhcnIiLCJsZW4iLCJhcnIyIiwid3JhcCIsInRleHQiLCJfcmVmIiwiYXJndW1lbnRzIiwidW5kZWZpbmVkIiwiX3JlZiRoYW5naW5nSW5kZW50IiwiaGFuZ2luZ0luZGVudCIsIl9yZWYkaWdub3JlVGFncyIsImlnbm9yZVRhZ3MiLCJfcmVmJGluZGVudCIsImluZGVudCIsIl9yZWYkc21hcnRJbmRlbnQiLCJzbWFydEluZGVudCIsIl9yZWYkd2lkdGgiLCJ3aWR0aCIsImluZGVudE1vZGVzQWN0aXZlIiwiRXJyb3IiLCJsaW5lcyIsIl9pdGVyYXRvciIsInNwbGl0IiwiX3N0ZXAiLCJpTGluZSIsIm5ld1BwIiwiaW5MaXN0IiwicHVzaCIsIm1hdGNoIiwicmVwbGFjZSIsImVmZmVjdGl2ZUluZGVudCIsImV3IiwiZ2V0RWZmZWN0aXZlV2lkdGgiLCJzcGNzIiwicmVwZWF0IiwiaW5pdFNwYWNlcyIsInRyaW1TdGFydCIsImNoYXJBdCIsImlTcGFjZSIsImxhc3RJbmRleE9mIiwiaURhc2giLCJNYXRoIiwibWF4Iiwiam9pbiIsImV4cG9ydHMiXSwic291cmNlcyI6WyIuLi9zcmMvd3JhcC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0RWZmZWN0aXZlV2lkdGggfSBmcm9tICcuL2dldC1lZmZlY3RpdmUtd2lkdGgnXG5cbmNvbnN0IHdyYXAgPSAodGV4dCwgeyBcbiAgaGFuZ2luZ0luZGVudCA9IGZhbHNlLCBcbiAgaWdub3JlVGFncyA9IGZhbHNlLCBcbiAgaW5kZW50ID0gMCwgXG4gIHNtYXJ0SW5kZW50ID0gZmFsc2UsIFxuICB3aWR0aCA9IDgwIFxufSA9IHt9KSA9PiB7XG4gIGNvbnN0IGluZGVudE1vZGVzQWN0aXZlID0gKGhhbmdpbmdJbmRlbnQgPT09IHRydWUgPyAxIDogMCkgKyAoaW5kZW50ID4gMCA/IDEgOiAwKSArIChzbWFydEluZGVudCA9PT0gdHJ1ZSA/IDEgOiAwKVxuICBpZiAoaW5kZW50TW9kZXNBY3RpdmUgPiAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTXVsdGlwbGUgaW5kZW50IG1vZGVzIGFjdGl2ZTsgb25seSBvbmUgJ2hhbmdpbmdJbmRlbnQnLCAnaW5kZW50Jywgb3IgJ3NtYXJ0SW5kZW50JyBtYXkgYmUgYWN0aXZlLlwiKVxuICB9XG5cbiAgaWYgKCF0ZXh0KSByZXR1cm4gJydcbiAgLy8gdGV4dCA9IHRleHQucmVwbGFjZSgvXFxzKyQvLCAnJykgLy8gd2UnbGwgdHJpbSB0aGUgZnJvbnQgaW5zaWRlIHRoZSB3aGlsZSBsb29wXG5cbiAgY29uc3QgbGluZXMgPSBbXVxuXG4gIGZvciAobGV0IGlMaW5lIG9mIHRleHQuc3BsaXQoJ1xcbicpKSB7XG4gICAgbGV0IG5ld1BwID0gdHJ1ZVxuICAgIGxldCBpbkxpc3QgPSAwXG4gICAgLy8gYXQgdGhlIHN0YXJ0IG9mIGVhY2ggcGFyYWdyYXBoLCB3ZSBjaGVjayBpZiB3ZSBoYXZlIGFuIGVtcHR5IGxpbmVcbiAgICBpZiAoaUxpbmUubGVuZ3RoID09PSAwKSB7XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgICAgY29udGludWVcbiAgICB9IC8vIHRoZW4gd2UgY2hlY2tlIGlmIHdlJ3JlIGluIGEgbGlzdFxuICAgIGVsc2UgaWYgKGlMaW5lLm1hdGNoKC9eICpbLSpdICsvKSkge1xuICAgICAgLy8gY291bnQgdGhlIGRlcHRoIG9mIGluZGVudGF0aW9uIChzdWItbGlzdHMpXG4gICAgICBpbkxpc3QgPSBpTGluZS5yZXBsYWNlKC9eKCAqLSArKS4qLywgJyQxJykubGVuZ3RoXG4gICAgfVxuXG4gICAgLy8gbmV3IHdlIHByb2Nlc3MgdGhlIHJlc3QgZWYgdGhlIGxpbmU7IHRoZXJlIGFyZSBtdWx0aXBsZSBleGl0IG9yIHJlLWxvb3AgcG9pbnRzLCB3aGVyZSB3ZSBzZXQgdGhlICduZXdQcCcgZmFsc2UgXG4gICAgLy8gaW5kaWNhdGluZyB0aGF0IHdlJ3JlIG5vIGxvbmdlciBhdCB0aGUgZnJvbnQgb2YgdGhlIGxpbmUuXG4gICAgd2hpbGUgKGlMaW5lLmxlbmd0aCA+IDApIHsgLy8gdXN1YWxseSB3ZSAnYnJlYWsnIHRoZSBmbG93LCBidXQgdGhpcyBjb3VsZCBoYXBwZW4gaWYgd2UgdHJpbSB0aGUgdGV4dCBleGFjdGx5LlxuICAgICAgLy8gZGV0ZXJtaW5lIGhvdyBtYW55IHNwYWNlcyB0byBhZGQgYmVmb3JlIHRoZSBjdXJyZW50IGxpbmVcbiAgICAgIGNvbnN0IGVmZmVjdGl2ZUluZGVudCA9ICFoYW5naW5nSW5kZW50ICYmICFzbWFydEluZGVudFxuICAgICAgICA/IGluZGVudFxuICAgICAgICA6IGhhbmdpbmdJbmRlbnQgJiYgIW5ld1BwXG4gICAgICAgICAgPyBpbmRlbnRcbiAgICAgICAgICA6IHNtYXJ0SW5kZW50ICYmIGluTGlzdCA+IDAgJiYgIW5ld1BwXG4gICAgICAgICAgICA/IGluTGlzdCBcbiAgICAgICAgICAgIDogMFxuICAgICAgY29uc3QgZXcgPSBnZXRFZmZlY3RpdmVXaWR0aCh7IHRleHQgOiBpTGluZSwgd2lkdGgsIGluZGVudCA6IGVmZmVjdGl2ZUluZGVudCwgaWdub3JlVGFncyB9KVxuICAgICAgY29uc3Qgc3BjcyA9ICcgJy5yZXBlYXQoZWZmZWN0aXZlSW5kZW50KVxuICAgICAgbGV0IGluaXRTcGFjZXMgPSAwXG4gICAgICBpZiAobmV3UHAgPT09IGZhbHNlKSB7IC8vIHRyaW0gYW55IHdoaXRlc3BhY2UgKGxpa2UgdGhlICcgJyBpbiBmcm9udCBvZiB0aGUgbGFzdCBpbnNlcnRlZCBsaW5lIGJyZWFrKVxuICAgICAgICAvLyB1bmxlc3Mgd2UncmUgYXQgdGhlIHN0YXJ0IG9mIGEgUFAsIGluIHdoaWNoIGNhc2Ugd2Ugd2FudCB0byBwcmVzZXJ2ZSB0aGUgaW5pdGlhbCBpbmRlbnQgb3IgbGlzdCBpbmRlbnRcbiAgICAgICAgaUxpbmUgPSBpTGluZS50cmltU3RhcnQoKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGluaXRTcGFjZXMgPSBpTGluZS5yZXBsYWNlKC9eKCAqKS4qLywgJyQxJykubGVuZ3RoXG4gICAgICB9XG5cbiAgICAgIGlmIChldyA+PSBpTGluZS5sZW5ndGgpIHtcbiAgICAgICAgbGluZXMucHVzaChzcGNzICsgaUxpbmUpXG4gICAgICAgIG5ld1BwID0gZmFsc2VcbiAgICAgICAgLy8gbGluZXMucHVzaCgnYTIzNDU2NzkwJyArICcxMjM0NTY3OTAnLnJlcGVhdCg3KSlcbiAgICAgICAgYnJlYWsgLy8gd2UncmUgZG9uZVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaUxpbmUuY2hhckF0KGV3KSA9PT0gJyAnKSB7XG4gICAgICAgIGxpbmVzLnB1c2goc3BjcyArIGlMaW5lLnNsaWNlKDAsIGV3KSlcbiAgICAgICAgaUxpbmUgPSBpTGluZS5zbGljZShldylcbiAgICAgICAgbmV3UHAgPSBmYWxzZVxuICAgICAgICAvLyBsaW5lcy5wdXNoKCdiMjM0NTY3OTAnICsgJzEyMzQ1Njc5MCcucmVwZWF0KDcpKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaUxpbmUuY2hhckF0KGV3IC0gMSkgPT09ICctJykge1xuICAgICAgICBsaW5lcy5wdXNoKHNwY3MgKyBpTGluZS5zbGljZSgwLCBldykpXG4gICAgICAgIGlMaW5lID0gaUxpbmUuc2xpY2UoZXcpXG4gICAgICAgIG5ld1BwID0gZmFsc2VcbiAgICAgICAgLy8gbGluZXMucHVzaCgnYzIzNDU2NzkwJyArICcxMjM0NTY3OTAnLnJlcGVhdCg3KSlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gd2hhdCdzIHRoZSBsYXN0IGluZGV4IG9mIG91ciBicmVhayBwb2ludHMgd2l0aGluIHRoZSBlZmZlY3RpdmUgd2lkdGggcmFuZ2U/XG4gICAgICBsZXQgaVNwYWNlID0gaUxpbmUubGFzdEluZGV4T2YoJyAnLCBldylcbiAgICAgIGlmIChpU3BhY2UgPiAtMSAmJiBuZXdQcCA9PT0gdHJ1ZSAmJiBpbml0U3BhY2VzID49IGlTcGFjZSkge1xuICAgICAgICAvLyBpZiB3ZSdyZSBuZXcgUFAsIHdlIHdhbnQgdG8gcHJlc2VydmUgdGhlIGluaXRpYWwgaW5kZW50IGFuZCBub3QgYnJlYWsgb24gc3BhY2VzIHdpdGhpblxuICAgICAgICBpU3BhY2UgPSAtMVxuICAgICAgfVxuXG4gICAgICBsZXQgaURhc2ggPSBpTGluZS5sYXN0SW5kZXhPZignLScsIGV3KVxuICAgICAgaWYgKGlEYXNoID4gLTEpIHtcbiAgICAgICAgaWYgKGluTGlzdCAmJiBpRGFzaCA8PSBpbkxpc3QpIHsgLy8gaWYgd2UgZmluZCB0aGUgJy0nIGF0IHRoZSBoZWFkIG9mIHRoZSBsaXN0LCB3ZSByZXNldCB0aGUgaURhc2hcbiAgICAgICAgICBpRGFzaCA9IC0xXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIHdlIHdhbnQgdG8ga2VlcCB0aGUgZGFzaCwgc28gd2UgcHVzaCBvdXIgYnJlYWsgcG9pbnQgb3V0IGJ5IG9uZVxuICAgICAgICAgIGlEYXNoICs9IDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBsZXQgaSA9IE1hdGgubWF4KGlTcGFjZSwgaURhc2gpXG4gICAgICBpZiAoaSA9PT0gLTEgfHwgaSA+IGV3KSB7IC8vIHRoZXJlJ3Mgbm8gJyAnLyctJyBvciBpdCdzIHBhc3Qgb3VyIGVmZmVjdGl2ZSB3aWR0aCBzbyB3ZSBmb3JjZSBhIGhhcmQgYnJlYWsuXG4gICAgICAgIGkgPSBld1xuICAgICAgfVxuICAgICAgaWYgKGkgPiBpTGluZS5sZW5ndGgpIHtcbiAgICAgICAgaSA9IGlMaW5lLmxlbmd0aFxuICAgICAgfVxuXG4gICAgICBsaW5lcy5wdXNoKHNwY3MgKyBpTGluZS5zbGljZSgwLCBpKSlcbiAgICAgIC8vIGxpbmVzLnB1c2goJ2QyMzQ1Njc5MCcgKyAnMTIzNDU2NzkwJy5yZXBlYXQoNykpXG4gICAgICBpTGluZSA9IGlMaW5lLnNsaWNlKGkpXG5cbiAgICAgIG5ld1BwID0gZmFsc2VcbiAgICB9IC8vIHdoaWxlIGlucHV0IGxpbmVcbiAgfSAvLyBmb3IgZWFjaCBpbnB1dCBsaW5lXG5cbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG59XG5cbmV4cG9ydCB7IHdyYXAgfVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFBQSxrQkFBQSxHQUFBQyxPQUFBO0FBQXlELFNBQUFDLDJCQUFBQyxDQUFBLEVBQUFDLGNBQUEsUUFBQUMsRUFBQSxVQUFBQyxNQUFBLG9CQUFBSCxDQUFBLENBQUFHLE1BQUEsQ0FBQUMsUUFBQSxLQUFBSixDQUFBLHFCQUFBRSxFQUFBLFFBQUFHLEtBQUEsQ0FBQUMsT0FBQSxDQUFBTixDQUFBLE1BQUFFLEVBQUEsR0FBQUssMkJBQUEsQ0FBQVAsQ0FBQSxNQUFBQyxjQUFBLElBQUFELENBQUEsV0FBQUEsQ0FBQSxDQUFBUSxNQUFBLHFCQUFBTixFQUFBLEVBQUFGLENBQUEsR0FBQUUsRUFBQSxNQUFBTyxDQUFBLFVBQUFDLENBQUEsWUFBQUEsRUFBQSxlQUFBQyxDQUFBLEVBQUFELENBQUEsRUFBQUUsQ0FBQSxXQUFBQSxFQUFBLFFBQUFILENBQUEsSUFBQVQsQ0FBQSxDQUFBUSxNQUFBLFdBQUFLLElBQUEsbUJBQUFBLElBQUEsU0FBQUMsS0FBQSxFQUFBZCxDQUFBLENBQUFTLENBQUEsVUFBQU0sQ0FBQSxXQUFBQSxFQUFBQyxFQUFBLFVBQUFBLEVBQUEsS0FBQUMsQ0FBQSxFQUFBUCxDQUFBLGdCQUFBUSxTQUFBLGlKQUFBQyxnQkFBQSxTQUFBQyxNQUFBLFVBQUFDLEdBQUEsV0FBQVYsQ0FBQSxXQUFBQSxFQUFBLElBQUFULEVBQUEsR0FBQUEsRUFBQSxDQUFBb0IsSUFBQSxDQUFBdEIsQ0FBQSxNQUFBWSxDQUFBLFdBQUFBLEVBQUEsUUFBQVcsSUFBQSxHQUFBckIsRUFBQSxDQUFBc0IsSUFBQSxJQUFBTCxnQkFBQSxHQUFBSSxJQUFBLENBQUFWLElBQUEsU0FBQVUsSUFBQSxLQUFBUixDQUFBLFdBQUFBLEVBQUFVLEdBQUEsSUFBQUwsTUFBQSxTQUFBQyxHQUFBLEdBQUFJLEdBQUEsS0FBQVIsQ0FBQSxXQUFBQSxFQUFBLGVBQUFFLGdCQUFBLElBQUFqQixFQUFBLG9CQUFBQSxFQUFBLDhCQUFBa0IsTUFBQSxRQUFBQyxHQUFBO0FBQUEsU0FBQWQsNEJBQUFQLENBQUEsRUFBQTBCLE1BQUEsU0FBQTFCLENBQUEscUJBQUFBLENBQUEsc0JBQUEyQixpQkFBQSxDQUFBM0IsQ0FBQSxFQUFBMEIsTUFBQSxPQUFBZCxDQUFBLEdBQUFnQixNQUFBLENBQUFDLFNBQUEsQ0FBQUMsUUFBQSxDQUFBUixJQUFBLENBQUF0QixDQUFBLEVBQUErQixLQUFBLGFBQUFuQixDQUFBLGlCQUFBWixDQUFBLENBQUFnQyxXQUFBLEVBQUFwQixDQUFBLEdBQUFaLENBQUEsQ0FBQWdDLFdBQUEsQ0FBQUMsSUFBQSxNQUFBckIsQ0FBQSxjQUFBQSxDQUFBLG1CQUFBUCxLQUFBLENBQUE2QixJQUFBLENBQUFsQyxDQUFBLE9BQUFZLENBQUEsK0RBQUF1QixJQUFBLENBQUF2QixDQUFBLFVBQUFlLGlCQUFBLENBQUEzQixDQUFBLEVBQUEwQixNQUFBO0FBQUEsU0FBQUMsa0JBQUFTLEdBQUEsRUFBQUMsR0FBQSxRQUFBQSxHQUFBLFlBQUFBLEdBQUEsR0FBQUQsR0FBQSxDQUFBNUIsTUFBQSxFQUFBNkIsR0FBQSxHQUFBRCxHQUFBLENBQUE1QixNQUFBLFdBQUFDLENBQUEsTUFBQTZCLElBQUEsT0FBQWpDLEtBQUEsQ0FBQWdDLEdBQUEsR0FBQTVCLENBQUEsR0FBQTRCLEdBQUEsRUFBQTVCLENBQUEsSUFBQTZCLElBQUEsQ0FBQTdCLENBQUEsSUFBQTJCLEdBQUEsQ0FBQTNCLENBQUEsVUFBQTZCLElBQUE7QUFFekQsSUFBTUMsSUFBSSxHQUFHLFNBQVBBLElBQUlBLENBQUlDLElBQUksRUFNUDtFQUFBLElBQUFDLElBQUEsR0FBQUMsU0FBQSxDQUFBbEMsTUFBQSxRQUFBa0MsU0FBQSxRQUFBQyxTQUFBLEdBQUFELFNBQUEsTUFBUCxDQUFDLENBQUM7SUFBQUUsa0JBQUEsR0FBQUgsSUFBQSxDQUxKSSxhQUFhO0lBQWJBLGFBQWEsR0FBQUQsa0JBQUEsY0FBRyxLQUFLLEdBQUFBLGtCQUFBO0lBQUFFLGVBQUEsR0FBQUwsSUFBQSxDQUNyQk0sVUFBVTtJQUFWQSxVQUFVLEdBQUFELGVBQUEsY0FBRyxLQUFLLEdBQUFBLGVBQUE7SUFBQUUsV0FBQSxHQUFBUCxJQUFBLENBQ2xCUSxNQUFNO0lBQU5BLE1BQU0sR0FBQUQsV0FBQSxjQUFHLENBQUMsR0FBQUEsV0FBQTtJQUFBRSxnQkFBQSxHQUFBVCxJQUFBLENBQ1ZVLFdBQVc7SUFBWEEsV0FBVyxHQUFBRCxnQkFBQSxjQUFHLEtBQUssR0FBQUEsZ0JBQUE7SUFBQUUsVUFBQSxHQUFBWCxJQUFBLENBQ25CWSxLQUFLO0lBQUxBLEtBQUssR0FBQUQsVUFBQSxjQUFHLEVBQUUsR0FBQUEsVUFBQTtFQUVWLElBQU1FLGlCQUFpQixHQUFHLENBQUNULGFBQWEsS0FBSyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBS0ksTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUlFLFdBQVcsS0FBSyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNsSCxJQUFJRyxpQkFBaUIsR0FBRyxDQUFDLEVBQUU7SUFDekIsTUFBTSxJQUFJQyxLQUFLLENBQUMsbUdBQW1HLENBQUM7RUFDdEg7RUFFQSxJQUFJLENBQUNmLElBQUksRUFBRSxPQUFPLEVBQUU7RUFDcEI7O0VBRUEsSUFBTWdCLEtBQUssR0FBRyxFQUFFO0VBQUEsSUFBQUMsU0FBQSxHQUFBMUQsMEJBQUEsQ0FFRXlDLElBQUksQ0FBQ2tCLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFBQUMsS0FBQTtFQUFBO0lBQWxDLEtBQUFGLFNBQUEsQ0FBQTlDLENBQUEsTUFBQWdELEtBQUEsR0FBQUYsU0FBQSxDQUFBN0MsQ0FBQSxJQUFBQyxJQUFBLEdBQW9DO01BQUEsSUFBM0IrQyxLQUFLLEdBQUFELEtBQUEsQ0FBQTdDLEtBQUE7TUFDWixJQUFJK0MsS0FBSyxHQUFHLElBQUk7TUFDaEIsSUFBSUMsTUFBTSxHQUFHLENBQUM7TUFDZDtNQUNBLElBQUlGLEtBQUssQ0FBQ3BELE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDdEJnRCxLQUFLLENBQUNPLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDZDtNQUNGLENBQUMsQ0FBQztNQUFBLEtBQ0csSUFBSUgsS0FBSyxDQUFDSSxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDakM7UUFDQUYsTUFBTSxHQUFHRixLQUFLLENBQUNLLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUN6RCxNQUFNO01BQ25EOztNQUVBO01BQ0E7TUFDQSxPQUFPb0QsS0FBSyxDQUFDcEQsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUFFO1FBQ3pCO1FBQ0EsSUFBTTBELGVBQWUsR0FBRyxDQUFDckIsYUFBYSxJQUFJLENBQUNNLFdBQVcsR0FDbERGLE1BQU0sR0FDTkosYUFBYSxJQUFJLENBQUNnQixLQUFLLEdBQ3JCWixNQUFNLEdBQ05FLFdBQVcsSUFBSVcsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDRCxLQUFLLEdBQ2pDQyxNQUFNLEdBQ04sQ0FBQztRQUNULElBQU1LLEVBQUUsR0FBRyxJQUFBQyxvQ0FBaUIsRUFBQztVQUFFNUIsSUFBSSxFQUFHb0IsS0FBSztVQUFFUCxLQUFLLEVBQUxBLEtBQUs7VUFBRUosTUFBTSxFQUFHaUIsZUFBZTtVQUFFbkIsVUFBVSxFQUFWQTtRQUFXLENBQUMsQ0FBQztRQUMzRixJQUFNc0IsSUFBSSxHQUFHLEdBQUcsQ0FBQ0MsTUFBTSxDQUFDSixlQUFlLENBQUM7UUFDeEMsSUFBSUssVUFBVSxHQUFHLENBQUM7UUFDbEIsSUFBSVYsS0FBSyxLQUFLLEtBQUssRUFBRTtVQUFFO1VBQ3JCO1VBQ0FELEtBQUssR0FBR0EsS0FBSyxDQUFDWSxTQUFTLEVBQUU7UUFDM0IsQ0FBQyxNQUNJO1VBQ0hELFVBQVUsR0FBR1gsS0FBSyxDQUFDSyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDekQsTUFBTTtRQUNwRDtRQUVBLElBQUkyRCxFQUFFLElBQUlQLEtBQUssQ0FBQ3BELE1BQU0sRUFBRTtVQUN0QmdELEtBQUssQ0FBQ08sSUFBSSxDQUFDTSxJQUFJLEdBQUdULEtBQUssQ0FBQztVQUN4QkMsS0FBSyxHQUFHLEtBQUs7VUFDYjtVQUNBLE1BQUssQ0FBQztRQUNSLENBQUMsTUFDSSxJQUFJRCxLQUFLLENBQUNhLE1BQU0sQ0FBQ04sRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFFO1VBQ2pDWCxLQUFLLENBQUNPLElBQUksQ0FBQ00sSUFBSSxHQUFHVCxLQUFLLENBQUM3QixLQUFLLENBQUMsQ0FBQyxFQUFFb0MsRUFBRSxDQUFDLENBQUM7VUFDckNQLEtBQUssR0FBR0EsS0FBSyxDQUFDN0IsS0FBSyxDQUFDb0MsRUFBRSxDQUFDO1VBQ3ZCTixLQUFLLEdBQUcsS0FBSztVQUNiO1VBQ0E7UUFDRixDQUFDLE1BQ0ksSUFBSUQsS0FBSyxDQUFDYSxNQUFNLENBQUNOLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7VUFDckNYLEtBQUssQ0FBQ08sSUFBSSxDQUFDTSxJQUFJLEdBQUdULEtBQUssQ0FBQzdCLEtBQUssQ0FBQyxDQUFDLEVBQUVvQyxFQUFFLENBQUMsQ0FBQztVQUNyQ1AsS0FBSyxHQUFHQSxLQUFLLENBQUM3QixLQUFLLENBQUNvQyxFQUFFLENBQUM7VUFDdkJOLEtBQUssR0FBRyxLQUFLO1VBQ2I7VUFDQTtRQUNGOztRQUVBO1FBQ0EsSUFBSWEsTUFBTSxHQUFHZCxLQUFLLENBQUNlLFdBQVcsQ0FBQyxHQUFHLEVBQUVSLEVBQUUsQ0FBQztRQUN2QyxJQUFJTyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUliLEtBQUssS0FBSyxJQUFJLElBQUlVLFVBQVUsSUFBSUcsTUFBTSxFQUFFO1VBQ3pEO1VBQ0FBLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDYjtRQUVBLElBQUlFLEtBQUssR0FBR2hCLEtBQUssQ0FBQ2UsV0FBVyxDQUFDLEdBQUcsRUFBRVIsRUFBRSxDQUFDO1FBQ3RDLElBQUlTLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRTtVQUNkLElBQUlkLE1BQU0sSUFBSWMsS0FBSyxJQUFJZCxNQUFNLEVBQUU7WUFBRTtZQUMvQmMsS0FBSyxHQUFHLENBQUMsQ0FBQztVQUNaLENBQUMsTUFDSTtZQUFFO1lBQ0xBLEtBQUssSUFBSSxDQUFDO1VBQ1o7UUFDRjtRQUVBLElBQUluRSxDQUFDLEdBQUdvRSxJQUFJLENBQUNDLEdBQUcsQ0FBQ0osTUFBTSxFQUFFRSxLQUFLLENBQUM7UUFDL0IsSUFBSW5FLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSUEsQ0FBQyxHQUFHMEQsRUFBRSxFQUFFO1VBQUU7VUFDeEIxRCxDQUFDLEdBQUcwRCxFQUFFO1FBQ1I7UUFDQSxJQUFJMUQsQ0FBQyxHQUFHbUQsS0FBSyxDQUFDcEQsTUFBTSxFQUFFO1VBQ3BCQyxDQUFDLEdBQUdtRCxLQUFLLENBQUNwRCxNQUFNO1FBQ2xCO1FBRUFnRCxLQUFLLENBQUNPLElBQUksQ0FBQ00sSUFBSSxHQUFHVCxLQUFLLENBQUM3QixLQUFLLENBQUMsQ0FBQyxFQUFFdEIsQ0FBQyxDQUFDLENBQUM7UUFDcEM7UUFDQW1ELEtBQUssR0FBR0EsS0FBSyxDQUFDN0IsS0FBSyxDQUFDdEIsQ0FBQyxDQUFDO1FBRXRCb0QsS0FBSyxHQUFHLEtBQUs7TUFDZixDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7RUFBQSxTQUFBeEMsR0FBQTtJQUFBb0MsU0FBQSxDQUFBMUMsQ0FBQSxDQUFBTSxHQUFBO0VBQUE7SUFBQW9DLFNBQUEsQ0FBQXhDLENBQUE7RUFBQTtFQUVGLE9BQU91QyxLQUFLLENBQUN1QixJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3pCLENBQUM7QUFBQUMsT0FBQSxDQUFBekMsSUFBQSxHQUFBQSxJQUFBIn0=