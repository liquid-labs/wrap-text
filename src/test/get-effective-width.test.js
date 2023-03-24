/* global describe, expect, test */
import { getEffectiveWidth } from '../get-effective-width'

describe('getEffectiveWidth', () => {
  test.each([
    [4, '1234 67 9012'],
    [5, '1234 67 9012'],
    [6, '1234 67 9012'],
    [4, '12<4>67 9012'],
    [5, '12<4>67 9012']
  ])("by default just reflect width %s for '%s'", (width, text) => {
    expect(getEffectiveWidth({ text, width })).toBe(width)
  })

  test.each([
    [4, '1234 67 9012', 4],
    [5, '1234 67 9012', 5],
    [4, '12<4>67 9012', 7],
    [5, '12<4>67 9012', 8],
    [5, '12<4>6<tag>2 4567', 13],
    [5, '12<4><tag>1 3456', 13]
  ])("'ignoreTages=true', width: %s, text: %p => %s; ", (width, text, effectiveWidth) => {
    expect(getEffectiveWidth({ ignoreTags : true, text, width })).toBe(effectiveWidth)
  })
})
