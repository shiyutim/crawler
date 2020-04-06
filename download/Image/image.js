const cheerio = require('cheerio')
// 这里封装下载图片function

// `div` 爬取 `background-image` 属性
const download_div_img = (chunk, remove, reg, trueArr, errorArr) => {
  // chunk 为 接收数据流
  // remove 为去除`url()`的函数
  // trueArr  为正确图片数组
  // errorArr 为格式错误数组
  let rawData = ''

  rawData += chunk
  rawData = rawData.toString()

  const $ = cheerio.load(rawData)

  $('div').each((index, element) => {
    let img = $(element).css('background-image') // 获取所有没经过处理的url

    let removeBg = remove(img)

    if (img) {
      removeBg.search(reg) !== -1
        ? trueArr.push(removeBg)
        : errorArr.push(removeBg)
    }
  })
}

// 爬取img 标签 src
const download_img = (chunk, reg, trueArr, errorArr) => {
  let rawData = ''
  rawData += chunk
  rawData = rawData.toString()

  const $ = cheerio.load(rawData)

  $('img').each((index, item) => {
    let src = $(item).attr('src')
      ? $(item).attr('src')
      : $(item).attr('data-original')
    // console.log(src, 'src')
    if (src) {
      src.search(reg) !== -1 ? trueArr.push(src) : errorArr.push(src)
    }
  })

  let title = $('title').text()
  return title
}

module.exports = {
  download_div_img,
  download_img
}
