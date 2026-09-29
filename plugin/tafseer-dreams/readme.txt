=== Tafseer Dream Interpretation ===
Requires at least: 5.8
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Dream interpretation grounded in the classical books of Ibn Sirin, Al-Nabulsi and others.

== Installation ==

1. Plugins → Add New → Upload Plugin, choose tafseer-dreams.zip, then Activate.
2. Edit the page where the form should appear and add the shortcode:

   [tafseer_dream]

   In the block editor use a "Shortcode" block; in Elementor use the "Shortcode" widget.
   Your own content can go above and below it.
3. Optional: Settings → Tafseer to change the backend URL, set an API key or change the rate limit.

== How it works ==

The form and the result are both shown by the one shortcode: after submitting, the result
replaces the form in place, and "New dream" / "Edit dream" bring the form back.

The browser sends the dream to /wp-json/tafseer/v1/dreams on this site; WordPress forwards it
to the backend and returns the answer. The backend address is never exposed to visitors.

== Notes ==

* An interpretation takes 10–20 seconds. If the host limits PHP requests to less time than
  that, ask the host to raise max_execution_time.
* If a caching or security plugin blocks or caches the REST API, exclude /wp-json/tafseer/.
* The rate limit counts requests per visitor IP. Behind Cloudflare or another proxy, every
  visitor may share one IP unless the host restores the real visitor IP.
* Only one [tafseer_dream] per page.

== Changelog ==

= 1.0.0 =
* First release.
