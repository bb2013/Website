/*
 Document   :  Local SEO
 Author     :  Andrei Dinca, AA-Team http://codecanyon.net/user/AA-Team
*/
// Initialization and events code for the app
pspLocalSEO = (function ($) {
	"use strict";

	var debug_level = 0;
	var IDs = [];
	var loaded_page = 0;

	// metabox wrappers
	var metabox = {
		main_id		: '',
		main		: null,
		preload		: null,
		box			: null,
		boxmenu		: null,
		boxcontent	: null,
		post_id		: 0,
		lang		: {},
		settings	: {}
	};


	// init function, autoload
	(function init() {
		// load the triggers
		$(document).ready(function(){
			// metabox
			metabox_init();

			triggers();
		});
	})();

	function triggers()
	{
	}

	/**
	 * Meta Box
	 */
	function metabox_init() {
		metabox.main_id		= '#psp_locations_meta_box';
		metabox.main 		= $(metabox.main_id);
		if ( metabox.main.length ) {
			metabox.preload 	= metabox.main.find("#psp-meta-box-preload");
			metabox.box		 	= metabox.main.find(".psp-meta-box-container");
		}
		if ( metabox.box && metabox.box.length ) {
			metabox.boxmenu 	= metabox.box.find(".psp-tab-menu");
			metabox.boxcontent 	= metabox.box.find(".psp-tab-container");
		}
		//console.log( metabox );

		if ( metabox.box && metabox.box.length ) {
			var lang 		= {},
				settings 	= {};

			// language messages
			lang = metabox.main.find('#psp-meta-boxlang-translation').html();
			//lang = JSON.stringify(lang);
			lang = typeof lang != 'undefined'
				? JSON && JSON.parse(lang) || $.parseJSON(lang) : lang;

			// settings
			settings = metabox.main.find('#psp-meta-box-settings').html();
			//settings = JSON.stringify(settings);
			settings = typeof settings != 'undefined'
				? JSON && JSON.parse(settings) || $.parseJSON(settings) : settings;

			metabox.lang = lang;
			metabox.settings = settings;

			metabox.post_id = metabox.box.data('post_id');
			//console.log( metabox );

			metabox_triggers();
			metabox_load();
		}
	}

	function metabox_triggers() {
		metabox.main.on('click', '.psp-tab-menu a', function(e){
			e.preventDefault();

			var that 	= $(this),
				open 	= metabox.boxmenu.find("a.open"),
				href 	= that.attr('href').replace('#', '');

			metabox.box.hide();

			metabox.boxcontent.find("#psp-tab-div-id-" + href ).show();

			// close current opened tab
			var rel_open = open.attr('href').replace('#', '');

			metabox.boxcontent.find("#psp-tab-div-id-" + rel_open ).hide();

			metabox.preload.show();
			metabox.preload.hide();

			metabox.box.fadeIn('fast');

			open.removeClass('open');
			that.addClass('open');
		});

		openingHours.init();
	}

	function metabox_load() {
		var data = {
				action				: 'psp_metabox_localseo',
				sub_action			: 'load_box',
				post_id				: metabox.post_id
		};

		//loading( 'show' );

		$.post(ajaxurl, data, function(response) {

			if ( misc.hasOwnProperty(response, 'status') ) {
				metabox.boxcontent.html( response.html );

				openingHours.makeSortableOpening();
				googleMap.init();
			}

			//loading( 'close' );
			metabox.preload.hide();
			metabox.box.fadeIn('fast');

		}, 'json')
		.fail(function() {})
		.done(function() {})
		.always(function() {});
	}

	var openingHours = {
		
		init: function()
		{
			var self = this;
			
			self.triggers();
		},
		
		triggers: function()
		{
			var self = this;
			
			/*jQuery('.psp-oh-time-slider').slider({
				min: 0,
				max: 23,
				step: 1,
				//range: 'min',
				value: parseInt( jQuery(this).prev() ),
				slide: function( event, ui ) {
					//jQuery(this).prev().val() = ui.value - 1;
				}
			});*/
			
			jQuery('body').on('click', '#psp-add-new-opening', function(e) {
				e.preventDefault();
				self.addOpening();
			});

			jQuery('body').on('click', 'a.opening-delete-btn', function(e) {
				e.preventDefault();
				self.deleteOpening(jQuery(this));
			});
			
			//self.makeSortableOpening();
		},
		
		makeSortableOpening: function ()
		{
			var self = this;

			jQuery(function() {
				jQuery( "div#psp-tab-div-id-opening_hours div#psp-panel-content-dom" ).sortable({
					placeholder: "psp-form-row-fake",
					stop: function() {
						self.regenerateListIds();
					}
				});
			});
		},
	
		regenerateListIds: function ()
		{
			var self = this;

			var contentDom 	= jQuery("#psp-panel-content-dom"),
			rows 		= contentDom.find('.psp-form-row'),
			setupIndex 	= 1;

			rows.each(function() {
				var $t = jQuery(this);
				$t.find(".opening-from-hour").attr('name', 'oh[' + setupIndex + '][from_hour]' );
				$t.find(".opening-from-min").attr('name', 'oh[' + setupIndex + '][from_min]' );
				$t.find(".opening-to-hour").attr('name', 'oh[' + setupIndex + '][to_hour]' );
				$t.find(".opening-to-min").attr('name', 'oh[' + setupIndex + '][to_min]' );
				$t.find(".opening-day").attr('name', 'oh[' + setupIndex + '][day]' );

				setupIndex++;
			});

			jQuery("#psp-opening-nr").val(rows.size());
			
			self.makeSortableOpening();
		},

		deleteOpening: function ($btn)
		{
			var self = this;
			
			var contentDom 	= jQuery("#psp-panel-content-dom"),
			parentRow = $btn.parent().parent();

			//if (confirm('Are you sure to delete this opening?')) {

				parentRow.remove();
				if(contentDom.find('.psp-form-row').size() == 0) {
					contentDom.find('#psp-opening-no-items').show();
				}
			//}

			self.regenerateListIds();
		},


		addOpening: function ()
		{
			var self = this;
			
			var contentDom 	= jQuery("#psp-panel-content-dom"),
			lastRow 		= contentDom.find('.psp-form-row').last(),
			htmlBlock 		= jQuery('#psp-locations-opening-tpl').html();

			// append new opening
			if(contentDom.find('.psp-form-row').size() > 0){
				lastRow.after(htmlBlock);
			}else{
				contentDom.append(htmlBlock);
				contentDom.find('#psp-opening-no-items').hide();
			}

			self.regenerateListIds();
		}

	};
	
	var googleMap = {
		
		init: function() {
			var self = this;

			self.isDebug = false;
			 //[51.508742,-0.120850] [51.508742,-0.120850] [-34.397, 150.644] [-25.363882,131.044922]
			self.debugMap = [0,0];

			self.geocoder = '';
			self.map = '';
			self.marker = '';
			self.zoom = 12;
			self.geostatus = jQuery('.psp-geocode-status');
			
			self.map_init();

			jQuery('a.psp-geocode-verify').bind('click', function(e) {
				e.preventDefault();
				self.map_check();
			});
		},

		get_address: function() {
			
			var address = [];
			if ( jQuery("#address").val() != '' )
				address.push( jQuery("#address").val() );
			//if ( jQuery("#unit").val() != '' )
			//	address.push( jQuery("#unit").val() );
			if ( jQuery("#city").val() != '' )
				address.push( jQuery("#city").val() + ', ' );
			if ( jQuery("#state").val() != '' )
				address.push( jQuery("#state").val() );
			if ( jQuery("#zipcode").val() != '' )
				address.push( jQuery("#zipcode").val() );
			if ( jQuery("#country").val() != '' )
				address.push( jQuery("#country").val() );
			address = address.join(' ');
			address = jQuery.trim(address);

			return address;
		},

		map_view: function( callback, latlng ) {
			var self = this;

			var t;
			var startWhenVisible = function (){
				if ( jQuery('#psp-map-canvas').is(':visible') ) {

					window.clearInterval(t);

					jQuery.isFunction( callback )
						callback.call( self, latlng );
					return true;
				}
				return false;
			};
			if ( !startWhenVisible() ) {
				// verify every 100 miliseconds till display!
				t = window.setInterval( function(){ startWhenVisible(); }, 100 );
			}
		},

		map_draw: function( latlng ) {
			var self = this;
			
			var mapTitle = jQuery('#map_name').val() || 'Business address!';		

			var mapOptions = {
				zoom: self.zoom,
				center: latlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
			if ( !self.map )
				self.map = new google.maps.Map( document.getElementById("psp-map-canvas"), mapOptions );
			else
				self.map.setCenter( latlng );

			if ( self.marker )
				self.marker.setMap(null);

			self.marker = new google.maps.Marker({
				map: self.map,
				position: latlng,
				title: mapTitle
				//,icon: icon
              	//,html: ''
			});
			
			var address = self.get_address();
			var contentString =	'<div id="content" style="height:100%;"> \
					<div id="siteNotice"> \
					</div> \
					<h1 id="firstHeading" class="firstHeading"><strong>' + mapTitle + '</strong></h1> \
					<div id="bodyContent"><p>' + address + '</p> \
					</div> \
				</div>';
			var infowindow = new google.maps.InfoWindow({
				content: contentString
			});

			// infowindow will be open on marker mouseover
			google.maps.event.addListener(self.marker, "click", function() {
				//infowindow.open( self.map, self.marker );
				infowindow.open( self.marker.getMap(), self.marker );
			});
			//infowindow.open( self.map, self.marker );
			infowindow.open( self.marker.getMap(), self.marker );

			//google.maps.event.trigger(map, 'resize');
			//map.setCenter(myLatlng);

			if ( self.marker ) {

				self.geostatus.html( '<span class="success">' + 'Google Map successfully drawn.' + '</span>' );
				self.geostatus.show();
				return true;
			} else {
				
				self.geostatus.html( '<span class="error">' + 'Google Map cound\'t be drawn.' + '</span>' );
				self.geostatus.show();
				return false;
			}
		},
		
		map_init: function() {
			var self = this;

			self.geocoder = new google.maps.Geocoder();
			
			var lat = jQuery('#map_latitude').val(), lng = jQuery('#map_longitude').val();

			if ( self.isDebug ) {
				lat = self.debugMap[0];
				lng = self.debugMap[1];
			}
				
			if ( jQuery.trim( lat ) != '' && jQuery.trim( lng ) != '' ) ;
			else
				return self.map_check();
				
			if ( jQuery.trim( lat ) == '' || jQuery.trim( lng ) == '' ) {

				jQuery('#psp-map-canvas').hide();
				self.geostatus.html( '<span class="show">' + 'You didn\'t enter the address yet.' + '</span>' );
				self.geostatus.show();
				return false;
			}

			var latlng = new google.maps.LatLng( lat, lng );

			jQuery('#psp-map-canvas').show();
			self.map_view( self.map_draw, latlng );
		},
		
		map_check: function() {
			var self = this;

			var address = self.get_address();

			if ( address == '' ) {

				jQuery('#psp-map-canvas').hide();
				self.geostatus.html( '<span class="show">' + 'You didn\'t enter the address yet.' + '</span>' );
				self.geostatus.show();

				return false;
			}

			self.geocoder.geocode( { 'address': address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {

					var latlng = results[0].geometry.location;

					jQuery('#psp-map-canvas').show();
					self.map_view( self.map_draw, latlng );

					jQuery("#map_latitude").val( results[0].geometry.location.lat() );
					jQuery("#map_longitude").val( results[0].geometry.location.lng() );

					return true;
				} else {

					if ( self.marker )
						self.marker.setMap(null);

					// reset geocodes!
					jQuery("#map_latitude").val('');
					jQuery("#map_longitude").val('');

					jQuery('#psp-map-canvas').hide();
					self.geostatus.html( '<span class="error">Google response (error): ' + status + '</span>' );
					self.geostatus.show();

					return false;
				}
			} );
		}
		
	};

	// :: MISC
	var misc = {

		hasOwnProperty: function(obj, prop) {
			var proto = obj.__proto__ || obj.constructor.prototype;
			return (prop in obj) &&
			(!(prop in proto) || proto[prop] !== obj[prop]);
		},

		isNormalInteger: function(str, positive) {
			//return /^\+?(0|[1-9]\d*)$/.test(str);
			return /^(0|[1-9]\d*)$/.test(str);
		}

	};

	// external usage
	return {
    }
})(jQuery);