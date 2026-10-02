=== Tafseer Dream Interpretation ===
Requires at least: 5.8
Requires PHP: 7.4
Stable tag: 2.2.0
License: GPLv2 or later

Dream interpretation grounded in the classical books of Ibn Sirin, Al-Nabulsi and others.

== Installation ==

1. Plugins → Add New → Upload Plugin, choose tafseer-dreams.zip, then Activate.
2. Edit the page where the form should appear and add one of the shortcodes below.
   In the block editor use a "Shortcode" block; in Elementor use the "Shortcode" widget.
   Your own content can go above and below it.

== Shortcodes ==

[tafseer_dream]       The visitor chooses: all the books, or one authority
[tafseer_all]         All the classical books together
[tafseer_ibn_sirin]   Ibn Sirin
[tafseer_nabulsi]     Al-Nabulsi
[tafseer_ibn_shahin]  Ibn Shahin
[tafseer_tabir]       Ta'bir al-Ru'ya
[tafseer_sadiq]       Imam Ja'far al-Sadiq
[tafseer_freud]       Sigmund Freud (psychological)

Several shortcodes can share one page.

[tafseer_my_dreams]   The visitor's saved dreams ("My dreams")

Every interpreted dream is saved in the visitor's own browser (localStorage), newest first,
up to 100. Put [tafseer_my_dreams] on its own page to list them; a saved dream opens again
without asking the backend. Nothing is stored on the server, so the list is per browser and
per device, and is lost if the visitor clears their browser data.

The result page links to the "My dreams" page by itself once a published page or post contains
[tafseer_my_dreams]. With a page builder that hides the shortcode from WordPress, give the
address yourself: [tafseer_dream my_dreams="/my-dreams/"] (works on every form shortcode).

== How it works ==

The form and the result are both shown by the shortcode: after submitting, the result
replaces the form in place, and "New dream" / "Edit dream" bring the form back.

The browser sends the dream to /wp-json/tafseer/v1/dreams on this site; WordPress forwards it
to the backend and returns the answer. The backend address is never exposed to visitors.

== Notes ==

* An interpretation takes 10–20 seconds. If the host limits PHP requests to less time than
  that, ask the host to raise max_execution_time.
* If a caching or security plugin blocks or caches the REST API, exclude /wp-json/tafseer/.

== Changelog ==

= 2.2.0 =
* Arabic interface, right to left.
* [tafseer_my_dreams]: the visitor's past dreams, saved in their browser.
* "Edit dream" keeps the form as it was; "New dream" keeps the "about you" answers.

= 2.1.0 =
* One plugin with a shortcode per authority, plus [tafseer_dream] with every authority.
* "All" option: one reading across all the classical books.
* The form only: no intro, footer or page background.
* No settings page; the backend address is built in.
