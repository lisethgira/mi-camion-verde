const mock = require('../mock/data')

function useMock() {
  return process.env.USE_MOCK === 'true' || process.env.USE_MOCK === '1'
}

async function withFallback(dbFn, mockFn, res, errorLabel) {
  if (useMock()) {
    return res.json(mockFn())
  }
  try {
    const data = await dbFn()
    return res.json(data)
  } catch (error) {
    console.error(`${errorLabel}:`, error.message)
    if (process.env.FALLBACK_MOCK !== 'false') {
      console.warn(`${errorLabel}: usando datos mock`)
      return res.json(mockFn())
    }
    return res.status(500).json({ error: errorLabel })
  }
}

module.exports = { useMock, withFallback, mock }
