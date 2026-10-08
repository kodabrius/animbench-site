# Animbench website

Landing page for Animbench, an animation toolkit for Autodesk Maya.
Plain HTML/CSS/JS, hosted on GitHub Pages.

```
index.html          English page
ru/index.html       Russian page
assets/css/         styles
assets/js/          scroll reveal + video pause button
assets/img/         logo, favicon
assets/video/       showreel and demo clips
```

## Replacing a demo placeholder with a clip

Export from Premiere as **H.264 MP4, no audio**, short loop, a few MB.
Put the file in `assets/video/`, then in **both** `index.html` and `ru/index.html`
replace the `<div class="clip-placeholder">…</div>` inside that demo with:

```html
<video data-loop autoplay muted loop playsinline preload="metadata" src="assets/video/curves.mp4"></video>
```

(In `ru/index.html` the path starts with `../assets/`.)

## Placeholders still to fill

Search for `[` in both pages: supported Maya versions and OS, price, how to buy, contact.

## Custom domain

After `animbench.com` points to GitHub (DNS A records `185.199.108.153`,
`185.199.109.153`, `185.199.110.153`, `185.199.111.153` and `www` CNAME to
`kodabrius.github.io`), set it in Settings → Pages → Custom domain and enable
Enforce HTTPS.
