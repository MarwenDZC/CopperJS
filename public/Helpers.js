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
 *         Helper functions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// Helper functions
////////////////////////////////////////////////////////////////////////////////

Copper.getRequestType = function() {
	return Copper.behavior.requests=='con' ? Copper.MSG_TYPE_CON : Copper.MSG_TYPE_NON;
};

//TODO write nice generic settings object (settings['requests'] = 'bool';) and generate load/update/save code
// Load behavior options from preferences
Copper.loadBehavior = function() {
	Copper.behavior.requests = "con";
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.showUnknown = false;
	Copper.behavior.rejectUnknown = true;
	Copper.behavior.sendUriHost = false;
	Copper.behavior.sendSize1 = false;
	Copper.behavior.blockSize = "64";
	Copper.behavior.observeToken = false;
	Copper.behavior.observeCancellation = "lazy";
	
	// init menu
	Copper.updateBehavior();
};
// sync XUL menu with behavior object
Copper.updateBehavior = function() {
	$('#menu_behavior_requests_' + Copper.behavior.requests).click();

	if(Copper.behavior.retransmissions) $('#menu_behavior_retransmissions').click();
/*	else $('#menu_behavior_retransmissions').parents("label").removeClass('active');*/

	if(Copper.behavior.sendDuplicates) $('#menu_behavior_send_duplicates').click();
	/*else $('#menu_behavior_send_duplicates').parents("label").removeClass('active');*/

	if(Copper.behavior.showUnknown) $('#menu_behavior_show_unknown').click();
	/*else $('#menu_behavior_show_unknown').parents("label").removeClass('active');*/

	if(Copper.behavior.rejectUnknown) $('#menu_behavior_reject_unknown').click();
	/*else $('#menu_behavior_reject_unknown').parents("label").removeClass('active');*/

	if(Copper.behavior.sendUriHost) $('#menu_behavior_send_uri_host').click();
	/*else $('#menu_behavior_send_uri_host').parents("label").removeClass('active');*/

	if(Copper.behavior.sendSize1) $('#menu_behavior_send_size1').click();
	/*else $('#menu_behavior_send_size1').parents("label").removeClass('active');*/

	$('#menu_behavior_block_size_' + Copper.behavior.blockSize).click();

	if(Copper.behavior.observeToken) $('#menu_behavior_token_observe').click();
	/*else $('#menu_behavior_token_observe').parents("label").removeClass('active');*/

	$('#menu_behavior_observe_' + Copper.behavior.observeCancellation).click();
	
	Copper.behaviorUpdate({id: 'menu_behavior_block_size', value: Copper.behavior.blockSize});
};
// sync behavior object with XUL menu (callback)
Copper.behaviorUpdate = function(target) {
	if (target.id.substr(0,22)=='menu_behavior_requests') {
		Copper.behavior.requests = target.value;
	} else if (target.id=='menu_behavior_retransmissions') {
		Copper.behavior.retransmissions = ischecked(target.id); 
		Copper.endpoint.setRetransmissions(Copper.behavior.retransmissions);
	} else if (target.id=='menu_behavior_send_duplicates') {
		Copper.behavior.sendDuplicates = ischecked(target.id);
	} else if (target.id=='menu_behavior_show_unknown') {
		Copper.behavior.showUnknown = ischecked(target.id);
	} else if (target.id=='menu_behavior_reject_unknown') {
		Copper.behavior.rejectUnknown = ischecked(target.id);
	} else if (target.id=='menu_behavior_send_uri_host') {
		Copper.behavior.sendUriHost = ischecked(target.id);
	} else if (target.id=='menu_behavior_send_size1') {
		Copper.behavior.sendSize1 = ischecked(target.id);
	} else if (target.id.substr(0,24)=='menu_behavior_block_size') {
		Copper.behavior.blockSize = target.value;
		$('#menu_behavior_block_size_' + Copper.behavior.blockSize).click();
		if (Copper.behavior.blockSize==0) {
			$('#debug_option_block1').disable();
			$('#debug_option_block2').disable();
			$('#chk_debug_option_block_auto').disable();
		} else {
			$('#debug_option_block1').enable();
			$('#debug_option_block2').enable();
			$('#chk_debug_option_block_auto').enable();
		}
	} else if (target.id=='menu_behavior_token_observe') {
		Copper.behavior.observeToken = ischecked(target.id);
	} else if (target.id.substr(0,21)=='menu_behavior_observe') {
		Copper.behavior.observeCancellation = target.value;
	}
};
// save to preferences
Copper.saveBehavior = function() {
	/*Copper.prefManager.setCharPref('extensions.copper.behavior.requests', Copper.behavior.requests);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.retransmissions', Copper.behavior.retransmissions);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.send-duplicates', Copper.behavior.sendDuplicates);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.show-unknown', Copper.behavior.showUnknown);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.reject-unknown', Copper.behavior.rejectUnknown);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.send-uri-host', Copper.behavior.sendUriHost);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.send-size1', Copper.behavior.sendSize1);
	Copper.prefManager.setIntPref('extensions.copper.behavior.block-size', Copper.behavior.blockSize);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.observe-token', Copper.behavior.observeToken);
	Copper.prefManager.setCharPref('extensions.copper.behavior.observe-cancellation', Copper.behavior.observeCancellation);*/
};

