const tagBreakers = ['<', ' ', '\n']
/**
* Determines the effective considering any indent and invisible tags.
*/
const getEffectiveWidth = ({ text, width, indent, ignoreTags }) => {
  if (ignoreTags === false) return width - indent
  else {
    width = width - indent // adjust width
    let charCount = 0
    let tagChars = 0
    let sawLtAt = -1
    let cursor = 0
    //         v have we run out of text?         v once we've counted width chars, we're done
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

const wrap = (text, { 
  hangingIndent = false, 
  ignoreTags = false, 
  indent = 0, 
  smartIndent = false, 
  width = 80 
} = {}) => {
  const indentModesActive = (hangingIndent === true ? 1 : 0) + (indent > 0 ? 1 : 0) + (smartIndent === true ? 1 : 0)
  if (indentModesActive > 1) {
    throw new Error("Multiple indent modes active; only one 'hangingIndent', 'indent', or 'smartIndent' may be active.")
  }

  if (!text) return ''
  // text = text.replace(/\s+$/, '') // we'll trim the front inside the while loop

  const lines = []

  for (let iLine of text.split('\n')) {
    let newPp = true
    let inList = 0
    // at the start of each paragraph, we check if we have an empty line
    if (iLine.length === 0) {
      lines.push('')
      continue
    } // then we checke if we're in a list
    else if (iLine.match(/^ *[-*] +/)) {
      // count the depth of indentation (sub-lists)
      inList = iLine.replace(/^( *- +).*/, '$1').length
    }

    // new we process the rest ef the line; there are multiple exit or re-loop points, where we set the 'newPp' false 
    // indicating that we're no longer at the front of the line.
    while (iLine.length > 0) { // usually we 'break' the flow, but this could happen if we trim the text exactly.
      // determine how many spaces to add before the current line
      const effectiveIndent = !hangingIndent && !smartIndent
        ? indent
        : hangingIndent && !newPp
          ? indent
          : smartIndent && inList > 0 && !newPp
            ? inList 
            : 0
      const ew = getEffectiveWidth({ text : iLine, width, indent : effectiveIndent, ignoreTags })
      const spcs = ' '.repeat(effectiveIndent)
      let initSpaces = 0
      if (newPp === false) { // trim any whitespace (like the ' ' in front of the last inserted line break)
        // unless we're at the start of a PP, in which case we want to preserve the initial indent or list indent
        iLine = iLine.trimStart()
      }
      else {
        initSpaces = iLine.replace(/^( *).*/, '$1').length
      }

      if (ew >= iLine.length) {
        lines.push(spcs + iLine)
        newPp = false
        // lines.push('a23456790' + '123456790'.repeat(7))
        break // we're done
      }
      else if (iLine.charAt(ew) === ' ') {
        lines.push(spcs + iLine.slice(0, ew))
        iLine = iLine.slice(ew)
        newPp = false
        // lines.push('b23456790' + '123456790'.repeat(7))
        continue
      }
      else if (iLine.charAt(ew - 1) === '-') {
        lines.push(spcs + iLine.slice(0, ew))
        iLine = iLine.slice(ew)
        newPp = false
        // lines.push('c23456790' + '123456790'.repeat(7))
        continue
      }

      // what's the last index of our break points within the effective width range?
      let iSpace = iLine.lastIndexOf(' ', ew)
      if (iSpace > -1 && newPp === true && initSpaces >= iSpace) {
        // if we're new PP, we want to preserve the initial indent and not break on spaces within
        iSpace = -1
      }

      let iDash = iLine.lastIndexOf('-', ew)
      if (iDash > -1) {
        if (inList && iDash <= inList) { // if we find the '-' at the head of the list, we reset the iDash
          iDash = -1
        }
        else { // we want to keep the dash, so we push our break point out by one
          iDash += 1
        }
      }
      
      let i = Math.max(iSpace, iDash)
      if (i === -1 || i > ew) { // there's no ' '/'-' or it's past our effective width so we force a hard break.
        i = ew
      }
      if (i > iLine.length) {
        i = iLine.length
      }

      lines.push(spcs + iLine.slice(0, i))
      // lines.push('d23456790' + '123456790'.repeat(7))
      iLine = iLine.slice(i)

      newPp = false
    } // while input line
  } // for each input line

  return lines.join('\n')
}

export { getEffectiveWidth, wrap }
