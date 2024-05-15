# liquid-labs/wrap-text
[![coverage: 91%](./.readme-assets/coverage.svg)](https://github.com/liquid-labs/wrap-text-plus/pulls?q=is%3Apr+is%3Aclosed)

Library and CLI to wrap text for any width with handling for invisible formatting, smart list indentation, and more.

- [Installation](#installation)
- [Usage](#usage)
  - [Library usage](#library-usage)
  - [CLI usage](#cli-usage)
- [Examples](#examples)
  - [Basic wrapping](#basic-wrapping)
  - [Wrap ignoring formatting](#wrap-ignoring-formatting)
  - [Wrap ignoring tags](#wrap-ignoring-tags)
  - [Smart list indentation](#smart-list-indentation)
  - [Hanging indentation](#hanging-indentation)
  - [Absolute indentation](#absolute-indentation)
  - [Line-prefixing](#line-prefixing)
- [User reference](#user-reference)
  - [API reference](#api-reference)
  - [CLI reference](#cli-reference)

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

### Basic wrapping

By default, tags don't get special treatment.

```javascript
text = "Hey! Here's some <i>text</i> with <em>tags</em> embedded in it."
wrap(text, { width: 40 })
```
yields:
```
0        1         2         3         4
1234567890123456789012345678901234567890
Hey! Here's some <i>text<rst> with 
<em>tags<rst> embedded in it.
```

### Wrap ignoring formatting

```javascript
const text = "Hey! Here's some \u001b[1mtext\u0000 with \u001b[106mformatting\u0000 embedded in it."
wrap(text, { width: 40 })
```
yields:
```
0        1                  2                            3               4
12345678901234567         8901       23456            789012345      67890
Hey! Here's some \u001b[1mtext\u0000 with \u001b[106mformatting\u0000
embedded in it.
```

### Wrap ignoring tags

```javascript
text = "Hey! Here's some <i>text</i> with <em>tags</em> embedded in it."
wrap(text, { ignoreTags: true,  width: 40 })
```
yields:
```
0        1            2                 3              4
12345678901234567   8901     234567    8901     234567890
Hey! Here's some <i>text<rst> with <em>tags<rst>
embedded in it.
```

- Tags are simple and cannot contain any spaces. I.e., these are not full HTML/XML tags.
- The tags wrapping is meant to be compitible with [@liquid-labs/terminal-text](https://github.com/liquid-labs/terminal-text).


### Smart list indentation

```javascript
const text = `- We'll indent the entire item to match the list.
  - And same goes for this sub item!
Now back to normal.`
wrap(text, { smartIndent: true, width: 30 })
```
yields:
```
0        1         2         3
123456789012345678901234567890
- We'll indent the entire item
  to match the list.
  - And same goes for this sub 
    item!
Now back to normal.
```

Of course you can combine `smartIndent` with `ignoreTags`. But not `hangingIndent` or `indent`.

### Hanging indentation

```javascript
const text = `Hi there my friend!
This is a hanging indent.`
wrap(text, { hangingIndent: 2, width: 12 })
```
yields:
```
0        1
123456789012
Hi there my
  friend!
This is a
  hanging
  indent.
```

Cannot be combined with `smartIndent` or `indent`

### Absolute indentation

```javascript
const text = `Hi there my friend!
This is absolute indent.`
wrap(text, { indent: 2, width: 12 })
```
yields:
```
0        1
123456789012
  Hi there
  my friend!
  This shows
  off the
  absolute
  indent.
```

### Line prefixing

```javascript
const text = `Hi there my friend!
This is what prefixing looks like.`
wrap(text, { prefix: '(!) ', width: 12 })
```
yields:
```
    0        1
    123456789012
(!) Hi there my
(!) friend!
(!) This is what
(!) prefixing
(!) looks like.
```

Notice that unlike the indentation schemes, the prefix is _in addition_ to the `width`.

## User reference

### API reference

`wrap(text, option)`: Wraps the specified text to the specified or default width.
- `text`: The text to wrap.
- `options.hangingIndent`: The amount to indent all but the first line of a paragraph. Incompatible with other indent modes.
- `options.ignoreTags`: Treat any tags ('<...>') in the text as 'invisible' and adjust wrapping accordingly.
- `options.indent`: Indent each line by the spcified amount. Incompatible with other indent modes.
- `options.prefix`: Prefixes each wrapped line with the indicated prefix. Note this happens after the lines are wrapped according to the specified width. If you need the line to be a specific width in total, you must subtract the length of the indent yourself.
- `options.width`: The width to wrap to. Defaults to 80. Use '0' to default to 'process.stdout.columns' and -1 for no wrapping.

### CLI reference

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
|`--width`|The width to wrap to. Defaults to 80. Use '0' to default to 'process.stdout.columns' and -1 for no wrapping.|