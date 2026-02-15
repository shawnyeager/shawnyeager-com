import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import matter from 'gray-matter';

const satoshiBold = readFileSync('assets/fonts/Satoshi-Bold.otf');

// Design config: values derived from approved HTML preview
// Preview at 50% (600×315) → multiply by 2 for 1× (1200×630)
const LANDSCAPE = {
  width: 1200,
  height: 630,
  paddingV: 60,
  paddingH: 80,
  title: { short: 112, medium: 96, long: 76 },
  line: { width: 80, height: 6 },
  domain: 22,
  gap: 48,
  footerGap: 24,
};

// Use SAME RATIOS as landscape for visual consistency
const SQUARE = {
  width: 1200,
  height: 1200,
  paddingV: 114,
  paddingH: 80,
  title: { short: 213, medium: 183, long: 145 },
  line: { width: 80, height: 11 },
  domain: 42,
  gap: 91,
  footerGap: 46,
};

const COLORS = {
  bg: '#1a1a1a',
  title: '#f5f5f4',
  accent: '#FF5733',
  domain: '#a8a8a8',
};

const SITE_URL = 'shawnyeager.com';

async function generateOG(title, outputPath, format = 'landscape') {
  const isSquare = format === 'square';
  const config = isSquare ? SQUARE : LANDSCAPE;
  const scale = 2; // Render at 2× for crispness

  const width = config.width * scale;
  const height = config.height * scale;

  // Responsive title sizing based on character count
  const titleLen = title.length;
  let titleSize;
  if (titleLen <= 25) {
    titleSize = config.title.short;
  } else if (titleLen <= 45) {
    titleSize = config.title.medium;
  } else {
    titleSize = config.title.long;
  }

  const padding = `${config.paddingV * scale}px ${config.paddingH * scale}px`;

  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.bg,
        padding,
      },
      children: [
        // Content wrapper (title + footer)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: `${config.gap * scale}px`,
            },
            children: [
              // Title
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: `${titleSize * scale}px`,
                    fontWeight: 700,
                    fontFamily: 'Satoshi',
                    color: COLORS.title,
                    lineHeight: 1.0,
                    letterSpacing: '-0.03em',
                  },
                  children: title,
                },
              },
              // Footer: line accent + domain
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${config.footerGap * scale}px`,
                  },
                  children: [
                    // Orange line accent
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: `${config.line.width * scale}px`,
                          height: `${config.line.height * scale}px`,
                          backgroundColor: COLORS.accent,
                          marginTop: `${2 * scale}px`, // Optical centering with domain text
                        },
                      },
                    },
                    // Domain
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: `${config.domain * scale}px`,
                          fontWeight: 700,
                          fontFamily: 'Satoshi',
                          color: COLORS.domain,
                        },
                        children: SITE_URL,
                      },
                    },
                  ],
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

  const resvg = new Resvg(svg, { background: COLORS.bg });
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

async function processDirectory(dir, outputDir) {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const files = readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'));

  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf-8');
    const { data } = matter(content);

    if (!data.title) {
      console.log(`Skipping ${file}: missing title`);
      continue;
    }

    const slug = getSlug(file, data.slug);

    // Generate both landscape and square
    await generateOG(data.title, join(outputDir, `${slug}.png`), 'landscape');
    await generateOG(data.title, join(outputDir, `${slug}-square.png`), 'square');
    console.log(`Generated: ${slug} (landscape + square)`);
  }
}

async function processSectionIndexes() {
  // Find all _index.md files recursively
  const findIndexFiles = (dir, files = []) => {
    const indexPath = join(dir, '_index.md');
    if (existsSync(indexPath)) {
      files.push(indexPath);
    }
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        findIndexFiles(join(dir, entry.name), files);
      }
    }
    return files;
  };

  const indexFiles = findIndexFiles('content');
  const outputDir = 'static/images/og-sections';

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  for (const filePath of indexFiles) {
    const content = readFileSync(filePath, 'utf-8');
    const { data } = matter(content);

    if (!data.title && !data.headline) {
      console.log(`Skipping ${filePath}: missing title/headline`);
      continue;
    }

    const title = data.headline || data.title;

    // Determine output filename based on path
    // content/_index.md → og-image (homepage)
    // content/essays/_index.md → essays
    const relativePath = filePath.replace('content/', '').replace('/_index.md', '').replace('_index.md', '');
    const isHomepage = relativePath === '';
    const slug = isHomepage ? 'og-image' : relativePath;
    const outputBase = isHomepage ? 'static/images' : outputDir;

    if (!existsSync(outputBase)) {
      mkdirSync(outputBase, { recursive: true });
    }

    await generateOG(title, join(outputBase, `${slug}.png`), 'landscape');
    await generateOG(title, join(outputBase, `${slug}-square.png`), 'square');
    console.log(`Generated: ${slug} (landscape + square)`);
  }
}

async function main() {
  console.log('Generating OG images...\n');

  await processDirectory('content/essays', 'static/images/og-essays');
  await processDirectory('content/notes', 'static/images/og-notes');
  await processDirectory('content', 'static/images/og-pages');
  await processSectionIndexes();

  console.log('\nDone!');
}

main().catch(console.error);
