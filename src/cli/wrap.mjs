import * as fs from 'node:fs/promises'

import commandLineArgs from 'command-line-args'
import { commandLineDocumentation } from 'command-line-documentation'

import { wrap as doWrap } from '../lib/wrap'

const cliSpec = {
  mainCommand : 'wrap',
  mainOptions : [
    { name : 'input-file', defaultOption : true, description : 'The file to process and wrap.' },
    { name : 'document', description : 'Creates documentation for self.', type : Boolean },
    {
      name        : 'document-section-depth',
      description : 'Sets the initial section-depth for generated docuemnation.',
      type        : Number
    },
    { name : 'document-title', description : 'Sets the title for generated documentation.' },
    { 
      name : 'hanging-indent', 
      description : 'The amount to indent all but the first line of a paragraph. Incompatible with other indent modes.',
      type : Number 
    },
    { name : 'ignore-tags', description : "Treat any tags ('<...>') in the text as 'invisible' and adjust wrapping accordingly." },
    { name : 'indent', description : 'Indent each line by the spcified amount. Incompatible with other indent modes.', type : Number },
    {
      name        : 'prefix',
      description : 'Prefixes each wrapped line with the indicated prefix. Note this happens after the lines are wrapped according to the specified width. If you need the line to be a specific width in total, you must subtract the length of the indent yourself.'
    },
    { 
      name : 'smart-indent', 
      description : 'Ignores tags (treats as zero-width string) when wrapping.', 
      type : Boolean 
    },
    { 
      name : 'width', 
      description : "The width to wrap to. Defaults to 80. Use '0' to default to 'process.stdout.columns' and -1 for no wrapping.", 
      type : Number
    }
  ]
}

const wrap = async({
  argv = process.argv,
  stderr = process.stderr,
  stdin = process.stdin,
  stdout = process.stdout
} = {}) => {
  const options = commandLineArgs(cliSpec.mainOptions, { argv })

  const inputFile = options['input-file']
  const hangingIndent = options['hanging-indent']
  const ignoreTags = options['ignore-tags']
  const smartIndent = options['smart-indent']
  const { document: doDocument, indent, prefix, width } = options

  if (doDocument === true) {
    const sectionDepth = options['document-section-depth']
    const title = options['document-title']

    const documentation = commandLineDocumentation(cliSpec, { sectionDepth, title })
    stdout.write(documentation)

    return 0
  }

  const wrapOptions = { hangingIndent, ignoreTags, indent, prefix, smartIndent, width }

  if (inputFile !== undefined) {
    try {
      const contents = await fs.readFile(inputFile, { encoding : 'utf8' })
      const wrappedContents = doWrap(contents, wrapOptions)
      stdout.write(wrappedContents)
      return 0
    }
    catch (e) {
      if (e.code === 'ENOENT') {
        stderr.write(`Did not find input file '${inputFile}'.\n`)
        return 1
      }
      else {
        stderr.write(`Unknown error reading '${inputFile}': ` + e.message + '\n')
        return 10
      }
    }
  }
  else { // no input file
    try {
      const input = await new Promise(function(resolve, reject) {
        let data = ''

        stdin.setEncoding('utf8')

        stdin.on('data', function(chunk) {
          data += chunk
        })

        stdin.on('end', function() {
          resolve(data)
        })

        stdin.on('error', reject)
      })
      const wrappedContents = doWrap(input, wrapOptions)
      stdout.write(wrappedContents)
      return 0
    }
    catch (e) {
      stderr.write('There was an error processing the input: ' + e.message + '\n')
      return 10
    }
  }
}

export { wrap }
