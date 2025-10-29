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
		client: {start:"_app/immutable/entry/start.Bn9phs1_.js",app:"_app/immutable/entry/app.-l5Tq6qG.js",imports:["_app/immutable/entry/start.Bn9phs1_.js","_app/immutable/chunks/DGeXd8UT.js","_app/immutable/chunks/DKOeWvNk.js","_app/immutable/chunks/c_39yaXq.js","_app/immutable/entry/app.-l5Tq6qG.js","_app/immutable/chunks/DKOeWvNk.js","_app/immutable/chunks/DrSCZdzw.js","_app/immutable/chunks/BJufGnvD.js","_app/immutable/chunks/c_39yaXq.js","_app/immutable/chunks/UyuA2AfY.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
