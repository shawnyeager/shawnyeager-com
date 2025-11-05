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
  textSecondary: "#666666",
  accent: "#d63900",
  bgPrimary: "#ffffff",
  bgSecondary: "#f5f5f5",
};

async function generateImage(template, width, height, fontData) {
  const svg = await satori(template, {
    width,
    height,
    fonts: [
      {
        name: "Inter",
        data: fontData,
        weight: 600,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg);
  return resvg.render().asPng();
}

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
    console.error(`  Please ensure Inter-SemiBold.otf exists at this location.`);
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
      const description = data.description || "";

      console.log(`  Processing: ${title}`);
      console.log(`    File: ${file}`);

      // Generate landscape version (1200×630)
      const landscapeTemplate = html(`
        <div style="
          display: flex;
          width: 1200px;
          height: 630px;
          background: linear-gradient(135deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%);
          padding: 40px;
          font-family: 'Inter', sans-serif;
        ">
          <div style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
          ">
            <div style="
              display: flex;
              align-items: flex-start;
              gap: 16px;
              margin-bottom: 16px;
            ">
              <div style="
                display: flex;
                width: 36px;
                height: 36px;
                background: ${COLORS.accent};
                margin-top: 16px;
                flex-shrink: 0;
              "></div>
              <h1 style="
                font-size: 60px;
                font-weight: 600;
                color: ${COLORS.textPrimary};
                line-height: 1.2;
                margin: 0;
                max-width: 1000px;
              ">${title}</h1>
            </div>
            <p style="
              font-size: 34px;
              color: ${COLORS.textSecondary};
              line-height: 1.4;
              margin: 0;
              max-width: 1000px;
              padding-left: 60px;
            ">${description}</p>
          </div>
        </div>
      `);

      const landscapePng = await generateImage(landscapeTemplate, 1200, 630, fontData);
      const landscapeOutput = `${slug}.png`;
      await writeFile(join(OUTPUT_DIR, landscapeOutput), landscapePng);
      console.log(`    Landscape: ${landscapeOutput} (${(landscapePng.length / 1024).toFixed(1)} KB)`);

      // Generate square version (1200×1200)
      const squareTemplate = html(`
        <div style="
          display: flex;
          width: 1200px;
          height: 1200px;
          background: linear-gradient(135deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%);
          padding: 60px;
          font-family: 'Inter', sans-serif;
        ">
          <div style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
          ">
            <div style="
              display: flex;
              align-items: flex-start;
              gap: 24px;
              margin-bottom: 24px;
            ">
              <div style="
                display: flex;
                width: 32px;
                height: 32px;
                background: ${COLORS.accent};
                margin-top: 20px;
                flex-shrink: 0;
              "></div>
              <h1 style="
                font-size: 70px;
                font-weight: 600;
                color: ${COLORS.textPrimary};
                line-height: 1.2;
                margin: 0;
                max-width: 800px;
              ">${title}</h1>
            </div>
            <p style="
              font-size: 36px;
              color: ${COLORS.textSecondary};
              line-height: 1.4;
              margin: 0;
              max-width: 800px;
              padding-left: 64px;
            ">${description}</p>
          </div>
        </div>
      `);

      const squarePng = await generateImage(squareTemplate, 1200, 1200, fontData);
      const squareOutput = `${slug}-square.png`;
      await writeFile(join(OUTPUT_DIR, squareOutput), squarePng);
      console.log(`    Square: ${squareOutput} (${(squarePng.length / 1024).toFixed(1)} KB)`);
      console.log(`    ✓ Generated successfully\n`);
    } catch (error) {
      console.error(`    ✗ Error processing ${file}:`);
      console.error(`      ${error.message}\n`);
    }
  }

  console.log(`\n🎉 Done! Generated ${markdownFiles.length * 2} Open Graph image(s).`);
  console.log(`   Output directory: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
