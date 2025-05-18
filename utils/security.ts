export function detectSqlInjection(input: string): boolean {
  const sqlKeywords = ["SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "UNION", "--", ";"]
  return sqlKeywords.some((keyword) => input.toUpperCase().includes(keyword))
}

export function detectUrlTampering(url: string): boolean {
  return url.includes("javascript:") || url.includes("<script>")
}

export function detectDdos(activityLogs: string[]): boolean {
  return activityLogs.filter((log) => log === "same-ip").length > 100 // Example threshold
}
