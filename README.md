## Praece Sails Logs

Logging with Winston for Praece sails apps.
- Automatically includes email, file and console logs
- File and email logs automatically default to JSON format
- Console logs default to formatted message with JSON meta data
- File and email logs are only enabled on production
	- File logs are stored in `/app/log/dokku_[app name].log`
	- Linking persistent storage mapped to `/var/log/` is required for dokku

### Configuration:

#####The following env vars are required
- `APP_NAME`
- `ENVIRONMENT`
- `NODE_ENV`

```javascript
// Email log config.
module.exports.log = {
	email: {
    to: 'error@test.com',
    from: 'reporter@test.com',
    service: 'gmail',
    auth: {
      user: 'error@test.com',
      pass: 'password!'
    }
  }
}
```

### Usage:

```javascript
Movie.find()
	.then(function(movies) {
		sails.log.info('Found some movies', {movies: movies})
	})
	.catch(function(error) {
		sails.log.error(error.message, {error: error, model: 'movie'})
	});
```