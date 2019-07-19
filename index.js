const request = require('request')
const htmlparser = require('htmlparser')
const select = require('soupselect').select
const async = require('async')

// Internal parsing functions
const handler = new htmlparser.DefaultHandler(err => {
  if (err) {
    console.err('Error creating HTML parser ${err}')
    process.exit(1)
  }
})

const parseHTML = function(html) {
  const parser = new htmlparser.Parser(handler)
  parser.parseComplete(html)
  return handler.dom
}

// Basic Freecycle URL
module.exports.URL = 'https://groups.freecycle.org/'

// Post type enum
module.exports.TYPE = {
  wanted: 'wanted',
  offer: 'offer',
  all: 'all'
}

// The base URL
const makeGroupURL = function(groupName) {
  return module.exports.URL + 'group/' + groupName
}

// URL of the post results page
// N.B. setting resultsPerPage to less than 10 still yields 10 results
const makePostsURL = function(groupName, { type = module.exports.TYPE.all, page = 1, resultsPerPage = 10 }) {
  return `${makeGroupURL(groupName)}/posts/${type}?page=${page}&resultsperpage=${resultsPerPage}`
}

// URL of a particular post, given its ID
const makePostURL = function(groupName, postId) {
  return `${makeGroupURL(groupName)}/posts/${postId}`
}

// Return an object of post data from a specific post
const getPostFromDOM = function(dom) {
  const headers = select(dom, "#group_post header h2")
  const id = headers[0].children[0].raw.trim().replace('Post ID: ', '')
  let title = headers[1].children[0].raw.trim()

  const type = (title.indexOf('OFFER: ') > -1) ? module.exports.TYPE.offer : module.exports.TYPE.wanted
  title = title.replace('OFFER: ', '').replace('WANTED: ', '')

  const details = select(dom, "#group_post #post_details div")
  const location = details[0].children[1].raw.trim()
  const date = details[1].children[1].raw.trim()

  const elems = select(dom, "#group_post div")
  const outer = elems[4].children[3]
  let description, image
  if (outer.attribs && outer.attribs.class == 'floatLeft textCenter') {
    image = outer.children[1].attribs.href
    description = elems[4].children[5].children[0].raw.trim()
  } else {
    description = elems[4].children[3].children[0].raw.trim()
  }

  return {
    id,
    type,
    title,
    location,
    date,
    description,
    image,
  }
}

// Return an object array of post data from the main list
const getPostsFromDOM = function(dom) {
  let posts = []
  select(dom, "#group_posts_table tr td").forEach(elem => {
    const name = elem.children[1].children[0].raw.trim()
    if (name === '') {
      return
    }
    const url = elem.children[1].data.trim().replace('a href=', '').replace(/'/g, '')
    const location = elem.children[2].raw.trim().replace(/[()]/g, '')
    posts.push({name, url, location})
  })
  return posts
}

// Retrieve a list of posts from the main page
module.exports.getPosts = function(groupName, cb, opts = {}) {
  const postsURL = makePostsURL(groupName, opts)
  request({ url: postsURL, followRedirect: false }, (err, res, body) => {
    if (err) {
      console.error(`Error retrieving posts ${err}, ${postsURL}`)
      return cb(err)
    }
    if (res.statusCode !== 200) {
      console.warn(`Status code ${res.statusCode} for ${postsURL}`)
      return cb(new Error(`Invalid status code: ${res.statusCode}`))
    }
    const posts = getPostsFromDOM(parseHTML(body))
    const results = []
    async.forEachOf(posts, (post, key, _cb) => {
      this.getPostByURL(post.url, (err, postObj) => {
        if (err) {
          return _cb(err)
        }
        postObj.url = post.url
        results.push(postObj)
        _cb()
      })
    }, err => {
      return cb(err, results)
    })
  })
}

// Retrieve a post, given the URL
module.exports.getPostByURL = function(postURL, cb) {
  request({ url: postURL, followRedirect: false }, (err, res, body) => {
    if (err) {
      console.error(`Error retrieving post ${err}, ${postURL}`)
      return cb(err)
    }
    if (res.statusCode !== 200) {
      console.warn(`Status code ${res.statusCode} for ${postURL}`)
      return cb(new Error(`Invalid status code: ${res.statusCode}`))
    }
    const post = getPostFromDOM(parseHTML(body))
    return cb(err, post)
  })
}

// Retrieve a post, given the group name and the post identifier
module.exports.getPostById = function(groupName, postId, cb) {
  const postURL = makePostURL(groupName, postId)
  return this.getPostByURL(postURL, cb)
}
