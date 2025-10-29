export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.C3hZ4115.js",app:"_app/immutable/entry/app.BINedNXe.js",imports:["_app/immutable/entry/start.C3hZ4115.js","_app/immutable/chunks/BHFAoKNs.js","_app/immutable/chunks/Dx5WBm0i.js","_app/immutable/chunks/DgQfwXId.js","_app/immutable/entry/app.BINedNXe.js","_app/immutable/chunks/Dx5WBm0i.js","_app/immutable/chunks/CHVYgHlj.js","_app/immutable/chunks/B_-0vjWx.js","_app/immutable/chunks/DgQfwXId.js","_app/immutable/chunks/D67plWE8.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
