import { getBaseWidth } from './get-base-width'
import { getEffectiveWidth } from './get-effective-width'

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
 * - `allowOverflow`: (opt)  Indicates that long sequences of characters with no break characters should be allowed to
 *    overflow the width. They may still, of course, be wrapped by the terminal.
 * - `breakCharacters`: (opt) Specify the characters to break on. (Can be strings, actually.) Defaults to ' ', '-', '/'.
 * - `breakSpacesOnly: (opt) Sets ' ' as the only break character.`
 * - `hangingIndent`: (opt) The amount to indent all but the first line of a paragraph. Incompatible with other indent
 *   modes.
 * - `ignoreTags`: (opt) Treat any tags ('<...>') in the text as 'invisible' and adjust wrapping accordingly.
 * - `indent`: (opt) Indent each line by the spcified amount. Incompatible with other indent modes.
 * - `prefix`: (opt) Prefixes each wrapped line with the indicated prefix. Note this happens after the lines are wrapped
 *   according to 'width'. If you need the line to be a specific width in total, you must subtract the length of the
 *   indent yourself.
 * - `smartIndent` (opt) Indent the list items (lines starting with /\s*[-*]/) according to the list indentation.
 *   Incompatbile with other indent modes.
 * - `width` (opt): The width to wrap to. Defaults to 80. Use '0' to default to 'process.stdout.columns' and -1 for no
 *   wrapping.
 */
const wrap = (text, {
  allowOverflow = false,
  breakCharacters = [' ', '-', '/'],
  breakSpacesOnly = false,
  hangingIndent = 0,
  ignoreTags = false,
  indent = 0,
  prefix,
  smartIndent = false,
  width
} = {}) => {
  const indentModesActive = (hangingIndent === true ? 1 : 0) + (indent > 0 ? 1 : 0) + (smartIndent === true ? 1 : 0)
  if (indentModesActive > 1) {
    throw new Error("Multiple indent modes active; only one 'hangingIndent', 'indent', or 'smartIndent' may be active.")
  }

  if (!text) return ''

  if (width === -1) {
    return text
  }

  if (breakSpacesOnly === true) {
    breakCharacters = [' ']
  }

  width = getBaseWidth(width)

  const lines = []

  for (let iLine of text.split('\n').map((line) => line.trimEnd())) {
    let newPp = true
    let inList = 0
    // at the start of each paragraph, we check if we have an empty line
    if (iLine.length === 0) {
      lines.push('')
      continue
    } // then we checke if we're in a list
    else if (iLine.match(/^ *[*-] +/)) {
      // count the depth of indentation (sub-lists)
      inList = iLine.replace(/^( *[*-] +).*/, '$1').length
    }

    // new we process the rest ef the line; there are multiple exit or re-loop points, where we set the 'newPp' false
    // indicating that we're no longer at the front of the line.
    while (iLine.length > 0) { // usually we 'break' the flow, but this could happen if we trim the text exactly.
      // determine how many spaces to add before the current line
      const effectiveIndent = !hangingIndent && !smartIndent
        ? indent
        : hangingIndent && !newPp
          ? hangingIndent
          : smartIndent && inList > 0 && !newPp
            ? inList
            : 0
      let initSpaces = 0
      if (newPp === false) { // trim any whitespace (like the ' ' in front of the last inserted line break)
        // unless we're at the start of a PP, in which case we want to preserve the initial indent or list indent
        iLine = iLine.trimStart()
      }
      else {
        initSpaces = iLine.replace(/^( *).*/, '$1').length
      }
      const ew = getEffectiveWidth({ text : iLine, width, indent : effectiveIndent, ignoreTags })
      const spcs = ' '.repeat(effectiveIndent)

      if (ew >= iLine.length) {
        lines.push(spcs + iLine)
        newPp = false
        break // we're done
      }/*
      else { // check if we effectively end at a break character TODO: do we need this with the new logic below?
        if (breakCharacters.includes(' ') && iLine.charAt(ew) === ' ') {
          lines.push(spcs + iLine.slice(0, ew))
          iLine = iLine.slice(ew)
          newPp = false
          continue
        } // else, check the other break characters
        for (const breakChar of breakCharacters.filter((c) => c !== ' ')) {
          if (iLine.charAt(ew - 1) === breakChar) {
            lines.push(spcs + iLine.slice(0, ew - 1))
            iLine = iLine.slice(ew - 1)
            newPp = false
            continue
          }
        }
      } */
      // then we have a break point not at the end of the current line
      // what's the last index of our break points within the effective width range?
      let [breakPoint, breakChar] = breakCharacters.reduce((acc, breakChar) => {
        const breakPoint = iLine.lastIndexOf(breakChar, ew)
        const lastBreak = acc[0]

        if (breakPoint > lastBreak && !(breakChar === ' ' && breakPoint + 1 === initSpaces)) {
          return [breakPoint, breakChar]
        } // else
        return acc
      }, [-1, undefined])
      // note, because we look for lastIndexOf less than ew, breakpoint can't be greater than ew
      if (allowOverflow === true && breakPoint === -1) {
        ([breakPoint, breakChar] = breakCharacters.reduce((acc, breakChar) => {
          const testAfter = breakChar === ' ' ? initSpaces : 0
          const breakPoint = iLine.indexOf(breakChar, testAfter)
          const lastBreak = acc[0]

          if ((breakPoint !== -1 && breakPoint < lastBreak)) {
            return [breakPoint, breakChar]
          } // else
          return acc
        }, [iLine.length, undefined]))
      }
      else if (breakPoint === -1) { // and !allowOveflow
        breakPoint = ew
      }

      if (breakChar !== ' ' && breakChar !== undefined && (allowOverflow === false && breakPoint !== ew)) {
        breakPoint += 1
      }

      lines.push(spcs + iLine.slice(0, breakPoint))
      iLine = iLine.slice(breakPoint)

      newPp = false
    } // while input line
  } // for each input line

  if (prefix !== undefined) {
    lines.forEach((line, i, arr) => {
      if (i < arr.length - 1 || line.length > 0) {
        arr[i] = prefix + line
      }
    })
  }

  return lines.join('\n')
}

export { wrap }
