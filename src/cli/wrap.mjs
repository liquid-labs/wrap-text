import * as fs from 'node:fs/promises'

import commandLineArgs from 'command-line-args'

import { wrap as doWrap } from '../lib/wrap'

const cliSpec = {
  mainCommand: 'wrap',
  mainOptions: [
    { name: 'input-file', defaultOption: true, description: 'The file to process and wrap.' },
    { name: 'hanging-indent', description: 'Adds a hanging indent of the specified width.', type: Number },
    { name: 'indent', description: 'Indents the wrapped text the specified width.', type: Number },
    { 
      name: 'prefix', 
      description: "Prefixes each wrapped line with the indicated prefix. Note this happens after the lines are wrapped according to the specified width. If you need the line to be a specific width in total, you must subtract the length of the indent yourself."
    },
    { name: 'smart-indent', description: 'Ignores tags (treats as zero-width string) when wrapping.', type: Boolean },
    { name: 'width', description: 'The character width to wrap.', type: Number }
  ]
}

const wrap = async ({ 
  argv = process.argv, 
  stderr = process.stderr, 
  stdin = process.stdin, 
  stdout = process.stdout 
} = {}) => {
  const options = commandLineArgs(cliSpec.mainOptions, { argv })

  const inputFile = options['input-file']
  const hangingIndent = options['hanging-indent']
  const smartIndent = options['smart-indent']
  const { indent, prefix, width } = options

  const wrapOptions = { hangingIndent, indent, prefix, smartIndent, width }

  if (inputFile !== undefined) {
    try {
      const contents = await fs.readFile(inputFile, { encoding: 'utf8' })
      const wrappedContents = doWrap(contents, wrapOptions)
      stdout.write(wrappedContents)
      return 0
    }
    catch (e) {
      if (e.code === 'ENOENT') {
        stderr.write(`Did not find input file '${inputFile}'.`)
        return 1
      }
      else {
        stderr.write(`Unknown error reading '${inputFile}': ` + e.message)
        return 10
      }
    }
  }
  else { // no input file
    try {
      const input = await new Promise(function (resolve, reject) {
        let data = ''
        
        stdin.setEncoding('utf8')

        stdin.on('data', function (chunk) {
          data += chunk
        })

        stdin.on('end', function () {
          resolve(data)
        })

        stdin.on('error', reject)
      })
      const wrappedContents = doWrap(input, wrapOptions)
      stdout.write(wrappedContents)
      return 0
    }
    catch (e) {
      stderr.write('There was an error processing the input: ' + e.message)
      return 10
    }
  }
}

export { wrap }