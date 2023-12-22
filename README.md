# liquid-labs/wrap-text

Wraps text for any width while respecting potentially invisible tags and smartly indenting lists.

## Installation

```bash
npm i @liquid-labs/wrap-text
```

## Usage

### Library usage

```javascript
import { wrap } from '@liquid-labs/wrap-text'
//                      0        1         2         3         4         5         6
//                      12345678901234567890123456789012345678901234567890123456789012
const someTaggedText = "Hey! Here's some <i>text</i> with <em>tags</em> embedded in it."
console.log('Default wrapping:\n')
console.log(wrap(someTaggedText, { width: 40 }))

console.log('Tag-ignoring wrapping:\n')
console.log(wrap(someTaggedText, { ignoreTags: true, width: 40 }))
```

See [Examples](#examples) section for output.

### CLI usage

```bash
cat 'some text' | wrap
wrap a-text-file.txt
```

## Examples

_The numbers are given as a visual aid, only the text is actually printed._

Given text:
```
Hey! Here's some <i>text</i> with <em>tags</em> embedded in it.
```

__Basic wrapping__: `wrap(text, { width: 40 })` yields:
```
0        1         2         3         4
1234567890123456789012345678901234567890
Hey! Here's some <i>text</i> with
<em>tags</em> embedded in it.
```

- A __width of 0__ means to set the wrapping to `process.stdout.columns` if defined, and the default (80) otherwise.
- A __width of -1__ means no wrapping at all.

__Tag ignoring wrapping__: `wrap(text, { ignoreTags: true,  width: 40 })` yields:
```
0        1            2                 3              4
12345678901234567   8901     234567    8901     234567890
Hey! Here's some <i>text<rst> with <em>tags<rst>
embedded in it.
```

- Tags are simple and cannot contain any spaces. I.e., these are not full HTML/XML tags.
- The tags wrapping is meant to be compitible with [@liquid-labs/terminal-text](https://github.com/liquid-labs/terminal-text).

Given text:
```
- We'll indent the entire item to match the list.
  - And same goes for this sub item!
Now back to normal.
```

__Smart list indenting__: `wrap(text, { smartIndent: true, width: 30 })` yields:
```
0        1         2         3
123456789012345678901234567890
- We'll indent the entire item
  to match the list.
  - And same goes for this sub 
    item!
Now back to normal.
```

Of course you can combine `smartIndent` with `ignoreTags`.

## Reference

### API reference

`wrap(text, option)`: Wraps the specified text to the specified or default width.
- `text`: The text to wrap.
- `options.hangingIndent`: The amount to indent all but the first line of a paragraph. Incompatible with other indent modes.
- `options.ignoreTags`: Treat any tags ('<...>') in the text as 'invisible' and adjust wrapping accordingly.
- `options.indent`: Indent each line by the spcified amount. Incompatible with other indent modes.
- `options.prefix`: Prefixes each wrapped line with the indicated prefix. Note this happens after the lines are wrapped according to the specified width. If you need the line to be a specific width in total, you must subtract the length of the indent yourself.
- `options.width`: The width to wrap to. Defaults to 80.

### CLI command reference

#### Usage

`wrap <options> <input-file>`

#### Options

|Option|Description|
|------|------|
|`<input-file>`|(_main argument_,_optional_) The file to process and wrap.|
|`--document`|Creates documentation for self.|
|`--document-section-depth`|Sets the initial section-depth for generated docuemnation.|
|`--document-title`|Sets the title for generated documentation.|
|`--hanging-indent`|The amount to indent all but the first line of a paragraph. Incompatible with other indent modes.|
|`--ignore-tags`|Treat any tags ('<...>') in the text as 'invisible' and adjust wrapping accordingly.|
|`--indent`|Indent each line by the spcified amount. Incompatible with other indent modes.|
|`--prefix`|Prefixes each wrapped line with the indicated prefix. Note this happens after the lines are wrapped according to the specified width. If you need the line to be a specific width in total, you must subtract the length of the indent yourself.|
|`--smart-indent`|Ignores tags (treats as zero-width string) when wrapping.|
|`--width`|The width to wrap to. Defaults to 80.|