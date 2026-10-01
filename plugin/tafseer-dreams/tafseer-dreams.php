<?php
/**
 * Plugin Name:       Tafseer Dream Interpretation
 * Description:       Dream interpretation from the classical books. Add [tafseer_dream] for every authority, or one shortcode per authority (see readme.txt).
 * Version:           2.1.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Tafseer
 * License:           GPL-2.0-or-later
 * Text Domain:       tafseer-dreams
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TAFSEER_VERSION', '2.1.0' );
define( 'TAFSEER_DIR', plugin_dir_path( __FILE__ ) );
define( 'TAFSEER_URL', plugin_dir_url( __FILE__ ) );
define( 'TAFSEER_API_URL', 'http://72.60.34.215/api/dreams' );

// Shortcode => the one authority it reads from, or '' to let the visitor choose.
const TAFSEER_SHORTCODES = array(
	'tafseer_dream'      => '',
	'tafseer_all'        => 'all',
	'tafseer_ibn_sirin'  => 'ibn_sirin',
	'tafseer_nabulsi'    => 'nabulsi',
	'tafseer_ibn_shahin' => 'ibn_shaheen',
	'tafseer_tabir'      => 'tabir',
	'tafseer_sadiq'      => 'sadiq',
	'tafseer_freud'      => 'freud',
);

require_once TAFSEER_DIR . 'includes/rest-proxy.php';

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

	// Load the styles in <head> when we can see a shortcode, to avoid a flash of unstyled form.
	// Page builders keep content elsewhere; the shortcode callback enqueues as a fallback.
	$post = get_post();
	if ( ! $post ) {
		return;
	}
	foreach ( array_keys( TAFSEER_SHORTCODES ) as $tag ) {
		if ( has_shortcode( $post->post_content, $tag ) ) {
			wp_enqueue_style( 'tafseer-app' );
			return;
		}
	}
}

add_action( 'init', 'tafseer_register_shortcodes' );
function tafseer_register_shortcodes() {
	foreach ( array_keys( TAFSEER_SHORTCODES ) as $tag ) {
		add_shortcode( $tag, 'tafseer_render_shortcode' );
	}
}

// WordPress passes the shortcode's tag as the third argument.
function tafseer_render_shortcode( $atts, $content, $tag ) {
	wp_enqueue_style( 'tafseer-app' );
	wp_enqueue_script( 'tafseer-app' );

	$source  = TAFSEER_SHORTCODES[ $tag ];
	$api_url = rest_url( 'tafseer/v1/dreams' );
	$uid     = wp_unique_id( 'tafseer-' );

	ob_start();
	include TAFSEER_DIR . 'templates/app.php';
	return ob_get_clean();
}
