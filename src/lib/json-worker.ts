self.onmessage = (e: MessageEvent) => {
  const { input } = e.data
  try {
    const data = JSON.parse(input)
    self.postMessage({ success: true, data })
  } catch (err) {
    self.postMessage({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
