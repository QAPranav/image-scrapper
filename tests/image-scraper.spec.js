const { test, expect } = require('@playwright/test');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

test('Scrape Images and Save to CSV', async ({ page }) => {
  const url = 'https://www.google.com/search?sxsrf=AB5stBge9gbsoXQ4QOstFUhgSDRAj9qI3Q:1688162762316&q=cat+images&tbm=isch&sa=X&ved=2ahUKEwjP9pSugOz_AhUKIMAKHbVvAkwQ0pQJegQIDBAB&biw=1280&bih=569&dpr=1.5';
  const numImages = 10; // Specify the number of images you want to capture
  const csvFile = 'image_data.csv';

  // Navigate to the target URL
  await page.goto(url);
  await page.locator('#yDmH0d > c-wiz > div > div > div > div.NIoIEf > div.G4njw > div.AIC7ge > div.CxJub > div.VtwTSb > form:nth-child(2) > div > div > button > span').click();

  // Wait for the image elements to load
  const imageSelector = '.rg_i.Q4LuWd';
  const maxWaitTime = 5000; // Maximum wait time in milliseconds
  let imageElements = null;
  let elapsedWaitTime = 0;

  while (elapsedWaitTime <= maxWaitTime) {
    imageElements = await page.$$(imageSelector);
    if (imageElements.length >= numImages) {
      break;
    }

    await page.waitForTimeout(100); // Wait for 100 milliseconds
    elapsedWaitTime += 100;
  }

  if (imageElements.length < numImages) {
    console.error(`Warning: Found only ${imageElements.length} image elements out of ${numImages}.`);
  }

  // Scrape image URLs
  const imageUrls = await Promise.all(imageElements.slice(0, numImages).map(async (img) => {
    const url = await img.getAttribute('data-src') || await img.getAttribute('src');
    return url;
  }));

  // Save image URLs to CSV
  const csvWriter = createCsvWriter({
    path: csvFile,
    header: [{ id: 'imageUrl', title: 'Image URL' }]
  });

  const records = imageUrls.map(imageUrl => ({ imageUrl }));
  await csvWriter.writeRecords(records);

  // Validate the number of scraped image URLs
  expect(imageUrls.length).toBe(numImages);
});
