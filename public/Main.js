/*******************************************************************************
 * Copyright (c) 2014, Institute for Pervasive Computing, ETH Zurich.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the Institute nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE INSTITUTE OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 * 
 * This file is part of the Copper (Cu) CoAP user-agent.
 ******************************************************************************/
/**
 * \file
 *         Main program code for the Copper CoAP Browser
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// file IO
//Components.utils.import("resource://gre/modules/NetUtil.jsm");

/*Copper.mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIWebNavigation)
		.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
		.rootTreeItem
		.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIDOMWindow);*/

//Copper.prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
function ischecked(id)
{
	if($('#'+id).parents("label").hasClass("active")) return true;
	else return false;
}
function check(id)
{
	$('#'+id).parents("label").addClass("active");
}
function uncheck(id)
{
	$('#'+id).parents("label").removeClass("active");
}
$.prototype.enable = function () {
    $.each(this, function (index, el) {
        $(el).removeAttr('disabled');
    });
}
$.prototype.disable = function () {
    $.each(this, function (index, el) {
        $(el).attr('disabled', 'disabled');
    });
}

Copper.hostname = '';
Copper.port = -1;
Copper.path = '/';
Copper.query = '';

Copper.endpoint = null;
Copper.observer = null;

Copper.resources = new Object();
Copper.resourcesCached = true;

Copper.uploadMethod = 0;
Copper.uploadBlocks = null;
Copper.uploadHandler = null;

Copper.downloadMethod = 0;
Copper.downloadHandler = null;

Copper.behavior = {
	requests: 'con',
	retransmission: true,
	sendDuplicates: false,
	showUnknown: false,
	rejectUnknown: true,
	sendUriHost: false,
	sendSize1: false,
	blockSize: 0,
	observeToken: true,
	observeCancellation: 'lazy'
};

Copper.payload = {
	mode: 'text',
	file: '',
	loaded: false,
	data: null
};


// Life cycle functions
////////////////////////////////////////////////////////////////////////////////

Copper.main = function() {
	
	Copper.logEvent('==============================================================================');
	Copper.logEvent('= INITIALIZING COPPER ========================================================');
	Copper.logEvent('==============================================================================');
	
	window.addEventListener('beforeunload', function(event) { Copper.beforeunload(event); });
	window.addEventListener('unload', function(event) { Copper.unload(event); });
	
	// get settings from preferences
	var onloadAction = null;
	try {
		
		/*document.getElementById('view_tree_split').setAttribute('state', Copper.prefManager.getBoolPref('extensions.copper.view-tree') ? 'open' : 'collapsed');
		document.getElementById('view_debug_split').setAttribute('state', Copper.prefManager.getBoolPref('extensions.copper.view-debug') ? 'open' : 'collapsed');
		document.getElementById('view_log_split').setAttribute('state', Copper.prefManager.getBoolPref('extensions.copper.view-log') ? 'open' : 'collapsed');*/
		
		Copper.loadBehavior();
		Copper.loadDebugOptions();
		Copper.initDebugContentFormats();
		
		if ($.cookie('extensions.copper.plugtest.menu') == "true") {
			$('#menu_plugtest').hide();
			Copper.loadPlugtest();
		}
		
	} catch (ex) {
		Copper.logError(ex);
	}
};

Copper.go = function(Action) {
	$('#location').val($('#urlbar').val());
	try {
		Copper.parseUri($('#urlbar').val());
			
		// set up datagram and transaction layer

		Copper.endpoint = new Copper.TransactionHandler(new Copper.UdpClient(Copper.hostname, Copper.port), Copper.behavior.retransmissions);

		Copper.endpoint.registerCallback(Copper.defaultHandler);
		
		// enable observing
		Copper.observer = new Copper.Observing();
		
		Copper.loadCachedResources();
		Copper.updateResourceLinks();
		
		Copper.loadPayload();
		if (Action)
		{
			Copper.logEvent('INFO: Action defined ('+Action+')');
			window.setTimeout(
					'Copper.'+Action+'();',
					0);
		}
		Copper.updateLabel('info_code', "Opened " + decodeURI($('#urlbar').val()));
	} catch (ex) {
		alert(ex.stack);
		Copper.errorHandler({getCopperCode:function(){return ex.message;}, getPayload:function(){return ex.stacktrace;}});
		Copper.logEvent('ERROR: ' + ex.message + '\n\t' + ex.stack.replace(/\n/, '\n\t'));
	}
};

