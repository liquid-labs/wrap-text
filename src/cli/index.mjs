import { wrap } from './wrap'

(async() => {
  const exitCode = await wrap()
  process.exit(exitCode)
})()
