// Service worker do guia: depois da primeira visita, o guia abre sem internet.
//
// - Páginas (navegação): rede primeiro, para quem está online ver sempre a versão nova; sem rede, ou com a rede
//   demorando, a cópia guardada. Uma página nunca aberta, sem rede, cai no início do guia no mesmo idioma.
// - Arquivos (fontes, imagens, 3D, rádio virtual): a cópia guardada na hora, e a rede atualiza a cópia por trás.
// - Fica de fora o que não é do guia: as prévias (prototipo-*), outros sites, as rádios do rádio virtual.
//
// O build troca {{VERSAO}} e {{ESSENCIAL}}. Uma versão nova apaga as cópias da anterior. Para desligar o service
// worker de vez, publique no lugar deste um que só chame self.registration.unregister().
const VERSAO = "{{VERSAO}}";
const CACHE = "guia-dp666-" + VERSAO;
const BASE = new URL("./", self.location).pathname;
const ESSENCIAL = {{ESSENCIAL}};
const ESPERA_REDE = 4000;   // ms: com a rede mais lenta que isso, a página guardada aparece

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(ESSENCIAL.map((u) => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith("guia-dp666-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function doGuia(url) {
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return false;
  const resto = url.pathname.slice(BASE.length);
  return !resto.startsWith("prototipo-") && resto !== "sw.js";
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!doGuia(url)) return;
  e.respondWith(req.mode === "navigate" ? pagina(req, url) : arquivo(e, req));
});

async function pagina(req, url) {
  const c = await caches.open(CACHE);
  const rede = fetch(req).then((r) => {
    if (r.ok) c.put(req, r.clone());
    return r;
  });
  rede.catch(() => {});   // sem rede depois de a página guardada já ter aparecido: nada a fazer
  const demora = new Promise((ok) => setTimeout(ok, ESPERA_REDE));
  try {
    const r = await Promise.race([rede, demora]);
    if (r) return r;
    const guardada = await c.match(req, { ignoreSearch: true });
    return guardada || await rede;
  } catch (erro) {
    const guardada = await c.match(req, { ignoreSearch: true });
    if (guardada) return guardada;
    const ingles = url.pathname.startsWith(BASE + "en/");
    return (await c.match(new URL(ingles ? "en/" : "./", self.location).href)) || Response.error();
  }
}

async function arquivo(e, req) {
  const c = await caches.open(CACHE);
  const guardado = await c.match(req);
  const rede = fetch(req).then((r) => {
    if (r.ok && r.type === "basic") c.put(req, r.clone());
    return r;
  }).catch(() => guardado || Response.error());
  if (guardado) {
    e.waitUntil(rede);
    return guardado;
  }
  return rede;
}
