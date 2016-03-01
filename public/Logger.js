/*******************************************************************************
 * Copyright (c) 2015, Institute for Pervasive Computing, ETH Zurich.
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
 *******************************************************************************/
/**
 * \file Main script file for the LWM2M DevKit.
 * 
 * \author Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

Copper.operationLog = [];
Copper.operationReportingLog = [];

Copper.resetLogger = function() {
	$('#log_messages table tbody').html('');
};

Copper.logMessage = function(message, out) {

	var t = $('#log_messages table').DataTable();

	t.row.add( [
            new Date().toLocaleTimeString(),
            message.getType(true)+'-'+message.getCode(true),
            message.getMID() + (message.isConfirmable() ? (' (' + message.getRetries() + ')') : ''),
            message.getToken(),
            message.getOptions(true),
            message.getPayloadText()
        ] ).draw( false );
};

Copper.bytes2hexedit = function(bytes) {
	
	if (bytes==null) return '';
	
	var str ='';
	var show = '';
	for (var b in bytes) {
		str += Copper.Copper.leadingZero(bytes[b].toString(16));
		show += bytes[b]<32 ? '·' : String.fromCharCode(bytes[b]);
		if (b % 16 == 15) {
			str += " | ";
			str += show;
			str += '\n';
			show = '';
		} else {
			str += ' ';
		}
	}
	return str;
}

Copper.logEvent = function(text) {
	$('#log_event_log').append(text + '\n');
};

Copper.logWarning = function(text) {
	Copper.logEvent('WARNING: ' + text);
	window.setTimeout(
			function() { alert('WARNING: '+ text); },
			0);
};

Copper.logError = function(error, skip) {
	Copper.logEvent('ERROR: ' + error.message + '\n\t' + error.stack.replace(/\n/, '\n\t'));
	if (Copper.endpoint) {
		Copper.endpoint.cancelTransactions();
	}
	window.setTimeout(
			function() { alert('ERROR: '+ error.message + (skip ? '' : '\n\nStacktrace:\n' + error.stack)); },
			0);
};

Copper.debug = function(object) {
	var str = "";
	for (var x in object) str += x+": "+object[x]+"\n-----\n";
	alert(str);
};
