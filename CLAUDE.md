# Blu Veda website: notes for Claude

The Blu Veda site (yoga and holistic therapies by Craig Clark), moved from Webflow to Netlify.
It is built with [Eleventy](https://www.11ty.dev/). Every push to `main` deploys automatically.

## Working on it

```bash
npm install
npm start        # local preview at http://localhost:8080
npm run build    # production build into _site/
```

## Where things live

| What | File |
| --- | --- |
| Top banner + navigation (including the **MY CALENDAR** timetable image) | `src/_includes/nav.njk` |
| Footer (logo, links, sessions, contact details, Instagram) | `src/_includes/footer.njk` (sessions are listed from the courses automatically; the light logo is `src/images/bluveda-logo-light.png`) |
| Course cards shown on Home, About, Studio and Candles pages, and under each course page | `src/_includes/course-cards.njk` (styles at the end of `src/css/site.css`) |
| Course page design (`/courses/...`) | `src/_includes/layouts/course.njk` |
| Pages | `src/index.njk`, `about.njk`, `contact.njk`, `bridport-wellness-studio.njk`, `ayurvedic-candles.njk`, `404.njk` |
| Styles | `src/css/blue-veda.webflow.css` (Webflow export), `src/css/site.css` (our additions) |
| Images | `src/images/` |
| Sound bath player (sticky on every page with a footer) | Markup at the end of `src/_includes/footer.njk`, behaviour in `src/js/sound-bath.js`, styles at the end of `src/css/site.css`, audio in `src/audio/sound-bath.mp3` |

## Courses (formerly the Webflow "Courses" CMS collection)

Each course is a file in `src/courses/`. The front matter holds the fields.
The HTML below it is the intro copy, shown above the services.

- `title`, `slug`: the name and URL (`/courses/<slug>`)
- `image`: the hero image and card image. `image3` goes after the intro copy, `image2` after the services.
- `moduleDescription`: the intro under the title, also used as the page's meta description
- `courseTypesOffers`, `duration`, `price`: the hero details. Duration/Price only show when set; they also appear on the course cards.
- `blockDescription`: the text on the course cards
- `imageRatio` (optional, e.g. `"3 / 4"`): gives every photo on the page the same crop
- `order`: the position in the card lists
- `draft: true`: kept in the repo but not published

### Services (treatments and classes)

Services are data, so every one is laid out the same way: name and price on one line, duration under the price, then the description.

```yaml
servicesTitle: "Classes"          # label above the list (default "Treatments")
servicesIntro: "One-line intro."  # optional
serviceGroups:
  - title: "Massage & Bodywork"
    subtitle: "To restore movement and support the body's natural ability to rebalance"
    image: "/images/courses/holistic-hand-massage.jpg"   # optional photo above the group
    imageAlt: "Oiled hands massaging a client's hand"
    services:
      - name: "Swedish Massage"           # title case, no trailing colon
        subtitle: "Ayurvedic oil massage" # optional
        price: "From £60"                 # always "From £00"; leave out if on enquiry
        duration: "60 or 90 mins"         # optional; "60 mins", "90 mins", "60 or 90 mins"
        description:
          - "First paragraph."
          - "Second paragraph."
```

`ctaTitle`, `ctaText` and `ctaButton` set the closing "book a session" block (defaults: "Ready to book a session?" / "Book a session").
The contact form's "What would you like to book?" list is built from these services automatically.

To add a course, copy an existing file, give it a new `slug`, and link it from `nav.njk` if needed.

## Contact form

The contact form uses **Netlify Forms** (form name `contact`). Submissions appear in the Netlify dashboard under *Forms*.
Email notifications are set up there. `src/js/contact-form.js` sends the form and shows the thank-you message.

## Sound bath audio

`src/audio/sound-bath.mp3` is "Cuencos tibetanos al ser percutidos" by Luis Alvaz, from
[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Cuencos_tibetanos_al_ser_percutidos.wav),
licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). It was converted from WAV to MP3 (96 kbps) with no other changes.
The licence requires the credit in the footer's bottom bar; keep it if the track stays. If you swap the track, update the credit to match.

Browsers block sound until the visitor interacts with the page, so it starts on the first click or tap,
then resumes from the same spot on later pages. Pausing or stopping is remembered.

## Notes from the Webflow move

- Webflow's unused ecommerce and blog template pages were left out.
- All images are now hosted with the site. Course images live in `src/images/courses/`; nothing loads from Webflow's CDN any more.
- jQuery is now hosted with the site (`src/js/jquery-3.5.1.min.js`), the same file Webflow used.

## Rules for changes

- Keep the Webflow class names and `data-w-id` / `data-wf-page` attributes. `js/webflow.js` uses them for animations and the mobile menu.
- Pages are built from shared blocks in `src/css/site.css`: `page-intro` (photo beside the title), `page-story` (long text in the reading column) and `page-cta` (closing booking block). Reuse them for new pages. All buttons share one style (`.button.w-button`).
- Font sizes come from the type scale at the top of the "Type scale" block in `src/css/site.css` (`--fs-display`, `--fs-h2`, `--fs-h3`, `--fs-lead`, `--fs-body` and so on). Use those instead of new pixel sizes. Long reading text is capped at `--measure` (720px).
- Run `npm run build` before committing, and make sure it passes.
- Commit to `main` with a clear message. Netlify deploys it within about a minute.
