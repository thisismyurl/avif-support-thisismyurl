/**
 * TIMU Shared Core JS
 * Version: 1.260101
 */
jQuery(document).ready(function($) {
    'use strict';

    const TIMU_Core = {
        init: function() {
            this.initColorPickers();
            this.initMediaUploader();
            this.initCustomInstaller();
            this.initParentChildToggles();
        },

        /**
         * Initialize WordPress Color Pickers
         */
        initColorPickers: function() { 
            if ($.isFunction($.fn.wpColorPicker)) { 
                $('.timu-color-picker').wpColorPicker(); 
            } 
        },

        /**
         * Initialize Parent/Child Visibility Logic
         */
        initParentChildToggles: function() {
            const self = this;
            
            // Run on page load to set initial state
            this.handleParentChildVisibility();

            // Listen for changes on any parent switch or radio button
            $(document).on('change', '.timu-parent-control input', function() {
                self.handleParentChildVisibility();
            });
        },

        /**
         * Handles hiding/showing child settings based on parent state or value
         */
       /**
         * Handles hiding/showing child settings based on parent state or value
         * updated to support cascading (grandchild) visibility.
         */
        handleParentChildVisibility: function() {
            const self = this;

            $('.timu-child-field').each(function() {
                const $childWrapper = $(this);
                const parentId      = $childWrapper.data('parent');
                const requiredValue = $childWrapper.data('parent-value');
                const $row          = $childWrapper.closest('tr');

                // 1. Find the parent input
                let $parent = $('#' + parentId); 
                if ($parent.length === 0) {
                    $parent = $('input[name$="[' + parentId + ']"]:checked');
                }

                // 2. Determine parent's value
                let currentValue = '';
                if ($parent.is(':checkbox')) {
                    currentValue = $parent.is(':checked') ? "1" : "0";
                } else {
                    currentValue = $parent.val();
                }

                // 3. New Cascading Logic: Check if the parent's OWN row is hidden
                const $parentRow = $parent.closest('tr');
                const isParentHidden = $parentRow.is(':hidden');

                // 4. Logic check: Show only if parent is visible AND value matches
                let shouldShow = false;
                if (!isParentHidden) {
                    if (requiredValue !== undefined) {
                        if (currentValue == requiredValue) {
                            shouldShow = true;
                        }
                    } else if (currentValue == "1") {
                        shouldShow = true;
                    }
                }

                if (shouldShow) {
                    $row.show();
                } else {
                    $row.hide();
                }
            });

            // 5. Run a second pass to ensure grandchildren of newly hidden children 
            // also hide. This handles multiple levels of nesting.
            if ($('.timu-child-field:visible').length !== self.lastVisibleCount) {
                self.lastVisibleCount = $('.timu-child-field:visible').length;
                self.handleParentChildVisibility();
            }
        },

        /**
         * Handles AJAX Plugin Installation from Sidebar
         */
        initCustomInstaller: function() {
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
                            alert('Error: ' + response.data);
                        }
                    },
                    error: function() {
                        $btn.removeClass('updating-message').text('Failed.');
                    }
                });
            });
        },

        /**
         * Initialize WP Media Uploader for Custom Inputs
         */
        initMediaUploader: function() {
            $(document).on('click', '.media_btn', function(e) {
                e.preventDefault();
                const btn = $(this), 
                      target = $(btn.data('target')), 
                      preview = $(btn.data('preview'));

                const frame = wp.media({ 
                    title: 'Select Media', 
                    multiple: false 
                }).on('select', function() {
                    const asset = frame.state().get('selection').first().toJSON();
                    target.val(asset.url);
                    if (preview.length) { 
                        preview.html('<img src="'+asset.url+'" style="max-width:100%;">'); 
                    }
                }).open();
            });
        }
    };

    // Initialize the Core JS object
    TIMU_Core.init();
});