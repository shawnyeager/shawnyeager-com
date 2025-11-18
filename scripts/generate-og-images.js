import satori from 'satori';
import sharp from 'sharp';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

// Load Inter Bold font (700 weight)
// Note: Satori doesn't support WOFF2, requires OTF/TTF format
// This is separate from theme's inter-variable.woff2 used for web
const fontData = readFileSync('assets/fonts/Inter-Bold.otf');

function calculateFontSize(title, maxSize, minSize, maxLength) {
  if (title.length <= 20) return maxSize;
  if (title.length >= maxLength) return minSize;

  const ratio = (title.length - 20) / (maxLength - 20);
  return Math.round(maxSize - (ratio * (maxSize - minSize)));
}

function calculateSquareFontSize(title) {
  // Available width after margins: 700px
  // Inter Bold average char width: ~0.55em

  // Test at max size
  let testSize = 140;
  let avgCharWidth = testSize * 0.55;
  let charsPerLine = Math.floor(700 / avgCharWidth);
  let lines = Math.ceil(title.length / charsPerLine);

  // Scale based on lines, tighter range
  if (lines <= 2) return 140;
  if (lines === 3) return 125;
  if (lines >= 4) return 110;

  return 110;
}

async function generateOGImage(title, outputPath, format = 'landscape') {
  const isSquare = format === 'square';

  // Dimensions
  const dimensions = isSquare
    ? { width: 1200, height: 1200 }
    : { width: 1200, height: 630 };

  // Orange panel dimensions - vertical panel on left for both formats
  const orangeWidth = isSquare ? 300 : 240;
  const orangeHeight = isSquare ? 1200 : 630;

  // Font sizing
  const fontSize = isSquare
    ? calculateSquareFontSize(title)
    : calculateFontSize(title, 90, 64, 60);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
        },
        children: [
          // Orange panel - vertical on left for both formats
          {
            type: 'div',
            props: {
              style: {
                width: `${orangeWidth}px`,
                height: `${orangeHeight}px`,
                backgroundColor: '#F84200',
                flexShrink: 0,
              },
            },
          },
          // Text area
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: `${dimensions.width - orangeWidth}px`,
                height: '100%',
                padding: '0 100px 0 100px',
              },
              children: {
                type: 'div',
                props: {
                  style: {
                    fontSize: `${fontSize}px`,
                    fontWeight: 700,
                    lineHeight: 1.15,
                    color: '#1a1a1a',
                    fontFamily: 'Inter',
                    textAlign: 'left',
                  },
                  children: title,
                },
              },
            },
          },
        ],
      },
    },
    {
      ...dimensions,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

async function main() {
  const essaysDir = 'content/essays';
  const outputDir = 'static/images/og-essays';

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const files = readdirSync(essaysDir).filter(f => f.endsWith('.md') && !f.startsWith('_'));

  for (const file of files) {
    const content = readFileSync(join(essaysDir, file), 'utf-8');
    const { data } = matter(content);

    if (!data.title) {
      console.log(`Skipping ${file}: no title`);
      continue;
    }

    // Use slug from frontmatter, or generate from filename as fallback
    const slug = data.slug || file
      .replace('.md', '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Generate landscape OG image
    await generateOGImage(data.title, join(outputDir, `${slug}.png`), 'landscape');

    console.log(`Generated: ${slug}`);
  }
}

main().catch(console.error);
