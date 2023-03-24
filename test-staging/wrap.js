"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrap = void 0;
var _getEffectiveWidth = require("./get-effective-width");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
/**
 * Wraps text to a specified width (default 80) with support for invisible tags and smart list indentation. See
 * [project hompage](https://github.com/liquid-labs/wrap-text) for details on usage and behavior.
 * 
 * There are three optional indentation modes:
 * - `indent`: indents each line a specified amount.
 * - `hangingIndent`: indents all but the first line in a paragrph by the specified amount.
 * - `smartIndent`: adds hanging indents for lists so the entire list item aligns under the list start
 * 
 * Only one indent mode may be specified. Specifying more than one results in an exception.
 * 
 * ## Parameters
 * 
 * - `hangingIndent`: (opt) The amount to indent all but the first line of a paragraph. Incompatible with other indent 
 *   modes.
 * - `ignoreTags`: (opt) Treat any tags ('<...>') in the text as 'invisible' and adjust wrapping accordingly.
 * - `indent`: (opt) Indent each line by the spcified amount. Incompatible with other indent modes.
 * - `smartIndent` (opt) Indent the list items (lines starting with /\s*[-*]/) according to the list indentation. 
 *   Incompatbile with other indent modes.
 * - `width` (opt): The width to wrap to. Defaults to 80.
 */
