/** Canonical paths: strip /index.html and redirect legacy .html /build URLs. */
(function () {
  var pathname = location.pathname;
  var search = location.search;
  var hash = location.hash;

  if (/\/index\.html$/i.test(pathname)) {
    location.replace(pathname.replace(/\/index\.html$/i, "/") + search + hash);
    return;
  }

  var legacy = {
    "/host.html": "/custom-zones/",
    "/about.html": "/about/",
    "/team.html": "/team/",
  };

  if (legacy[pathname]) {
    location.replace(legacy[pathname] + search + hash);
    return;
  }

  if (pathname === "/build" || pathname === "/build/") {
    location.replace("/fund-the-festival/" + search + hash);
  }
})();
