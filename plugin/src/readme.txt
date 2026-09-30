=== {{NAME}} ===
Requires at least: 5.8
Requires PHP: 7.4
Stable tag: {{VERSION}}
License: GPLv2 or later

{{DESCRIPTION}}

== Installation ==

1. Plugins → Add New → Upload Plugin, choose {{SLUG}}.zip, then Activate.
2. Edit the page where the form should appear and add the shortcode:

   [{{SHORTCODE}}]

   In the block editor use a "Shortcode" block; in Elementor use the "Shortcode" widget.
   Your own content can go above and below it.

== How it works ==

The form and the result are both shown by the one shortcode: after submitting, the result
replaces the form in place, and "New dream" / "Edit dream" bring the form back.

The browser sends the dream to /wp-json/tafseer/v1/{{ROUTE}} on this site; WordPress forwards it
to the backend and returns the answer. The backend address is never exposed to visitors.

Any of the Tafseer plugins can be active together, and their shortcodes can share a page.

== Notes ==

* An interpretation takes 10–20 seconds. If the host limits PHP requests to less time than
  that, ask the host to raise max_execution_time.
* If a caching or security plugin blocks or caches the REST API, exclude /wp-json/tafseer/.

== Changelog ==

= {{VERSION}} =
* One plugin per authority, plus one with every authority.
* The form only: no intro, footer or page background.
* No settings page; the backend address is built in.
