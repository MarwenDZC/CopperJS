$.fn.extend({
    treed: function (o) {
      
      var openedClass = 'fa-caret-down';
      var closedClass = 'fa-caret-right';
	  var hostClass = 'fa-home';
      
      if (typeof o != 'undefined'){
        if (typeof o.openedClass != 'undefined'){
        openedClass = o.openedClass;
        }
        if (typeof o.closedClass != 'undefined'){
        closedClass = o.closedClass;
        }
		if (typeof o.hostClass != 'undefined'){
        hostClass = o.hostClass;
        }
      };
      
        //initialize each of the top levels
        var tree = $(this);
        tree.addClass("tree");
        tree.find('li').has("ul").each(function () {
            var branch = $(this); //li with children ul
            branch.prepend("<i class='indicator fa " + openedClass + "'></i> ");
            branch.addClass('branch');
            branch.on('click', function (e) {
                if (this == e.target) {
                    var icon = $(this).children('i:first');
                    icon.toggleClass(openedClass + " " + closedClass);
                    $(this).children().children().toggle();
                }
            })
            //branch.children().children().toggle();
        });
        //fire event from the dynamically added icon
	    tree.find('.branch .indicator').each(function(){
		    $(this).on('click', function () {
				$(this).closest('li').click();
		    });
	    });
        // action redirect
        tree.find('.branch a').each(function () {
            $(this).on('click', function (e) {
				$('#urlbar').val('coap://'+$(this).attr("value"));
				Copper.go();
                e.preventDefault();
            });
        });
    }
});

//Initialization of treeviews

$('#resource_tree').treed();