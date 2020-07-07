const OAuth2Strategy = require('passport-oauth2');
const util = require('util');

/**
 * 
 * @typedef {object} StrategyOptions
 * @property {string} clientID
 * @property {string} clientSecret
 * @property {string} [callbackURL="https://anilist.co/api/v2/oauth/pin"]
 * @property {string} [authorizationURL="https://anilist.co/api/v2/oauth/authorize"]
 * @property {string} [tokenURL="https://anilist.co/api/v2/oauth/token"]
 * @constructor
 * @param {StrategyOptions} options
 * @param {function} verify 
 * @access public
 */
function Strategy (options, verify) {
    options = options || {};
    options.authorizationURL = options.authorizationURL || 'https://anilist.co/api/v2/oauth/authorize';
    options.tokenURL = options.tokenURL || 'https://anilist.co/api/v2/oauth/token';
    options.callbackURL = options.callbackURL || 'https://anilist.co/api/v2/oauth/pin';
    OAuth2Strategy.call(this, options, verify);
    this.name = 'anilist';
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, done) {
    const headers = { Authorization: this._oauth2.buildAuthHeader(accessToken), 'Content-Type': 'application/json' };
    const body = {
        query: `{
            Viewer {
              id
              name
              avatar {
                large
              }
              unreadNotificationCount
              donatorTier
              updatedAt
              options {
                titleLanguage
                displayAdultContent
              }
              mediaListOptions {
                scoreFormat
              }
            }
          }`
    };
    this._oauth2._request('POST', 'https://graphql.anilist.co', headers, JSON.stringify(body), accessToken, function(error, body, _response) {
        if (error) {
            return done(new InternalOAuthError('Failed to fetch the user profile.', error));
        }

        try {
            var parsedData = JSON.parse(body).data.Viewer;
        }
        catch (error) {
            return done(new Error('Failed to parse the user profile.'));
        }

        const profile = parsedData;
        profile.provider = 'anilist';
        profile.accessToken = accessToken;
        done(null, profile);
    });
}

module.exports = Strategy;