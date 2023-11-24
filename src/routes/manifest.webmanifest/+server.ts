import { json } from '@sveltejs/kit';
import type { WebAppManifest } from 'web-app-manifest';
import type { RequestHandler } from '@sveltejs/kit';

export const prerender = true;

interface CustomWebAppManifest extends WebAppManifest {
	protocol_handlers: Array<{ protocol: string; url: string }>;
	id: string; // https://developer.chrome.com/blog/pwa-manifest-id/?utm_source=devtools
}

const manifest: CustomWebAppManifest = {
	theme_color: '#ffffff',
	background_color: '#ffffff',
	display: 'standalone',
	scope: '/',
	start_url: '/',
	id: '/',
	name: 'Real Debrid Manager',
	short_name: 'RDM',
	description:
		'Effortlessly organize and control your Real Debrid torrents and downloads. Simplifying the process of scraping and downloading.',
	orientation: 'portrait',
	categories: ['entertainment', 'utilities'], // https://github.com/w3c/manifest/wiki/Categories
	shortcuts: [
		{
			name: 'Torrents',
			url: '/app/torrents',
			icons: [{ src: '/shortcuts/torrents-192x192.png', sizes: '192x192' }]
		},
		{
			name: 'Downloads',
			url: '/app/downloads',
			icons: [{ src: '/shortcuts/downloads-192x192.png', sizes: '192x192' }]
		},
		{
			name: 'Scraper',
			url: '/app/scraper',
			icons: [{ src: '/shortcuts/scraper-192x192.png', sizes: '192x192' }]
		}
	],
	icons: [
		{
			src: '/manifest/icon-192x192.png',
			sizes: '192x192',
			type: 'image/png'
		},
		{
			src: '/manifest/icon-256x256.png',
			sizes: '256x256',
			type: 'image/png'
		},
		{
			src: '/manifest/icon-384x384.png',
			sizes: '384x384',
			type: 'image/png'
		},
		{
			src: '/manifest/icon-512x512.png',
			sizes: '512x512',
			type: 'image/png'
		},
		{
			src: '/manifest/icon-maskable.png',
			sizes: '512x512',
			type: 'image/png',
			purpose: 'maskable'
		}
	],
	protocol_handlers: [
		// TODO: Add support for other protocols
		{
			protocol: 'web+rdm',
			url: '/handle?url=%s'
		}
	]
};

export const GET: RequestHandler = async () => {
	return json(manifest, {
		headers: {
			'content-type': 'application/manifest+json'
		}
	});
};
