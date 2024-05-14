const DEFAULT_WIDTH = 80

const getBaseWidth = (requestedWidth) => {
  const consoleWidth = process.stdout.columns

  if (consoleWidth === undefined) {
    return requestedWidth || DEFAULT_WIDTH
  }
  else if (requestedWidth === undefined) {
    return consoleWidth // console width must be defined
  }
  else if (requestedWidth === 0 || consoleWidth < requestedWidth) {
    return consoleWidth
  }
  else {
    return requestedWidth
  }
}

export { DEFAULT_WIDTH, getBaseWidth }
