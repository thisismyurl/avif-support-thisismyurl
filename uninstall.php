<?php
/**
 * TIMU Plugin Uninstaller
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

$plugin_slug = dirname( WP_UNINSTALL_PLUGIN );

// 1. Delete standard options
delete_option( $plugin_slug . '_options' );

// 2. Delete transients
delete_transient( $plugin_slug . '_license_status' );
delete_transient( $plugin_slug . '_license_msg' );
delete_transient( 'timu_tools_cache' );

// 3. Plugin-Specific Cleanup
global $wpdb;

if ( 'thisismyurl-avif-support' === $plugin_slug ) {
    // Delete AVIF specific post metadata
    $wpdb->query( "DELETE FROM {$wpdb->postmeta} WHERE meta_key IN ('_avif_original_path', '_avif_savings')" );
}