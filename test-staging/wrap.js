"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "getEffectiveWidth", {
  enumerable: true,
  get: function get() {
    return _getEffectiveWidth.getEffectiveWidth;
  }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZ2V0RWZmZWN0aXZlV2lkdGgiLCJyZXF1aXJlIiwiX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIiLCJvIiwiYWxsb3dBcnJheUxpa2UiLCJpdCIsIlN5bWJvbCIsIml0ZXJhdG9yIiwiQXJyYXkiLCJpc0FycmF5IiwiX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5IiwibGVuZ3RoIiwiaSIsIkYiLCJzIiwibiIsImRvbmUiLCJ2YWx1ZSIsImUiLCJfZSIsImYiLCJUeXBlRXJyb3IiLCJub3JtYWxDb21wbGV0aW9uIiwiZGlkRXJyIiwiZXJyIiwiY2FsbCIsInN0ZXAiLCJuZXh0IiwiX2UyIiwibWluTGVuIiwiX2FycmF5TGlrZVRvQXJyYXkiLCJPYmplY3QiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsInNsaWNlIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiZnJvbSIsInRlc3QiLCJhcnIiLCJsZW4iLCJhcnIyIiwid3JhcCIsInRleHQiLCJfcmVmIiwiYXJndW1lbnRzIiwidW5kZWZpbmVkIiwiX3JlZiRoYW5naW5nSW5kZW50IiwiaGFuZ2luZ0luZGVudCIsIl9yZWYkaWdub3JlVGFncyIsImlnbm9yZVRhZ3MiLCJfcmVmJGluZGVudCIsImluZGVudCIsIl9yZWYkc21hcnRJbmRlbnQiLCJzbWFydEluZGVudCIsIl9yZWYkd2lkdGgiLCJ3aWR0aCIsImluZGVudE1vZGVzQWN0aXZlIiwiRXJyb3IiLCJsaW5lcyIsIl9pdGVyYXRvciIsInNwbGl0IiwiX3N0ZXAiLCJpTGluZSIsIm5ld1BwIiwiaW5MaXN0IiwicHVzaCIsIm1hdGNoIiwicmVwbGFjZSIsImVmZmVjdGl2ZUluZGVudCIsImV3IiwiZ2V0RWZmZWN0aXZlV2lkdGgiLCJzcGNzIiwicmVwZWF0IiwiaW5pdFNwYWNlcyIsInRyaW1TdGFydCIsImNoYXJBdCIsImlTcGFjZSIsImxhc3RJbmRleE9mIiwiaURhc2giLCJNYXRoIiwibWF4Iiwiam9pbiIsImV4cG9ydHMiXSwic291cmNlcyI6WyIuLi9zcmMvd3JhcC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0RWZmZWN0aXZlV2lkdGggfSBmcm9tICcuL2dldC1lZmZlY3RpdmUtd2lkdGgnXG5cbmNvbnN0IHdyYXAgPSAodGV4dCwgeyBcbiAgaGFuZ2luZ0luZGVudCA9IGZhbHNlLCBcbiAgaWdub3JlVGFncyA9IGZhbHNlLCBcbiAgaW5kZW50ID0gMCwgXG4gIHNtYXJ0SW5kZW50ID0gZmFsc2UsIFxuICB3aWR0aCA9IDgwIFxufSA9IHt9KSA9PiB7XG4gIGNvbnN0IGluZGVudE1vZGVzQWN0aXZlID0gKGhhbmdpbmdJbmRlbnQgPT09IHRydWUgPyAxIDogMCkgKyAoaW5kZW50ID4gMCA/IDEgOiAwKSArIChzbWFydEluZGVudCA9PT0gdHJ1ZSA/IDEgOiAwKVxuICBpZiAoaW5kZW50TW9kZXNBY3RpdmUgPiAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTXVsdGlwbGUgaW5kZW50IG1vZGVzIGFjdGl2ZTsgb25seSBvbmUgJ2hhbmdpbmdJbmRlbnQnLCAnaW5kZW50Jywgb3IgJ3NtYXJ0SW5kZW50JyBtYXkgYmUgYWN0aXZlLlwiKVxuICB9XG5cbiAgaWYgKCF0ZXh0KSByZXR1cm4gJydcbiAgLy8gdGV4dCA9IHRleHQucmVwbGFjZSgvXFxzKyQvLCAnJykgLy8gd2UnbGwgdHJpbSB0aGUgZnJvbnQgaW5zaWRlIHRoZSB3aGlsZSBsb29wXG5cbiAgY29uc3QgbGluZXMgPSBbXVxuXG4gIGZvciAobGV0IGlMaW5lIG9mIHRleHQuc3BsaXQoJ1xcbicpKSB7XG4gICAgbGV0IG5ld1BwID0gdHJ1ZVxuICAgIGxldCBpbkxpc3QgPSAwXG4gICAgLy8gYXQgdGhlIHN0YXJ0IG9mIGVhY2ggcGFyYWdyYXBoLCB3ZSBjaGVjayBpZiB3ZSBoYXZlIGFuIGVtcHR5IGxpbmVcbiAgICBpZiAoaUxpbmUubGVuZ3RoID09PSAwKSB7XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgICAgY29udGludWVcbiAgICB9IC8vIHRoZW4gd2UgY2hlY2tlIGlmIHdlJ3JlIGluIGEgbGlzdFxuICAgIGVsc2UgaWYgKGlMaW5lLm1hdGNoKC9eICpbLSpdICsvKSkge1xuICAgICAgLy8gY291bnQgdGhlIGRlcHRoIG9mIGluZGVudGF0aW9uIChzdWItbGlzdHMpXG4gICAgICBpbkxpc3QgPSBpTGluZS5yZXBsYWNlKC9eKCAqLSArKS4qLywgJyQxJykubGVuZ3RoXG4gICAgfVxuXG4gICAgLy8gbmV3IHdlIHByb2Nlc3MgdGhlIHJlc3QgZWYgdGhlIGxpbmU7IHRoZXJlIGFyZSBtdWx0aXBsZSBleGl0IG9yIHJlLWxvb3AgcG9pbnRzLCB3aGVyZSB3ZSBzZXQgdGhlICduZXdQcCcgZmFsc2UgXG4gICAgLy8gaW5kaWNhdGluZyB0aGF0IHdlJ3JlIG5vIGxvbmdlciBhdCB0aGUgZnJvbnQgb2YgdGhlIGxpbmUuXG4gICAgd2hpbGUgKGlMaW5lLmxlbmd0aCA+IDApIHsgLy8gdXN1YWxseSB3ZSAnYnJlYWsnIHRoZSBmbG93LCBidXQgdGhpcyBjb3VsZCBoYXBwZW4gaWYgd2UgdHJpbSB0aGUgdGV4dCBleGFjdGx5LlxuICAgICAgLy8gZGV0ZXJtaW5lIGhvdyBtYW55IHNwYWNlcyB0byBhZGQgYmVmb3JlIHRoZSBjdXJyZW50IGxpbmVcbiAgICAgIGNvbnN0IGVmZmVjdGl2ZUluZGVudCA9ICFoYW5naW5nSW5kZW50ICYmICFzbWFydEluZGVudFxuICAgICAgICA/IGluZGVudFxuICAgICAgICA6IGhhbmdpbmdJbmRlbnQgJiYgIW5ld1BwXG4gICAgICAgICAgPyBpbmRlbnRcbiAgICAgICAgICA6IHNtYXJ0SW5kZW50ICYmIGluTGlzdCA+IDAgJiYgIW5ld1BwXG4gICAgICAgICAgICA/IGluTGlzdCBcbiAgICAgICAgICAgIDogMFxuICAgICAgY29uc3QgZXcgPSBnZXRFZmZlY3RpdmVXaWR0aCh7IHRleHQgOiBpTGluZSwgd2lkdGgsIGluZGVudCA6IGVmZmVjdGl2ZUluZGVudCwgaWdub3JlVGFncyB9KVxuICAgICAgY29uc3Qgc3BjcyA9ICcgJy5yZXBlYXQoZWZmZWN0aXZlSW5kZW50KVxuICAgICAgbGV0IGluaXRTcGFjZXMgPSAwXG4gICAgICBpZiAobmV3UHAgPT09IGZhbHNlKSB7IC8vIHRyaW0gYW55IHdoaXRlc3BhY2UgKGxpa2UgdGhlICcgJyBpbiBmcm9udCBvZiB0aGUgbGFzdCBpbnNlcnRlZCBsaW5lIGJyZWFrKVxuICAgICAgICAvLyB1bmxlc3Mgd2UncmUgYXQgdGhlIHN0YXJ0IG9mIGEgUFAsIGluIHdoaWNoIGNhc2Ugd2Ugd2FudCB0byBwcmVzZXJ2ZSB0aGUgaW5pdGlhbCBpbmRlbnQgb3IgbGlzdCBpbmRlbnRcbiAgICAgICAgaUxpbmUgPSBpTGluZS50cmltU3RhcnQoKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGluaXRTcGFjZXMgPSBpTGluZS5yZXBsYWNlKC9eKCAqKS4qLywgJyQxJykubGVuZ3RoXG4gICAgICB9XG5cbiAgICAgIGlmIChldyA+PSBpTGluZS5sZW5ndGgpIHtcbiAgICAgICAgbGluZXMucHVzaChzcGNzICsgaUxpbmUpXG4gICAgICAgIG5ld1BwID0gZmFsc2VcbiAgICAgICAgLy8gbGluZXMucHVzaCgnYTIzNDU2NzkwJyArICcxMjM0NTY3OTAnLnJlcGVhdCg3KSlcbiAgICAgICAgYnJlYWsgLy8gd2UncmUgZG9uZVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaUxpbmUuY2hhckF0KGV3KSA9PT0gJyAnKSB7XG4gICAgICAgIGxpbmVzLnB1c2goc3BjcyArIGlMaW5lLnNsaWNlKDAsIGV3KSlcbiAgICAgICAgaUxpbmUgPSBpTGluZS5zbGljZShldylcbiAgICAgICAgbmV3UHAgPSBmYWxzZVxuICAgICAgICAvLyBsaW5lcy5wdXNoKCdiMjM0NTY3OTAnICsgJzEyMzQ1Njc5MCcucmVwZWF0KDcpKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaUxpbmUuY2hhckF0KGV3IC0gMSkgPT09ICctJykge1xuICAgICAgICBsaW5lcy5wdXNoKHNwY3MgKyBpTGluZS5zbGljZSgwLCBldykpXG4gICAgICAgIGlMaW5lID0gaUxpbmUuc2xpY2UoZXcpXG4gICAgICAgIG5ld1BwID0gZmFsc2VcbiAgICAgICAgLy8gbGluZXMucHVzaCgnYzIzNDU2NzkwJyArICcxMjM0NTY3OTAnLnJlcGVhdCg3KSlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gd2hhdCdzIHRoZSBsYXN0IGluZGV4IG9mIG91ciBicmVhayBwb2ludHMgd2l0aGluIHRoZSBlZmZlY3RpdmUgd2lkdGggcmFuZ2U/XG4gICAgICBsZXQgaVNwYWNlID0gaUxpbmUubGFzdEluZGV4T2YoJyAnLCBldylcbiAgICAgIGlmIChpU3BhY2UgPiAtMSAmJiBuZXdQcCA9PT0gdHJ1ZSAmJiBpbml0U3BhY2VzID49IGlTcGFjZSkge1xuICAgICAgICAvLyBpZiB3ZSdyZSBuZXcgUFAsIHdlIHdhbnQgdG8gcHJlc2VydmUgdGhlIGluaXRpYWwgaW5kZW50IGFuZCBub3QgYnJlYWsgb24gc3BhY2VzIHdpdGhpblxuICAgICAgICBpU3BhY2UgPSAtMVxuICAgICAgfVxuXG4gICAgICBsZXQgaURhc2ggPSBpTGluZS5sYXN0SW5kZXhPZignLScsIGV3KVxuICAgICAgaWYgKGlEYXNoID4gLTEpIHtcbiAgICAgICAgaWYgKGluTGlzdCAmJiBpRGFzaCA8PSBpbkxpc3QpIHsgLy8gaWYgd2UgZmluZCB0aGUgJy0nIGF0IHRoZSBoZWFkIG9mIHRoZSBsaXN0LCB3ZSByZXNldCB0aGUgaURhc2hcbiAgICAgICAgICBpRGFzaCA9IC0xXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIHdlIHdhbnQgdG8ga2VlcCB0aGUgZGFzaCwgc28gd2UgcHVzaCBvdXIgYnJlYWsgcG9pbnQgb3V0IGJ5IG9uZVxuICAgICAgICAgIGlEYXNoICs9IDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBsZXQgaSA9IE1hdGgubWF4KGlTcGFjZSwgaURhc2gpXG4gICAgICBpZiAoaSA9PT0gLTEgfHwgaSA+IGV3KSB7IC8vIHRoZXJlJ3Mgbm8gJyAnLyctJyBvciBpdCdzIHBhc3Qgb3VyIGVmZmVjdGl2ZSB3aWR0aCBzbyB3ZSBmb3JjZSBhIGhhcmQgYnJlYWsuXG4gICAgICAgIGkgPSBld1xuICAgICAgfVxuICAgICAgaWYgKGkgPiBpTGluZS5sZW5ndGgpIHtcbiAgICAgICAgaSA9IGlMaW5lLmxlbmd0aFxuICAgICAgfVxuXG4gICAgICBsaW5lcy5wdXNoKHNwY3MgKyBpTGluZS5zbGljZSgwLCBpKSlcbiAgICAgIC8vIGxpbmVzLnB1c2goJ2QyMzQ1Njc5MCcgKyAnMTIzNDU2NzkwJy5yZXBlYXQoNykpXG4gICAgICBpTGluZSA9IGlMaW5lLnNsaWNlKGkpXG5cbiAgICAgIG5ld1BwID0gZmFsc2VcbiAgICB9IC8vIHdoaWxlIGlucHV0IGxpbmVcbiAgfSAvLyBmb3IgZWFjaCBpbnB1dCBsaW5lXG5cbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG59XG5cbmV4cG9ydCB7IGdldEVmZmVjdGl2ZVdpZHRoLCB3cmFwIH1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsSUFBQUEsa0JBQUEsR0FBQUMsT0FBQTtBQUF5RCxTQUFBQywyQkFBQUMsQ0FBQSxFQUFBQyxjQUFBLFFBQUFDLEVBQUEsVUFBQUMsTUFBQSxvQkFBQUgsQ0FBQSxDQUFBRyxNQUFBLENBQUFDLFFBQUEsS0FBQUosQ0FBQSxxQkFBQUUsRUFBQSxRQUFBRyxLQUFBLENBQUFDLE9BQUEsQ0FBQU4sQ0FBQSxNQUFBRSxFQUFBLEdBQUFLLDJCQUFBLENBQUFQLENBQUEsTUFBQUMsY0FBQSxJQUFBRCxDQUFBLFdBQUFBLENBQUEsQ0FBQVEsTUFBQSxxQkFBQU4sRUFBQSxFQUFBRixDQUFBLEdBQUFFLEVBQUEsTUFBQU8sQ0FBQSxVQUFBQyxDQUFBLFlBQUFBLEVBQUEsZUFBQUMsQ0FBQSxFQUFBRCxDQUFBLEVBQUFFLENBQUEsV0FBQUEsRUFBQSxRQUFBSCxDQUFBLElBQUFULENBQUEsQ0FBQVEsTUFBQSxXQUFBSyxJQUFBLG1CQUFBQSxJQUFBLFNBQUFDLEtBQUEsRUFBQWQsQ0FBQSxDQUFBUyxDQUFBLFVBQUFNLENBQUEsV0FBQUEsRUFBQUMsRUFBQSxVQUFBQSxFQUFBLEtBQUFDLENBQUEsRUFBQVAsQ0FBQSxnQkFBQVEsU0FBQSxpSkFBQUMsZ0JBQUEsU0FBQUMsTUFBQSxVQUFBQyxHQUFBLFdBQUFWLENBQUEsV0FBQUEsRUFBQSxJQUFBVCxFQUFBLEdBQUFBLEVBQUEsQ0FBQW9CLElBQUEsQ0FBQXRCLENBQUEsTUFBQVksQ0FBQSxXQUFBQSxFQUFBLFFBQUFXLElBQUEsR0FBQXJCLEVBQUEsQ0FBQXNCLElBQUEsSUFBQUwsZ0JBQUEsR0FBQUksSUFBQSxDQUFBVixJQUFBLFNBQUFVLElBQUEsS0FBQVIsQ0FBQSxXQUFBQSxFQUFBVSxHQUFBLElBQUFMLE1BQUEsU0FBQUMsR0FBQSxHQUFBSSxHQUFBLEtBQUFSLENBQUEsV0FBQUEsRUFBQSxlQUFBRSxnQkFBQSxJQUFBakIsRUFBQSxvQkFBQUEsRUFBQSw4QkFBQWtCLE1BQUEsUUFBQUMsR0FBQTtBQUFBLFNBQUFkLDRCQUFBUCxDQUFBLEVBQUEwQixNQUFBLFNBQUExQixDQUFBLHFCQUFBQSxDQUFBLHNCQUFBMkIsaUJBQUEsQ0FBQTNCLENBQUEsRUFBQTBCLE1BQUEsT0FBQWQsQ0FBQSxHQUFBZ0IsTUFBQSxDQUFBQyxTQUFBLENBQUFDLFFBQUEsQ0FBQVIsSUFBQSxDQUFBdEIsQ0FBQSxFQUFBK0IsS0FBQSxhQUFBbkIsQ0FBQSxpQkFBQVosQ0FBQSxDQUFBZ0MsV0FBQSxFQUFBcEIsQ0FBQSxHQUFBWixDQUFBLENBQUFnQyxXQUFBLENBQUFDLElBQUEsTUFBQXJCLENBQUEsY0FBQUEsQ0FBQSxtQkFBQVAsS0FBQSxDQUFBNkIsSUFBQSxDQUFBbEMsQ0FBQSxPQUFBWSxDQUFBLCtEQUFBdUIsSUFBQSxDQUFBdkIsQ0FBQSxVQUFBZSxpQkFBQSxDQUFBM0IsQ0FBQSxFQUFBMEIsTUFBQTtBQUFBLFNBQUFDLGtCQUFBUyxHQUFBLEVBQUFDLEdBQUEsUUFBQUEsR0FBQSxZQUFBQSxHQUFBLEdBQUFELEdBQUEsQ0FBQTVCLE1BQUEsRUFBQTZCLEdBQUEsR0FBQUQsR0FBQSxDQUFBNUIsTUFBQSxXQUFBQyxDQUFBLE1BQUE2QixJQUFBLE9BQUFqQyxLQUFBLENBQUFnQyxHQUFBLEdBQUE1QixDQUFBLEdBQUE0QixHQUFBLEVBQUE1QixDQUFBLElBQUE2QixJQUFBLENBQUE3QixDQUFBLElBQUEyQixHQUFBLENBQUEzQixDQUFBLFVBQUE2QixJQUFBO0FBRXpELElBQU1DLElBQUksR0FBRyxTQUFQQSxJQUFJQSxDQUFJQyxJQUFJLEVBTVA7RUFBQSxJQUFBQyxJQUFBLEdBQUFDLFNBQUEsQ0FBQWxDLE1BQUEsUUFBQWtDLFNBQUEsUUFBQUMsU0FBQSxHQUFBRCxTQUFBLE1BQVAsQ0FBQyxDQUFDO0lBQUFFLGtCQUFBLEdBQUFILElBQUEsQ0FMSkksYUFBYTtJQUFiQSxhQUFhLEdBQUFELGtCQUFBLGNBQUcsS0FBSyxHQUFBQSxrQkFBQTtJQUFBRSxlQUFBLEdBQUFMLElBQUEsQ0FDckJNLFVBQVU7SUFBVkEsVUFBVSxHQUFBRCxlQUFBLGNBQUcsS0FBSyxHQUFBQSxlQUFBO0lBQUFFLFdBQUEsR0FBQVAsSUFBQSxDQUNsQlEsTUFBTTtJQUFOQSxNQUFNLEdBQUFELFdBQUEsY0FBRyxDQUFDLEdBQUFBLFdBQUE7SUFBQUUsZ0JBQUEsR0FBQVQsSUFBQSxDQUNWVSxXQUFXO0lBQVhBLFdBQVcsR0FBQUQsZ0JBQUEsY0FBRyxLQUFLLEdBQUFBLGdCQUFBO0lBQUFFLFVBQUEsR0FBQVgsSUFBQSxDQUNuQlksS0FBSztJQUFMQSxLQUFLLEdBQUFELFVBQUEsY0FBRyxFQUFFLEdBQUFBLFVBQUE7RUFFVixJQUFNRSxpQkFBaUIsR0FBRyxDQUFDVCxhQUFhLEtBQUssSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUtJLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJRSxXQUFXLEtBQUssSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEgsSUFBSUcsaUJBQWlCLEdBQUcsQ0FBQyxFQUFFO0lBQ3pCLE1BQU0sSUFBSUMsS0FBSyxDQUFDLG1HQUFtRyxDQUFDO0VBQ3RIO0VBRUEsSUFBSSxDQUFDZixJQUFJLEVBQUUsT0FBTyxFQUFFO0VBQ3BCOztFQUVBLElBQU1nQixLQUFLLEdBQUcsRUFBRTtFQUFBLElBQUFDLFNBQUEsR0FBQTFELDBCQUFBLENBRUV5QyxJQUFJLENBQUNrQixLQUFLLENBQUMsSUFBSSxDQUFDO0lBQUFDLEtBQUE7RUFBQTtJQUFsQyxLQUFBRixTQUFBLENBQUE5QyxDQUFBLE1BQUFnRCxLQUFBLEdBQUFGLFNBQUEsQ0FBQTdDLENBQUEsSUFBQUMsSUFBQSxHQUFvQztNQUFBLElBQTNCK0MsS0FBSyxHQUFBRCxLQUFBLENBQUE3QyxLQUFBO01BQ1osSUFBSStDLEtBQUssR0FBRyxJQUFJO01BQ2hCLElBQUlDLE1BQU0sR0FBRyxDQUFDO01BQ2Q7TUFDQSxJQUFJRixLQUFLLENBQUNwRCxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3RCZ0QsS0FBSyxDQUFDTyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2Q7TUFDRixDQUFDLENBQUM7TUFBQSxLQUNHLElBQUlILEtBQUssQ0FBQ0ksS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQ2pDO1FBQ0FGLE1BQU0sR0FBR0YsS0FBSyxDQUFDSyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDekQsTUFBTTtNQUNuRDs7TUFFQTtNQUNBO01BQ0EsT0FBT29ELEtBQUssQ0FBQ3BELE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFBRTtRQUN6QjtRQUNBLElBQU0wRCxlQUFlLEdBQUcsQ0FBQ3JCLGFBQWEsSUFBSSxDQUFDTSxXQUFXLEdBQ2xERixNQUFNLEdBQ05KLGFBQWEsSUFBSSxDQUFDZ0IsS0FBSyxHQUNyQlosTUFBTSxHQUNORSxXQUFXLElBQUlXLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQ0QsS0FBSyxHQUNqQ0MsTUFBTSxHQUNOLENBQUM7UUFDVCxJQUFNSyxFQUFFLEdBQUcsSUFBQUMsb0NBQWlCLEVBQUM7VUFBRTVCLElBQUksRUFBR29CLEtBQUs7VUFBRVAsS0FBSyxFQUFMQSxLQUFLO1VBQUVKLE1BQU0sRUFBR2lCLGVBQWU7VUFBRW5CLFVBQVUsRUFBVkE7UUFBVyxDQUFDLENBQUM7UUFDM0YsSUFBTXNCLElBQUksR0FBRyxHQUFHLENBQUNDLE1BQU0sQ0FBQ0osZUFBZSxDQUFDO1FBQ3hDLElBQUlLLFVBQVUsR0FBRyxDQUFDO1FBQ2xCLElBQUlWLEtBQUssS0FBSyxLQUFLLEVBQUU7VUFBRTtVQUNyQjtVQUNBRCxLQUFLLEdBQUdBLEtBQUssQ0FBQ1ksU0FBUyxFQUFFO1FBQzNCLENBQUMsTUFDSTtVQUNIRCxVQUFVLEdBQUdYLEtBQUssQ0FBQ0ssT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQ3pELE1BQU07UUFDcEQ7UUFFQSxJQUFJMkQsRUFBRSxJQUFJUCxLQUFLLENBQUNwRCxNQUFNLEVBQUU7VUFDdEJnRCxLQUFLLENBQUNPLElBQUksQ0FBQ00sSUFBSSxHQUFHVCxLQUFLLENBQUM7VUFDeEJDLEtBQUssR0FBRyxLQUFLO1VBQ2I7VUFDQSxNQUFLLENBQUM7UUFDUixDQUFDLE1BQ0ksSUFBSUQsS0FBSyxDQUFDYSxNQUFNLENBQUNOLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRTtVQUNqQ1gsS0FBSyxDQUFDTyxJQUFJLENBQUNNLElBQUksR0FBR1QsS0FBSyxDQUFDN0IsS0FBSyxDQUFDLENBQUMsRUFBRW9DLEVBQUUsQ0FBQyxDQUFDO1VBQ3JDUCxLQUFLLEdBQUdBLEtBQUssQ0FBQzdCLEtBQUssQ0FBQ29DLEVBQUUsQ0FBQztVQUN2Qk4sS0FBSyxHQUFHLEtBQUs7VUFDYjtVQUNBO1FBQ0YsQ0FBQyxNQUNJLElBQUlELEtBQUssQ0FBQ2EsTUFBTSxDQUFDTixFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO1VBQ3JDWCxLQUFLLENBQUNPLElBQUksQ0FBQ00sSUFBSSxHQUFHVCxLQUFLLENBQUM3QixLQUFLLENBQUMsQ0FBQyxFQUFFb0MsRUFBRSxDQUFDLENBQUM7VUFDckNQLEtBQUssR0FBR0EsS0FBSyxDQUFDN0IsS0FBSyxDQUFDb0MsRUFBRSxDQUFDO1VBQ3ZCTixLQUFLLEdBQUcsS0FBSztVQUNiO1VBQ0E7UUFDRjs7UUFFQTtRQUNBLElBQUlhLE1BQU0sR0FBR2QsS0FBSyxDQUFDZSxXQUFXLENBQUMsR0FBRyxFQUFFUixFQUFFLENBQUM7UUFDdkMsSUFBSU8sTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJYixLQUFLLEtBQUssSUFBSSxJQUFJVSxVQUFVLElBQUlHLE1BQU0sRUFBRTtVQUN6RDtVQUNBQSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2I7UUFFQSxJQUFJRSxLQUFLLEdBQUdoQixLQUFLLENBQUNlLFdBQVcsQ0FBQyxHQUFHLEVBQUVSLEVBQUUsQ0FBQztRQUN0QyxJQUFJUyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7VUFDZCxJQUFJZCxNQUFNLElBQUljLEtBQUssSUFBSWQsTUFBTSxFQUFFO1lBQUU7WUFDL0JjLEtBQUssR0FBRyxDQUFDLENBQUM7VUFDWixDQUFDLE1BQ0k7WUFBRTtZQUNMQSxLQUFLLElBQUksQ0FBQztVQUNaO1FBQ0Y7UUFFQSxJQUFJbkUsQ0FBQyxHQUFHb0UsSUFBSSxDQUFDQyxHQUFHLENBQUNKLE1BQU0sRUFBRUUsS0FBSyxDQUFDO1FBQy9CLElBQUluRSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUlBLENBQUMsR0FBRzBELEVBQUUsRUFBRTtVQUFFO1VBQ3hCMUQsQ0FBQyxHQUFHMEQsRUFBRTtRQUNSO1FBQ0EsSUFBSTFELENBQUMsR0FBR21ELEtBQUssQ0FBQ3BELE1BQU0sRUFBRTtVQUNwQkMsQ0FBQyxHQUFHbUQsS0FBSyxDQUFDcEQsTUFBTTtRQUNsQjtRQUVBZ0QsS0FBSyxDQUFDTyxJQUFJLENBQUNNLElBQUksR0FBR1QsS0FBSyxDQUFDN0IsS0FBSyxDQUFDLENBQUMsRUFBRXRCLENBQUMsQ0FBQyxDQUFDO1FBQ3BDO1FBQ0FtRCxLQUFLLEdBQUdBLEtBQUssQ0FBQzdCLEtBQUssQ0FBQ3RCLENBQUMsQ0FBQztRQUV0Qm9ELEtBQUssR0FBRyxLQUFLO01BQ2YsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO0VBQUEsU0FBQXhDLEdBQUE7SUFBQW9DLFNBQUEsQ0FBQTFDLENBQUEsQ0FBQU0sR0FBQTtFQUFBO0lBQUFvQyxTQUFBLENBQUF4QyxDQUFBO0VBQUE7RUFFRixPQUFPdUMsS0FBSyxDQUFDdUIsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN6QixDQUFDO0FBQUFDLE9BQUEsQ0FBQXpDLElBQUEsR0FBQUEsSUFBQSJ9