Help
---

This is the bot that lives in [The Hangar](http://chat.stackexchange.com/rooms/12036/the-hangar) - for more info, ping [@DannyBeckett](http://aviation.stackexchange.com/users/97/danny-beckett).

So far, using 3-letter IATA or 4-letter ICAO airport codes, you can try:

- `!!weather KJFK` to get English weather info for New York JFK airport
- `!!metar LPL` to get raw METAR data for Liverpool John Lennon airport
- `!!taf AMS` to get raw TAF data for Amsterdam Schiphol airport
- `!!distance LHR FRA` to get approximate distances & flying times between London Heathrow and Frankfurt

You can also try:

- `!!TeachMeToFly`

Leave an answer [here](http://meta.aviation.stackexchange.com/questions/156/what-would-you-like-the-chat-bot-to-do) with ideas for new commands! Here are some that have been suggested:

- Aerodrome data - airnav or worldaerodata.com
- [Weather frequencies & phone numbers](https://www.faa.gov/air_traffic/weather/asos/)

---

Technical Info
---

You can check out the source code for the above commands at [./source/plugins/av-*.js](https://github.com/dannybeckett/SO-ChatBot/blob/master/source/plugins/).

The corresponding PHP can be found at [../so-chatbot-php-helper](https://github.com/dannybeckett/so-chatbot-php-helper).

**Edits:**

`./source/adapter.js`
 - [be more helpful with timeouts](https://github.com/dannybeckett/SO-ChatBot/commit/d257d954f405f194670a24b59d781c974fffaf0e);
 - [remove 500ms delay on replies](https://github.com/dannybeckett/SO-ChatBot/commit/83696bd6b5482aacfd5e526e8091159eb0f5b6fa).

`./source/commands.js`

 - [point `!!help` to our fork, instead of upstream](https://github.com/dannybeckett/SO-ChatBot/commit/1be29071f7ec136ceba9a2b139efc68e43962ab5).

**Commands deleted:**

- Specific to programming or unnecessary: `awsm colors cowsay domain firefly github hangman jquery mdn mustache norris stop urban vendetta xkcd zalgo`;

- The `!!weather` command to make room for ours.
