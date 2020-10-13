// Modifed from original at https://github.com/NekR/self-destroying-sw/blob/master/packages/webpack-remove-serviceworker-plugin/sw.js
// Credit is given in our acknowledgements.html that we link to from our web app

self.addEventListener("install", function (e) {
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  self.registration.unregister().then(function () {
    console.log(
      "Unregistered service worker. This site will work like a regular site after you refresh."
    );
  });
});
