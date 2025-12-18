import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const satoshiBold = readFileSync('assets/fonts/Satoshi-Bold.otf');

// Both formats are 1200px wide - text is width-constrained
// Square has 1.9x height (1200 vs 630) - vertical spacing scales up
// Text sizes stay similar (~10% larger for square to use vertical space)

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
  bar: 28,                                    // similar to landscape
  paddingV: 100,                              // vertical: scaled for height
  paddingH: 64,                               // horizontal: similar to landscape
  brandMark: 72,                              // 1.5x landscape (not 1.9x)
  title: { short: 104, medium: 88, long: 72 }, // ~8% larger than landscape
  description: 36,                            // ~12% larger
  author: 32,                                 // ~14% larger
  titleMargin: 40,                            // scaled for height
};

async function generateOG(title, description, outputPath, format) {
  const isSquare = format === 'square';
  // Landscape renders at 2x for crispness
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
        backgroundColor: '#f8f6f3',
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
              // Title + Description
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
                          letterSpacing: '-0.02em',
                          marginBottom: `${(isSquare ? config.titleMargin : config.titleMargin * scale)}px`,
                        },
                        children: title,
                      },
                    },
                    {
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
                    },
                  ],
                },
              },
              // Author at bottom
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: `${config.author * scale}px`,
                    fontWeight: 700,
                    fontFamily: 'Satoshi',
                    color: '#777',
                  },
                  children: 'Shawn Yeager',
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

  const resvg = new Resvg(svg, { background: '#f8f6f3' });
  const pngBuffer = resvg.render().asPng();
  writeFileSync(outputPath, pngBuffer);
}

// Test with real essays
mkdirSync('/tmp/og-test', { recursive: true });

const essays = [
  {
    slug: 'extraction',
    title: 'Extraction is rational',
    desc: "Every wave of the internet promised to democratize something. Every wave ended in extraction. The pattern isn't greed—it's the money.",
  },
  {
    slug: 'product-first',
    title: 'Product first, partnerships second',
    desc: 'Bitcoin partnerships succeed when product readiness comes first. Prove the product in market, then use partnerships to scale.',
  },
  {
    slug: 'soldiers-scouts',
    title: 'Soldiers, scouts, and the limits of persuasion',
    desc: 'Why smart people dismiss Bitcoin without looking, and where to direct your energy instead.',
  },
  {
    slug: 'sovereignty',
    title: 'Sovereignty without sacrifice',
    desc: 'Freedom tech loses when it demands sacrifice. Winning means building products that are better on every dimension—not just principles.',
  },
  {
    slug: 'bitcoin-sales',
    title: 'Why Bitcoin sales is different from SaaS',
    desc: "Bitcoin sales differs from SaaS because you're asking buyers to rethink money itself, not just evaluate software.",
  },
];

for (const essay of essays) {
  await generateOG(essay.title, essay.desc, `/tmp/og-test/${essay.slug}-landscape.png`, 'landscape');
  await generateOG(essay.title, essay.desc, `/tmp/og-test/${essay.slug}-square.png`, 'square');
  console.log(`Generated: ${essay.slug}`);
}

console.log('\nAll images in /tmp/og-test/');
