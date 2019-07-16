const freecycle = require('./freecycle')

// Testing function
freecycle.getPosts('CambridgeUK', (err, posts) => {
  if (err) {
    console.error('Could not retrieve posts', err)
    process.exit(1)
  }
  console.log(posts)
  process.exit(0)
})
