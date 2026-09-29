export default function (eleventyConfig) {
  // Static assets exported from Webflow, copied as-is
  for (const dir of ["css", "js", "images", "fonts"]) {
    eleventyConfig.addPassthroughCopy(`src/${dir}`);
  }

  // Published courses, in display order
  eleventyConfig.addFilter("publishedCourses", (items = []) =>
    items.filter((c) => !c.data.draft).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
  );
  eleventyConfig.addFilter("exceptSlug", (items = [], slug) => items.filter((c) => c.data.slug !== slug));

  return {
    dir: { input: "src", output: "_site" },
    htmlTemplateEngine: "njk",
  };
}
