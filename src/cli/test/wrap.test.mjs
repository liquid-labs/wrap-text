/* global beforeEach describe expect test */
import * as fsPath from 'node:path'

import { wrap } from '../wrap'

describe('wrap', () => {
  let output
  let errout

  const stdout = { write: (chunk) => output += chunk }
  const stderr = { write: (chunk) => errout += chunk }

  beforeEach(() => {
    output = ''
    errout = ''
  })

  test("'--document' documents self", async () => {
    const exitCode = await wrap({ argv: ['--document'], stderr, stdout })
    expect(exitCode).toBe(0)
    expect(errout).toHaveLength(0)
    expect(output.startsWith('# `wrap` Command Reference')).toBe(true)
  })

  test('wraps input file', async() => {
    const testDataPath = fsPath.join(__dirname, 'data', 'text.txt')
    const exitCode = await wrap({ argv: [testDataPath], stderr, stdout })
    expect(exitCode).toBe(0)
    expect(errout).toHaveLength(0)
    expect(output.split('\n')).toHaveLength(2)
  })

  test('exits with code 1 if no file', async() => {
    const testDataPath = fsPath.join(__dirname, 'data', 'bad-path.txt')
    const exitCode = await wrap({ argv: [testDataPath], stderr, stdout })
    expect(exitCode).toBe(1)
    console.log('errorout:', errout) // DEBUG
    expect(errout.startsWith('Did not find input file')).toBe(true)
    expect(output).toHaveLength(0)
  })
})