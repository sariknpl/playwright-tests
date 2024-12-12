const { chromium } = require('playwright');

// Track test results
let passed = 0;
let failed = 0;

const appUrl = "https://animated-gingersnap-8cf7f2.netlify.app/";
const username = "admin";
const password = "password123";

const testCasesData = [
    {
      "id": "Test Case 01",
      "navigationMenu": "Web Application",
      "cardTitle": "Implement user authentication",
      "columnName": "To Do",
      "tagNames": ["Feature", "High Priority"]
    },
    {
      "id": "Test Case 02",
      "navigationMenu": "Web Application",
      "cardTitle": "Fix navigation bug",
      "columnName": "To Do",
      "tagNames": ["Bug"]
    },
    {
      "id": "Test Case 03",
      "navigationMenu": "Web Application",
      "cardTitle": "Design system updates",
      "columnName": "In Progress",
      "tagNames": ["Design"]
    },
    {
      "id": "Test Case 04",
      "navigationMenu": "Mobile Application",
      "cardTitle": "Push notification system",
      "columnName": "To Do",
      "tagNames": ["Feature"]
    },
    {
      "id": "Test Case 05",
      "navigationMenu": "Mobile Application",
      "cardTitle": "Offline mode",
      "columnName": "In Progress",
      "tagNames": ["Feature", "High Priority"]
    },
    {
      "id": "Test Case 06",
      "navigationMenu": "Mobile Application",
      "cardTitle": "App icon design",
      "columnName": "Done",
      "tagNames": ["Design"]
    }
  ]

async function runTest(id, testFunc) {
  try {
    console.log(`Running Test Case: ${id}`);
    await testFunc();  // Run the test function
    passed++;  // If no error, mark as passed
    console.log(`Test Passed: ${id}`);
  } catch (error) {
    failed++;  // If an error occurs, mark as failed
    console.error(`Test Failed: ${id}`);
    console.error(error);  // Log the error details
  }
}

async function runTests() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Login to the demo app url and wait until Projects page loads.
  await page.goto(appUrl);
  await page.fill('input[id="username"]', username);
  await page.fill('input[id="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('h1:text("Projects")');  
  console.log('Successfully able to login to demo application.')

for (const testCase of testCasesData) {
	id = testCase.id;
	navMenu = testCase.navigationMenu;
	column = testCase.columnName
	card = testCase.cardTitle
	tags = testCase.tagNames

    await runTest(id, async () => {
      try {
        await page.click(`text="${navMenu}"`);
        await page.waitForSelector(`text="${column}"`);
        
        // Locate dashboard card based on card title text
        const cardLocator = await page.locator(`h3:has-text("${card}")`);
        

        // Locate columns and verify dashboard card is under correct column
        const columnLocator = await cardLocator.locator('xpath=..//..//preceding-sibling::h2');
        const columnText = await columnLocator.textContent();
        if (!columnText.includes(column)) {
          throw new Error(`Dashboard card "${card}" not found in column "${column}"`);
        }

        // Retrieve tags present in each dashboard card
        const tagsLocator = await cardLocator.locator('xpath=..//span[contains(@class, "rounded-full")]');
        const tagsText = await tagsLocator.allTextContents();

        // Verify that the expected tag is included in the retrieved tags 
        tags.forEach(tag => {
          if (!tagsText.includes(tag)) {
            throw new Error(`Tag "${tag}" not found on the dashboard card "${card}"`);
          }
        });


      } catch (error) {
        // Catch errors in this specific test case and re-throw to be caught in runTest
        console.error(`Error found in test "${testCase.id}":`, error);
        throw error;
      }
    });
  }

  // Closing the browser
  await browser.close();

  // Log the final results
  console.log('--------------------------------------');
  console.log(`Total Tests Passed: ${passed}`);
  console.log(`Total Tests Failed: ${failed}`);
}

runTests();
