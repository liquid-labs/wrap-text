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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0YWdCcmVha2VycyIsImdldEVmZmVjdGl2ZVdpZHRoIiwiX3JlZiIsInRleHQiLCJ3aWR0aCIsImluZGVudCIsImlnbm9yZVRhZ3MiLCJjaGFyQ291bnQiLCJ0YWdDaGFycyIsInNhd0x0QXQiLCJjdXJzb3IiLCJsZW5ndGgiLCJjaGFyIiwiY2hhckF0IiwiaW5jbHVkZXMiLCJleHBvcnRzIl0sInNvdXJjZXMiOlsiLi4vc3JjL2dldC1lZmZlY3RpdmUtd2lkdGgubWpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHRhZ0JyZWFrZXJzID0gWyc8JywgJyAnLCAnXFxuJ11cbi8qKlxuKiBEZXRlcm1pbmVzIHRoZSBlZmZlY3RpdmUgY29uc2lkZXJpbmcgYW55IGluZGVudCBhbmQgaW52aXNpYmxlIHRhZ3MuXG4qL1xuY29uc3QgZ2V0RWZmZWN0aXZlV2lkdGggPSAoeyB0ZXh0LCB3aWR0aCwgaW5kZW50LCBpZ25vcmVUYWdzIH0pID0+IHtcbiAgaWYgKGlnbm9yZVRhZ3MgPT09IGZhbHNlKSByZXR1cm4gd2lkdGggLSBpbmRlbnRcbiAgZWxzZSB7XG4gICAgd2lkdGggPSB3aWR0aCAtIGluZGVudCAvLyBhZGp1c3Qgd2lkdGhcbiAgICBsZXQgY2hhckNvdW50ID0gMFxuICAgIGxldCB0YWdDaGFycyA9IDBcbiAgICBsZXQgc2F3THRBdCA9IC0xXG4gICAgbGV0IGN1cnNvciA9IDBcbiAgICAvLyAgICAgICAgIHYgaGF2ZSB3ZSBydW4gb3V0IG9mIHRleHQ/ICAgICAgICAgdiBvbmNlIHdlJ3ZlIGNvdW50ZWQgd2lkdGggY2hhcnMsIHdlJ3JlIGRvbmVcbiAgICBmb3IgKDsgY3Vyc29yIDwgdGV4dC5sZW5ndGggJiYgY2hhckNvdW50IDwgd2lkdGg7IGN1cnNvciArPSAxKSB7XG4gICAgICBjb25zdCBjaGFyID0gdGV4dC5jaGFyQXQoY3Vyc29yKVxuICAgICAgaWYgKHNhd0x0QXQgPiAtMSkgeyAvLyBtYXliZSBpbiBhIHRhZ1xuICAgICAgICBpZiAoY2hhciA9PT0gJz4nKSB7XG4gICAgICAgICAgdGFnQ2hhcnMgKz0gY3Vyc29yIC0gc2F3THRBdCArIDFcbiAgICAgICAgICBzYXdMdEF0ID0gLTFcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0YWdCcmVha2Vycy5pbmNsdWRlcyhjaGFyKSkgeyAvLyBmYWxzZSBhbGFybSwgbm90IHJlYWxseSBhIHRhZ1xuICAgICAgICAgIC8vIGNoYXJDb3VudCArPSBjdXJzb3IgLSBzYXdMdEF0ICsgMVxuICAgICAgICAgIGNoYXJDb3VudCArPSAxIC8vIGNvdW50IHRoZSAnPCdcbiAgICAgICAgICBjdXJzb3IgPSBzYXdMdEF0ICsgMSAvLyByZXNldCB0aGUgY3Vyc29yXG4gICAgICAgICAgc2F3THRBdCA9IC0xXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgeyAvLyBub3QgaW4gYSB0YWdcbiAgICAgICAgaWYgKGNoYXIgPT09ICc8Jykge1xuICAgICAgICAgIHNhd0x0QXQgPSBjdXJzb3JcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjaGFyQ291bnQgKz0gMVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzYXdMdEF0ID4gLTEpIHsgLy8gdGhlbiB3ZSd2ZSBydW4gb2ZmIHRoZSBlbmQgd2l0aG91dCBmaW5kaW5nIGEgY2xvc2luZyB0YWdcbiAgICAgIGNoYXJDb3VudCArPSBjdXJzb3IgLSBzYXdMdEF0ICsgMVxuICAgICAgaWYgKChjaGFyQ291bnQgLSB0YWdDaGFycykgPiB3aWR0aCkgeyAvLyB0aGVuIHdlIGhhZCBhICc8JyBhbmQgdGhlbiBjaGFycyB0byB0aGUgZW5kIG9mIHRoZSBsaW5lXG4gICAgICAgIHJldHVybiB3aWR0aCArIHRhZ0NoYXJzXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYXJDb3VudCArIHRhZ0NoYXJzXG4gIH1cbn1cblxuZXhwb3J0IHsgZ2V0RWZmZWN0aXZlV2lkdGggfSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTUEsV0FBVyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM7QUFDcEM7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsaUJBQWlCLEdBQUcsU0FBcEJBLGlCQUFpQkEsQ0FBQUMsSUFBQSxFQUE0QztFQUFBLElBQXRDQyxJQUFJLEdBQUFELElBQUEsQ0FBSkMsSUFBSTtJQUFFQyxLQUFLLEdBQUFGLElBQUEsQ0FBTEUsS0FBSztJQUFFQyxNQUFNLEdBQUFILElBQUEsQ0FBTkcsTUFBTTtJQUFFQyxVQUFVLEdBQUFKLElBQUEsQ0FBVkksVUFBVTtFQUMxRCxJQUFJQSxVQUFVLEtBQUssS0FBSyxFQUFFLE9BQU9GLEtBQUssR0FBR0MsTUFBTSxNQUMxQztJQUNIRCxLQUFLLEdBQUdBLEtBQUssR0FBR0MsTUFBTSxFQUFDO0lBQ3ZCLElBQUlFLFNBQVMsR0FBRyxDQUFDO0lBQ2pCLElBQUlDLFFBQVEsR0FBRyxDQUFDO0lBQ2hCLElBQUlDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDaEIsSUFBSUMsTUFBTSxHQUFHLENBQUM7SUFDZDtJQUNBLE9BQU9BLE1BQU0sR0FBR1AsSUFBSSxDQUFDUSxNQUFNLElBQUlKLFNBQVMsR0FBR0gsS0FBSyxFQUFFTSxNQUFNLElBQUksQ0FBQyxFQUFFO01BQzdELElBQU1FLEtBQUksR0FBR1QsSUFBSSxDQUFDVSxNQUFNLENBQUNILE1BQU0sQ0FBQztNQUNoQyxJQUFJRCxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFBRTtRQUNsQixJQUFJRyxLQUFJLEtBQUssR0FBRyxFQUFFO1VBQ2hCSixRQUFRLElBQUlFLE1BQU0sR0FBR0QsT0FBTyxHQUFHLENBQUM7VUFDaENBLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDZCxDQUFDLE1BQ0ksSUFBSVQsV0FBVyxDQUFDYyxRQUFRLENBQUNGLEtBQUksQ0FBQyxFQUFFO1VBQUU7VUFDckM7VUFDQUwsU0FBUyxJQUFJLENBQUMsRUFBQztVQUNmRyxNQUFNLEdBQUdELE9BQU8sR0FBRyxDQUFDLEVBQUM7VUFDckJBLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDZDtNQUNGLENBQUMsTUFDSTtRQUFFO1FBQ0wsSUFBSUcsS0FBSSxLQUFLLEdBQUcsRUFBRTtVQUNoQkgsT0FBTyxHQUFHQyxNQUFNO1FBQ2xCLENBQUMsTUFDSTtVQUNISCxTQUFTLElBQUksQ0FBQztRQUNoQjtNQUNGO0lBQ0Y7SUFDQSxJQUFJRSxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUU7TUFBRTtNQUNsQkYsU0FBUyxJQUFJRyxNQUFNLEdBQUdELE9BQU8sR0FBRyxDQUFDO01BQ2pDLElBQUtGLFNBQVMsR0FBR0MsUUFBUSxHQUFJSixLQUFLLEVBQUU7UUFBRTtRQUNwQyxPQUFPQSxLQUFLLEdBQUdJLFFBQVE7TUFDekI7SUFDRjtJQUVBLE9BQU9ELFNBQVMsR0FBR0MsUUFBUTtFQUM3QjtBQUNGLENBQUM7QUFBQU8sT0FBQSxDQUFBZCxpQkFBQSxHQUFBQSxpQkFBQSJ9