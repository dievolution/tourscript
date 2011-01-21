//Tour Script v1
//Copyright (c) 2011, Thomas Diehl, DIEVOLUTION web development
//web: www.dievolution.com | twitter: @dievo

//released under the MIT License, http://www.opensource.org/licenses/mit-license.php
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/*
	Usage:
	create a .json file in the following format:
	[
		{
			"element" 	: "#divtoshow",
			"label"			: "description",
			"options" 	: "interactive",
			"highlight"	: ".inner"
		},
		{
			"element" 	: "#divtoshow",
			"label"			: "description",
			"options" 	: "interactive",
			"highlight"	: ".inner"
		},
	]

	Each hash is one item in the tour.
	- "element" is the box who should be higlighted. This can be any valid jquery selector (must be unique, or the first one will be chosen)
	- "label" is the description displayed underneath or above the highlighted element. It can contain html elements.
	- "options": Just write an option as text in this part to activate. The following options are currently available:
	- - interactive : when using this option, the user will be able to click something in the highlighted element. Any form submit or link click will continue to the next part of the tour
	- - lastItem : this option should be used for the last element of the tour. This will replace the 'continue tour' link with a 'end tour' link, closing the tour.
	- "highlight" is a highlight option for an element in the chosen element. The element will pulsate so the user can see what the description is currently talking about.
*/

function startTour(jsonfile) {
	$.getJSON(jsonfile,function(items) {
		var k = items.length;
		var currentItem = 0;
		var started = true;
		var didScroll = false;
		var everyItem = $("*");
		dimensions(items[0]);
		$(".nextTourItem").live('click',function() {
			nextItem();
		});

		$(".tourInteractiveClick a").live('click',function() {
			$(items[currentItem].element).removeClass('tourInteractiveClick');
			setTimeout(function(){nextItem()},1000);
		});

		$(".tourInteractiveClick").live('submit',function() {
			$(items[currentItem].element).removeClass('tourInteractiveClick');
			setTimeout(function(){nextItem()},1000);
		});

		$(".lastTourItem").live('click',function() {
			everyItem.removeClass("tourCurrentItem");
			if (!items[currentItem-1])
				currentItem = k;
			dimensions(items[currentItem-=1]);
		});

		$(window).resize(function() {
			didScroll = true;
		});

		$(window).scroll(function() {
			didScroll = true;
		});

		setInterval(function() {
			if (didScroll) {
				didScroll = false;
				$("*").removeClass("tourCurrentItem");
					if (started)
						dimensions(items[currentItem]);
			}
		}, 250);

		$(".closeTour").live('click', function() {
			$(".tourLabel").remove();
			$(".darkbox").remove();
			$("#tourguide_active").hide();
			$("#tourguide_inactive").show();
			everyItem.removeClass("tourCurrentItem");
			everyItem.removeClass("tourInteractiveClick");
			started = false;
		});

		function nextItem() {
			everyItem.removeClass("tourCurrentItem");
			if (!items[currentItem+1])
				currentItem = -1;
			dimensions(items[currentItem+=1]);
		}
	});
}

function dimensions(item) {
	var obj = $(item.element);
	var w = obj.outerWidth();
	var h = obj.outerHeight();
	var x = obj.offset().left;
	var y = obj.offset().top;
	if (!item.options || item.options.indexOf("interactive") == -1) {
		darken(x,y,w,h, true);
		createLabel(item,false);
	} else {
		darken(x,y,w,h,false);
		createLabel(item,true);
		obj.addClass("tourInteractiveClick");
	}

	if (item.highlight) {
		createHighlight(item);
	}
	obj.addClass("tourCurrentItem");
}

function darken(x,y,width,height,disabled) {
	if (disabled) {
		createBox('tourCurrentBoxDisabled',width,height,x,y);
	} else {
		$("#tourCurrentBoxDisabled").remove();
	}
	createBox('topbox',$(window).width(),y,0,0);
	createBox('bottombox',$(window).width(),$(document).height()-y-height,0,y+height);
  createBox('leftbox',x,height,0,y);
	createBox('rightbox',$(window).width()-width-x,height,x+width,y);
}

function createBox(id,width,height,x,y) {
	$("#"+id).remove();
	var box = "<div class='darkbox' id='"+id+"' style='width:"+width+"px;height:"+height+"px;left:"+x+"px;top:"+y+"px;'></div>";
	$('body').append(box);
}

function createLabel(elem,showlink) {
	var obj = $(elem.element);
	var text = elem.label;
	var label = "";
	var boxtop = 0;
	if (!elem.options || elem.options.indexOf("lastItem") == -1)
		label = "<div class='tourLabel'>"+text+" <a href='#' class='nextTourItem'>continue the tour</a></div>";
	else
		label = "<div class='tourLabel'>"+text+" <a href='#' class='closeTour'>end the tour</a></div>";

	if (showlink) label = "<div class='tourLabel'>"+text+"</div>";
	$(".tourLabel").remove();
	$('body').append(label);
	var labelBox = $(".tourLabel");
	if (obj.offset().top > $(window).height() / 2)
		boxtop = obj.offset().top - labelBox.height();
	 else
		boxtop = obj.offset().top + obj.outerHeight();
	labelBox.attr("style", "top:"+boxtop+"px;left:"+obj.offset().left+"px;width:"+(obj.outerWidth()-6)+"px");
}

function createHighlight(elem) {
	$(elem.element + " " + elem.highlight).effect('pulsate', {times: 4}, 500, function() {
		$(this).removeAttr("filter");
	});
}