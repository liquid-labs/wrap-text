const tagBreakers = ['<', ' ', '\n']
/**
* Determines the effective considering any indent and invisible tags.
*/
const getEffectiveWidth = ({ text, width, indent = 0, ignoreTags = false }) => {
  if (ignoreTags === false) return width - indent
  else {
    width = width - indent // adjust width
    let charCount = 0
    let tagChars = 0
    let sawLtAt = -1
    let cursor = 0
    //                   v have we run out of text?         v once we've counted width chars, we're done
    for (; cursor < text.length && charCount < width; cursor += 1) {
      const char = text.charAt(cursor)
      if (sawLtAt > -1) { // maybe in a tag
        if (char === '>') {
          tagChars += cursor - sawLtAt + 1
          sawLtAt = -1
        }
        else if (tagBreakers.includes(char)) { // false alarm, not really a tag
          // charCount += cursor - sawLtAt + 1
          charCount += 1 // count the '<'
          cursor = sawLtAt + 1 // reset the cursor
          sawLtAt = -1
        }
      }
      else { // not in a tag
        if (char === '<') {
          sawLtAt = cursor
        }
        else {
          charCount += 1
        }
      }
    }
    if (sawLtAt > -1) { // then we've run off the end without finding a closing tag
      charCount += cursor - sawLtAt + 1
      if ((charCount - tagChars) > width) { // then we had a '<' and then chars to the end of the line
        return width + tagChars
      }
    }

    return charCount + tagChars
  }
}

export { getEffectiveWidth }
