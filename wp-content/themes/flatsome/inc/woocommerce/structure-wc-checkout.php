<?php

// Fix Cart Totals Title style
if(!function_exists('flatsome_woocommerce_before_cart_totals')) {
  function flatsome_woocommerce_before_cart_totals(){  ?>
          <table cellspacing="0">
          <thead>
              <tr>
                  <th class="product-name" colspan="2" style="border-width:3px;"><?php _e( 'Cart totals', 'woocommerce' ); ?></th>
              </tr>
          </thead>
          </table>
  <?php }
}
add_action( 'woocommerce_before_cart_totals', 'flatsome_woocommerce_before_cart_totals' );


// Custom Thank You Html
function flatsome_thank_you_html(){
    echo get_theme_mod('html_thank_you');
}
add_action( 'woocommerce_thankyou', 'flatsome_thank_you_html', 100);

// Add HTML Checkout sidebar
if(!function_exists('flatsome_html_checkout_sidebar')) {
  function flatsome_html_checkout_sidebar(){
     $content = flatsome_option('html_checkout_sidebar');
     echo '<div class="html-checkout-sidebar pt-half">'.do_shortcode($content).'</div>';
  }
}
add_action('woocommerce_checkout_after_order_review', 'flatsome_html_checkout_sidebar');

//Fix Safari autoscroll issue

function flatsome_disable_autofocus_shipping_firstname($fields) {
  if(isset($fields['billing'])) $fields['billing']['billing_first_name']['autofocus'] = false;
  if(isset($fields['shipping'])) $fields['shipping']['shipping_first_name']['autofocus'] = false;
  return $fields;
}
add_filter('woocommerce_checkout_fields', 'flatsome_disable_autofocus_shipping_firstname');
