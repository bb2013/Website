<?php
/*
* Define class pspSocialStats
* Make sure you skip down to the end of this file, as there are a few
* lines of code that are very important.
*/
!defined('ABSPATH') and exit;
if (class_exists('pspSocialStats') != true) {
    class pspSocialStats
    {
        /*
        * Some required plugin information
        */
        const VERSION = '1.0';

        /*
        * Store some helpers config
        */
		public $the_plugin = null;

		private $module_folder = '';
		private $module = '';

		static protected $_instance;
		

		/*
        * Required __construct() function that initalizes the AA-Team Framework
        */
        public function __construct()
        {
        	global $psp;

        	$this->the_plugin = $psp;
			$this->module_folder = $this->the_plugin->cfg['paths']['plugin_dir_url'] . 'modules/Social_Stats/';
			$this->module = $this->the_plugin->cfg['modules']['Social_Stats'];
			
			$this->plugin_settings = $this->the_plugin->get_theoption( $this->the_plugin->alias . '_social' );
			
			if (is_admin()) {
	            add_action('admin_menu', array( &$this, 'adminMenu' ));
			}
			
			$this->init();
			
			// social sharing
			if ( $this->the_plugin->is_admin !== true )
				$this->init_social_sharing();
        }
        

        /**
         * Head Filters & Init!
         *
         */
		public function init() {
		}
		
		/**
		 * Social Sharing
		 *
		 */
		public function init_social_sharing() {

			// social sharing module
			require_once( $this->the_plugin->cfg['paths']['plugin_dir_path'] . 'aa-framework/utils/social_sharing.php' );
			$ssh = new pspSocialSharing( $this->the_plugin );
		}
		
		
		/**
	    * Hooks
	    */
	    static public function adminMenu()
	    {
	       self::getInstance()
	    		->_registerAdminPages();
	    }

	    /**
	    * Register plug-in module admin pages and menus
	    */
		protected function _registerAdminPages()
    	{
    		if ( $this->the_plugin->capabilities_user_has_module('Social_Stats') ) {
	    		add_submenu_page(
	    			$this->the_plugin->alias,
	    			$this->the_plugin->alias . " " . __('Social Stats', 'psp'),
		            __('Social Stats', 'psp'),
		            'read',
		           	$this->the_plugin->alias . "_Social_Stats",
		            array($this, 'display_index_page')
		        );
    		}

			return $this;
		}
		
		public function display_meta_box()
		{
			$this->printBoxInterface();
		}

		public function display_index_page()
		{
			$this->printBaseInterface();
		}

		/*
		* printBaseInterface, method
		* --------------------------
		*
		* this will add the base DOM code for you options interface
		*/
		private function printBaseInterface()
		{
			$socialServices = $this->the_plugin->social_get_allowed_providers();
?>
		<script type="text/javascript" src="<?php echo $this->module_folder;?>app.class.js" ></script>
		
		<div class="<?php echo $this->the_plugin->alias; ?>">
			
			<div class="<?php echo $this->the_plugin->alias; ?>-content">
				<?php
				// show the top menu
				pspAdminMenu::getInstance()->make_active('off_page_optimization|Social_Stats')->show_menu();
				?>
				
				<!-- Content -->
				<section class="<?php echo $this->the_plugin->alias; ?>-main">
					
					<?php 
					echo psp()->print_section_header(
						$this->module['Social_Stats']['menu']['title'],
						$this->module['Social_Stats']['description'],
						$this->module['Social_Stats']['help']['url']
					);
					?>
					
					<div class="panel panel-default <?php echo $this->the_plugin->alias; ?>-panel psp-social-stats">
						
						<!-- Main loading box -->
						<div id="psp-main-loading">
							<div id="psp-loading-overlay"></div>
							<div id="psp-loading-box">
								<div class="psp-loading-text"><?php _e('Loading', 'psp');?></div>
								<div class="psp-meter psp-animate" style="width:86%; margin: 34px 0px 0px 7%;"><span style="width:100%"></span></div>
							</div>
						</div>
						
						<div class="panel-heading psp-panel-heading">
							<h2><?php _e('Social Stats of your pages', 'psp');?></h2>
						</div>
	
						<div class="panel-body <?php echo $this->the_plugin->alias; ?>-panel-body">
							
							<!-- Container -->
							<div class="psp-container clearfix">
			
								<!-- Main Content Wrapper -->
								<div id="psp-content-wrap" class="clearfix">
									
	                        		<div class="psp-panel">
	                        			
										<div class="psp-panel-content">
											<form class="psp-form" id="1" action="#save_with_ajax">
												<div class="psp-form-row psp-table-ajax-list" id="psp-table-ajax-response">
												<?php
												$columns = array(
													'id'		=> array(
														'th'	=> __('ID', 'psp'),
														'td'	=> '%ID%',
														'width' => '40'
													),
		
													'title'		=> array(
														'th'	=> __('Title', 'psp'),
														'td'	=> '%title%',
														'align' => 'left'
													)
												);
												
												if ( ! empty($socialServices) ) {
													foreach ($socialServices as $ssKey => $ssVal) {
														if (1) {
															$columns["ss_{$ssKey}"] = array(
																'th'	=> $ssVal['title'],
																'td'	=> "%ss_{$ssKey}%",
																'width' => '55'
															);
														}
													}
												}
												
												$columns['date'] = array(
													'th'	=> __('Date', 'psp'),
													'td'	=> '%date%',
													'width' => '120'
												);
												
												pspAjaxListTable::getInstance( $this->the_plugin )
													->setup(array(
														'id' 				=> 'pspSocialStats',
														'show_header' 		=> true,
														'show_header_buttons' => true,
														'items_per_page' 	=> '10',
														'post_statuses' 	=> 'all',
														'columns'			=> $columns,
														'mass_actions'		=> false
													))
													->print_html();
									            ?>
									            </div>
								            </form>
					            		</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
<?php
		}

		public function __socialstats_scripts( $socialServices=array() ) {
			if ( count($socialServices) > 220 ) {
				foreach ($socialServices as $key => $value){
					if( $value == 'twitter' ){
						echo '<script type="text/javascript" src="http://platform.twitter.com/widgets.js?' . ( time() ) . '"></script>';
					}
					elseif( $value == 'google' ){
						echo '<script type="text/javascript" src="http://apis.google.com/js/plusone.js?' . ( time() ) . '"></script>';
					}
					elseif( $value == 'digg' ){
					?>
						<script type="text/javascript">
							(function() {
							  var s = document.createElement('SCRIPT'), s1 = document.getElementsByTagName('SCRIPT')[0];
							  s.type = 'text/javascript';
							  s.async = true;
							  s.src = 'http://widgets.digg.com/buttons.js';
							  s1.parentNode.insertBefore(s, s1);
							})();
						</script>
					<?php
					}
					elseif( $value == 'linkedin' ){
						echo '<script type="text/javascript" src="http://platform.linkedin.com/in.js?' . ( time() ) . '"></script>';
					}

					elseif( $value == 'stumbleupon' ){
					?>
						<script type="text/javascript">
						  (function() {
						    var li = document.createElement('script'); li.type = 'text/javascript'; li.async = true;
						    li.src = ('https:' == document.location.protocol ? 'https:' : 'http:') + '//platform.stumbleupon.com/1/widgets.js';
						    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(li, s);
						  })();
						</script>

					<?php
					}
				}
			}
		}


		/**
	    * Singleton pattern
	    *
	    * @return pspSocialStats Singleton instance
	    */
	    static public function getInstance()
	    {
	        if (!self::$_instance) {
	            self::$_instance = new self;
	        }

	        return self::$_instance;
	    }
    }
}

// Initialize the pspSocialStats class
//$pspSocialStats = new pspSocialStats();
$pspSocialStats = pspSocialStats::getInstance();