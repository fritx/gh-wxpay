let { getSession, handleLogin } = require('../custom')
let { getOauthUrl } = require('./oauth')
let { fetchUser } = require('./fetch')

module.exports = (router, conf) => {
  // 退出登录
  router.post('/logout', ctx => {
    ctx.session = null
    ctx.status = 200
  })

  // 发起oauth登录
  router.get('/login', async ctx => {
    // 不是很担心第三方人冒用这个链接 没啥影响
    let from = ctx.query.from || ctx.get('referer')
    let authUrl = getOauthUrl(from, conf)
    ctx.redirect(authUrl)
  })

  // 获取session
  router.get('/session', async ctx => {
    let sess = await getSession(ctx)
    ctx.body = sess
  })

  // 登录成功 写入session
  router.get('/oauth/callback', async ctx => {
    let { error, error_description } = ctx.query
    if (error) {
      let err = new Error(error_description || error)
      Object.assign(err, ctx.query)
      throw err
    }

    let { code, target } = ctx.query
    let data = await fetchUser(code, conf)
    await handleLogin(data, ctx)
    ctx.redirect(target)
  })
}
