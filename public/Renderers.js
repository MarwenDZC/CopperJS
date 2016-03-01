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
 *         Content-type rendering functions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// Rendering functions
////////////////////////////////////////////////////////////////////////////////

Copper.renderText = function(message) {
	Copper.updateLabel('packet_payload', Copper.bytes2str(message.getPayload()), false);
	var str = Copper.bytes2str(message.getPayload());
	if (str.match(/^#[0-9a-f]{3,6}$/i) || str.match(/´rgb\(\s*[0-9]+\s*,\s*[0-9]+\s*,\s*[0-9]+\s*\)$/i)) {

		// view corresponding render element
		$('#rendered_img').hide();
		$('#rendered_div').css({display : 'block'});
		
		$('#tab_rendered').css({backgroundColor : str.toLowerCase()});
		$('#tab_rendered_head').click();
	} else {
		$('#tab_rendered').css({backgroundColor : ''});
		$('#tab_incoming_head').click();
	}
};

Copper.renderImage = function(message) {
	
	if (!message.getBlock2More()) {
		// only render binary when transfer is complete (binary is heavy)
		Copper.renderBinary(message);
	}
	
	// view corresponding render element
	$('#rendered_div').hide();
	$('#rendered_img').css({display : 'block'});
	
	// causes flickering, but partially added data does not draw anyway
	$('#rendered_img').src = 'data:'+Copper.getContentFormatName(message.getContentFormat())+';base64,'+btoa( Copper.bytes2data(message.getPayload()) );
	$('#tab_rendered').css({backgroundColor : ''});
	$('#tab_rendered_head').click();
};

Copper.renderBinary = function(message) {
	
	var pl = message.getPayload();
	
	// TODO: loop is too heavy for large payloads, alternatives?
	for (var i in pl) {
		
		Copper.updateLabel('packet_payload', Copper.leadingZero(pl[i].toString(16).toUpperCase()), true);
		
		if (i % 16 == 15) {
			Copper.updateLabel('packet_payload', ' | ', true);
			for (var j=i-15; j<=i; ++j) {
				if (pl[j] < 32 || pl[j] >= 127) {
					Copper.updateLabel('packet_payload', '·', true);
				} else {
					Copper.updateLabel('packet_payload', String.fromCharCode(pl[j] & 0xFF), true);
				}
			}
			Copper.updateLabel('packet_payload', '\n', true);
		} else if (i % 2 == 1) {
			Copper.updateLabel('packet_payload', ' ', true);
		}
	}
	
	// incomplete lines
	if ((parseInt(i)+1) % 16 != 0) {
		// complete line with spaces
		for (var j=0; j<39-((parseInt(i)+1)%16)*2 - ((parseInt(i)+1)%16)/2; ++j) {
			Copper.updateLabel('packet_payload', ' ', true);
		}
		
		Copper.updateLabel('packet_payload', ' | ', true);
		for (var j=i-(i%16); j<=i; ++j) {
			if (pl[j] < 32) {
				Copper.updateLabel('packet_payload', '·', true);
			} else {
				Copper.updateLabel('packet_payload', String.fromCharCode(pl[j] & 0xFF), true);
			}
		}
	}
	
	$('#tab_incoming_head').click();
};


Copper.renderLinkFormat = function(message) {
	
	// Print raw Link Format in case parsing fails
	Copper.renderText(message);
	
	// The box for output at the top-level
	$('#rendered_img').hide();
    var view = $('#rendered_div');
    view.css({display : 'block'});
    
    view.html('');
    view.attr("class", "link-content");
    
	var parsedObj = Copper.parseLinkFormat( Copper.bytes2str(message.getPayload()) );
	
	view.append( Copper.renderLinkFormatUtils.getLinks(parsedObj) );
	
	$('#tab_rendered').css({backgroundColor : ''});
	$('#tab_rendered_head').click();
};

Copper.renderLinkFormatUtils = {
	
	htmlns: "http://www.w3.org/1999/xhtml",
	
	getLinks: function(value) {
		if (typeof value != 'object') {
			return null;
		}

		var Obj = $.create("ul");
		for (var uri in value) {
			this.addLink(Obj, value[uri], uri);
		}
		
		return Obj;
	},
	 
	addLink: function(Obj, attribs, key) {

		var Child = $.create("li");

		var label = $.create("label").attr("class", "uri").html(key);
		Child.append(label);
		Child.append( this.getObject(attribs) );

		Obj.append(Child);
	},
 
	getObject: function(value) {
		
		if (typeof value != 'object') {
			return null;
		}

		var Obj = $.create("ul");

		if (Array.isArray(value)) {
			Obj.attr("class", "array");
			for (var i = 0; i < value.length; i ++) {
				this.addChild(Obj, value[i]);
			}
		} else {
			// object
			Obj.attr("class", "object");
			for (var prop in value) {
				this.addChild(Obj, value[prop], prop);
			}
		}
		
		return Obj;
	},
	 
	addChild: function(Obj, value, key) {

		var Child = $.create("li");

		// If the value has a label (object properties will have labels)
		if (key != null) {
			var label = $.create("label");
			label.attr("class", "label");
			label.html(key + ":");
			Child.append(label);
		}

		if (typeof value == 'object' && value != null) {
			Child.append( this.getObject(value) );
		} else {
			Child.append( this.getValue(value) );
		}

		Obj.append(Child);
	},

	getValue: function(value) {
		var Obj = $.create("description");
		switch (typeof value) {
			case 'object':
				if (!value) {
					Obj.html('null');
					Obj.attr("class", "null");
					return Obj;
				}
				return null;
	
			case 'string':
				Obj.append( String(value) );
				Obj.attr("class", "string");
				return Obj;
	
			case 'number':
				Obj.html(isFinite(value) ? String(value) : 'null');
				if (Math.floor(value) == value) {
					Obj.attr("class", "int");
				} else {
					Obj.attr("class", "float");
				}
				return Obj;
	
			case 'boolean':
				Obj.html(String(value));
				Obj.attr("class", "bool");
				return Obj;
	
			case 'null':
				Obj.html(String(value));
				Obj.attr("class", "null");
				return Obj;
				
			default:
				return null;
		}
	}
};

Copper.renderJSON = function(message) {
	
	// Print raw JSON in case parsing fails
	Copper.renderText(message);
	
	// The box for output at the top-level
	$('#rendered_img').hide();
    var view = $('#rendered_div');
    view.css({display : 'block'});
    
    view.html('');
    view.attr("class", "json-content");
    
    var pl = Copper.bytes2str(message.getPayload()).replace(/'/g, '"');
    
	try {
		// Parse the JSON
		var parsedObj = JSON.parse(pl);
		
		if (typeof parsedObj == 'object') {
			view.append( Copper.renderJSONutils.getObject(parsedObj) );
			$('#tab_rendered').css({backgroundColor : ''});
			$('#tab_rendered_head').click();
		} else {
			Copper.logError(new Error('Top level element is not a JSON object'));
		}
	} catch (ex) {
		Copper.logError(ex);
	}
	
};

Copper.renderJSONutils = {
		
	htmlns: "http://www.w3.org/1999/xhtml",
 
	getObject: function(value) {
		if (typeof value != 'object') {
			return null;
		}

		var Obj = $.create("ul");

		if (Array.isArray(value)) {
			Obj.attr("class", "array");

			if (value.length>0) {
				var label = $.create("label");
				label.html("(length " + value.length + ")");
				label.attr("style", "color: gray;");
				Obj.append(label);
				
				for (var i = 0; i < value.length; i ++) {
					this.addChild(Obj, value[i]);
				}
			} else {
				var label = $.create("label");
				label.html("    ");
				Obj.append(label);
			}
			
		} else {
			// object
			Obj.attr("class", "object");
			for (var prop in value) {
				this.addChild(Obj, value[prop], prop);
			}
		}
		
		return Obj;
	},
	 
	addChild: function(Obj, value, key) {

		var Child = $.create("li");

		// If the value has a label (object properties will have labels)
		if (key != null) {
			var label = $.create("label");
			label.attr("class", "label");
			label.html(key + ":");
			Child.append(label);
		}

		if (typeof value == 'object' && value != null) {
			Child.append( this.getObject(value) );
		} else {
			Child.append( this.getValue(value) );
		}

		Obj.append(Child);
	},

	getValue: function(value) {
		var Obj = $.create("description");
		switch (typeof value) {
			case 'object':
				if (!value) {
					Obj.html('null');
					Obj.attr("class", "null");
					return Obj;
				}
				return null;
	
			case 'string':
				Obj.append( String(value) );
				Obj.attr("class", "string");
				return Obj;
	
			case 'number':
				Obj.html(isFinite(value) ? String(value) : 'null');
				if (Math.floor(value) == value) {
					Obj.attr("class", "int");
				} else {
					Obj.attr("class", "float");
				}
				return Obj;
	
			case 'boolean':
				Obj.html(String(value));
				Obj.attr("class", "bool");
				return Obj;
	
			case 'null':
				Obj.html(String(value));
				Obj.attr("class", "null");
				return Obj;
				
			default:
				return null;
		}
	}
};

Copper.renderEXI = function(message) {
	Copper.updateLabel('packet_payload', Copper.bytes2data(message.getPayload()), message.getBlock2Number()>0);
	$('#tab_incoming_head').click();
};
