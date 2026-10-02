<?php
/**
 * Plugin Name:       Tafseer Dream Interpretation
 * Description:       Dream interpretation from the classical books. Add [tafseer_dream] for every authority, or one shortcode per authority (see readme.txt).
 * Version:           2.2.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Tafseer
 * License:           GPL-2.0-or-later
 * Text Domain:       tafseer-dreams
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TAFSEER_VERSION', '2.2.0' );
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

// The visitor's saved dreams, read from their own browser.
const TAFSEER_MY_DREAMS = 'tafseer_my_dreams';

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
	wp_register_script( 'tafseer-store', TAFSEER_URL . 'assets/js/store.js', array(), TAFSEER_VERSION, true );
	wp_register_script( 'tafseer-app', TAFSEER_URL . 'assets/js/app.js', array( 'tafseer-result', 'tafseer-store' ), TAFSEER_VERSION, true );
	wp_register_script( 'tafseer-my-dreams', TAFSEER_URL . 'assets/js/my-dreams.js', array( 'tafseer-result', 'tafseer-store' ), TAFSEER_VERSION, true );

	// Load the styles in <head> when we can see a shortcode, to avoid a flash of unstyled form.
	// Page builders keep content elsewhere; the shortcode callback enqueues as a fallback.
	$post = get_post();
	if ( ! $post ) {
		return;
	}
	foreach ( array_merge( array_keys( TAFSEER_SHORTCODES ), array( TAFSEER_MY_DREAMS ) ) as $tag ) {
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
	add_shortcode( TAFSEER_MY_DREAMS, 'tafseer_render_my_dreams' );
}

// WordPress passes the shortcode's tag as the third argument.
// [tafseer_dream my_dreams="/my-dreams/"] sets the "My dreams" link; by default it is found by itself.
function tafseer_render_shortcode( $atts, $content, $tag ) {
	wp_enqueue_style( 'tafseer-app' );
	wp_enqueue_script( 'tafseer-app' );

	$atts      = shortcode_atts( array( 'my_dreams' => '' ), $atts, $tag );
	$source    = TAFSEER_SHORTCODES[ $tag ];
	$api_url   = rest_url( 'tafseer/v1/dreams' );
	$my_dreams = '' !== $atts['my_dreams'] ? $atts['my_dreams'] : tafseer_my_dreams_url();
	$uid       = wp_unique_id( 'tafseer-' );

	ob_start();
	include TAFSEER_DIR . 'templates/app.php';
	return ob_get_clean();
}

function tafseer_render_my_dreams() {
	wp_enqueue_style( 'tafseer-app' );
	wp_enqueue_script( 'tafseer-my-dreams' );

	$uid = wp_unique_id( 'tafseer-' );

	ob_start();
	include TAFSEER_DIR . 'templates/my-dreams.php';
	return ob_get_clean();
}

// The published page holding [tafseer_my_dreams], or '' when there is none.
// Looked up once and cached; saving any page clears the cache.
function tafseer_my_dreams_url() {
	$page_id = get_transient( 'tafseer_my_dreams_page' );
	if ( false === $page_id ) {
		$query   = new WP_Query( array(
			'post_type'              => array( 'page', 'post' ),
			'post_status'            => 'publish',
			's'                      => TAFSEER_MY_DREAMS,
			'posts_per_page'         => 10,
			'fields'                 => 'ids',
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
		) );
		$page_id = 0;
		foreach ( $query->posts as $id ) {
			// The search is loose; make sure the shortcode is really there.
			if ( has_shortcode( get_post_field( 'post_content', $id ), TAFSEER_MY_DREAMS ) ) {
				$page_id = $id;
				break;
			}
		}
		set_transient( 'tafseer_my_dreams_page', $page_id, DAY_IN_SECONDS );
	}
	return $page_id ? get_permalink( $page_id ) : '';
}

add_action( 'save_post', 'tafseer_forget_my_dreams_page' );
add_action( 'deleted_post', 'tafseer_forget_my_dreams_page' );
function tafseer_forget_my_dreams_page() {
	delete_transient( 'tafseer_my_dreams_page' );
}
