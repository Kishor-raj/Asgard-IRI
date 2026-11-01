const pool = require('../config/db');

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// Ensures uniqueness by appending -2, -3 etc.
const uniqueSlug = async (table, baseText) => {
  const base = slugify(baseText);
  let slug = base;
  let counter = 2;
  while (true) {
    const { rows } = await pool.query(`SELECT id FROM ${table} WHERE slug = $1`, [slug]);
    if (rows.length === 0) return slug;
    slug = `${base}-${counter++}`;
  }
};

module.exports = { slugify, uniqueSlug };
