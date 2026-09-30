<?php
/**
 * Markup for the shortcode: the form, the loading state and the result container.
 * app.js switches between the three; result.js fills the result.
 *
 * From the shortcode: $source (fixed authority, or '' for the picker), $api_url, $uid.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<?php $step = 1; ?>
<div class="tafseer-app" id="<?php echo esc_attr( $uid ); ?>" data-api-url="<?php echo esc_url( $api_url ); ?>">
<div class="t-page">
  <div data-t="form-view">
    <form class="t-form" data-t="form" novalidate>
      <?php if ( '' !== $source ) : ?>
        <input type="hidden" name="source" value="<?php echo esc_attr( $source ); ?>">
      <?php endif; ?>

      <!-- 1. Dream -->
      <section class="t-step">
        <div class="t-step-head">
          <span class="t-step-no"><?php echo $step++; ?></span>
          <div>
            <h2><label for="<?php echo esc_attr( $uid ); ?>-dream">Your dream</label></h2>
            <p>Write it the way you remember it, in Arabic or English.</p>
          </div>
        </div>
        <textarea id="<?php echo esc_attr( $uid ); ?>-dream" name="dream" data-t="dream" dir="auto" rows="7"
                  placeholder="رأيت في المنام..." required></textarea>
        <div class="t-field-foot">
          <span class="t-hint">More detail gives a better reading: people, places, colours, how you felt.</span>
          <span class="t-counter" data-t="counter" aria-live="polite">0</span>
        </div>
      </section>

      <?php if ( '' === $source ) : ?>
      <!-- Authority -->
      <section class="t-step">
        <div class="t-step-head">
          <span class="t-step-no"><?php echo $step++; ?></span>
          <div>
            <h2 id="<?php echo esc_attr( $uid ); ?>-authority">Choose an authority</h2>
            <p>The reading follows this interpreter's method and books alone.</p>
          </div>
        </div>

        <div class="t-sources" role="radiogroup" aria-labelledby="<?php echo esc_attr( $uid ); ?>-authority">
          <label class="t-source t-source--all">
            <input type="radio" name="source" value="all" checked>
            <span class="t-source-body">
              <span class="t-source-name">All</span>
              <span class="t-source-desc">All the classical books together</span>
            </span>
          </label>

          <label class="t-source">
            <input type="radio" name="source" value="ibn_sirin">
            <span class="t-source-body">
              <span class="t-source-name">Ibn Sirin</span>
              <span class="t-source-desc">Attributed to Ibn Sirin</span>
            </span>
          </label>

          <label class="t-source">
            <input type="radio" name="source" value="nabulsi">
            <span class="t-source-body">
              <span class="t-source-name">Al-Nabulsi</span>
              <span class="t-source-desc">Abd al-Ghani al-Nabulsi</span>
            </span>
          </label>

          <label class="t-source">
            <input type="radio" name="source" value="ibn_shaheen">
            <span class="t-source-body">
              <span class="t-source-name">Ibn Shahin</span>
              <span class="t-source-desc">Ibn Shahin al-Zahiri</span>
            </span>
          </label>

          <label class="t-source">
            <input type="radio" name="source" value="tabir">
            <span class="t-source-body">
              <span class="t-source-name">Ta'bir al-Ru'ya</span>
              <span class="t-source-desc">The classical book of that name</span>
            </span>
          </label>

          <label class="t-source">
            <input type="radio" name="source" value="sadiq">
            <span class="t-source-body">
              <span class="t-source-name">Imam Al-Sadiq</span>
              <span class="t-source-desc">Attributed to Imam Ja'far al-Sadiq and the Ahl al-Bayt</span>
            </span>
          </label>

          <label class="t-source t-source--alt">
            <input type="radio" name="source" value="freud">
            <span class="t-source-body">
              <span class="t-source-name">Sigmund Freud <span class="t-source-flag">psychological</span></span>
              <span class="t-source-desc">An alternative, non-religious lens</span>
            </span>
          </label>
        </div>
      </section>
      <?php endif; ?>

      <!-- About you -->
      <section class="t-step">
        <div class="t-step-head">
          <span class="t-step-no"><?php echo $step++; ?></span>
          <div>
            <h2>About you <span class="t-optional">optional</span></h2>
            <p>The books read a symbol differently for a man and a woman, the married and the unmarried — so telling us changes the reading.</p>
          </div>
        </div>

        <div class="t-ctx-grid">
          <label><span>Gender</span>
            <select name="gender"><option value="">—</option>
              <option value="ذكر">Male</option><option value="أنثى">Female</option>
            </select></label>
          <label><span>Marital status</span>
            <select name="marital_status"><option value="">—</option>
              <option value="أعزب">Single</option><option value="متزوج">Married</option><option value="مطلق">Divorced</option><option value="أرمل">Widowed</option>
            </select></label>
          <label><span>Age range</span>
            <select name="age_range"><option value="">—</option>
              <option value="أقل من ٢٠">Under 20</option><option value="٢٠-٣٠">20-30</option><option value="٣٠-٤٠">30-40</option><option value="٤٠-٦٠">40-60</option><option value="أكثر من ٦٠">Over 60</option>
            </select></label>
          <label><span>Waking state</span>
            <select name="waking_state"><option value="">—</option>
              <option value="مطمئن">At ease</option><option value="قلق">Anxious</option><option value="حزن">Sad</option><option value="خوف">Fearful</option><option value="فرح">Joyful</option>
            </select></label>
          <label><span>Pain in the dream</span>
            <select name="pain"><option value="">—</option>
              <option value="نعم">Yes</option><option value="لا">No</option>
            </select></label>
          <label><span>Recurring</span>
            <select name="recurring"><option value="">—</option>
              <option value="نعم">Yes</option><option value="نعم، مراراً">Yes, several times</option><option value="لا">No</option>
            </select></label>
          <label><span>Time of the dream</span>
            <select name="dream_time"><option value="">—</option>
              <option value="أول الليل">Early night</option><option value="آخر الليل">Before dawn</option><option value="بعد الفجر">After fajr</option><option value="القيلولة">Daytime nap</option>
            </select></label>
          <label><span>Istikhara prayer beforehand</span>
            <select name="istikhara"><option value="">—</option>
              <option value="نعم">Yes</option><option value="لا">No</option><option value="لم يُذكر">Not mentioned</option>
            </select></label>
          <label><span>Clarity of details</span>
            <select name="clarity"><option value="">—</option>
              <option value="واضحة جداً">Very clear</option><option value="متوسطة">Somewhat clear</option><option value="مشوّشة">Hazy</option>
            </select></label>
          <label><span>State before sleep</span>
            <select name="state_before_sleep"><option value="">—</option>
              <option value="مطمئن">Settled</option><option value="مرهق وكثير التفكير">Exhausted, racing thoughts</option><option value="على وضوء وذكر">In wudu, remembering God</option><option value="بعد خصام أو ضيق">After conflict or distress</option>
            </select></label>
          <label><span>Was the place familiar</span>
            <select name="place_familiar"><option value="">—</option>
              <option value="نعم، مكاني المعتاد">Yes, my own place</option><option value="مكان أعرفه">Somewhere I know</option><option value="مكان غريب">A strange place</option>
            </select></label>
        </div>
      </section>

      <div class="t-form-actions">
        <button type="submit" class="t-btn t-btn--primary t-btn--lg">
          Interpret my dream
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button type="reset" class="t-btn t-btn--ghost">Clear</button>
      </div>
      <p class="t-status" data-t="status" role="alert"></p>
    </form>
  </div>

  <!-- Loading -->
  <section class="t-loading" data-t="loading" hidden aria-live="polite">
    <div class="t-loading-moon" aria-hidden="true"></div>
    <h2>Interpreting your dream</h2>
    <p class="t-loading-note">This usually takes 10–20 seconds.</p>
    <ol class="t-loading-steps" data-t="loading-steps">
      <li>Finding the symbols in your dream</li>
      <li data-t="loading-book">Reading the books</li>
      <li>Writing your interpretation</li>
    </ol>
  </section>

  <!-- Result -->
  <section class="t-result" id="<?php echo esc_attr( $uid ); ?>-result" data-t="result" hidden></section>

</div>
</div>
