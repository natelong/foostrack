var fs = require( 'fs' );
var settings;

var loading = false;
var requestCache = [];

var _init = function _init(){
	fs.readFile( './settings.json', function( err, data ){
		var settingsObj;
		var modeSearch = /-mode=\w+(?=.*)/i;
		var modeSearchResults;
		var mode;

		if( err ){
			console.log( '[ERROR] Couldn\'t load settings file.' );
			return;
		};
	
		try{
			settingsObj = JSON.parse( data );
		}catch( e ){
			console.log( '[ERROR] Couldn\'t parse settings data.' );
			return;
		}

		modeSearchResults = process.argv.toString().match( modeSearch );
		if( modeSearchResults ){
			mode = modeSearchResults[ 0 ].replace( '-mode=', '' );
		}else{
			mode = 'production';
		}

		if( settingsObj[ mode ] ){
			settings = settingsObj[ mode ];
			console.log( '[INFO] Starting server in "%s" mode', mode );
			console.log( '[INFO] Loaded server settings: ', settings );
		}else{
			console.log( '[ERROR] Mode "%s" does not exist in settings.json', mode );
			return;
		}

		_flushRequestCache();
	});
}

var _flushRequestCache = function flushRequestCache(){
	console.log( '[INFO] Flushing %s requests', requestCache.length );

	var request;
	while( requestCache.length ){
		request = requestCache.pop();
		getSetting( request.settingName, request.onComplete );
	}
};

var getSetting = function getSetting( settingName, onComplete ){
	if( !settings ){
		if( !loading ){
			console.log( '[INFO] Settings not initialized. Loading from file.' );
			loading = true;
			_init();
		}
		requestCache.push({
			settingName: settingName,
			onComplete: onComplete
		});
		return;
	}

	if( settings[ settingName ] ){
		console.log( '[INFO] Setting %s existed in cache: %s', settingName, settings[ settingName ] );
		onComplete( null, settings[ settingName ] );
	}else{
		console.log( '[ERROR] Setting %s doesn\'t exist in settings.json', settingName );
		onComplete( 'Setting does not exist!' );
	}
};

exports.getSetting = getSetting;
