/**
 * TIMU Shared Core JS
 * Version: 1.1.3
 */
jQuery(document).ready(function($) {
    'use strict';

    const TIMU_Core = {
        init: function() {
            this.initColorPickers();
            this.initToggles();
            this.initMediaUploader();
            this.initCustomInstaller();
            this.handleToggles();
        },
        initColorPickers: function() { if ($.isFunction($.fn.wpColorPicker)) { $('.timu-color-field').wpColorPicker(); } },
        initToggles: function() { const self = this; $(document).on('change', '.timu-toggle-trigger', function() { self.handleToggles(); }); },
        handleToggles: function() {
            $('.timu-toggle-trigger').each(function() {
                const target = $(this).data('target');
                if (target) { $(this).is(':checked') ? $(target).fadeIn(200) : $(target).hide(); }
            });
        },
        
        initCustomInstaller: function() {
            const self = this;
            $(document).on('click', '.timu-install-btn', function(e) {
                e.preventDefault();
                const $btn = $(this);
                const slug = $btn.data('slug');
                const url  = $btn.data('url');

                if ($btn.hasClass('updating-message')) return;

                $btn.addClass('updating-message').text('Installing...');

                $.ajax({
                    url: timu_core_vars.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'timu_install_tool',
                        slug: slug,
                        download_url: url,
                        nonce: timu_core_vars.nonce
                    },
                    success: function(response) {
                        if (response.success) {
                            $btn.removeClass('updating-message').css('color', '#46b450').text('Installed!');
                            setTimeout(function() { location.reload(); }, 1500);
                        } else {
                            $btn.removeClass('updating-message').css('color', '#dc3232').text('Error.');
                            console.error('TIMU Install Error:', response.data);
                            alert('Error: ' + response.data);
                        }
                    },
                    error: function() {
                        $btn.removeClass('updating-message').text('Failed.');
                    }
                });
            });
        },

        initMediaUploader: function() {
            $(document).on('click', '.media_btn', function(e) {
                e.preventDefault();
                const btn = $(this), target = $(btn.data('target')), preview = $(btn.data('preview'));
                const frame = wp.media({ title: 'Select Media', multiple: false }).on('select', function() {
                    const asset = frame.state().get('selection').first().toJSON();
                    target.val(asset.url);
                    if (preview.length) { preview.html('<img src="'+asset.url+'" style="max-width:100%;">'); }
                }).open();
            });
        }
    };

    TIMU_Core.init();
});