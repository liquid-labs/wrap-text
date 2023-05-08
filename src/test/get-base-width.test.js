/* global describe, expect, test */
import { DEFAULT_WIDTH, getBaseWidth } from '../get-base-width'

describe('getEffectiveWidth', () => {
  test.each([
    [undefined, undefined, DEFAULT_WIDTH],
    [undefined, 60, 60],
    [60, undefined, 60],
    [100, 60, 60],
    [60, 100, 60],
    [60, 60, 60]
  ])("requested width %s, console width %s => %s", (requestedWidth, consoleWidth, expectedWidth) => {
    process.stdout.columns = consoleWidth
    expect(getBaseWidth(requestedWidth)).toBe(expectedWidth)
  })
})
