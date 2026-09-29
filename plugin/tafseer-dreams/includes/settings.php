<?php
/**
 * Settings → Tafseer
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_menu', 'tafseer_add_settings_page' );
function tafseer_add_settings_page() {
	add_options_page( 'Tafseer', 'Tafseer', 'manage_options', 'tafseer', 'tafseer_render_settings_page' );
}

add_action( 'admin_init', 'tafseer_register_settings' );
function tafseer_register_settings() {
	register_setting( 'tafseer', 'tafseer_options', array(
		'type'              => 'array',
		'sanitize_callback' => 'tafseer_sanitize_options',
		'default'           => array(),
	) );

	add_settings_section( 'tafseer_api', 'Backend', '__return_false', 'tafseer' );

	add_settings_field( 'api_url', 'API URL', 'tafseer_field_text', 'tafseer', 'tafseer_api', array(
		'key'         => 'api_url',
		'type'        => 'url',
		'description' => 'The dream interpretation endpoint. Default: ' . TAFSEER_DEFAULT_API_URL,
	) );
	add_settings_field( 'api_key', 'API key', 'tafseer_field_text', 'tafseer', 'tafseer_api', array(
		'key'         => 'api_key',
		'type'        => 'password',
		'description' => 'Optional. Sent to the backend as the X-Tafseer-Key header.',
	) );
	add_settings_field( 'rate_limit', 'Requests per visitor per hour', 'tafseer_field_text', 'tafseer', 'tafseer_api', array(
		'key'         => 'rate_limit',
		'type'        => 'number',
		'description' => 'Limits how often one IP address can ask for an interpretation. 0 turns the limit off.',
	) );
}

function tafseer_sanitize_options( $input ) {
	return array(
		'api_url'    => isset( $input['api_url'] ) ? esc_url_raw( trim( $input['api_url'] ) ) : '',
		'api_key'    => isset( $input['api_key'] ) ? sanitize_text_field( $input['api_key'] ) : '',
		'rate_limit' => isset( $input['rate_limit'] ) ? max( 0, (int) $input['rate_limit'] ) : 20,
	);
}

function tafseer_field_text( $args ) {
	$key = $args['key'];
	printf(
		'<input type="%1$s" name="tafseer_options[%2$s]" id="tafseer-%2$s" value="%3$s" class="%4$s" %5$s>',
		esc_attr( $args['type'] ),
		esc_attr( $key ),
		esc_attr( tafseer_option( $key ) ),
		'number' === $args['type'] ? 'small-text' : 'regular-text',
		'number' === $args['type'] ? 'min="0" step="1"' : 'autocomplete="off"'
	);
	printf( '<p class="description">%s</p>', esc_html( $args['description'] ) );
}

function tafseer_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1>Tafseer Dream Interpretation</h1>
		<p>Add the form to any page or post with this shortcode:</p>
		<p><code>[<?php echo esc_html( TAFSEER_SHORTCODE ); ?>]</code></p>
		<form action="options.php" method="post">
			<?php
			settings_fields( 'tafseer' );
			do_settings_sections( 'tafseer' );
			submit_button();
			?>
		</form>
	</div>
	<?php
}
