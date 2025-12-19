import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import matter from 'gray-matter';

const satoshiBold = readFileSync('assets/fonts/Satoshi-Bold.otf');

// Design config - landscape uses 2x rendering for crispness
const LANDSCAPE = {
  width: 1200,
  height: 630,
  bar: 24,
  padding: 56,
  brandMark: 48,
  title: { short: 96, medium: 80, long: 64 },
  description: 32,
  author: 28,
  titleMargin: 24,
};

const SQUARE = {
  width: 1200,
  height: 1200,
  bar: 28,
  paddingV: 100,
  paddingH: 64,
  brandMark: 72,
  title: { short: 104, medium: 88, long: 72 },
  description: 36,
  author: 32,
  titleMargin: 40,
};

// All pages use site URL for attribution
const SITE_URL = 'shawnyeager.com';

async function generateOG(title, description, outputPath, format = 'landscape', author = 'Shawn Yeager') {
  const isSquare = format === 'square';
  const scale = isSquare ? 1 : 2;
  const config = isSquare ? SQUARE : LANDSCAPE;

  const width = config.width * scale;
  const height = config.height * scale;

  // Responsive title sizing
  const titleLen = title.length;
  let titleSize;
  if (titleLen <= 25) {
    titleSize = config.title.short;
  } else if (titleLen <= 40) {
    titleSize = config.title.medium;
  } else {
    titleSize = config.title.long;
  }
  if (!isSquare) titleSize *= scale;

  const padding = isSquare
    ? `${config.paddingV}px ${config.paddingH}px`
    : `${config.padding * scale}px`;

  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#FDFCFA',
      },
      children: [
        // Left orange accent bar
        {
          type: 'div',
          props: {
            style: {
              width: `${config.bar * scale}px`,
              height: '100%',
              backgroundColor: '#F84200',
              flexShrink: 0,
            },
          },
        },
        // Main content area
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flex: 1,
              padding,
            },
            children: [
              // Brand mark at top
              {
                type: 'div',
                props: {
                  style: {
                    width: `${config.brandMark * scale}px`,
                    height: `${config.brandMark * scale}px`,
                    backgroundColor: '#F84200',
                  },
                },
              },
              // Title + Description (description optional)
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: `${titleSize}px`,
                          fontWeight: 700,
                          fontFamily: 'Satoshi',
                          color: '#1a1a1a',
                          lineHeight: 1.1,
                          marginBottom: description ? `${(isSquare ? config.titleMargin : config.titleMargin * scale)}px` : 0,
                        },
                        children: title,
                      },
                    },
                    ...(description ? [{
                      type: 'div',
                      props: {
                        style: {
                          fontSize: `${config.description * scale}px`,
                          fontWeight: 700,
                          fontFamily: 'Satoshi',
                          color: '#777',
                          lineHeight: 1.35,
                        },
                        children: description,
                      },
                    }] : []),
                  ],
                },
              },
              // Attribution at bottom
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: `${config.author * scale}px`,
                    fontWeight: 700,
                    fontFamily: 'Satoshi',
                    color: '#777',
                  },
                  children: author,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(element, {
    width,
    height,
    fonts: [{ name: 'Satoshi', data: satoshiBold, weight: 700, style: 'normal' }],
  });

  const resvg = new Resvg(svg, { background: '#FDFCFA' });
  const pngBuffer = resvg.render().asPng();
  writeFileSync(outputPath, pngBuffer);
}

function getSlug(filename, frontmatterSlug) {
  if (frontmatterSlug) return frontmatterSlug;
  return basename(filename, '.md')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function processDirectory(dir, outputDir, isEssays = false) {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const files = readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'));

  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf-8');
    const { data } = matter(content);

    if (!data.title || !data.description) {
      console.log(`Skipping ${file}: missing title or description`);
      continue;
    }

    const slug = getSlug(file, data.slug);

    // Generate both landscape and square
    await generateOG(data.title, data.description, join(outputDir, `${slug}.png`), 'landscape', SITE_URL);
    await generateOG(data.title, data.description, join(outputDir, `${slug}-square.png`), 'square', SITE_URL);
    console.log(`Generated: ${slug} (landscape + square)`);
  }
}

async function processHomepage() {
  const content = readFileSync('content/_index.md', 'utf-8');
  const { data } = matter(content);

  if (!data.title || !data.description) {
    console.log('Skipping homepage: missing title or description');
    return;
  }

  const outputDir = 'static/images';
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Homepage uses headline (H1) + description
  const title = data.headline || data.title;
  await generateOG(title, data.description, join(outputDir, 'og-image.png'), 'landscape', SITE_URL);
  await generateOG(title, data.description, join(outputDir, 'og-image-square.png'), 'square', SITE_URL);
  console.log('Generated: og-image (landscape + square)');
}

async function main() {
  console.log('Generating OG images...\n');

  // Essays
  await processDirectory('content/essays', 'static/images/og-essays', true);

  // Non-essay pages
  await processDirectory('content', 'static/images/og-pages', false);

  // Homepage (special case)
  await processHomepage();

  console.log('\nDone!');
}

main().catch(console.error);
