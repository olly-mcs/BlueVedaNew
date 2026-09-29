# Blu Veda website

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
| Footer (email, phone, Instagram) | `src/_includes/footer.njk` |
| Course cards shown on Home, About, Studio and Candles pages | `src/_includes/course-cards.njk` |
| Course page design (`/courses/...`) | `src/_includes/layouts/course.njk` |
| Pages | `src/index.njk`, `about.njk`, `contact.njk`, `bridport-wellness-studio.njk`, `ayurvedic-candles.njk`, `404.njk` |
| Styles | `src/css/blue-veda.webflow.css` (Webflow export), `src/css/site.css` (our additions) |
| Images | `src/images/` |

## Courses (formerly the Webflow "Courses" CMS collection)

Each course is a file in `src/courses/`. The front matter holds the fields.
The HTML below it is the long description ("Course Description" in Webflow).

- `title`, `slug`: the name and URL (`/courses/<slug>`)
- `image`: the hero image and card image. `image3` is the second image beside the description. `image2` goes below the description.
- `moduleDescription`: the intro under the title, also used as the page's meta description
- `courseTypesOffers`, `duration`, `price`: the hero details. The Duration/Price labels only show when a value is set.
- `blockDescription`: the text on the course cards
- `order`: the position in the card lists
- `draft: true`: kept in the repo but not published

To add a course, copy an existing file, give it a new `slug`, and link it from `nav.njk` if needed.

## Contact form

The contact form uses **Netlify Forms** (form name `contact`). Submissions appear in the Netlify dashboard under *Forms*.
Email notifications are set up there. `src/js/contact-form.js` sends the form and shows the thank-you message.

## Notes from the Webflow move

- Webflow's unused ecommerce and blog template pages were left out.
- Course images are still loaded from Webflow's CDN (`cdn.prod.website-files.com`). Move them into `src/images/` before the Webflow site is deleted.
- jQuery is now hosted with the site (`src/js/jquery-3.5.1.min.js`), the same file Webflow used.
