export async function getImageSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = function () {
      const img = new Image()
      img.onload = function () {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = reject
      img.src = fileReader.result as string
    }
    fileReader.onerror = reject
    fileReader.readAsDataURL(file)
  })
}
