const DEFAULT_WIDTH = 80

const getBaseWidth = (requestedWidth) => {
  const consoleWidth = process.stdout.columns

  if (consoleWidth === undefined) {
    return requestedWidth || DEFAULT_WIDTH
  }
  else if (requestedWidth === undefined) {
    return consoleWidth || DEFAULT_WIDTH
  }
  else if (consoleWidth < requestedWidth) {
    return consoleWidth
  }
  else {
    return requestedWidth
  }
}

export { DEFAULT_WIDTH, getBaseWidth }