Copper.beforeunload = function(event) {
	
	if (Copper.observer.subscription!=null) {
		Copper.logEvent('WARNING: Leaving resource while observing');
		Copper.updateLabel('info_code', "Copper: Still observing resource");
		event.preventDefault();
	}
};

Copper.unload = function(event) {
	
	if (Copper.observer.subscription!=null) {
		Copper.logEvent('INFO: Canceling Observe in unload handler');
		Copper.observer.unsubscribe(true);
	}
	
	// shut down socket required for refresh (F5), client might be null for parseUri() redirects
	if (Copper.endpoint!=null) {
		Copper.endpoint.shutdown();
	}
	
	Copper.saveBehavior();
	Copper.savePayload();
	Copper.saveDebugOptions();
	Copper.savePlugtest();
};


// Toolbar commands
////////////////////////////////////////////////////////////////////////////////

Copper.userGet = function() {
	Copper.endpoint.cancelTransactions();
	var uri = Copper.checkUri(null, 'userGet',"uri");
	
	Copper.sendGet(uri);
};
Copper.userPost = function() {
	Copper.endpoint.cancelTransactions();
	var uri = Copper.checkUri(null, 'userPost',"uri");
	
	Copper.sendPost(uri);
};
Copper.userPut = function() {
	Copper.endpoint.cancelTransactions();
	var uri = Copper.checkUri(null, 'userPut',"uri");
	
	Copper.sendPut(uri);
};
Copper.userDelete = function() {
	Copper.endpoint.cancelTransactions();
	var uri = Copper.checkUri(null, 'userDelete',"uri");

	Copper.sendDelete(uri);
};
Copper.userObserve = function() {
	var uri = Copper.checkUri(uri, 'observe',"uri");
	
	Copper.observe(uri);
};

Copper.userDiscover = function() {
	Copper.logEvent('INFO: resetting cached resources');
	$('#toolbar_discover i').show();
	$.cookie('extensions.copper.resources.'+Copper.hostname+':'+Copper.port, '' );
	Copper.resources = new Object();
	
	Copper.discover();
};


// Request commands
////////////////////////////////////////////////////////////////////////////////

Copper.sendGet = function(uri, callback) {
	try {
		if (!uri) throw new Error('No URI specified');
		
		Copper.downloadMethod = Copper.GET;
		
		if (Copper.behavior.blockSize!=0) {
			Copper.sendBlockwise2(uri, parseInt($('#debug_option_block2').val()), Copper.behavior.blockSize, callback);
			return;
		}
		
		var message = new Copper.CoapMessage(Copper.getRequestType(), Copper.GET, uri);
		
		Copper.checkDebugOptions(message);
		
		Copper.clearLabels();
		Copper.endpoint.send( message, callback );
	} catch (ex) {
		Copper.logError(ex);
	}
};
Copper.sendBlockwise2 = function(uri, num, size, callback) {
	try {
		if (!uri) throw new Error('No URI specified');
		if (!num) num = 0;
		if (!size) size = Copper.behavior.blockSize;
		
		if (Copper.downloadMethod==0) {
			throw new Error('No download in progress');
		}
		
		if (callback) Copper.downloadHandler = callback;
		
		var message = new Copper.CoapMessage(Copper.getRequestType(), Copper.downloadMethod, uri);
		
		Copper.checkDebugOptions(message);
		
		// (re)set to useful block option
		message.setBlock2(num, size);
		
		Copper.clearLabels(num==0);
		Copper.endpoint.send( message, Copper.blockwiseHandler );
	} catch (ex) {
		Copper.logError(ex);
	}
};

Copper.sendPost = function(uri, callback) {
	var num = parseInt($('#debug_option_block2').val());
	
	if (Copper.downloadMethod == Copper.POST && num>0) {
		Copper.sendBlockwise2(uri, num, Copper.behavior.blockSize, callback);
	} else {
		Copper.doUpload(Copper.POST, uri, callback);
	}
};

Copper.sendPut = function(uri, callback) {
	var num = parseInt($('#debug_option_block2').val());
	
	if (Copper.downloadMethod == Copper.PUT && num>0) {
		Copper.sendBlockwise2(uri, num, Copper.behavior.blockSize, callback);
	} else {
		Copper.doUpload(Copper.PUT, uri, callback);
	}
};

