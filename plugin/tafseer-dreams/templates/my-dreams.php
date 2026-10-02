<?php
/**
 * Markup for [tafseer_my_dreams]: the list of saved dreams and one dream's result.
 * my-dreams.js fills both from the visitor's browser storage.
 *
 * From the shortcode: $uid.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="tafseer-app tafseer-my-dreams" dir="rtl" lang="ar" id="<?php echo esc_attr( $uid ); ?>">
<div class="t-page">
  <div data-t="list-view">
    <p class="h-empty" data-t="empty" hidden>لا توجد أحلام محفوظة بعد. ستظهر هنا كل رؤيا تفسّرها من هذا المتصفح.</p>
    <ol class="h-list" data-t="list" hidden></ol>
    <div class="h-foot">
      <p class="h-note">تُحفظ أحلامك في هذا المتصفح وحده، ولا تُرسل إلى أي مكان آخر.</p>
      <button type="button" class="t-btn t-btn--ghost t-btn--sm" data-t="clear" hidden>حذف الكل</button>
    </div>
  </div>

  <div data-t="detail-view" hidden>
    <button type="button" class="t-btn t-btn--ghost t-btn--sm h-back" data-t="back">رجوع إلى أحلامي</button>
    <section class="t-result" id="<?php echo esc_attr( $uid ); ?>-result" data-t="result"></section>
  </div>
</div>
</div>
