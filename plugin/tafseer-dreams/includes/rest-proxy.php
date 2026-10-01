<?php
/**
 * POST /wp-json/tafseer/v1/dreams — used by every Tafseer shortcode.
 *
 * The browser talks to WordPress and WordPress talks to the backend, so the site's
 * HTTPS pages never call the plain-HTTP backend directly (mixed content) and the
 * backend needs no CORS setup.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Request body fields the backend accepts. Anything else is dropped.
const TAFSEER_FIELDS = array(
	'dream',
	'source',
	'gender',
	'marital_status',
	'age_range',
	'waking_state',
	'pain',
	'recurring',
	'dream_time',
	'istikhara',
	'clarity',
	'state_before_sleep',
	'place_familiar',
);

const TAFSEER_SOURCES = array( 'all', 'ibn_sirin', 'nabulsi', 'ibn_shaheen', 'tabir', 'sadiq', 'freud' );

// Same as the backend's limit; checked here so the visitor gets a readable message.
const TAFSEER_MAX_DREAM_LENGTH = 10000;

add_action( 'rest_api_init', 'tafseer_register_route' );
function tafseer_register_route() {
	register_rest_route( 'tafseer/v1', '/dreams', array(
		'methods'             => 'POST',
		'callback'            => 'tafseer_proxy_dream',
		// A public form. Page caches serve stale nonces, so no nonce check.
		'permission_callback' => '__return_true',
	) );
}

// Same shape the backend uses for errors, so the frontend reads one format.
function tafseer_error( $message, $status ) {
	return new WP_REST_Response( array( 'detail' => $message ), $status );
}

function tafseer_proxy_dream( WP_REST_Request $request ) {
	$params = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		return tafseer_error( 'Invalid request.', 400 );
	}

	$body = array();
	foreach ( TAFSEER_FIELDS as $field ) {
		if ( isset( $params[ $field ] ) && is_string( $params[ $field ] ) && '' !== trim( $params[ $field ] ) ) {
			$body[ $field ] = sanitize_textarea_field( $params[ $field ] );
		}
	}

	if ( ! isset( $body['source'] ) || ! in_array( $body['source'], TAFSEER_SOURCES, true ) ) {
		return tafseer_error( 'Please choose an authority.', 400 );
	}

	if ( empty( $body['dream'] ) ) {
		return tafseer_error( 'Please write your dream first.', 400 );
	}
	if ( mb_strlen( $body['dream'] ) > TAFSEER_MAX_DREAM_LENGTH ) {
		return tafseer_error( sprintf( 'Please keep the dream under %d characters.', TAFSEER_MAX_DREAM_LENGTH ), 400 );
	}

	// The interpretation takes 10–20s; PHP must not give up before the backend does.
	if ( function_exists( 'set_time_limit' ) ) {
		@set_time_limit( 120 );
	}

	$response = wp_remote_post( TAFSEER_API_URL, array(
		'timeout' => 90,
		'headers' => array( 'Content-Type' => 'application/json' ),
		'body'    => wp_json_encode( $body ),
	) );

	if ( is_wp_error( $response ) ) {
		return tafseer_error( 'The interpretation service is unreachable.', 502 );
	}

	$status = (int) wp_remote_retrieve_response_code( $response );
	$data   = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( ! is_array( $data ) ) {
		return tafseer_error( 'The interpretation service returned an invalid response.', 502 );
	}

	$result = new WP_REST_Response( $data, $status ?: 502 );
	$result->header( 'Cache-Control', 'no-store' );
	return $result;
}
