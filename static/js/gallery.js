$(function() {
	var $header = $("#header");
	var $frame = $('#frame');
	var $slider = $('#slider');
	var $themes = $("#themes");
	var $nav = $('#nav');
	var $image = $frame.find('.photo');
	var $caption = $frame.children('.photo-caption');
	var $thumbnails = $slider.children('#thumbnails');
	var $slider_btn = $slider.children('span');
	var thumbnails_width = 0;
	var $edge;
	var $selected;
	var currPhoto;

	// Get gallery json data & initialize page
	$.getJSON('/gallery_json', function(data) {
		data = JSON.parse(data);
		$header.children('.album').text(data.album.name);
		photos = data.photos;
		thumbnails = "";
		
		// Create thumbnails
		for(var i=0; i < data.photos.length; i++){
			photo = data.photos[i];
			thumbnails += "<li><img data-index=" + photo.id + " src='/static/" + photo.thumb_url +
										"' alt='" + photo.title + "' title='" + photo.title + "' /></li>";
		}
		$thumbnails.html(thumbnails);

		// Select first photo and thumbnail by default
		currPhoto = parseInt(photos[0].id, 10);
		setImage(currPhoto);
		firstThumbnail = $thumbnails.children(":first");
		selectThumbnail(firstThumbnail);

		// Calculate and initiate slider if thumbnails overflow
		var first = firstThumbnail.children("img"); // check if loaded
		if (first[0].complete) {
			initSlider();
		} else {
			// init slider after thumbnail images load
			first.load(initSlider);
		}

		// Make page visible
		$('body').css("opacity", "1");
	});

	// Select thumbnail & image on click
	$thumbnails.on('click', 'img', function(event){
		$this = $(this);
		var photoID = parseInt($this.data('index'), 10);
		setImage(photoID);
		selectThumbnail($this.parent('li'), photoID);
		currPhoto = photoID;
	});

	// Display next or previous photo on click
	$nav.on('click', 'button', function(event){
		var dir = this.className;
		if (dir.indexOf('prev') >= 0 && currPhoto > 1) {
			currPhoto--;
			prevThumbnail();
		} else if (dir.indexOf('next') >= 0 && currPhoto < photos.length) {
			currPhoto++;
			nextThumbnail();
		}
		setImage(currPhoto);
	});

	// Display slider based on window size
	$(window).on('resize', function(){
		sliderDisplay();
		$thumbnails.children().css("display", "inline-block");
		$edge = $thumbnails.children(":first");
		displaySliderBtn('prev', false);
		displaySliderBtn('next', true);
	});


	// Display prev or next thumbnail in slider
	$slider.on('click', 'span', function(event){
		var dir = event.target.className;
		var $first = $thumbnails.children(":first");
		var last_pos = getLastPos();
		
		if (dir.indexOf('prev') >= 0 && $first.css('display') == "none") {
			$prev = $edge.prev();
			if ($prev.length > 0) {$edge = $prev;} // update if prev exist
			$edge.css('display', 'inline-block');

			// toggle slider buttons
			if ($first[0] === $edge[0]) {displaySliderBtn('prev', false);}
			displaySliderBtn('next', true);

		} else if(dir.indexOf('next') >= 0 && last_pos > 0) {
			$edge.css('display', 'none');
			$edge = $edge.next();

			// toggle slider buttons
			displaySliderBtn('prev', true);
			if (getLastPos() === 0) {displaySliderBtn('next', false);}
		}
	});

	// Toggle gallery theme styles
	$themes.on('click', 'span', function(event){
		$this = $(this);
		theme = $this.data('theme');

		if (!$this.hasClass('active')) {
			if(theme == "another") {
				$('link[href="/static/css/original.min.css"]').attr({href: "/static/css/another.min.css"});
				$nav.appendTo("#frame");
				$caption.appendTo(".photo-wrapper");
			} else {
				$('link[href="/static/css/another.min.css"]').attr({href: "/static/css/original.min.css"});
				$nav.appendTo("#header");
				$caption.appendTo("#frame");
			}

			$themes.children('.active').removeClass('active');
			$this.addClass('active');
		}

	});

	function setImage(photoID) {
		if (photoID > 0 && photoID <= photos.length) {
			var photo = photos[photoID - 1];
			$image.attr('src', '/static/' + photo.url);
			$caption.children('.title').text(photo.title);
			$caption.children(".data").text("Taken on " + photo.date + " in " + photo.location);
		}
	}

	function selectThumbnail(thumbnail) {
		if ($selected) {$selected.removeClass('selected');}
		$selected = $(thumbnail); // update $selected
		$selected.addClass('selected');
	}

	function prevThumbnail() {
		$selected.removeClass('selected');
		$selected = $selected.prev(); // update $selected
		$selected.addClass('selected');
	}

	function nextThumbnail() {
		$selected.removeClass('selected');
		$selected = $selected.next(); // update $selected
		$selected.addClass('selected');
	}

	function initSlider(){
		$thumbnails.children().each(function(){thumbnails_width += $(this).outerWidth(true);});
		$edge = $thumbnails.children(":first");
		sliderDisplay();
		displaySliderBtn('prev', false);
	}

	function sliderDisplay() {
		slider_width = $slider.innerWidth();
		if (slider_width < thumbnails_width && $slider_btn.css('display') == "none") {
			$slider_btn.css('display', "block");
		} else if(slider_width >= thumbnails_width && $slider_btn.css('display') == "block"){
			$slider_btn.css('display', "none");
		}
	}

	function displaySliderBtn(dir, display) {
		$btn = $slider.children('.' + dir);
		if (display) {
			$btn.removeClass('disable');
		} else {
			$btn.addClass('disable');
		}
	}

	function getLastPos() {
		var $last = $thumbnails.children(":last");
		return $last.position().top; // get position of last thumbnail for overflow check
	}

});