//Load last used payload from preferences, otherwise use default payload
Copper.loadPayload = function() {
	
	Copper.logEvent('INFO: loading payload from extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.*');
	
	try {
		Copper.payload.mode = $.cookie('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.mode');
		Copper.payload.file = $.cookie('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.file');
		
		$('#toolbar_payload_mode_' + Copper.payload.mode).click();		
		$('#payload_text').html($.cookie('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.text'));
		
		if (Copper.payload.file!='') {
			Copper.loadPayloadFileByName(Copper.payload.file);
		}
	} catch (ex) {
	    Copper.logEvent('INFO: no stored payload for '+Copper.hostname+':'+Copper.port);
	}
};

Copper.payloadUpdate = function(target) {
	
	if (target.id=='toolbar_payload_mode_text') {
		Copper.payload.mode = 'text';
		$('#tab_outgoing_head').click();
		$('#payload_text').focus();
		Copper.logEvent('INFO: Selected text payload');
	} else if (target.id=='toolbar_payload_mode_file') {
		Copper.logEvent('INFO: Selected file payload');
		if (Copper.payload.file=='' || Copper.payload.data==null) {
			if (Copper.selectPayloadFile()) {
				Copper.payload.mode = 'file';
			} else {
				$('#toolbar_payload_filename_label').html("Choose file...");
			}
		} else {
			Copper.payload.mode = 'file';
		}
	} else if (target.id=='toolbar_payload_filename') {
		Copper.selectPayloadFile();
	} else {
		Copper.logWarning("Unknown payload preference: "+target.id+"="+target.value);
	}
}

Copper.savePayload = function() {
	if (Copper.hostname!='') {
		$.cookie('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.mode', Copper.payload.mode);
		$.cookie('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.text', $('#payload_text').html());
		$.cookie('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.file', Copper.payload.file);
	}
};

Copper.loadPayloadFileByName = function(filename) {
	
	try {
	
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);  
		file.initWithPath(filename);
		
		Copper.loadPayloadFile(file);
	} catch (ex) {
		Copper.logError(ex);
	}
};

Copper.selectPayloadFile = function() {
	const nsIFilePicker = Components.interfaces.nsIFilePicker;
	
	Copper.payload.file = '';
	Copper.payload.data = null;
	Copper.payload.loaded = false;

	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Select payload file", nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
		Copper.payload.file = fp.file.path;
		Copper.loadPayloadFile(fp.file);
		return true;
	} else {
		return false;
	}
};

