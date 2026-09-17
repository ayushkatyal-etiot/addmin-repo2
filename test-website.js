const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log("🧪 Testing website at http://localhost:3000...");

    const response = await page.goto("http://localhost:3000", {
      waitUntil: "networkidle",
      timeout: 10000
    });

    if (!response) {
      throw new Error("Failed to navigate to page");
    }

    const title = await page.title();
    console.log(`✅ Page loaded successfully`);
    console.log(`📄 Page title: "${title}"`);

    const heading = await page.locator("h1").textContent();
    console.log(`📝 Heading text: "${heading}"`);

    // Check if page has content
    const pageContent = await page.content();
    if (pageContent.includes("AddMin")) {
      console.log("✅ AddMin content found on page");
    }

    console.log("\n✨ Website is working!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
