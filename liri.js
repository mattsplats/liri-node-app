'use strict';

const request = require('request');
const fs = require('fs');
const spotify = require('spotify');
const Twitter = require('twitter');
const keys = require('./keys.js').twitterKeys;

const client = new Twitter(keys);
let [, , op, ...args] = process.argv;
args = args.join(' ');

const ops = {
	'my-tweets': function my_tweets() {
		client.get('statuses/user_timeline', { count: 20 }, (error, tweets, response) => {
			if (error) { console.log(error); throw error; }
			
			let output = '';
			for (const tweet of tweets) { output += `
---------------
${tweet.text}
>> Created at: ${tweet.created_at.match(/ (.+) \+/)[1]}
---------------`;
			}

			console.log(output);
			logOutput(output);
		});
	},

	'spotify-this-song': function spotify_this_song() {
		spotify.search({ type: 'track', query: (args || 'The Sign, Ace of Base') }, (error, data) => {
			if (error) { console.log(error); throw error; }

			const info = data.tracks.items[0];
			const output = `
---------------
Artist: ${info.artists[0].name}
Album: ${info.album.name}
Title: ${info.name}
Preview: ${info.preview_url}
---------------`;

			console.log(output);
			logOutput(output);
		});
	},

	'movie-this': function movie_this() {
		request({ url: 'http://www.omdbapi.com/?', qs: { t: (args || 'Mr. Nobody'), tomatoes: true }}, (error, response, body) => {
			if (error) { console.log(error); throw error; }

			body = JSON.parse(body);
			const output = `
---------------
Title: ${body.Title}
Actors: ${body.Actors}

${body.Plot}

Year: ${body.Year}
Country: ${body.Country}
Language: ${body.Language.match(/(.+),/)[1]}

IMDB Rating (out of 10): ${body.imdbRating}
Rotten Tomatoes Rating: ${body.tomatoRating}
Rotten Tomatoes URL: ${body.tomatoURL}
---------------`;

			console.log(output);
			logOutput(output);
		});
	},

	'do-what-it-says': function do_what_it_says() {
		fs.readFile('random.txt', 'utf8', (error, data) => {
			[op, args] = data.split(',');

			runOp();
		});
	},

	err: () => console.log('Invalid op')
};

function runOp() {
	ops[ op = ops.hasOwnProperty(op) ? op : 'err' ]();
}

function logOutput(output) {
	const time = new Date;
	const logEntry = `Request: ${op} ${args}
Time: ${time.toString()}${output}


`;

	fs.appendFile('log.txt', logEntry, error => { if (error) throw error; });
}

runOp();