Copper.loadPayloadFile = function(file) {
	var channel = NetUtil.newChannel(file);
	NetUtil.asyncFetch(channel,
			function(inputStream, status) {
				if (!Components.isSuccessCode(status)) {  
					Copper.logError(new Error(status));
					return;
				}
				Copper.payload.data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
				document.getElementById('toolbar_payload_filename').label = file.leafName;
				Copper.logEvent("INFO: Loaded payload file '" + file.path + "'");
				Copper.payload.loaded = true;
			}
		);
};

//Load cached resource links from preferences
Copper.loadCachedResources = function() {
	
	try {
		Copper.logEvent('INFO: loading cached resource links');
		var loadRes = $.cookie('extensions.copper.resources.'+Copper.hostname+':'+Copper.port);
		Copper.resources = JSON.parse( unescape(loadRes) );
	} catch (ex) {
	    Copper.logEvent('INFO: no cached links for '+Copper.hostname+':'+Copper.port);
	}
};


Copper.parseUri = function(inputUri) {

/*	
	( 'coap:' )
    ( '//' Uri-Authority )
    ( '/'  Uri-Path )
    ( '?'  Uri-Query )
*/

	var uri = {filePath:"",filePath:"",prePath:"",query:"",ref:"",port:"",host:""};

	try {
		uri.protocol = $.url('protocol', inputUri);
		uri.filePath = $.url('path', inputUri);
		uri.fileName = $.url('-1', inputUri);
		uri.query = $.url('query', inputUri);
		uri.ref = $.url('#', inputUri);
		uri.port = $.url('port', inputUri);
		uri.host = $.url('hostname', inputUri);
		uri.prePath = uri.protocol + "://" + uri.host + ":" + uri.port;

		uri.filePath = (uri.filePath!=undefined?uri.filePath:"");
		uri.fileName = (uri.fileName!=undefined?uri.fileName:"");
		uri.prePath = (uri.prePath!=undefined?uri.prePath:"");
		uri.query = (uri.query!=undefined?uri.query:"");
		uri.ref = (uri.ref!=undefined?uri.ref:"");
		uri.port = (uri.port!=undefined?uri.port:"");
		uri.host = (uri.host!=undefined?uri.host:"");
	} catch (ex) {
		// cannot parse URI
		throw new Error('Invalid URI');
	}
	//alert(uri.filePath);
	// redirect to omit subsequent slash, refs (#), and params (;)
	if (uri.filePath!='/' && uri.fileName=='') {
		$('#urlbar').val(uri.prePath + uri.filePath.substring(0, uri.filePath.length-1) + (uri.query!='' ? '?'+uri.query : ''));
		//throw new Error('Redirect');
	} else if (uri.ref!='') {
		$('#urlbar').val(uri.prePath + uri.filePath + (uri.query!='' ? '?'+uri.query : ''));
		throw new Error('Redirect');
	} else if (uri.filePath.match(/\/{2,}/)) {
		$('#urlbar').val(uri.prePath + uri.filePath.replace(/\/{2,}/g, '/') + (uri.query!='' ? '?'+uri.query : ''));
		throw new Error('Redirect');
	}
	if (uri.port>0xFFFF) {
		throw new Error('Illeagal port');
	}
	
	// DNS lookup
	try {
		var addresses = '';
		$.ajax ({
		    type: "POST",
		    url:"http://www.marwendzc.com/lookup.php",
		    data: {host : uri.host.replace(/%.+$/, '')},
		    dataType: "json",
		    success: function(results) {
		    	if(results != "error")
		    	{
			        for(i=0;i<results.length;i++)
			        {
			        	addresses += results[i]+'\n';
			        }
			    }
			    else
			    {
			    	Error('Cannot resolve host');
			    }
		    }
		});
		
	} catch (ex) {
		throw new Error('Cannot resolve host');
	}
	
	Copper.hostname = uri.host;
	if (Copper.hostname.indexOf(':')!=-1) Copper.hostname = '['+Copper.hostname+']';
	
	Copper.port = uri.port!=-1 ? uri.port : Copper.DEFAULT_PORT;
	Copper.path = decodeURI(uri.filePath); // as for 06 and as a server workaround for 03
	Copper.query = decodeURI(uri.query); // as for 06 and as aserver workaround for 03
	
	document.title = Copper.hostname + ':' + Copper.port;
};