var wrap = function wrap(text) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref$hangingIndent = _ref.hangingIndent,
    hangingIndent = _ref$hangingIndent === void 0 ? 0 : _ref$hangingIndent,
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
        var effectiveIndent = !hangingIndent && !smartIndent ? indent : hangingIndent && !newPp ? hangingIndent : smartIndent && inList > 0 && !newPp ? inList : 0;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZ2V0RWZmZWN0aXZlV2lkdGgiLCJyZXF1aXJlIiwiX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIiLCJvIiwiYWxsb3dBcnJheUxpa2UiLCJpdCIsIlN5bWJvbCIsIml0ZXJhdG9yIiwiQXJyYXkiLCJpc0FycmF5IiwiX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5IiwibGVuZ3RoIiwiaSIsIkYiLCJzIiwibiIsImRvbmUiLCJ2YWx1ZSIsImUiLCJfZSIsImYiLCJUeXBlRXJyb3IiLCJub3JtYWxDb21wbGV0aW9uIiwiZGlkRXJyIiwiZXJyIiwiY2FsbCIsInN0ZXAiLCJuZXh0IiwiX2UyIiwibWluTGVuIiwiX2FycmF5TGlrZVRvQXJyYXkiLCJPYmplY3QiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsInNsaWNlIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiZnJvbSIsInRlc3QiLCJhcnIiLCJsZW4iLCJhcnIyIiwid3JhcCIsInRleHQiLCJfcmVmIiwiYXJndW1lbnRzIiwidW5kZWZpbmVkIiwiX3JlZiRoYW5naW5nSW5kZW50IiwiaGFuZ2luZ0luZGVudCIsIl9yZWYkaWdub3JlVGFncyIsImlnbm9yZVRhZ3MiLCJfcmVmJGluZGVudCIsImluZGVudCIsIl9yZWYkc21hcnRJbmRlbnQiLCJzbWFydEluZGVudCIsIl9yZWYkd2lkdGgiLCJ3aWR0aCIsImluZGVudE1vZGVzQWN0aXZlIiwiRXJyb3IiLCJsaW5lcyIsIl9pdGVyYXRvciIsInNwbGl0IiwiX3N0ZXAiLCJpTGluZSIsIm5ld1BwIiwiaW5MaXN0IiwicHVzaCIsIm1hdGNoIiwicmVwbGFjZSIsImVmZmVjdGl2ZUluZGVudCIsImV3IiwiZ2V0RWZmZWN0aXZlV2lkdGgiLCJzcGNzIiwicmVwZWF0IiwiaW5pdFNwYWNlcyIsInRyaW1TdGFydCIsImNoYXJBdCIsImlTcGFjZSIsImxhc3RJbmRleE9mIiwiaURhc2giLCJNYXRoIiwibWF4Iiwiam9pbiIsImV4cG9ydHMiXSwic291cmNlcyI6WyIuLi9zcmMvd3JhcC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0RWZmZWN0aXZlV2lkdGggfSBmcm9tICcuL2dldC1lZmZlY3RpdmUtd2lkdGgnXG5cbi8qKlxuICogV3JhcHMgdGV4dCB0byBhIHNwZWNpZmllZCB3aWR0aCAoZGVmYXVsdCA4MCkgd2l0aCBzdXBwb3J0IGZvciBpbnZpc2libGUgdGFncyBhbmQgc21hcnQgbGlzdCBpbmRlbnRhdGlvbi4gU2VlXG4gKiBbcHJvamVjdCBob21wYWdlXShodHRwczovL2dpdGh1Yi5jb20vbGlxdWlkLWxhYnMvd3JhcC10ZXh0KSBmb3IgZGV0YWlscyBvbiB1c2FnZSBhbmQgYmVoYXZpb3IuXG4gKiBcbiAqIFRoZXJlIGFyZSB0aHJlZSBvcHRpb25hbCBpbmRlbnRhdGlvbiBtb2RlczpcbiAqIC0gYGluZGVudGA6IGluZGVudHMgZWFjaCBsaW5lIGEgc3BlY2lmaWVkIGFtb3VudC5cbiAqIC0gYGhhbmdpbmdJbmRlbnRgOiBpbmRlbnRzIGFsbCBidXQgdGhlIGZpcnN0IGxpbmUgaW4gYSBwYXJhZ3JwaCBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cbiAqIC0gYHNtYXJ0SW5kZW50YDogYWRkcyBoYW5naW5nIGluZGVudHMgZm9yIGxpc3RzIHNvIHRoZSBlbnRpcmUgbGlzdCBpdGVtIGFsaWducyB1bmRlciB0aGUgbGlzdCBzdGFydFxuICogXG4gKiBPbmx5IG9uZSBpbmRlbnQgbW9kZSBtYXkgYmUgc3BlY2lmaWVkLiBTcGVjaWZ5aW5nIG1vcmUgdGhhbiBvbmUgcmVzdWx0cyBpbiBhbiBleGNlcHRpb24uXG4gKiBcbiAqICMjIFBhcmFtZXRlcnNcbiAqIFxuICogLSBgaGFuZ2luZ0luZGVudGA6IChvcHQpIFRoZSBhbW91bnQgdG8gaW5kZW50IGFsbCBidXQgdGhlIGZpcnN0IGxpbmUgb2YgYSBwYXJhZ3JhcGguIEluY29tcGF0aWJsZSB3aXRoIG90aGVyIGluZGVudCBcbiAqICAgbW9kZXMuXG4gKiAtIGBpZ25vcmVUYWdzYDogKG9wdCkgVHJlYXQgYW55IHRhZ3MgKCc8Li4uPicpIGluIHRoZSB0ZXh0IGFzICdpbnZpc2libGUnIGFuZCBhZGp1c3Qgd3JhcHBpbmcgYWNjb3JkaW5nbHkuXG4gKiAtIGBpbmRlbnRgOiAob3B0KSBJbmRlbnQgZWFjaCBsaW5lIGJ5IHRoZSBzcGNpZmllZCBhbW91bnQuIEluY29tcGF0aWJsZSB3aXRoIG90aGVyIGluZGVudCBtb2Rlcy5cbiAqIC0gYHNtYXJ0SW5kZW50YCAob3B0KSBJbmRlbnQgdGhlIGxpc3QgaXRlbXMgKGxpbmVzIHN0YXJ0aW5nIHdpdGggL1xccypbLSpdLykgYWNjb3JkaW5nIHRvIHRoZSBsaXN0IGluZGVudGF0aW9uLiBcbiAqICAgSW5jb21wYXRiaWxlIHdpdGggb3RoZXIgaW5kZW50IG1vZGVzLlxuICogLSBgd2lkdGhgIChvcHQpOiBUaGUgd2lkdGggdG8gd3JhcCB0by4gRGVmYXVsdHMgdG8gODAuXG4gKi9cbmNvbnN0IHdyYXAgPSAodGV4dCwgeyBcbiAgaGFuZ2luZ0luZGVudCA9IDAsIFxuICBpZ25vcmVUYWdzID0gZmFsc2UsIFxuICBpbmRlbnQgPSAwLCBcbiAgc21hcnRJbmRlbnQgPSBmYWxzZSwgXG4gIHdpZHRoID0gODAgXG59ID0ge30pID0+IHtcbiAgY29uc3QgaW5kZW50TW9kZXNBY3RpdmUgPSAoaGFuZ2luZ0luZGVudCA9PT0gdHJ1ZSA/IDEgOiAwKSArIChpbmRlbnQgPiAwID8gMSA6IDApICsgKHNtYXJ0SW5kZW50ID09PSB0cnVlID8gMSA6IDApXG4gIGlmIChpbmRlbnRNb2Rlc0FjdGl2ZSA+IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNdWx0aXBsZSBpbmRlbnQgbW9kZXMgYWN0aXZlOyBvbmx5IG9uZSAnaGFuZ2luZ0luZGVudCcsICdpbmRlbnQnLCBvciAnc21hcnRJbmRlbnQnIG1heSBiZSBhY3RpdmUuXCIpXG4gIH1cblxuICBpZiAoIXRleHQpIHJldHVybiAnJ1xuICAvLyB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXHMrJC8sICcnKSAvLyB3ZSdsbCB0cmltIHRoZSBmcm9udCBpbnNpZGUgdGhlIHdoaWxlIGxvb3BcblxuICBjb25zdCBsaW5lcyA9IFtdXG5cbiAgZm9yIChsZXQgaUxpbmUgb2YgdGV4dC5zcGxpdCgnXFxuJykpIHtcbiAgICBsZXQgbmV3UHAgPSB0cnVlXG4gICAgbGV0IGluTGlzdCA9IDBcbiAgICAvLyBhdCB0aGUgc3RhcnQgb2YgZWFjaCBwYXJhZ3JhcGgsIHdlIGNoZWNrIGlmIHdlIGhhdmUgYW4gZW1wdHkgbGluZVxuICAgIGlmIChpTGluZS5sZW5ndGggPT09IDApIHtcbiAgICAgIGxpbmVzLnB1c2goJycpXG4gICAgICBjb250aW51ZVxuICAgIH0gLy8gdGhlbiB3ZSBjaGVja2UgaWYgd2UncmUgaW4gYSBsaXN0XG4gICAgZWxzZSBpZiAoaUxpbmUubWF0Y2goL14gKlstKl0gKy8pKSB7XG4gICAgICAvLyBjb3VudCB0aGUgZGVwdGggb2YgaW5kZW50YXRpb24gKHN1Yi1saXN0cylcbiAgICAgIGluTGlzdCA9IGlMaW5lLnJlcGxhY2UoL14oICotICspLiovLCAnJDEnKS5sZW5ndGhcbiAgICB9XG5cbiAgICAvLyBuZXcgd2UgcHJvY2VzcyB0aGUgcmVzdCBlZiB0aGUgbGluZTsgdGhlcmUgYXJlIG11bHRpcGxlIGV4aXQgb3IgcmUtbG9vcCBwb2ludHMsIHdoZXJlIHdlIHNldCB0aGUgJ25ld1BwJyBmYWxzZSBcbiAgICAvLyBpbmRpY2F0aW5nIHRoYXQgd2UncmUgbm8gbG9uZ2VyIGF0IHRoZSBmcm9udCBvZiB0aGUgbGluZS5cbiAgICB3aGlsZSAoaUxpbmUubGVuZ3RoID4gMCkgeyAvLyB1c3VhbGx5IHdlICdicmVhaycgdGhlIGZsb3csIGJ1dCB0aGlzIGNvdWxkIGhhcHBlbiBpZiB3ZSB0cmltIHRoZSB0ZXh0IGV4YWN0bHkuXG4gICAgICAvLyBkZXRlcm1pbmUgaG93IG1hbnkgc3BhY2VzIHRvIGFkZCBiZWZvcmUgdGhlIGN1cnJlbnQgbGluZVxuICAgICAgY29uc3QgZWZmZWN0aXZlSW5kZW50ID0gIWhhbmdpbmdJbmRlbnQgJiYgIXNtYXJ0SW5kZW50XG4gICAgICAgID8gaW5kZW50XG4gICAgICAgIDogaGFuZ2luZ0luZGVudCAmJiAhbmV3UHBcbiAgICAgICAgICA/IGhhbmdpbmdJbmRlbnRcbiAgICAgICAgICA6IHNtYXJ0SW5kZW50ICYmIGluTGlzdCA+IDAgJiYgIW5ld1BwXG4gICAgICAgICAgICA/IGluTGlzdCBcbiAgICAgICAgICAgIDogMFxuICAgICAgY29uc3QgZXcgPSBnZXRFZmZlY3RpdmVXaWR0aCh7IHRleHQgOiBpTGluZSwgd2lkdGgsIGluZGVudCA6IGVmZmVjdGl2ZUluZGVudCwgaWdub3JlVGFncyB9KVxuICAgICAgY29uc3Qgc3BjcyA9ICcgJy5yZXBlYXQoZWZmZWN0aXZlSW5kZW50KVxuICAgICAgbGV0IGluaXRTcGFjZXMgPSAwXG4gICAgICBpZiAobmV3UHAgPT09IGZhbHNlKSB7IC8vIHRyaW0gYW55IHdoaXRlc3BhY2UgKGxpa2UgdGhlICcgJyBpbiBmcm9udCBvZiB0aGUgbGFzdCBpbnNlcnRlZCBsaW5lIGJyZWFrKVxuICAgICAgICAvLyB1bmxlc3Mgd2UncmUgYXQgdGhlIHN0YXJ0IG9mIGEgUFAsIGluIHdoaWNoIGNhc2Ugd2Ugd2FudCB0byBwcmVzZXJ2ZSB0aGUgaW5pdGlhbCBpbmRlbnQgb3IgbGlzdCBpbmRlbnRcbiAgICAgICAgaUxpbmUgPSBpTGluZS50cmltU3RhcnQoKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGluaXRTcGFjZXMgPSBpTGluZS5yZXBsYWNlKC9eKCAqKS4qLywgJyQxJykubGVuZ3RoXG4gICAgICB9XG5cbiAgICAgIGlmIChldyA+PSBpTGluZS5sZW5ndGgpIHtcbiAgICAgICAgbGluZXMucHVzaChzcGNzICsgaUxpbmUpXG4gICAgICAgIG5ld1BwID0gZmFsc2VcbiAgICAgICAgLy8gbGluZXMucHVzaCgnYTIzNDU2NzkwJyArICcxMjM0NTY3OTAnLnJlcGVhdCg3KSlcbiAgICAgICAgYnJlYWsgLy8gd2UncmUgZG9uZVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaUxpbmUuY2hhckF0KGV3KSA9PT0gJyAnKSB7XG4gICAgICAgIGxpbmVzLnB1c2goc3BjcyArIGlMaW5lLnNsaWNlKDAsIGV3KSlcbiAgICAgICAgaUxpbmUgPSBpTGluZS5zbGljZShldylcbiAgICAgICAgbmV3UHAgPSBmYWxzZVxuICAgICAgICAvLyBsaW5lcy5wdXNoKCdiMjM0NTY3OTAnICsgJzEyMzQ1Njc5MCcucmVwZWF0KDcpKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaUxpbmUuY2hhckF0KGV3IC0gMSkgPT09ICctJykge1xuICAgICAgICBsaW5lcy5wdXNoKHNwY3MgKyBpTGluZS5zbGljZSgwLCBldykpXG4gICAgICAgIGlMaW5lID0gaUxpbmUuc2xpY2UoZXcpXG4gICAgICAgIG5ld1BwID0gZmFsc2VcbiAgICAgICAgLy8gbGluZXMucHVzaCgnYzIzNDU2NzkwJyArICcxMjM0NTY3OTAnLnJlcGVhdCg3KSlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gd2hhdCdzIHRoZSBsYXN0IGluZGV4IG9mIG91ciBicmVhayBwb2ludHMgd2l0aGluIHRoZSBlZmZlY3RpdmUgd2lkdGggcmFuZ2U/XG4gICAgICBsZXQgaVNwYWNlID0gaUxpbmUubGFzdEluZGV4T2YoJyAnLCBldylcbiAgICAgIGlmIChpU3BhY2UgPiAtMSAmJiBuZXdQcCA9PT0gdHJ1ZSAmJiBpbml0U3BhY2VzID49IGlTcGFjZSkge1xuICAgICAgICAvLyBpZiB3ZSdyZSBuZXcgUFAsIHdlIHdhbnQgdG8gcHJlc2VydmUgdGhlIGluaXRpYWwgaW5kZW50IGFuZCBub3QgYnJlYWsgb24gc3BhY2VzIHdpdGhpblxuICAgICAgICBpU3BhY2UgPSAtMVxuICAgICAgfVxuXG4gICAgICBsZXQgaURhc2ggPSBpTGluZS5sYXN0SW5kZXhPZignLScsIGV3KVxuICAgICAgaWYgKGlEYXNoID4gLTEpIHtcbiAgICAgICAgaWYgKGluTGlzdCAmJiBpRGFzaCA8PSBpbkxpc3QpIHsgLy8gaWYgd2UgZmluZCB0aGUgJy0nIGF0IHRoZSBoZWFkIG9mIHRoZSBsaXN0LCB3ZSByZXNldCB0aGUgaURhc2hcbiAgICAgICAgICBpRGFzaCA9IC0xXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIHdlIHdhbnQgdG8ga2VlcCB0aGUgZGFzaCwgc28gd2UgcHVzaCBvdXIgYnJlYWsgcG9pbnQgb3V0IGJ5IG9uZVxuICAgICAgICAgIGlEYXNoICs9IDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBsZXQgaSA9IE1hdGgubWF4KGlTcGFjZSwgaURhc2gpXG4gICAgICBpZiAoaSA9PT0gLTEgfHwgaSA+IGV3KSB7IC8vIHRoZXJlJ3Mgbm8gJyAnLyctJyBvciBpdCdzIHBhc3Qgb3VyIGVmZmVjdGl2ZSB3aWR0aCBzbyB3ZSBmb3JjZSBhIGhhcmQgYnJlYWsuXG4gICAgICAgIGkgPSBld1xuICAgICAgfVxuICAgICAgaWYgKGkgPiBpTGluZS5sZW5ndGgpIHtcbiAgICAgICAgaSA9IGlMaW5lLmxlbmd0aFxuICAgICAgfVxuXG4gICAgICBsaW5lcy5wdXNoKHNwY3MgKyBpTGluZS5zbGljZSgwLCBpKSlcbiAgICAgIC8vIGxpbmVzLnB1c2goJ2QyMzQ1Njc5MCcgKyAnMTIzNDU2NzkwJy5yZXBlYXQoNykpXG4gICAgICBpTGluZSA9IGlMaW5lLnNsaWNlKGkpXG5cbiAgICAgIG5ld1BwID0gZmFsc2VcbiAgICB9IC8vIHdoaWxlIGlucHV0IGxpbmVcbiAgfSAvLyBmb3IgZWFjaCBpbnB1dCBsaW5lXG5cbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG59XG5cbmV4cG9ydCB7IHdyYXAgfVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFBQSxrQkFBQSxHQUFBQyxPQUFBO0FBQXlELFNBQUFDLDJCQUFBQyxDQUFBLEVBQUFDLGNBQUEsUUFBQUMsRUFBQSxVQUFBQyxNQUFBLG9CQUFBSCxDQUFBLENBQUFHLE1BQUEs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