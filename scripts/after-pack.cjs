const path = require('node:path')

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return

  const { rcedit } = await import('rcedit')
  const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`)
  const iconPath = path.join(context.packager.projectDir, 'public', 'icon.ico')

  await rcedit(exePath, {
    icon: iconPath,
    'version-string': {
      CompanyName: 'AI Play',
      FileDescription: 'AI Play',
      ProductName: 'AI Play',
      OriginalFilename: 'AI Play.exe'
    }
  })
}