// Set the default URI and also check for modified Firefox URL bar
Copper.checkUri = function(uri, caller) {
	if (!uri) {
		uri = decodeURI($('#urlbar').val());
	} else if (uri.indexOf('coap://')!=0) {
		// URI must be absolute
		if (uri.indexOf('/')!=0) uri = '/' + uri;
		// convert to full URI
		uri = 'coap://' + Copper.hostname + ':' + Copper.port + uri;
	}
	
	var uri2 = decodeURI($('#location').val());
	// when urlbar was changed without pressing enter, redirect and perform request
	if (caller && ((uri!=uri2) || uri2 == "")) {
		
		Copper.logEvent('INFO: Redirecting\nfrom ' + uri2 + '\nto   ' + uri);
		Copper.go(caller);
		// required to stop execution for redirect
		throw new Error('Redirect2');
	}
	else
	{
		return Copper.path + (Copper.query ? '?'+Copper.query : '');
	}
};

Copper.parseLinkFormat = function(data) {
	
	var links = new Object();
	
	// totally complicated but supports ',' and '\n' to separate links and ',' as well as '\"' within quoted strings
	var format = data.match(/(<[^>]+>\s*(;\s*\w+\s*(=\s*(\w+|"([^"\\]*(\\.[^"\\]*)*)")\s*)?)*)/g);
	Copper.logEvent('-parsing link-format----------------------------');
	for (var i in format) {
		//Copper.logEvent(links[i]+'\n');
		var elems = format[i].match(/^<([^>\?]+)[^>]*>\s*(;.+)?\s*$/);
				
		var uri = elems[1];

		if (uri.match(/([a-zA-Z]+:\/\/)([^\/]+)(.*)/)) {
			// absolute URI
		} else {
			// fix for old Contiki implementation and others which omit the leading '/' in the link format
			if (uri.charAt(0)!='/') uri = '/'+uri;
		}
		
		links[uri] = new Object();
		
		if (elems[2]) {
		
			var tokens = elems[2].match(/(;\s*\w+\s*(=\s*(\w+|"([^\\"]*(\\.[^"\\]*)*)"))?)/g);
		
			Copper.logEvent(' '+uri+' ('+tokens.length+')');
		
			for (var j in tokens) {
				//Copper.logEvent('  '+tokens[j]+'\n');
				var keyVal = tokens[j].match(/;\s*([^<"\s;,=]+)\s*(=\s*(([^<"\s;,]+)|"([^"\\]*(\\.[^"\\]*)*)"))?/);
				if (keyVal) {
					//Copper.logEvent(keyVal[0]+'\n');
					//Copper.logEvent('   '+keyVal[1] + (keyVal[2] ? (': '+ (keyVal[4] ? keyVal[4] : keyVal[5].replace(/\\/g,''))) : ''));
					
					if (links[uri][keyVal[1]]!=null) {
						
						if (!Array.isArray(links[uri][keyVal[1]])) {
							var temp = links[uri][keyVal[1]]; 
							links[uri][keyVal[1]] = new Array(0);
							links[uri][keyVal[1]].push(temp);
						}
						
						links[uri][keyVal[1]].push(keyVal[2] ? (keyVal[4] ? parseInt(keyVal[4]) : keyVal[5].replace(/\\/g,'')) : true);
						
					} else {
						
						links[uri][keyVal[1]] = keyVal[2] ? (keyVal[4] ? parseInt(keyVal[4]) : keyVal[5].replace(/\\/g,'')) : true;
					}
				}
			}
		} else {
			Copper.logEvent(' '+uri+' (no attributes)');
		}
	}
	Copper.logEvent('------------------------------------------------');
	
	return links;
};

Copper.updateResourceLinks = function(add) {
	
	// merge links
	if (add) {
		for (var uri in add) {
			if (!Copper.resources[uri]) {
				Copper.resources[uri] = add[uri];
				Copper.logEvent('INFO: adding '+uri+' to host resources');
			}
		}
	}
	
	// add well-known resource to resource cache
	if (!Copper.resources[Copper.WELL_KNOWN_RESOURCES]) {
		Copper.resources[Copper.WELL_KNOWN_RESOURCES] = new Object();
		Copper.resources[Copper.WELL_KNOWN_RESOURCES]['ct'] = 40;
		Copper.resources[Copper.WELL_KNOWN_RESOURCES]['title'] = 'Resource discovery';
	}
	
	Copper.clearTree();
	
	// sort by path
	var sorted = new Array();
	for (var uri in Copper.resources) {
		sorted.push(uri);
	}
	sorted.sort();
	
	for (var entry in sorted) {

		var uri = sorted[entry];
		// add to tree view
		Copper.addTreeResource( decodeURI(uri), Copper.resources[uri] );
	}
	
	// save in cache
	var saveRes = JSON.stringify(Copper.resources);
	if (Copper.hostname!='') $.cookie('extensions.copper.resources.'+Copper.hostname+':'+Copper.port, escape(saveRes));
};

Copper.displayMessageInfo = function(message) {
	
	if (message.getCopperCode) {
		Copper.updateLabel('info_code', 'Copper: '+message.getCopperCode());
	} else {
		Copper.updateLabel('info_code', message.getCode(true));
	}

	$('#packet_header_type').html(message.getType(true));
	$('#packet_header_code').html(message.getCode(true));
	$('#packet_header_mid').html(message.getMID());
	$('#packet_header_token').html(message.getToken(true));
	
	var optionList = $('#packet_options table tbody');
	optionList.html('');
	
	var options = message.getOptions(false)
	
	for (var i in options) {
		
		optionList.append('<tr'+(options[i][0]=="ETag"?' id="ETag_tr"':(options[i][0]=="Max-Age"?' id="Max_Age_tr"':""))+'><td>'+options[i][0]+'</td><td id="packet_options_'+options[i][0].toLowerCase()+'">'+options[i][1]+'</td><td>'+options[i][2]+'</td></tr>');
        
        /*if (options[i][0]=='ETag') {
        	// might be cleaner with bind()
        	var etagValueCopy = options[i][1];
        	row.addEventListener('dblclick', function(event) {
        		if (event.button == 0) { // left
        			document.getElementById('debug_option_etag').value = etagValueCopy;
        		} else { // right
        			document.getElementById('debug_option_if_match').value = etagValueCopy;
        		}
        	});
        	row.setAttribute('tooltiptext', 'Double-click for Debug Control: Left for ETag, right for If-Match');
        }*/
        
        if (options[i][0]=='Max-Age') {
        	window.setTimeout(function() { $('#Max_Age_tr').css({backgroundColor: 'red', color: 'white'}); }, options[i][1]*1000);
        }
        
        if (options[i][0]=='Location-Path') {
        	Copper.updateResourceLinks( Copper.parseLinkFormat( '<'+options[i][1]+'>' ) );
        }
    }
};

Copper.displayCache = null;
Copper.displayInvalid = false;

Copper.displayPayload = function(message) {
	
	if (message.getPayload().length<1) {
		return;
	}
	
	// complete payload or first received block
	if (!message.isOption(Copper.OPTION_BLOCK2) || message.getBlock2Number()==0 || Copper.displayCache==null) {
		Copper.displayCache = new Copper.CoapMessage(0,0);
		Copper.displayCache.setContentType(message.getContentFormat());
		
		if (message.isOption(Copper.OPTION_BLOCK2) && message.getBlock2Number()!=0) {
			$('#info_payload').html('Partial Payload ('+message.getPayload().length+')');
			Copper.displayInvalid = true;
		} else {
			$('#info_payload').html('Payload ('+message.getPayload().length+')');
			Copper.displayInvalid = false;
		}
	
	// additional blocks
	} else {
		$('#info_payload').html('Combined Payload ('+ (Copper.displayCache.getPayload().length + message.getPayload().length)  +')');
	}
	
	Copper.displayCache.setBlock2(message.getBlock2());
	Copper.displayCache.appendPayload(message.getPayload());
	
	switch (Copper.displayCache.getContentFormat()) {
		case Copper.CONTENT_TYPE_IMAGE_GIF:
		case Copper.CONTENT_TYPE_IMAGE_JPEG:
		case Copper.CONTENT_TYPE_IMAGE_PNG:
		case Copper.CONTENT_TYPE_IMAGE_TIFF:
			Copper.renderImage(Copper.displayCache);
			break;
		case Copper.CONTENT_TYPE_AUDIO_RAW:
		case Copper.CONTENT_TYPE_VIDEO_RAW:
		case Copper.CONTENT_TYPE_APPLICATION_OCTET_STREAM:
		case Copper.CONTENT_TYPE_APPLICATION_X_OBIX_BINARY:
			Copper.renderBinary(Copper.displayCache);
			break;
		case Copper.CONTENT_TYPE_APPLICATION_EXI:
			Copper.renderBinary(Copper.displayCache);
			Copper.renderEXI(Copper.displayCache);
			break;
		case Copper.CONTENT_TYPE_APPLICATION_JSON:
			Copper.renderText(Copper.displayCache);
			// only render full representation to avoid parsing errors
			if (!Copper.displayInvalid && !message.getBlock2More()) Copper.renderJSON(Copper.displayCache);
			break;
		case Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT:
			Copper.renderText(Copper.displayCache);
			Copper.renderLinkFormat(Copper.displayCache);
			break;
		default:
			Copper.renderText(Copper.displayCache);
	}
	
	if (!message.getBlock2More()) {
		delete Copper.displayCache;
		Copper.displayInvalid = false;
	}
};

Copper.updateLabel = function(id, value, append) {
	if (append) {
		$('#'+id).append(value);
	} else {
		$('#'+id).html(value);
	}
};

Copper.clearLabels = function(full) {
	
	if (full || full==null) {
		Copper.updateLabel('info_code', '');
		Copper.updateLabel('packet_payload', '');
		Copper.updateLabel('info_payload', 'Payload');
		Copper.updateLabel('packet_header_type', '');
		Copper.updateLabel('packet_header_code', '');
		Copper.updateLabel('packet_header_mid', '');
		Copper.updateLabel('packet_header_token', '');
		
		$('#tab_outgoing_head').click();
		
		$('#packet_options table tbody').html('');
	}
	$('#group_head').show();
	$('#group_payload').show();
};

Copper.negotiateBlockSize = function(message) {
	var size = message.getBlock2Size();
	if (Copper.behavior.blockSize==0) {
		Copper.behavior.blockSize = size;
		Copper.updateBehavior();
	
		Copper.popup(Copper.hostname+':'+Copper.port, 'Negotiated block size: '+size);
	} else if (Copper.behavior.blockSize < size) {
		size = Copper.behavior.blockSize;
	}
	return size;
};

// workaround for "this" losing scope when passing callback functions
Copper.myBind = function(scope, fn) {
    return function () {
        fn.apply(scope, arguments);
    };
};

Copper.popup = function(title, str) {
	try {
        contentHTML = '<div class="alert alert-primary media fade in"><div class="media-left"><span class="icon-wrap icon-wrap-xs icon-circle alert-icon"><i class="fa fa-bolt fa-lg"></i></span></div><div class="media-body"><h4 class="alert-title">'+title+'</h4><p class="alert-message">'+str+'</p></div></div>';

        $.niftyNoty({
            type: 'primary',
            container : 'floating',
            html : contentHTML,
            timer : 3000
        });
	} catch (ex) {
		Copper.logEvent(ex.message)
	}
};
