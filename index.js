const async = require('async')
const moment = require('moment')
const Group = require('./freecycle/group')

const blacklist = ['washing', 'iron'].map(item => item.toLowerCase())
const whitelist = ['bed'].map(item => item.toLowerCase())

const GROUPS = ['CambridgeUK', 'IslingtonEastUK']
const groups = GROUPS.map(group => new Group(group))

// Testing function
const results = []
async.forEachOf(groups, (group, key, cb) => {
  group.getPosts((err, posts) => {
    if (err) {
      return cb(err)
    }

    // Remove any posts with blacklisted titles
    const filtered = posts.filter(post => {
      for (item of blacklist) {
        if (post.title.toLowerCase().indexOf(item) > -1) {
          return false
        }
      }
      return true
    })

    // Look for highlighted posts (titles with whitelisted terms)
    const highlights = posts.filter(post => {
      for (item of whitelist) {
        if (post.title.toLowerCase().indexOf(item) > -1) {
          return true
        }
      }
      return false
    })

    posts.forEach(post => results.push(post))
    cb()
  })
}, err => {
  if (err) {
    console.error('Could not retrieve posts: ', err)
    process.exit(1)
  }

  // Sort ascending by date
  const sorted = results.sort((a, b) => {
    const dateA = new moment(a.date)
    const dateB = new moment(b.date)
    return dateA.diff(dateB)
  })

  console.log(sorted)
})
