<?php
/**
 * Plugin Name:       Tafseer Dream Interpretation
 * Description:       Dream interpretation from the classical books. Add the [tafseer_dream] shortcode to any page.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Tafseer
 * License:           GPL-2.0-or-later
 * Text Domain:       tafseer-dreams
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TAFSEER_VERSION', '1.0.0' );
define( 'TAFSEER_DIR', plugin_dir_path( __FILE__ ) );
define( 'TAFSEER_URL', plugin_dir_url( __FILE__ ) );
define( 'TAFSEER_SHORTCODE', 'tafseer_dream' );

// Where the backend lives. Can be changed under Settings → Tafseer.
define( 'TAFSEER_DEFAULT_API_URL', 'http://72.60.34.215/api/dreams' );

require_once TAFSEER_DIR . 'includes/settings.php';
require_once TAFSEER_DIR . 'includes/rest-proxy.php';

function tafseer_option( $key ) {
	$defaults = array(
		'api_url'    => TAFSEER_DEFAULT_API_URL,
		'api_key'    => '',
		'rate_limit' => 20,
	);
	$options = get_option( 'tafseer_options', array() );
	return isset( $options[ $key ] ) && '' !== $options[ $key ] ? $options[ $key ] : $defaults[ $key ];
}

add_action( 'wp_enqueue_scripts', 'tafseer_register_assets' );
function tafseer_register_assets() {
	wp_register_style(
		'tafseer-fonts',
		'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;500;600;700&family=Lora:wght@500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap',
		array(),
		null
	);
	wp_register_style( 'tafseer-app', TAFSEER_URL . 'assets/css/tafseer.css', array( 'tafseer-fonts' ), TAFSEER_VERSION );
	wp_register_script( 'tafseer-result', TAFSEER_URL . 'assets/js/result.js', array(), TAFSEER_VERSION, true );
	wp_register_script( 'tafseer-app', TAFSEER_URL . 'assets/js/app.js', array( 'tafseer-result' ), TAFSEER_VERSION, true );
	wp_localize_script( 'tafseer-app', 'TafseerConfig', array(
		'apiUrl' => esc_url_raw( rest_url( 'tafseer/v1/dreams' ) ),
	) );

	// Load the styles in <head> when we can see the shortcode, to avoid a flash of unstyled form.
	// Page builders keep content elsewhere; the shortcode callback enqueues as a fallback.
	$post = get_post();
	if ( $post && has_shortcode( $post->post_content, TAFSEER_SHORTCODE ) ) {
		wp_enqueue_style( 'tafseer-app' );
	}
}

add_shortcode( TAFSEER_SHORTCODE, 'tafseer_render_shortcode' );
function tafseer_render_shortcode() {
	wp_enqueue_style( 'tafseer-app' );
	wp_enqueue_script( 'tafseer-app' );

	ob_start();
	include TAFSEER_DIR . 'templates/app.php';
	return ob_get_clean();
}

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'tafseer_action_links' );
function tafseer_action_links( $links ) {
	array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=tafseer' ) ) . '">' . esc_html__( 'Settings', 'tafseer-dreams' ) . '</a>' );
	return $links;
}
