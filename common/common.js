const request = require('request')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const symbols = require('log-symbols')

// 过滤 http | https
let httpReg = /^https?/g

// 过滤 background-img 的 `url()`
const removeBgUrl = url => {
  let path = url
  if (!path) return

  if (path.includes('url')) {
    path = path.replace('url(', '').replace(')', '')
    return path
  }
}

const downloadImg = (title = '', imgPath, callback) => {
  let folder // 下载的文件夹名称
  let headUrl = imgPath.split('/')[2]
  // console.log(imgPath.split('/'))
  // console.log(headUrl, 'headurl')
  const fileName = path.basename(imgPath) // 获取文件名
  let time = new Date().toLocaleDateString() // 当前年月日
  let formatTitle = title.replace(/[^\p{Unified_Ideograph}]/gu, '')

  folder = path.join('./' + headUrl + formatTitle + '-' + time)

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }
  let fileDownloadPath = `${folder}/image${fileName}`
  let exist = fs.existsSync(fileDownloadPath)
  if (!exist) {
    let writeStream = fs.createWriteStream(fileDownloadPath)
    let readStream = request(imgPath)
    readStream.pipe(writeStream)
    readStream.on('end', function () {
      readStream.end()
      callback(null, '文件下载成功')
      // console.log(`文件下载成功${fileDownloadPath}`);
    })
    readStream.on('error', function (error) {
      writeStream.end()
      fs.unlinkSync(fileDownloadPath)
      // console.log(`错误信息:${error}`);
      // 下载失败的，重新下载TODO
      readStream.end()
      callback(null, 'fail')
      setTimeout(() => {
        bagpipe.push(downloadFile, imgPath, function (err, data) {})
      }, 5000)
    })
    writeStream
      .on('finish', function () {
        readStream.end()
        writeStream.end()
      })
      .on('error', function (err) {
        readStream.end()
        writeStream.end()
        // console.log(`文件写入失败}`);
      })
  } else {
    console.log(symbols.error, chalk.red('文件下载失败'))
  }
}

module.exports = {
  httpReg,
  removeBgUrl,
  downloadImg
}