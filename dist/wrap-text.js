'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
  if (!text) return '';
  // text = text.replace(/\s+$/, '') // we'll trim the front inside the while loop

  var lines = [];
  var newPp = true;
  var inList = 0;
  var _iterator = _createForOfIteratorHelper(text.split('\n')),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var iLine = _step.value;
      if (iLine.length === 0) {
        lines.push('');
        newPp = true;
        inList = 0;
        continue;
      } else if (iLine.startsWith('-')) {
        // count the depth of indentation (sub-lists)
        inList = iLine.replace(/^(-+).*/, '$1').length;
        // and change sublist marker '--' (etc) to single list marker since indentation will be added later
        iLine = iLine.replace(/^-+/, '-');
        newPp = true;
      }
      while (iLine.length > 0) {
        // usually we 'break' the flow, but this could happen if we trim the text exactly.
        // determine how many spaces to add before the current line
        var effectiveIndent = !hangingIndent && !smartIndent ? indent : hangingIndent && !newPp ? indent : smartIndent && inList > 0 && !newPp ? inList * indent : smartIndent && inList > 1 && newPp ? (inList - 1) * indent : 0;
        var spcs = ' '.repeat(effectiveIndent);
        var ew = getEffectiveWidth({
          text: iLine,
          width: width,
          indent: effectiveIndent,
          ignoreTags: ignoreTags
        });
        iLine = iLine.replace(/^\s+/, '');
        if (ew >= iLine.length) {
          lines.push(spcs + iLine);
          newPp = false;
          // lines.push('a23456790' + '123456790'.repeat(7))
          break;
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
        var iSpace = iLine.lastIndexOf(' ', ew);
        var iDash = iLine.lastIndexOf('-', ew) + 1;
        var i = iSpace > iDash ? iSpace : iDash;
        if (i === -1) {
          // then there is no ' ' or '-' to break on and we force a hard break.
          i = ew - 1;
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

exports.getEffectiveWidth = getEffectiveWidth;
exports.wrap = wrap;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcC10ZXh0LmpzIiwic291cmNlcyI6WyIuLi9zcmMvd3JhcC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGFnQnJlYWtlcnMgPSBbJzwnLCAnICcsICdcXG4nXVxuLyoqXG4qIERldGVybWluZXMgdGhlIGVmZmVjdGl2ZSBjb25zaWRlcmluZyBhbnkgaW5kZW50IGFuZCBpbnZpc2libGUgdGFncy5cbiovXG5jb25zdCBnZXRFZmZlY3RpdmVXaWR0aCA9ICh7IHRleHQsIHdpZHRoLCBpbmRlbnQsIGlnbm9yZVRhZ3MgfSkgPT4ge1xuICBpZiAoaWdub3JlVGFncyA9PT0gZmFsc2UpIHJldHVybiB3aWR0aCAtIGluZGVudFxuICBlbHNlIHtcbiAgICB3aWR0aCA9IHdpZHRoIC0gaW5kZW50IC8vIGFkanVzdCB3aWR0aFxuICAgIGxldCBjaGFyQ291bnQgPSAwXG4gICAgbGV0IHRhZ0NoYXJzID0gMFxuICAgIGxldCBzYXdMdEF0ID0gLTFcbiAgICBsZXQgY3Vyc29yID0gMFxuICAgIC8vICAgICAgICAgdiBoYXZlIHdlIHJ1biBvdXQgb2YgdGV4dD8gICAgICAgICB2IG9uY2Ugd2UndmUgY291bnRlZCB3aWR0aCBjaGFycywgd2UncmUgZG9uZVxuICAgIGZvciAoOyBjdXJzb3IgPCB0ZXh0Lmxlbmd0aCAmJiBjaGFyQ291bnQgPCB3aWR0aDsgY3Vyc29yICs9IDEpIHtcbiAgICAgIGNvbnN0IGNoYXIgPSB0ZXh0LmNoYXJBdChjdXJzb3IpXG4gICAgICBpZiAoc2F3THRBdCA+IC0xKSB7IC8vIG1heWJlIGluIGEgdGFnXG4gICAgICAgIGlmIChjaGFyID09PSAnPicpIHtcbiAgICAgICAgICB0YWdDaGFycyArPSBjdXJzb3IgLSBzYXdMdEF0ICsgMVxuICAgICAgICAgIHNhd0x0QXQgPSAtMVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRhZ0JyZWFrZXJzLmluY2x1ZGVzKGNoYXIpKSB7IC8vIGZhbHNlIGFsYXJtLCBub3QgcmVhbGx5IGEgdGFnXG4gICAgICAgICAgLy8gY2hhckNvdW50ICs9IGN1cnNvciAtIHNhd0x0QXQgKyAxXG4gICAgICAgICAgY2hhckNvdW50ICs9IDEgLy8gY291bnQgdGhlICc8J1xuICAgICAgICAgIGN1cnNvciA9IHNhd0x0QXQgKyAxIC8vIHJlc2V0IHRoZSBjdXJzb3JcbiAgICAgICAgICBzYXdMdEF0ID0gLTFcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7IC8vIG5vdCBpbiBhIHRhZ1xuICAgICAgICBpZiAoY2hhciA9PT0gJzwnKSB7XG4gICAgICAgICAgc2F3THRBdCA9IGN1cnNvclxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNoYXJDb3VudCArPSAxXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNhd0x0QXQgPiAtMSkgeyAvLyB0aGVuIHdlJ3ZlIHJ1biBvZmYgdGhlIGVuZCB3aXRob3V0IGZpbmRpbmcgYSBjbG9zaW5nIHRhZ1xuICAgICAgY2hhckNvdW50ICs9IGN1cnNvciAtIHNhd0x0QXQgKyAxXG4gICAgICBpZiAoKGNoYXJDb3VudCAtIHRhZ0NoYXJzKSA+IHdpZHRoKSB7IC8vIHRoZW4gd2UgaGFkIGEgJzwnIGFuZCB0aGVuIGNoYXJzIHRvIHRoZSBlbmQgb2YgdGhlIGxpbmVcbiAgICAgICAgcmV0dXJuIHdpZHRoICsgdGFnQ2hhcnNcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2hhckNvdW50ICsgdGFnQ2hhcnNcbiAgfVxufVxuXG5jb25zdCB3cmFwID0gKHRleHQsIHsgaGFuZ2luZ0luZGVudCA9IGZhbHNlLCBpZ25vcmVUYWdzID0gZmFsc2UsIGluZGVudCA9IDAsIHNtYXJ0SW5kZW50ID0gZmFsc2UsIHdpZHRoID0gODAgfSA9IHt9KSA9PiB7XG4gIGlmICghdGV4dCkgcmV0dXJuICcnXG4gIC8vIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xccyskLywgJycpIC8vIHdlJ2xsIHRyaW0gdGhlIGZyb250IGluc2lkZSB0aGUgd2hpbGUgbG9vcFxuXG4gIGNvbnN0IGxpbmVzID0gW11cblxuICBsZXQgbmV3UHAgPSB0cnVlXG4gIGxldCBpbkxpc3QgPSAwXG4gIGZvciAobGV0IGlMaW5lIG9mIHRleHQuc3BsaXQoJ1xcbicpKSB7XG4gICAgaWYgKGlMaW5lLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbGluZXMucHVzaCgnJylcbiAgICAgIG5ld1BwID0gdHJ1ZVxuICAgICAgaW5MaXN0ID0gMFxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgZWxzZSBpZiAoaUxpbmUuc3RhcnRzV2l0aCgnLScpKSB7XG4gICAgICAvLyBjb3VudCB0aGUgZGVwdGggb2YgaW5kZW50YXRpb24gKHN1Yi1saXN0cylcbiAgICAgIGluTGlzdCA9IGlMaW5lLnJlcGxhY2UoL14oLSspLiovLCAnJDEnKS5sZW5ndGhcbiAgICAgIC8vIGFuZCBjaGFuZ2Ugc3VibGlzdCBtYXJrZXIgJy0tJyAoZXRjKSB0byBzaW5nbGUgbGlzdCBtYXJrZXIgc2luY2UgaW5kZW50YXRpb24gd2lsbCBiZSBhZGRlZCBsYXRlclxuICAgICAgaUxpbmUgPSBpTGluZS5yZXBsYWNlKC9eLSsvLCAnLScpXG4gICAgICBuZXdQcCA9IHRydWVcbiAgICB9XG5cbiAgICB3aGlsZSAoaUxpbmUubGVuZ3RoID4gMCkgeyAvLyB1c3VhbGx5IHdlICdicmVhaycgdGhlIGZsb3csIGJ1dCB0aGlzIGNvdWxkIGhhcHBlbiBpZiB3ZSB0cmltIHRoZSB0ZXh0IGV4YWN0bHkuXG4gICAgICAvLyBkZXRlcm1pbmUgaG93IG1hbnkgc3BhY2VzIHRvIGFkZCBiZWZvcmUgdGhlIGN1cnJlbnQgbGluZVxuICAgICAgY29uc3QgZWZmZWN0aXZlSW5kZW50ID0gIWhhbmdpbmdJbmRlbnQgJiYgIXNtYXJ0SW5kZW50XG4gICAgICAgID8gaW5kZW50XG4gICAgICAgIDogaGFuZ2luZ0luZGVudCAmJiAhbmV3UHBcbiAgICAgICAgICA/IGluZGVudFxuICAgICAgICAgIDogc21hcnRJbmRlbnQgJiYgaW5MaXN0ID4gMCAmJiAhbmV3UHBcbiAgICAgICAgICAgID8gaW5MaXN0ICogaW5kZW50XG4gICAgICAgICAgICA6IHNtYXJ0SW5kZW50ICYmIGluTGlzdCA+IDEgJiYgbmV3UHBcbiAgICAgICAgICAgICAgPyAoaW5MaXN0IC0gMSkgKiBpbmRlbnRcbiAgICAgICAgICAgICAgOiAwXG4gICAgICBjb25zdCBzcGNzID0gJyAnLnJlcGVhdChlZmZlY3RpdmVJbmRlbnQpXG4gICAgICBjb25zdCBldyA9IGdldEVmZmVjdGl2ZVdpZHRoKHsgdGV4dCA6IGlMaW5lLCB3aWR0aCwgaW5kZW50IDogZWZmZWN0aXZlSW5kZW50LCBpZ25vcmVUYWdzIH0pXG4gICAgICBpTGluZSA9IGlMaW5lLnJlcGxhY2UoL15cXHMrLywgJycpXG5cbiAgICAgIGlmIChldyA+PSBpTGluZS5sZW5ndGgpIHtcbiAgICAgICAgbGluZXMucHVzaChzcGNzICsgaUxpbmUpXG4gICAgICAgIG5ld1BwID0gZmFsc2VcbiAgICAgICAgLy8gbGluZXMucHVzaCgnYTIzNDU2NzkwJyArICcxMjM0NTY3OTAnLnJlcGVhdCg3KSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGlMaW5lLmNoYXJBdChldykgPT09ICcgJykge1xuICAgICAgICBsaW5lcy5wdXNoKHNwY3MgKyBpTGluZS5zbGljZSgwLCBldykpXG4gICAgICAgIGlMaW5lID0gaUxpbmUuc2xpY2UoZXcpXG4gICAgICAgIG5ld1BwID0gZmFsc2VcbiAgICAgICAgLy8gbGluZXMucHVzaCgnYjIzNDU2NzkwJyArICcxMjM0NTY3OTAnLnJlcGVhdCg3KSlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGlMaW5lLmNoYXJBdChldyAtIDEpID09PSAnLScpIHtcbiAgICAgICAgbGluZXMucHVzaChzcGNzICsgaUxpbmUuc2xpY2UoMCwgZXcpKVxuICAgICAgICBpTGluZSA9IGlMaW5lLnNsaWNlKGV3KVxuICAgICAgICBuZXdQcCA9IGZhbHNlXG4gICAgICAgIC8vIGxpbmVzLnB1c2goJ2MyMzQ1Njc5MCcgKyAnMTIzNDU2NzkwJy5yZXBlYXQoNykpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlTcGFjZSA9IGlMaW5lLmxhc3RJbmRleE9mKCcgJywgZXcpXG4gICAgICBjb25zdCBpRGFzaCA9IGlMaW5lLmxhc3RJbmRleE9mKCctJywgZXcpICsgMVxuICAgICAgbGV0IGkgPSBpU3BhY2UgPiBpRGFzaCA/IGlTcGFjZSA6IGlEYXNoXG4gICAgICBpZiAoaSA9PT0gLTEpIHsgLy8gdGhlbiB0aGVyZSBpcyBubyAnICcgb3IgJy0nIHRvIGJyZWFrIG9uIGFuZCB3ZSBmb3JjZSBhIGhhcmQgYnJlYWsuXG4gICAgICAgIGkgPSBldyAtIDFcbiAgICAgIH1cbiAgICAgIGlmIChpID4gaUxpbmUubGVuZ3RoKSB7XG4gICAgICAgIGkgPSBpTGluZS5sZW5ndGhcbiAgICAgIH1cblxuICAgICAgbGluZXMucHVzaChzcGNzICsgaUxpbmUuc2xpY2UoMCwgaSkpXG4gICAgICAvLyBsaW5lcy5wdXNoKCdkMjM0NTY3OTAnICsgJzEyMzQ1Njc5MCcucmVwZWF0KDcpKVxuICAgICAgaUxpbmUgPSBpTGluZS5zbGljZShpKVxuXG4gICAgICBuZXdQcCA9IGZhbHNlXG4gICAgfSAvLyB3aGlsZSBpbnB1dCBsaW5lXG4gIH0gLy8gZm9yIGVhY2ggaW5wdXQgbGluZVxuXG4gIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxufVxuXG5leHBvcnQgeyBnZXRFZmZlY3RpdmVXaWR0aCwgd3JhcCB9XG4iXSwibmFtZXMiOlsidGFnQnJlYWtlcnMiLCJnZXRFZmZlY3RpdmVXaWR0aCIsIl9yZWYiLCJ0ZXh0Iiwid2lkdGgiLCJpbmRlbnQiLCJpZ25vcmVUYWdzIiwiY2hhckNvdW50IiwidGFnQ2hhcnMiLCJzYXdMdEF0IiwiY3Vyc29yIiwibGVuZ3RoIiwiY2hhciIsImNoYXJBdCIsImluY2x1ZGVzIiwid3JhcCIsIl9yZWYyIiwiYXJndW1lbnRzIiwidW5kZWZpbmVkIiwiX3JlZjIkaGFuZ2luZ0luZGVudCIsImhhbmdpbmdJbmRlbnQiLCJfcmVmMiRpZ25vcmVUYWdzIiwiX3JlZjIkaW5kZW50IiwiX3JlZjIkc21hcnRJbmRlbnQiLCJzbWFydEluZGVudCIsIl9yZWYyJHdpZHRoIiwibGluZXMiLCJuZXdQcCIsImluTGlzdCIsIl9pdGVyYXRvciIsIl9jcmVhdGVGb3JPZkl0ZXJhdG9ySGVscGVyIiwic3BsaXQiLCJfc3RlcCIsInMiLCJuIiwiZG9uZSIsImlMaW5lIiwidmFsdWUiLCJwdXNoIiwic3RhcnRzV2l0aCIsInJlcGxhY2UiLCJlZmZlY3RpdmVJbmRlbnQiLCJzcGNzIiwicmVwZWF0IiwiZXciLCJzbGljZSIsImlTcGFjZSIsImxhc3RJbmRleE9mIiwiaURhc2giLCJpIiwiZXJyIiwiZSIsImYiLCJqb2luIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsSUFBTUEsV0FBVyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNwQztBQUNBO0FBQ0E7QUFDQSxJQUFNQyxpQkFBaUIsR0FBRyxTQUFwQkEsaUJBQWlCQSxDQUFBQyxJQUFBLEVBQTRDO0FBQUEsRUFBQSxJQUF0Q0MsSUFBSSxHQUFBRCxJQUFBLENBQUpDLElBQUk7SUFBRUMsS0FBSyxHQUFBRixJQUFBLENBQUxFLEtBQUs7SUFBRUMsTUFBTSxHQUFBSCxJQUFBLENBQU5HLE1BQU07SUFBRUMsVUFBVSxHQUFBSixJQUFBLENBQVZJLFVBQVUsQ0FBQTtFQUMxRCxJQUFJQSxVQUFVLEtBQUssS0FBSyxFQUFFLE9BQU9GLEtBQUssR0FBR0MsTUFBTSxDQUMxQyxLQUFBO0FBQ0hELElBQUFBLEtBQUssR0FBR0EsS0FBSyxHQUFHQyxNQUFNLENBQUM7SUFDdkIsSUFBSUUsU0FBUyxHQUFHLENBQUMsQ0FBQTtJQUNqQixJQUFJQyxRQUFRLEdBQUcsQ0FBQyxDQUFBO0lBQ2hCLElBQUlDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FB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
