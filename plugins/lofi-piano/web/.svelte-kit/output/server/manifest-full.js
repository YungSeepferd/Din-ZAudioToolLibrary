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
		client: {start:"_app/immutable/entry/start._CdKcLC9.js",app:"_app/immutable/entry/app.vnyFO6V0.js",imports:["_app/immutable/entry/start._CdKcLC9.js","_app/immutable/chunks/Cx2bQiZG.js","_app/immutable/chunks/Wv6JicDl.js","_app/immutable/chunks/BlBDq6ob.js","_app/immutable/entry/app.vnyFO6V0.js","_app/immutable/chunks/Wv6JicDl.js","_app/immutable/chunks/DdsAbmA8.js","_app/immutable/chunks/Ca04Kkn5.js","_app/immutable/chunks/BlBDq6ob.js","_app/immutable/chunks/CI2neQpF.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
