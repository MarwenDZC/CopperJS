 $(document).ready(function() {
$('#toolbar_preferences').on('click', function(){
		bootbox.dialog({
			title: "Copper Preferences",
			message:'<div class="row"> ' + '<div class="col-md-8 col-md-offset-2"> ' +
					'<form class="form-block">' +
					'<label class="form-checkbox form-normal form-primary active form-text"><input id="encode_utf_8" type="checkbox" checked=""> Use UTF-8 encoding</label>' +
					'<hr>'+
					'<label class="form-checkbox form-normal form-primary form-text"><input id="plugtest" type="checkbox"> Enable ETSI Plugtest menu</label>' +
					'</form>' +
					'<hr>'+
					'<button class="btn btn-block btn-default" onclick="Copper.Options.clearResourceCache();">Clear resource cache</button>' +
					'<button class="btn btn-block btn-default" onclick="Copper.Options.clearPayloadCache();">Clear payload cache</button>' +
					'</div> </div><script></script>',
			buttons: {
				success: {
					label: "Save",
					className: "btn-success",
					callback: function() {
						$('#plug-test').val($('#plugtest').val());
						$("#encode-utf-8").val($('#encode_utf_8').val());
						$.niftyNoty({
							type: 'success',
							icon : 'fa fa-check',
							message : "Preferences saved successfully",
							container : 'floating',
							timer : 4000
						});
					},
					animateIn: 'bounceIn',
					animateOut : 'bounceOut'
				},
				danger: {
					label: "Close",
					className: "btn-danger",
				}
			}
		});
	});
	$('[data-submenu]').submenupicker();
 });
