"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEffectiveWidth = void 0;
var tagBreakers = ['<', ' ', '\n'];
/**
* Determines the effective considering any indent and invisible tags.
*/
var getEffectiveWidth = function getEffectiveWidth(_ref) {
  var text = _ref.text,
    width = _ref.width,
    _ref$indent = _ref.indent,
    indent = _ref$indent === void 0 ? 0 : _ref$indent,
    _ref$ignoreTags = _ref.ignoreTags,
    ignoreTags = _ref$ignoreTags === void 0 ? false : _ref$ignoreTags;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0YWdCcmVha2VycyIsImdldEVmZmVjdGl2ZVdpZHRoIiwiX3JlZiIsInRleHQiLCJ3aWR0aCIsIl9yZWYkaW5kZW50IiwiaW5kZW50IiwiX3JlZiRpZ25vcmVUYWdzIiwiaWdub3JlVGFncyIsImNoYXJDb3VudCIsInRhZ0NoYXJzIiwic2F3THRBdCIsImN1cnNvciIsImxlbmd0aCIsImNoYXIiLCJjaGFyQXQiLCJpbmNsdWRlcyIsImV4cG9ydHMiXSwic291cmNlcyI6WyIuLi9zcmMvZ2V0LWVmZmVjdGl2ZS13aWR0aC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGFnQnJlYWtlcnMgPSBbJzwnLCAnICcsICdcXG4nXVxuLyoqXG4qIERldGVybWluZXMgdGhlIGVmZmVjdGl2ZSBjb25zaWRlcmluZyBhbnkgaW5kZW50IGFuZCBpbnZpc2libGUgdGFncy5cbiovXG5jb25zdCBnZXRFZmZlY3RpdmVXaWR0aCA9ICh7IHRleHQsIHdpZHRoLCBpbmRlbnQgPSAwLCBpZ25vcmVUYWdzID0gZmFsc2V9KSA9PiB7XG4gIGlmIChpZ25vcmVUYWdzID09PSBmYWxzZSkgcmV0dXJuIHdpZHRoIC0gaW5kZW50XG4gIGVsc2Uge1xuICAgIHdpZHRoID0gd2lkdGggLSBpbmRlbnQgLy8gYWRqdXN0IHdpZHRoXG4gICAgbGV0IGNoYXJDb3VudCA9IDBcbiAgICBsZXQgdGFnQ2hhcnMgPSAwXG4gICAgbGV0IHNhd0x0QXQgPSAtMVxuICAgIGxldCBjdXJzb3IgPSAwXG4gICAgLy8gICAgICAgICB2IGhhdmUgd2UgcnVuIG91dCBvZiB0ZXh0PyAgICAgICAgIHYgb25jZSB3ZSd2ZSBjb3VudGVkIHdpZHRoIGNoYXJzLCB3ZSdyZSBkb25lXG4gICAgZm9yICg7IGN1cnNvciA8IHRleHQubGVuZ3RoICYmIGNoYXJDb3VudCA8IHdpZHRoOyBjdXJzb3IgKz0gMSkge1xuICAgICAgY29uc3QgY2hhciA9IHRleHQuY2hhckF0KGN1cnNvcilcbiAgICAgIGlmIChzYXdMdEF0ID4gLTEpIHsgLy8gbWF5YmUgaW4gYSB0YWdcbiAgICAgICAgaWYgKGNoYXIgPT09ICc+Jykge1xuICAgICAgICAgIHRhZ0NoYXJzICs9IGN1cnNvciAtIHNhd0x0QXQgKyAxXG4gICAgICAgICAgc2F3THRBdCA9IC0xXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGFnQnJlYWtlcnMuaW5jbHVkZXMoY2hhcikpIHsgLy8gZmFsc2UgYWxhcm0sIG5vdCByZWFsbHkgYSB0YWdcbiAgICAgICAgICAvLyBjaGFyQ291bnQgKz0gY3Vyc29yIC0gc2F3THRBdCArIDFcbiAgICAgICAgICBjaGFyQ291bnQgKz0gMSAvLyBjb3VudCB0aGUgJzwnXG4gICAgICAgICAgY3Vyc29yID0gc2F3THRBdCArIDEgLy8gcmVzZXQgdGhlIGN1cnNvclxuICAgICAgICAgIHNhd0x0QXQgPSAtMVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHsgLy8gbm90IGluIGEgdGFnXG4gICAgICAgIGlmIChjaGFyID09PSAnPCcpIHtcbiAgICAgICAgICBzYXdMdEF0ID0gY3Vyc29yXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY2hhckNvdW50ICs9IDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2F3THRBdCA+IC0xKSB7IC8vIHRoZW4gd2UndmUgcnVuIG9mZiB0aGUgZW5kIHdpdGhvdXQgZmluZGluZyBhIGNsb3NpbmcgdGFnXG4gICAgICBjaGFyQ291bnQgKz0gY3Vyc29yIC0gc2F3THRBdCArIDFcbiAgICAgIGlmICgoY2hhckNvdW50IC0gdGFnQ2hhcnMpID4gd2lkdGgpIHsgLy8gdGhlbiB3ZSBoYWQgYSAnPCcgYW5kIHRoZW4gY2hhcnMgdG8gdGhlIGVuZCBvZiB0aGUgbGluZVxuICAgICAgICByZXR1cm4gd2lkdGggKyB0YWdDaGFyc1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjaGFyQ291bnQgKyB0YWdDaGFyc1xuICB9XG59XG5cbmV4cG9ydCB7IGdldEVmZmVjdGl2ZVdpZHRoIH0iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU1BLFdBQVcsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBLElBQU1DLGlCQUFpQixHQUFHLFNBQXBCQSxpQkFBaUJBLENBQUFDLElBQUEsRUFBdUQ7RUFBQSxJQUFqREMsSUFBSSxHQUFBRCxJQUFBLENBQUpDLElBQUk7SUFBRUMsS0FBSyxHQUFBRixJQUFBLENBQUxFLEtBQUs7SUFBQUMsV0FBQSxHQUFBSCxJQUFBLENBQUVJLE1BQU07SUFBTkEsTUFBTSxHQUFBRCxXQUFBLGNBQUcsQ0FBQyxHQUFBQSxXQUFBO0lBQUFFLGVBQUEsR0FBQUwsSUFBQSxDQUFFTSxVQUFVO0lBQVZBLFVBQVUsR0FBQUQsZUFBQSxjQUFHLEtBQUssR0FBQUEsZUFBQTtFQUN0RSxJQUFJQyxVQUFVLEtBQUssS0FBSyxFQUFFLE9BQU9KLEtBQUssR0FBR0UsTUFBTSxNQUMxQztJQUNIRixLQUFLLEdBQUdBLEtBQUssR0FBR0UsTUFBTSxFQUFDO0lBQ3ZCLElBQUlHLFNBQVMsR0FBRyxDQUFDO0lBQ2pCLElBQUlDLFFBQVEsR0FBRyxDQUFDO0lBQ2hCLElBQUlDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDaEIsSUFBSUMsTUFBTSxHQUFHLENBQUM7SUFDZDtJQUNBLE9BQU9BLE1BQU0sR0FBR1QsSUFBSSxDQUFDVSxNQUFNLElBQUlKLFNBQVMsR0FBR0wsS0FBSyxFQUFFUSxNQUFNLElBQUksQ0FBQyxFQUFFO01BQzdELElBQU1FLEtBQUksR0FBR1gsSUFBSSxDQUFDWSxNQUFNLENBQUNILE1BQU0sQ0FBQztNQUNoQyxJQUFJRCxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFBRTtRQUNsQixJQUFJRyxLQUFJLEtBQUssR0FBRyxFQUFFO1VBQ2hCSixRQUFRLElBQUlFLE1BQU0sR0FBR0QsT0FBTyxHQUFHLENBQUM7VUFDaENBLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDZCxDQUFDLE1BQ0ksSUFBSVgsV0FBVyxDQUFDZ0IsUUFBUSxDQUFDRixLQUFJLENBQUMsRUFBRTtVQUFFO1VBQ3JDO1VBQ0FMLFNBQVMsSUFBSSxDQUFDLEVBQUM7VUFDZkcsTUFBTSxHQUFHRCxPQUFPLEdBQUcsQ0FBQyxFQUFDO1VBQ3JCQSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2Q7TUFDRixDQUFDLE1BQ0k7UUFBRTtRQUNMLElBQUlHLEtBQUksS0FBSyxHQUFHLEVBQUU7VUFDaEJILE9BQU8sR0FBR0MsTUFBTTtRQUNsQixDQUFDLE1BQ0k7VUFDSEgsU0FBUyxJQUFJLENBQUM7UUFDaEI7TUFDRjtJQUNGO0lBQ0EsSUFBSUUsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFO01BQUU7TUFDbEJGLFNBQVMsSUFBSUcsTUFBTSxHQUFHRCxPQUFPLEdBQUcsQ0FBQztNQUNqQyxJQUFLRixTQUFTLEdBQUdDLFFBQVEsR0FBSU4sS0FBSyxFQUFFO1FBQUU7UUFDcEMsT0FBT0EsS0FBSyxHQUFHTSxRQUFRO01BQ3pCO0lBQ0Y7SUFFQSxPQUFPRCxTQUFTLEdBQUdDLFFBQVE7RUFDN0I7QUFDRixDQUFDO0FBQUFPLE9BQUEsQ0FBQWhCLGlCQUFBLEdBQUFBLGlCQUFBIn0=