# liquid-labs/wrap-text

Wraps text for any width while respecting potentially invisible tags and smartly indenting lists.

## Usage

Install:
```bash
npm i @liquid-labs/wrap-text
```

Code:
```javascript
import { wrap } from '@liquid-labs/wrap-text'
//                      0        1         2         3         4         5         6
//                      12345678901234567890123456789012345678901234567890123456789012
const someTaggedText = "Hey! Here's some <i>text</i> with <em>tags</em> embedded in it."
console.log('Default wrapping:\n')
console.log(wrap({ text: someTaggedText, width: 40}))

console.log('Tag-ignoring wrapping:\n')
console.log(wrap({ ignoreTags: true, text: someTaggedText, width: 40}))
```

See [Examples](#examples) section for output.

## Examplpes

_The numbers are given as a visual aid, only the text is actually printed._

Given text:
```
Hey! Here's some <i>text</i> with <em>tags</em> embedded in it.
```

__Basic wrapping__: `wrap({ text, width: 40})` yields:
```
0        1         2         3         4
1234567890123456789012345678901234567890
Hey! Here's some <i>text</i> with
<em>tags</em> embedded in it.
```

__Tag ignoring wrapping__: `wrap({ ignoreTags: true, text, width: 40})` yields:
```
0        1            2                 3             4
12345678901234567   8901    234567    8901    234567890
Hey! Here's some <i>text</i> with <em>tags</em>
embedded in it.
```

Given text:
```
- We'll indent the entire item to match the list.
  - And same goes for this sub item!
Now back to normal.
```

__Smart list indenting__: `wrap({ smartIndent: true, text, width: 30 })` yields:
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