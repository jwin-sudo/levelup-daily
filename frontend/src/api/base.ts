let apiBaseUrl = 'http://localhost:8000'

export function setApiBaseUrl(url?: string) {
  apiBaseUrl = url || 'http://localhost:8000'
}

export function getApiBaseUrl() {
  return apiBaseUrl
}