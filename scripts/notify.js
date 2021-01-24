const notifier = require('node-notifier')

notifier.notify({
  title: 'Repeato Build',
  message: 'Your build finished!',
  sound: 'Submarine'
})
