$(function() {
	var $album = $('#album');
	var $frame = $('#frame');
	var $nav = $('#nav');
	var $image = $frame.children('.image');
	var $title = $frame.children('.title');
	var $data = $frame.children('.data');
	var $thumbnails = $('#thumbnails');
	var $slider = $('#slider');
	var $slider_btn = $slider.children('span');
	var thumbnails_width = 0;
	var $edge;
	var $selected;
	var currPhoto;

	// Get gallery json data
	$.getJSON('/gallery_json', function(data) {
		data = JSON.parse(data);
		$album.text(data.album.name);
		photos = data.photos;
		thumbnails = "";
		
		// Create thumbnails
		for(var i=0; i < data.photos.length; i++){
			photo = data.photos[i];
			thumbnails += "<li><img index=" + photo.id + " src=" + '/static/' + photo.thumb_url + " alt='" + photo.title + "' title='" + photo.title + "' /></li>";
		}
		$thumbnails.html(thumbnails);

		// Select first photo and thumbnail by default
		currPhoto = 1;
		setImage(1);
		thumbnail = $thumbnails.find("img[index='1']");
		selectThumbnail(thumbnail);

		// Display slider if not all thumbnails are shown
		$thumbnails.children().each(function(){
			thumbnails_width += $(this).outerWidth(true);
		});
		$edge = $thumbnails.children(":first");
		sliderDisplay();

		// Select thumbnail & image on click
		$thumbnails.on('click', 'img', function(event){
			var photoID = parseInt(event.target.getAttribute('index'), 10);
			setImage(photoID);
			selectThumbnail(event.target, photoID);
			currPhoto = photoID;
		});

		// Display next or previous photo on click
		$nav.on('click', 'button', function(event){
			var dir = event.target.className;
			if (dir.indexOf('prev') >= 0 && currPhoto > 1) {
				currPhoto--;
				prevThumbnail();
			} else if (dir.indexOf('next') >= 0 && currPhoto < photos.length) {
				currPhoto++;
				nextThumbnail();
			}
			setImage(currPhoto);
		});
	});

	function setImage(photoID) {
		if (photoID > 0 && photoID <= photos.length) {
			var photo = photos[photoID - 1];
			$image.attr('src', '/static/' + photo.url);
			$title.text(photo.title);
			$data.text("Taken on " + photo.date + " in " + photo.location);
		}
	}

	function selectThumbnail(thumbnail) {
		if ($selected) {$selected.removeClass('selected');}
		$selected = $(thumbnail).parent('li'); // update $selected
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

	function sliderDisplay() {
		slider_width = $slider.innerWidth();
		if (slider_width < thumbnails_width && $slider_btn.css('display') == "none") {
			$slider_btn.css('display', "block");
		} else if(slider_width >= thumbnails_width && $slider_btn.css('display') == "block"){
			$slider_btn.css('display', "none");
		}
	}

	// Display slider based on window size
	$(window).on('resize', function(){
		sliderDisplay();
		$thumbnails.children().css("display", "inline-block");
		$edge = $thumbnails.children(":first");
	});

	// Display prev or next thumbnail in slider
	$slider.on('click', 'span', function(event){
		var dir = event.target.className;
		var $last = $thumbnails.children(":last");
		var last_pos = $last.position().top; // get position of last thumbnail for overflow check
		
		if (dir.indexOf('prev') >= 0 && $edge.css('display') != "None") {
			$prev = $edge.prev();
			if ($prev.length > 0) {$edge = $prev;} // check if prev exist
			$edge.css('display', 'inline-block');
		} else if(dir.indexOf('next') >= 0 && last_pos > 0) {
			$edge.css('display', 'none');
			$edge = $edge.next();
		}
	});
});