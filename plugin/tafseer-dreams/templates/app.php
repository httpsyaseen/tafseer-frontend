<?php
/**
 * Markup for the shortcode: the form, the loading state and the result container.
 * app.js switches between the three; result.js fills the result.
 *
 * From the shortcode: $source (fixed authority, or '' for the picker), $api_url, $my_dreams, $uid.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<?php $step = 1; ?>
<div class="tafseer-app" dir="rtl" lang="ar" id="<?php echo esc_attr( $uid ); ?>" data-api-url="<?php echo esc_url( $api_url ); ?>" data-my-dreams-url="<?php echo esc_url( $my_dreams ); ?>">
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
            <h2><label for="<?php echo esc_attr( $uid ); ?>-dream">رؤياك</label></h2>
            <p>اكتبها كما تتذكرها، بالعربية أو بالإنجليزية.</p>
          </div>
        </div>
        <textarea id="<?php echo esc_attr( $uid ); ?>-dream" name="dream" data-t="dream" dir="auto" rows="7"
                  placeholder="رأيت في المنام..." required></textarea>
        <div class="t-field-foot">
          <span class="t-hint">كلما زادت التفاصيل كان التفسير أدق: الأشخاص، والأماكن، والألوان، وما شعرت به.</span>
          <span class="t-counter" data-t="counter" aria-live="polite">0</span>
        </div>
      </section>

      <?php if ( '' === $source ) : ?>
      <!-- Authority -->
      <section class="t-step">
        <div class="t-step-head">
          <span class="t-step-no"><?php echo $step++; ?></span>
          <div>
            <h2 id="<?php echo esc_attr( $uid ); ?>-authority">اختر المفسّر</h2>
            <p>يتبع التفسير منهج هذا المفسّر وكتبه وحدها.</p>
          </div>
        </div>

        <div class="t-sources" role="radiogroup" aria-labelledby="<?php echo esc_attr( $uid ); ?>-authority">
          <label class="t-source t-source--all">
            <input type="radio" name="source" value="all" checked>
            <span class="t-source-body">
              <span class="t-source-name">الكل</span>
              <span class="t-source-desc">جميع كتب التفسير معاً</span>
            </span>
          </label>

          <label class="t-source">
            <input type="radio" name="source" value="ibn_sirin">
            <span class="t-source-body">
              <span class="t-source-name">ابن سيرين</span>
              <span class="t-source-desc">المنسوب إلى ابن سيرين</span>
            </span>
          </label>

          <label class="t-source">
            <input type="radio" name="source" value="nabulsi">
            <span class="t-source-body">
              <span class="t-source-name">النابلسي</span>
              <span class="t-source-desc">عبد الغني النابلسي</span>
            </span>
          </label>

          <label class="t-source">
            <input type="radio" name="source" value="ibn_shaheen">
            <span class="t-source-body">
              <span class="t-source-name">ابن شاهين</span>
              <span class="t-source-desc">ابن شاهين الظاهري</span>
            </span>
          </label>

          <label class="t-source">
            <input type="radio" name="source" value="tabir">
            <span class="t-source-body">
              <span class="t-source-name">تعبير الرؤيا</span>
              <span class="t-source-desc">الكتاب التراثي المعروف بهذا الاسم</span>
            </span>
          </label>

          <label class="t-source">
            <input type="radio" name="source" value="sadiq">
            <span class="t-source-body">
              <span class="t-source-name">الإمام الصادق</span>
              <span class="t-source-desc">المنسوب إلى الإمام جعفر الصادق وأهل البيت</span>
            </span>
          </label>

          <label class="t-source t-source--alt">
            <input type="radio" name="source" value="freud">
            <span class="t-source-body">
              <span class="t-source-name">سيغموند فرويد <span class="t-source-flag">نفسي</span></span>
              <span class="t-source-desc">منظور بديل غير ديني</span>
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
            <h2>عنك <span class="t-optional">اختياري</span></h2>
            <p>تختلف دلالة الرمز في الكتب بين الرجل والمرأة، والمتزوج والأعزب — لذلك تُغيّر إجاباتك التفسير.</p>
          </div>
        </div>

        <div class="t-ctx-grid">
          <label><span>الجنس</span>
            <select name="gender"><option value="">—</option>
              <option value="ذكر">ذكر</option><option value="أنثى">أنثى</option>
            </select></label>
          <label><span>الحالة الاجتماعية</span>
            <select name="marital_status"><option value="">—</option>
              <option value="أعزب">أعزب</option><option value="متزوج">متزوج</option><option value="مطلق">مطلق</option><option value="أرمل">أرمل</option>
            </select></label>
          <label><span>الفئة العمرية</span>
            <select name="age_range"><option value="">—</option>
              <option value="أقل من ٢٠">أقل من ٢٠</option><option value="٢٠-٣٠">٢٠-٣٠</option><option value="٣٠-٤٠">٣٠-٤٠</option><option value="٤٠-٦٠">٤٠-٦٠</option><option value="أكثر من ٦٠">أكثر من ٦٠</option>
            </select></label>
          <label><span>الحالة عند الاستيقاظ</span>
            <select name="waking_state"><option value="">—</option>
              <option value="مطمئن">مطمئن</option><option value="قلق">قلق</option><option value="حزن">حزن</option><option value="خوف">خوف</option><option value="فرح">فرح</option>
            </select></label>
          <label><span>ألم في المنام</span>
            <select name="pain"><option value="">—</option>
              <option value="نعم">نعم</option><option value="لا">لا</option>
            </select></label>
          <label><span>هل تكررت الرؤيا</span>
            <select name="recurring"><option value="">—</option>
              <option value="نعم">نعم</option><option value="نعم، مراراً">نعم، مراراً</option><option value="لا">لا</option>
            </select></label>
          <label><span>وقت الرؤيا</span>
            <select name="dream_time"><option value="">—</option>
              <option value="أول الليل">أول الليل</option><option value="آخر الليل">آخر الليل</option><option value="بعد الفجر">بعد الفجر</option><option value="القيلولة">القيلولة</option>
            </select></label>
          <label><span>صلاة الاستخارة قبلها</span>
            <select name="istikhara"><option value="">—</option>
              <option value="نعم">نعم</option><option value="لا">لا</option><option value="لم يُذكر">لم يُذكر</option>
            </select></label>
          <label><span>وضوح التفاصيل</span>
            <select name="clarity"><option value="">—</option>
              <option value="واضحة جداً">واضحة جداً</option><option value="متوسطة">متوسطة</option><option value="مشوّشة">مشوّشة</option>
            </select></label>
          <label><span>الحالة قبل النوم</span>
            <select name="state_before_sleep"><option value="">—</option>
              <option value="مطمئن">مطمئن</option><option value="مرهق وكثير التفكير">مرهق وكثير التفكير</option><option value="على وضوء وذكر">على وضوء وذكر</option><option value="بعد خصام أو ضيق">بعد خصام أو ضيق</option>
            </select></label>
          <label><span>هل المكان مألوف</span>
            <select name="place_familiar"><option value="">—</option>
              <option value="نعم، مكاني المعتاد">نعم، مكاني المعتاد</option><option value="مكان أعرفه">مكان أعرفه</option><option value="مكان غريب">مكان غريب</option>
            </select></label>
        </div>
      </section>

      <div class="t-form-actions">
        <button type="submit" class="t-btn t-btn--primary t-btn--lg">
          فسّر رؤياي
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button type="reset" class="t-btn t-btn--ghost">مسح</button>
      </div>
      <p class="t-status" data-t="status" role="alert"></p>
    </form>
  </div>

  <!-- Loading -->
  <section class="t-loading" data-t="loading" hidden aria-live="polite">
    <div class="t-loading-moon" aria-hidden="true"></div>
    <h2>جارٍ تفسير رؤياك</h2>
    <p class="t-loading-note">يستغرق ذلك عادةً من ١٠ إلى ٢٠ ثانية.</p>
    <ol class="t-loading-steps" data-t="loading-steps">
      <li>البحث عن رموز رؤياك</li>
      <li data-t="loading-book">الرجوع إلى الكتب</li>
      <li>كتابة التفسير</li>
    </ol>
  </section>

  <!-- Result -->
  <section class="t-result" id="<?php echo esc_attr( $uid ); ?>-result" data-t="result" hidden></section>

</div>
</div>
