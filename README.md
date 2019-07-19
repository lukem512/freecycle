# freecycle

A scraper for Freecycle.

## Installation

You can install the scraper via NPM or yarn.

`npm install --save freecycle`

## Usage

Import `freecycle` into your project to begin scraping. You can use the `getPosts` method to retrieve latest posts from a specified Freecycle group.

```js
const freecycle = require('freecycle')
const GROUP_NAME = 'CambridgeUK'

freecycle.getPosts(GROUP_NAME, (err, posts) => {
  if (err) {
    return console.err('Could not retrieve posts', err)
  }
  posts.forEach(post => {
    console.log('Post: ', post.name)
  })
})
```

The `posts` array is an array of objects with the following `string` fields:

```js
{
  name,
  url,
  location
}
```

More detail about each post can be retrieved using the `getPostById` and `getPostByURL` functions. Passing the `url` field (from an array item returned by the `getPosts` method) into `getPostByURL` is the easiest way to retrieve further information about a post.

```js
freecycle.getPostById(GROUP_NAME, '73086860', (err, post) => {
  if (err) {
    return console.err('Could not retrieve post details', err)
  }
  console.log('Post: ', post.title, post.description)
})
```

The `post` object, returned by either `getPostBy` function, contains the following `string` fields:

```js
{
  id,
  title,
  location,
  date,
  description,
  image,
}
```

The `image` field is `undefined` or the URL of the post image.

### Groups

There is also a `Group` object, available by importing `freecycle/group`. This abstracts the notion of an individual Freecycle group and allows multiple to be queried independently.

```js
const Group = require('freecycle/group')
const group = new Group('CambridgeUK')

group.getPosts((err, posts) => {
  if (err) {
    return console.error(err)
  }
  console.log(posts)
})
```

See the 'multi.js' example for more details.

## License

MIT
