export function isValidFilename(filename: string) {
  // null byte attacks
  if (filename.includes('%00') || filename.includes('\0')) {
    return false
  }

  // directory traversal / path injection
  if (
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    return false
  }

  // meta / special characters
  const unsafeChars = /[<>;:{}$`]/
  if (unsafeChars.test(filename)) {
    return false
  }

  // double extension (e.g., file.jpg.php or file.tar.gz)
  if ((filename.match(/\./g) || []).length > 1) {
    return false
  }

  return true
}
