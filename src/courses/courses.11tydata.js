export default {
  layout: "layouts/course.njk",
  tags: "courses",
  eleventyComputed: {
    // Drafts are kept in the repo but not published (same as Webflow drafts)
    permalink: (data) => (data.draft ? false : `courses/${data.slug}.html`),
  },
};
