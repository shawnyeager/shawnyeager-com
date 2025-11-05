import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";
import { existsSync } from "node:fs";
import { html } from "satori-html";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";

// Paths
const CONTENT_DIR = "./content/essays";
const OUTPUT_DIR = "./static/images/og-essays";
const FONT_PATH = "./assets/fonts/Inter-SemiBold.otf";

// Design tokens from tangerine-theme
const COLORS = {
  textPrimary: "#1a1a1a",
  textSecondary: "#808080",
  accent: "#d63900",
  bgPrimary: "#ffffff",
  bgSecondary: "#f5f5f5",
};

async function main() {
  console.log("🎨 Generating Open Graph images for essays...\n");

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`✓ Created output directory: ${OUTPUT_DIR}\n`);
  }

  // Load font
  let fontData;
  try {
    fontData = await readFile(FONT_PATH);
    console.log(`✓ Loaded font: ${FONT_PATH}\n`);
  } catch (error) {
    console.error(`✗ Error loading font from ${FONT_PATH}`);
    console.error(`  Please ensure Inter-SemiBold.ttf exists at this location.`);
    process.exit(1);
  }

  // Get all markdown files in content directory
  const files = await readdir(CONTENT_DIR);
  const markdownFiles = files.filter((file) => file.endsWith(".md") && !file.startsWith("_"));

  console.log(`Found ${markdownFiles.length} essay(s) to process:\n`);

  for (const file of markdownFiles) {
    const filePath = join(CONTENT_DIR, file);
    const slug = basename(file, ".md");

    try {
      // Parse frontmatter
      const content = await readFile(filePath, "utf-8");
      const { data } = matter(content);
      const title = data.title || "Untitled";

      console.log(`  Processing: ${title}`);
      console.log(`    File: ${file}`);

      // Create HTML template using design tokens
      const template = html(`
        <div style="
          display: flex;
          width: 1200px;
          height: 630px;
          background: linear-gradient(135deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%);
          padding: 80px;
          font-family: 'Inter', sans-serif;
        ">
          <div style="
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 100%;
          ">
            <div style="display: flex; flex-direction: column; margin-top: 60px;">
              <h1 style="
                font-size: 72px;
                font-weight: 600;
                color: ${COLORS.textPrimary};
                line-height: 1.2;
                margin: 0;
                max-width: 900px;
              ">${title}</h1>
            </div>

            <div style="
              display: flex;
              flex-direction: column;
              gap: 8px;
            ">
              <p style="
                font-size: 32px;
                color: ${COLORS.textSecondary};
                margin: 0;
              ">Shawn Yeager</p>
              <p style="
                font-size: 28px;
                color: ${COLORS.textSecondary};
                margin: 0;
              ">shawnyeager.com</p>
            </div>
          </div>
        </div>
      `);

      // Generate SVG using Satori
      const svg = await satori(template, {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            weight: 600,
            style: "normal",
          },
        ],
      });

      // Convert SVG to PNG using resvg
      const resvg = new Resvg(svg);
      const pngBuffer = resvg.render().asPng();

      // Save to output directory
      const outputFile = `${slug}.png`;
      const outputPath = join(OUTPUT_DIR, outputFile);
      await writeFile(outputPath, pngBuffer);

      const sizeKB = (pngBuffer.length / 1024).toFixed(1);
      console.log(`    Output: ${outputFile} (${sizeKB} KB)`);
      console.log(`    ✓ Generated successfully\n`);
    } catch (error) {
      console.error(`    ✗ Error processing ${file}:`);
      console.error(`      ${error.message}\n`);
    }
  }

  console.log(`\n🎉 Done! Generated ${markdownFiles.length} Open Graph image(s).`);
  console.log(`   Output directory: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
