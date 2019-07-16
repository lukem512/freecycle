const freecycle = require('./freecycle')

const blacklist = ['washing', 'iron'].map(item => item.toLowerCase())
const whitelist = ['bed'].map(item => item.toLowerCase())

// Testing function
freecycle.getPosts('CambridgeUK', (err, posts) => {
  if (err) {
    console.error('Could not retrieve posts', err)
    process.exit(1)
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

  console.log('highlights', highlights)
  process.exit(0)
})
