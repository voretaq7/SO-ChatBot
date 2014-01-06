/* To do:

 * QC flags
 * IATA codes
 * gusts don't work?
 * !!listcommands
 * airport/city name

*/

/* Changes:

 * Human time
 * AGL

*/

var convert = {
	formatNumber: function(integer)
	{
		// http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
		return integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	},
	
	toFahrenheit: function(celcius)
	{
		return (celcius * 9 / 5 + 32).toFixed();
	},
	
	toKilometres: function(miles)
	{
		return (miles * 1.609344).toFixed(2).toString().replace(/0$/, '');
	},
	
	toMillibars: function(inchesOfMercury)
	{
		return convert.formatNumber((inchesOfMercury * 33.86).toFixed());
	},
	
	toCompass: function(degrees)
	{
		// http://codereview.stackexchange.com/questions/38613/is-there-a-better-way-to-get-a-compass-point-from-140-than-a-series-of-ifs
		return ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'][Math.round(degrees / 11.25 / 2)];
	},
	
	toClouds: function(abbreviation)
	{
		return {
			SKC:	'Clear',
			CLR:	'Clear',
			CAVOK:	'Ceiling & visibility ok',
			FEW:	'Few clouds',
			SCT:	'Scattered clouds',
			BKN:	'Broken clouds',
			OVC:	'Overcast',
			OVX:	'Obscured'
		}[abbreviation];
	},
	
	toHumanTime: function(iso8601)
	{
		var	milis	= Date.now() - Date.parse(iso8601),
			seconds	= parseInt((milis / 1000).toFixed(), 10),
			minutes	= parseInt((seconds / 60).toFixed(), 10),
			hours	= parseInt((minutes / 60).toFixed(), 10);
		
		return	minutes > 59 ? hours   + ' hour' + (hours   === 1 ? '' : 's') + ' ago' :
				seconds > 59 ? minutes + ' min'  + (minutes === 1 ? '' : 's') + ' ago' :
				seconds > 0  ? seconds + ' sec'  + (seconds === 1 ? '' : 's') + ' ago' :
				iso8601;
	}
},

weather = {
	metar: function(args, cb)
	{
		weather.command(args, cb, 'metar');
	},
	
	weather: function(args, cb)
	{
		weather.command(args, cb, 'weather');
	},
	
	command: function(args, cb, mode)
	{
		var	query = args.toString().toUpperCase();
		
		if(!query || (query.length !== 3 && query.length !== 4))
		{
			args.directreply('You must specify a 3-letter IATA or 4-letter ICAO airport code - e.g. `!!' + mode + ' LPL` or `!!' + mode + ' KJFK`');
			return;
		}
		
		IO.jsonp({
			url:		'http://dannybeckett.co.uk/AviationBot/Weather.php',
			jsonpName:	'callback',
			fun:		finish,
			data:		{
							a:	query
						}
		});
	
		function finish(resp)
		{
			// These errors are generated directly by Weather.php
			if(resp.hasOwnProperty('error'))
			{
				var errors = {
					'BadParams':	'Whoops, something went wrong! (@DannyBeckett)',
					'NoICAO':		'No matching ICAO code could be found for the IATA code ' + query + '! Check you typed the correct 3-letter IATA code, or type its 4-letter ICAO code instead.'
				};
				
				args.directreply(errors[resp.error]);
				return;
			}
			
			// Weather.php appends icao, regardless of whether an IATA code was input and no METAR data was found
			var link = bot.adapter.link(resp.icao, 'http://aviationweather.gov/adds/metars/?station_ids=' + resp.icao + '&std_trans=translated&chk_metars=on&hoursStr=most+recent+only&chk_tafs=on&submitmet=Submit');
			
			if(resp.data['@attributes'].num_results === '0')
			{
				args.directreply('No METAR data could be found within the last 24 hours for ' + link + '! Check you typed the correct 3-letter IATA or 4-letter ICAO airport code.')
			}
			
			var data = resp.data.METAR,
				info = [],
				sky,
				gotmultipleClouds = data.sky_condition instanceof Array;
				gotSingleCloud = data.sky_condition.hasOwnProperty('@attributes');
			
			var getCloud = function(conditions)
			{
				var ret = convert.toClouds(conditions['@attributes'].sky_cover);
				
				if(conditions['@attributes'].hasOwnProperty('cloud_base_ft_agl'))
				{
					ret += ' @ ' + convert.formatNumber(conditions['@attributes'].cloud_base_ft_agl) + 'ft';
				}
				
				return ret;
			}
			
			if(gotmultipleClouds)
			{
				var clouds = [];
				
				for(var i = 0; i < data.sky_condition.length; i++)
				{
					clouds.push(getCloud(data.sky_condition[i]));
				}
				
				sky = clouds.join('; ');
			}
			
			else if(gotSingleCloud)
			{
				sky = getCloud(data.sky_condition);
			}
			
			else
			{
				sky = 'Unavailable';
			}
			
			if(mode === 'weather')
			{
				info = [
										data.flight_category,
					'**Observed:** '	+ convert.toHumanTime(data.observation_time),
					'**Wind:** '		+ data.wind_dir_degrees + '\u00B0/' + convert.toCompass(parseInt(data.wind_dir_degrees), 10) + ' @ ' + data.wind_speed_kt + 'kts',
					'**Visibility:** '	+ data.visibility_statute_mi + 'mi/' + convert.toKilometres(parseFloat(data.visibility_statute_mi)) + 'km',
					'**Sky (AGL):** '	+ sky,
					'**Temperature:** '	+ data.temp_c + '\u00B0C/' + convert.toFahrenheit(parseFloat(data.temp_c)) + '\u00B0F',
					'**Dewpoint:** '	+ data.dewpoint_c + '\u00B0C/' + convert.toFahrenheit(parseFloat(data.dewpoint_c)) + '\u00B0F',
					'**Pressure:** '	+ parseFloat(data.altim_in_hg).toFixed(2) + '" Hg/' + convert.toMillibars(parseFloat(data.altim_in_hg)) + 'mb'
				];
			}
			
			var text = {
				metar:		data.raw_text.substring(4),
				weather:	info.join(' \u2022 ')
			};
			
			args.directreply('**' + link + ':** ' + text[mode]);
		}
	}
};
	
bot.addCommand({
	name:			'weather',
	fun:			weather.weather,
	description:	'Retrieves the translated METAR weather data for a specified 3-letter IATA or 4-letter ICAO airport code - e.g. `!!weather LPL` or `!!weather KJFK`',
	async:			true,
	permissions:	{
						del:	'NONE'
					}
});

bot.addCommand({
	name:			'metar',
	fun:			weather.metar,
	description:	'Retrieves the standard METAR weather data for a specified 3-letter IATA or 4-letter ICAO airport code - e.g. `!!metar LPL` or `!!metar EGGP`',
	async:			true,
	permissions:	{
						del:	'NONE'
					}
});
