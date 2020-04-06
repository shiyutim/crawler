const fs = require('fs')
const http = require('http')
const https = require('https')
const cheerio = require('cheerio')
const request = require('request')
const ora = require('ora')
const chalk = require('chalk')
const symbols = require('log-symbols')
const path = require('path')
const Bagpipe = require('bagpipe')
const bagpipe = new Bagpipe(100)

const Image = require('./download/Image/image')
const common = require('./common/common')
const urlList = require('./url')


// const urlList = [{
//     name: 'baidu',
//     url: 'http://www.baidu.com'
//   },
//   {
//     name: 'bilibili',
//     url: 'https://www.bilibili.com/?rt=V%2FymTlOu4ow%2Fy4xxNWPUZ8Tl9Tzs4nrZNrtTaljGuRk%3D'
//   },
//   {
//     name: 'tuku',
//     url: 'https://ons.ooo/'
//   },
//   {
//     name: 'dd',
//     url: 'http://s1.pbnmdcb.xyz/pw/html_data/15/2001/4529314.html'
//   },
//   {
//     name: '23',
//     url: 'https://ons.ooo/article/59871/'
//   },
//   {
//     name: '34',
//     url: 'http://s1.pbnmdcb.xyz/pw/html_data/15/2001/4540637.html'
//   }
// ]

const url = urlList.url

const req = url.includes('https') ? https : http

let imgTrueArr = [] // 这里储存经过处理后 链接 **正确**的url
let imgErrorArr = [] // 这里储存经过处理后 **错误**的url

let localTitle = ''
const getHttp = function (getUrl) {
  return new Promise((resolve, reject) => {
    console.log(getUrl, 'url')
    try {
      req
        .get(getUrl, res => {
          const {
            statusCode
          } = res
          const analysis = ora('正在解析网址\n')
          analysis.start()
          let error

          if (statusCode !== 200) {
            analysis.fail()
            error = new Error('请求失败\n' + `状态码: ${statusCode}`)
          }

          if (error) {
            res.resume()

            return reject({
              error: -2,
              message: error
            })
          }

          res.setEncoding('utf8')

          res.on('data', chunk => {
            console.log('进入')
            let rawData = ''
            rawData += chunk
            rawData = rawData.toString()

            const $ = cheerio.load(rawData)

            // let src = $('a').attr('href')
            // console.log(src, 'src')
            // console.log(rawData)

            // 下载图片逻辑，并且返回标题
            localTitle += Image.download_img(
              chunk,
              common.httpReg,
              imgTrueArr,
              imgErrorArr
            )

            // 下载div 背景图片
            Image.download_div_img(
              chunk,
              common.removeBgUrl,
              common.httpReg,
              imgTrueArr,
              imgErrorArr
            )
            // 处理a标签逻辑，如果存在页面跳转，则进行跳转
            // $('a').each((idx, item) => {
            //   let href = $(item).attr('href')
            //   // console.log(href, 'href')
            //   if (href) {
            //     // console.log(path.join(url, href), 'path.join(url, href)')
            //     // getHttp(path.join(url, href))
            //     getHttp(`${url}${href}`)
            //   }
            // })
          })

          res.on('end', () => {
            analysis.succeed()
            //           let imgTrueArr = [] // 这里储存经过处理后 链接 **正确**的url
            // let imgErrorArr = [] // 这里储存经过处理后 **错误**的url
            console.log(imgTrueArr, 'imgTrueArr')
            console.log(imgErrorArr, 'imgErrorArr')
            console.log(symbols.success, chalk.green('爬取结束'))
            return resolve({
              error: 0,
              message: '爬取成功'
            })
          })
        })
        .on('error', e => {
          console.error(`出现错误, ${e.message}`)
        })
    } catch (e) {
      console.log(e)
    }
  })
}

const result = async function () {
  let g = await getHttp(url)
  // console.log(g.message)
  console.log(symbols.success, chalk.green(g.message))
  if (g.error !== 0) {
    // 说明返回错误信息，则退出本次
    return false
  }

  imgTrueArr.map(path => {
    bagpipe.push(common.downloadImg, localTitle, path, function (err, data) {
      // console.log(data)
    })
  })
}

result()