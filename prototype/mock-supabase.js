// Fake supabase-js v2 global for offline screenshots. Returns fixture rows per table/rpc.
(function () {
  const F = () => window.__FIX || {};
  const now = new Date();
  const iso = (d) => new Date(d).toISOString();
  function resolve(kind, name, st) {
    const w = st.filters.find(([k]) => k === 'insert' || k === 'update' || k === 'upsert');
    if (w) { const pl = Array.isArray(w[1][0]) ? w[1][0] : [Object.assign({ id: 'new-' + Math.random().toString(36).slice(2, 8) }, w[1][0])]; return { data: st.single ? pl[0] : pl, error: null, count: pl.length }; }
    const src = (kind === 'rpc' ? (F().rpc || {}) : (F().tables || {}))[name];
    let rows = typeof src === 'function' ? src(st) : (src === undefined ? (kind === 'rpc' ? null : []) : src);
    if (rows === null || rows === undefined) return { data: kind === 'rpc' ? null : [], error: null, count: 0 };
    if (Array.isArray(rows)) {
      const arr = rows.slice(0, st.limit || rows.length);
      if (st.head) return { data: null, error: null, count: rows.length };
      if (st.single) return { data: arr[0] || null, error: null, count: rows.length };
      return { data: arr, error: null, count: rows.length };
    }
    return { data: rows, error: null, count: 1 };
  }
  function builder(kind, name, args) {
    const st = { filters: [], args };
    const p = new Proxy(function () {}, {
      get(_, prop) {
        if (prop === 'then') return (res, rej) => Promise.resolve(resolve(kind, name, st)).then(res, rej);
        if (prop === 'catch') return (f) => Promise.resolve(resolve(kind, name, st)).catch(f);
        if (prop === 'finally') return (f) => Promise.resolve(resolve(kind, name, st)).finally(f);
        return (...a) => {
          if (prop === 'select' && a[1] && a[1].head) st.head = true;
          if (prop === 'limit') st.limit = a[0];
          if (prop === 'single' || prop === 'maybeSingle') st.single = true;
          st.filters.push([prop, a]);
          return p;
        };
      }
    });
    return p;
  }
  const session = { access_token: 'x', refresh_token: 'y', user: { id: 'auth-1', email: 'demo@example.com' }, expires_at: Math.floor(Date.now()/1000) + 3600 };
  function chan() { const c = { on: () => c, subscribe: (cb) => { cb && cb('SUBSCRIBED'); return c; }, unsubscribe: () => {}, send: () => {} }; return c; }
  const client = {
    auth: {
      getSession: async () => ({ data: { session: window.__NO_SESSION ? null : session }, error: null }),
      getUser: async () => ({ data: { user: session.user }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      refreshSession: async () => ({ data: { session }, error: null }),
      setSession: async () => ({ data: { session }, error: null }),
      signInWithPassword: async () => ({ data: { session }, error: null }),
      signOut: async () => ({ error: null }),
      mfa: { listFactors: async () => ({ data: { totp: [], all: [] } }), getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: 'aal2', nextLevel: 'aal2' } }) },
    },
    from: (t) => builder('table', t),
    rpc: (n, a) => builder('rpc', n, a),
    channel: chan, removeChannel: () => {}, removeAllChannels: () => {},
    storage: { from: () => ({ upload: async () => ({ data: {}, error: null }), createSignedUrl: async () => ({ data: { signedUrl: '#' } }), getPublicUrl: () => ({ data: { publicUrl: '#' } }), list: async () => ({ data: [] }) }) },
    functions: { invoke: async () => ({ data: null, error: null }) },
  };
  window.supabase = { createClient: () => client };
})();
