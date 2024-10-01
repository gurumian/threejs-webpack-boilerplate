import { App } from './app'

document.addEventListener("touchmove", function(e) {
  if (e.changedTouches[0].pageY < 0) {
      e.preventDefault();
      document.dispatchEvent(new Event('touchend'))
  }
})

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", function() {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then(res => console.log(`service worker registered ${res}`))
//       .catch(err => console.log("service worker not registered", err))
//   })
// }

// remove service-worker
// navigator.serviceWorker.getRegistrations().then(function(registrations) {
//   for(let registration of registrations) {
//    registration.unregister()
// }})

const app = new App()
app.init()
animate()

function animate() {
  requestAnimationFrame( animate )
  app.update()
}
