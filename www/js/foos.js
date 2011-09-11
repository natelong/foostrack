var appURL = '/data/';
var template;

var UIDManager = function UIDManager(len) {
	this.counter = 0;
	this.uidLength = len || 5
};
	
UIDManager.prototype.getUID = function getUID() {
    var i, delta;
    var returnVals = [];
    var returnString = "";
    this.counter++;
    delta = this.uidLength - (this.counter + "").length;
    for (i = 0; i < delta; i++) {
        returnVals.push("0")
    }
    return returnVals.join("") + this.counter
};

var TemplateManager = function TemplateManager() {
	this.template = document.getElementById("templates").innerHTML;
	this.template = this.template.replace(/(?:\n|\t)/g, "");
	this.uid = new UIDManager();
	this.templateCache = []
};
	
TemplateManager.prototype.getTemplate = function getTemplate(templateName) {
    if (this.templateCache[templateName] !== undefined) {
        return this.templateCache[templateName]
    }
    var templateSearch = new RegExp("{{2}template:" + templateName + "}{2}.*{{2}/template:" + templateName + "}{2}");
    var templateMarkers = new RegExp("({{2}template:" + templateName + "}{2}|{{2}/template:" + templateName + "}{2})", "g");
    try {
        var myTemplate = this.template.match(templateSearch)[0]
    } catch (e) {
        throw "Couldn't find the selected template."
    }
    myTemplate = myTemplate.replace(templateMarkers, "");
    this.templateCache[templateName] = myTemplate;
    return myTemplate
};

TemplateManager.prototype.transform = function transform(obj, templateName) {
    var i;
    var uid = this.uid.getUID();
    var template = this.getTemplate(templateName);
    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            template = template.replace(new RegExp("{{2}" + i + "}{2}", "g"), obj[i])
        }
    }
    template = template.replace(/\{{2}uid\}{2}/g, uid);
    return template
};

var getStateFromHash = function getStateFromHash(){
	var appState = location.hash;
	var players = $('#players');
	var games = $('#games');
	var dashboard = $('#dashboard');

	$('.tabs .active').removeClass('active');
	
	switch( appState ){
		case '#players':
			players.show();
			$('#players-tab').parent().addClass('active');
			games.hide();
			dashboard.hide();
			break;
		case '#games':
			games.show();
			$('#games-tab').parent().addClass('active');
			players.hide();
			dashboard.hide();
			break;
		case '#dashboard':
		default:
			dashboard.show();
			$('#dashboard-tab').addClass('active');
			players.hide();
			games.hide();
			break;
	}
}

var addGame = function addGame( e ){
	e.stopPropagation();
	e.preventDefault();
	
	hideMessaging( '#add-game-column' );
	
	var requestInfo = {
		winner: $('#add-game-form select[name=winner]').val(),
		loser: $('#add-game-form select[name=loser]').val(),
		winScore: $('#add-game-form input[name=winner-score]').val(),
		loseScore: $('#add-game-form input[name=loser-score]').val()
	};
	
	if( requestInfo.winner === 'other' ){
		requestInfo.winner = $('input[name=other-winner]').val();
	}
	
	if( requestInfo.loser === 'other' ){
		requestInfo.loser = $('input[name=other-loser]').val();
	}
	
	if( requestInfo.winner === '' ||
			requestInfo.loser === '' ||
			requestInfo.winScore === '' ||
			requestInfo.loseScore === '' ){
		showMessaging( '#add-game-column', 'Nope, try again.', 'error' )
		return;
	}

	$.ajax( appURL + 'add',{
		data: JSON.stringify( requestInfo ),
		type: 'POST',
		processData: false,
		success: addGameSuccess,
		error: function( xhr, status, error ){
			console.error( 'Error adding game: %s', status );
			showMessaging( '.container', 'Looks like the server isn\'t running! Did it crash? Probably.', 'error' );
		}
	});
};

var addGameSuccess = function addGameSuccess( data, status ){
	$( '#add-game-form' )[0].reset();
	
	var hideSuccessMessaging = function(){
		hideMessaging( '.container' );
	};

	updateScoreTable( data );
	if( data.rows.length > 1 ){
		hideMessaging( '.container' );
		showMessaging( '.container', 'Game successfully added!', 'success' );
		setTimeout( hideSuccessMessaging, 3000 );
	}
};

var updateScoreTable = function updateScoreTable( data ){
	var rowString = '';
	var playerList = '';
	var playerListContainer = '';
	var statsContainer = '';
	var i, len;
	var row;
	
	if( data.rows.length < 1 ){
		showMessaging( '.container', 'No game data in database!', 'warning' );
	}
	
	for( i = 0, len = data.rows.length; i < len; i++ ){
		row = data.rows[ i ];
		row.total = row.wins + row.losses;
		rowString += template.transform( row, 'scoreRow' );
		playerList += template.transform( row, 'playerOption' );
		statsContainer += template.transform({
			name: row.name,
			wins: row.wins,
			losses: row.losses,
			pointsPerGame: Math.ceil( row.for / row.total ),
			pointsAgainstPerGame: Math.ceil( row.against / row.total ),
			winPercentage: ( row.wins / row.total ).toFixed( 2 ) * 100
		}, 'playerStats');
	}
	
	playerListContainer = template.transform({
		players: playerList
	}, 'playerList');
	
	$( '#players' ).html( statsContainer );
	$( 'select[name=winner], select[name=loser]' ).html( playerListContainer );
	$( '#score-table tbody' ).html( rowString );
	$( '#score-table' ).trigger( 'update' );
};

var hideMessaging = function hideMessaging( selector ){
	$( selector ).find( ' .alert-message' ).fadeOut( 'fast', function(){
		$(this).remove();
	});
};

var hideCurrentMessage = function hideCurrentMessage( e ){
	$( e.target ).parents( '.alert-message' ).fadeOut( 'fast', function(){
		$(this).remove();
	});
};

var showMessaging = function showMessaging( target, text, type ){
	var types = [ 'error', 'warning', 'success', 'info' ];
	var message;
	if( types.indexOf( type ) === -1 ) return;
	
	message = template.transform({
		type: type,
		text: text
	}, 'alert' );

	$( target ).prepend( message );
};

var checkForOther = function checkForOther( e ){
	var thisElem = $( e.target );
	var thisVal = thisElem.val();
	var thisName = thisElem.attr( 'name' );
	var otherWinner = $('#other-winner-container');
	var otherLoser = $('#other-loser-container');

	if( thisName === 'winner' && thisVal === 'other' ){
		otherWinner.show();
	}else if( thisName === 'winner' && thisVal !== 'other' ){
		otherWinner.hide();
	}

	if( thisName === 'loser' && thisVal === 'other' ){
		otherLoser.show();
	}else if( thisName === 'loser' && thisVal !== 'other' ){
		otherLoser.hide();
	}
};

(function init(){
	template = new TemplateManager();
	
	$('#score-table, #games-table').tablesorter();
	$('#add-game-form').submit( addGame );
	$('select[name=winner], select[name=loser]').change( checkForOther );
	$('.alert-message .close').live( 'click', hideCurrentMessage );
	
	window.addEventListener( 'hashchange', getStateFromHash, false );
	
	getStateFromHash();
	
	$.ajax( appURL + 'all',{
		success: updateScoreTable,
		error: function( xhr, status, error ){
			console.error( 'Error getting game data: %s', status );
			showMessaging( '.container', 'Looks like the server isn\'t running!', 'error' );
		}
	});
}());