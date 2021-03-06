/*
Document   :  PageSpeed Insights
Author     :  Andrei Dinca, AA-Team http://codecanyon.net/user/AA-Team
*/
// Initialization and events code for the app
pspPageSpeedInsights = (function ($) {
    "use strict";

    // public
    var debug_level = 0;
    var maincontainer = null;
    var loading = null;
    var IDs = [];
    var loaded_page = 0;
    var detail_page = null;
    var selected_element = [];

	// init function, autoload
	(function init() {
		// load the triggers
		$(document).ready(function(){
			// load the checkbox styling plugin
			/*$('input').iCheck({
			    checkboxClass: 'icheckbox_minimal-blue',
			    radioClass: 'iradio_minimal-blue'
			});*/

			maincontainer = $(".psp-main");
			loading = maincontainer.find("#psp-main-loading");
			detail_page = maincontainer.find("#psp-pagespeed-detail");

			triggers();
		});
	})();
	
	function toogleRuleDetails( that )
	{
		var row = that.parent('td'),
			details_container = row.find('.psp-desc-complete');
			
		// if not open, make close action
		if( !that.hasClass('open') ){
			details_container.slideDown('fast');
			that.addClass('open');		
		}
		
		// close the container
		else{
			details_container.slideUp('fast');
			that.removeClass('open');
		}
	}
	
	function viewReport( that )
	{
		var row = that.parents("tr").eq(0),
			id 	= row.data('itemid');
		
		pspFreamwork.to_ajax_loader('Loading...');
		
		$.post(ajaxurl, {
			'action' 		: 'pspPageSpeedInsightsRequest',
			'sub_actions'	: 'viewSpeedRaportById',
			'id'			: id,
			'debug_level'	: debug_level
		}, function(response) {
			if( response.viewSpeedRaportById.status == 'valid'){
				
				if ( response.viewSpeedRaportById.mobile_score > 0 ) {
					do_progress_bar( 
						row.find('.psp_the_mobile_score'),
						response.viewSpeedRaportById.mobile_score
					);
				}
				if ( response.viewSpeedRaportById.desktop_score > 0 ) {
					do_progress_bar( 
						row.find('.psp_the_desktop_score'),
						response.viewSpeedRaportById.desktop_score
					);
				}

				detail_page.find("#psp-pagespeed-ajaxresponse").html( response.viewSpeedRaportById.html );
				detail_page.show();
				pspFreamwork.to_ajax_loader_close();

				$('html, body').animate({
			        scrollTop: 0
			    }, 1000);
			}
			pspFreamwork.to_ajax_loader_close();
		}, 'json'); 
	}
	
	function closeReportPage( that )
	{
		detail_page.fadeOut('fast', function(){
			detail_page.find("#psp-pagespeed-ajaxresponse").html( '' );
		});
	}
	
	function runSpeedCheck( that, callback )
	{
		var row = that.parents("tr").eq(0),
			id 	= row.data('itemid');
		row_loading(row, 'show');
		
		jQuery.post(ajaxurl, {
			'action' 		: 'pspPageSpeedInsightsRequest',
			'sub_actions'	: 'checkPage',
			'id'			: id,
			'debug_level'	: debug_level
		}, function(response) {
			if( response.checkPage.status == 'valid'){

				if ( response.checkPage.mobile_score > 0 ) {
					do_progress_bar(
						row.find('.psp_the_mobile_score'),
						response.checkPage.mobile_score
					);
				}
				if ( response.checkPage.desktop_score > 0 ) {
					do_progress_bar(
						row.find('.psp_the_desktop_score'),
						response.checkPage.desktop_score
					);
				}

				row_loading(row, 'hide');

				if( response.checkPage.desktop_score > 0 ){
					if( typeof callback == 'function' ){
						callback();
					}
				}
			}
			
			if ( response.checkPage.mobile_score <= 0 && response.checkPage.desktop_score <= 0 ) {
				alert(response.checkPage.msg);
			}
			row_loading(row, 'hide');

		}, 'json');
	}
	
	function changeTab( that )
	{
		if( !that.hasClass('on') ){
			var rel = that.data('rel');
			
			// hide all tabs, and show the clicked one
			maincontainer.find('.psp-pagespeed-tab').hide();
			maincontainer.find('#psp-pagespeed-page-' + rel).show();
			
			// remove on class from top tabs, and add on clicked one
			maincontainer.find(".psp-tab-item.on").removeClass('on');
			that.addClass('on');
		}
	}
	
	function tailCheckPages()
	{
		if( selected_element.length > 0 ){
			var curr_element = selected_element[0];
			runSpeedCheck( curr_element.find('.psp-do_item_pagespeed_test'), function(){
				selected_element.splice(0, 1);
				
				tailCheckPages();
			});
		}
	}
	
	function massTestPages()
	{
		// reset this array for be sure
		selected_element = [];
		// find all selected items 
		maincontainer.find('.psp-item-checkbox:checked').each(function(){
			var that = $(this),
				row = that.parents('tr').eq(0);
			selected_element.push( row );
		});
		
		tailCheckPages();
	}
	
	function triggers()
	{
		maincontainer.on('click', 'a.psp-criteria', function(e){
			e.preventDefault();
			
			toogleRuleDetails( $(this) );
		});
		
		maincontainer.on('click', '.psp-do_item_pagespeed_test', function(e){
			e.preventDefault();
			
			runSpeedCheck( $(this) );
		});
		
		maincontainer.on('click', '.psp-do_item_view_report', function(e){
			e.preventDefault();
			
			viewReport( $(this) );
		});
		
		maincontainer.on('click', 'a.psp-close-page-detail', function(e){
			e.preventDefault();
			
			closeReportPage( $(this) );
		});
		
		maincontainer.on('click', '.psp-tab-item', function(e){
			e.preventDefault();
			
			changeTab( $(this) );
		});
		
		maincontainer.on('click', '#psp-do_speed_test_mass', function(e){
			e.preventDefault();
			
			massTestPages( $(this) );
		});
	}

	function row_loading( row, status )
	{
		if( status == 'show' ){
			if( row.size() > 0 ){
				if( row.find('.psp-row-loading-marker').size() == 0 ){
					var row_loading_box = $('<div class="psp-row-loading-marker"><div class="psp-row-loading"><div class="psp-meter psp-animate"><span style="width:100%"></span></div></div></div>')
					row_loading_box.find('div.psp-row-loading').css({
						'width': row.width(),
						'height': row.height()
					});

					row.find('td').eq(0).append(row_loading_box);
				}
				row.find('.psp-row-loading-marker').fadeIn('fast');
			}
		}else{
			row.find('.psp-row-loading-marker').fadeOut('fast');
		}
	}

	function do_progress_bar( row, score, score_show ) {
		var __progress 		= $('<div class="psp-progress" style="margin-right: 4px;"><div class="psp-progress-bar"></div></div>'),
			progress_bar 	= __progress.find(".psp-progress-bar");

		var score 		= score || 0,
			score_show 	= typeof score_show !== 'undefined' ? score_show : score;

		//var progress_bar = row.find(".psp-progress-bar");
		//progress_bar.attr('class', 'psp-progress-bar');

		//var width = 100; //width = progress_bar.width();
		//width = parseFloat( parseFloat( parseFloat( score / 100 ).toFixed(2) ) * width ).toFixed(1);

		var size_class = 'size_';

		if ( score >= 20 && score < 40 ){
			size_class += '20_40';
		}
		else if ( score >= 40 && score < 60 ){
			size_class += '40_60';
		}
		else if( score >= 60 && score < 80 ){
			size_class += '60_80';
		}
		else if( score >= 80 && score <= 100 ){
			size_class += '80_100';
		}
		else{
			size_class += '0_20';
		}

		progress_bar
		.addClass( size_class )
		.width( score + '%' );

		//row.find('.psp-progress').find(".psp-progress-score").text( score_show + "%" );
		row.html( __progress );
	}

	// external usage
	return {
    }
})(jQuery);