Copper.doUpload = function(method, uri, callback) {
	try {
		if (uri===undefined) throw new Error('No URI specified');
		
		// load payload
		var pl = '';
		if (Copper.payload.mode=='text') {
			pl = Copper.str2bytes($('#payload_text').html());
		} else if (Copper.payload.file!='') {
			if (!Copper.payload.loaded) {
				// file loading as async, wait until done
				window.setTimeout(function() {Copper.doUpload(method, uri, callback);}, 50);
				return;
			}
			pl = Copper.data2bytes(Copper.payload.data);
		} else {
			Copper.logWarning('No payload data defined');
			return;
		}
		
		// store payload in case server requests blockwise upload
		Copper.uploadMethod = method; // POST or PUT
		Copper.uploadBlocks = pl;
		Copper.downloadMethod = method; // in case of Block2 response
		
		// blockwise uploads
		if (Copper.behavior.blockSize!=0 && pl.length > Copper.behavior.blockSize) {
			Copper.sendBlockwise1(uri, parseInt($('#debug_option_block1').val()), Copper.behavior.blockSize, callback);
			return;
		}
		
		var message = new Copper.CoapMessage(Copper.getRequestType(), method, uri, pl);
		
		Copper.checkDebugOptions(message);
		
		if (Copper.behavior.sendSize1) {
			Copper.logEvent('INFO: Send auto Size1 option');
			message.setSize1(pl.length);
			$('#debug_option_size1').val(pl.length);
		}
		
		Copper.clearLabels();
		Copper.endpoint.send( message, callback );
	} catch (ex) {
		Copper.logError(ex);
	}
}

Copper.sendBlockwise1 = function(uri, num, size, callback) {
	try {
		if (uri===undefined) throw new Error('No URI specified');
		if (!num) num = 0;
		if (size===undefined) size = Copper.behavior.blockSize;
		
		if (Copper.uploadBlocks==null || Copper.uploadMethod==0) {
			throw new Error('No upload in progress, cancelling');
		}
		if ( (num>0) && (size*(num-1) > Copper.uploadBlocks.length)) { // num-1, as we are called with the num to send, not was has been send
			throw new Error('Debug Block1 out of payload scope');
		}
		
		var more = false;
		var pl = Copper.uploadBlocks.slice(size*num, size*(num+1));
		
		// more blocks?
		if (Copper.uploadBlocks.length > (num+1) * size) { // num+1, as we start counting at 0...
			more = true;
		}
		
		if (callback) Copper.uploadHandler = callback;
		
		var message = new Copper.CoapMessage(Copper.getRequestType(), Copper.uploadMethod, uri, pl);
		
		Copper.checkDebugOptions(message);
		
		if (Copper.behavior.sendSize1) {
			Copper.logEvent('INFO: Send auto Size1 option');
			message.setSize1(Copper.uploadBlocks.length);
			$('#debug_option_size1').val(Copper.uploadBlocks.length);
		}
		
		message.setBlock1(num, size, more);
		
		Copper.clearLabels(num==0);
		Copper.endpoint.send( message, Copper.blockwiseHandler );
	} catch (ex) {
		Copper.logError(ex);
	}
};

Copper.sendDelete = function(uri, callback) {
	try {
		if (!uri) throw new Error('No URI specified');
		
		Copper.downloadMethod = Copper.GET;
		
		var message = new Copper.CoapMessage(Copper.getRequestType(), Copper.DELETE, uri);

		
		Copper.checkDebugOptions(message);
		
		Copper.clearLabels();
		Copper.endpoint.send( message, callback );
	} catch (ex) {
		Copper.logError(ex);
	}
};

Copper.observe = function(uri) {
	try {
		Copper.observer.subscribe(uri, Copper.observingHandler);
		
	} catch (ex) {
		Copper.logError(ex);
	}
};

Copper.discover = function(num, size) {
	try {
		var message = new Copper.CoapMessage(Copper.getRequestType(), Copper.GET, Copper.WELL_KNOWN_RESOURCES);
		
		if (num!==undefined) {
			Copper.logEvent('INFO: Continuing discovery with Block '+num+' size '+size);
			if (size===undefined) size = Copper.behavior.blockSize;
			message.setBlock2(num, size);
		}
		
		Copper.endpoint.send( message, Copper.discoverHandler );
	} catch (ex) {
		Copper.logError(ex);
	}
};

// Sends a CoAP ping which is an empty CON message
Copper.ping = function() {
	try {
		Copper.endpoint.cancelTransactions();
		
		var message = new Copper.CoapMessage(Copper.MSG_TYPE_CON);
		
		Copper.clearLabels();
		Copper.endpoint.send( message, Copper.pingHandler );
	} catch (ex) {
		Copper.logError(ex);
	}
};