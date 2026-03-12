// ============================================================
// GitHub Repository Statistics Tool
// This script fetches a user's public repos from GitHub API
// and calculates: Total Repos, Total Stars, Total Forks
// ============================================================

// --- Main async function that runs when button is clicked ---
async function fetchStats() {

  // Step 1: Get the username typed by the user
  const username = document.getElementById("usernameInput").value.trim();

  // Step 2: Validate - make sure the input is not empty
  if (!username) {
    showError("⚠️ Please enter a GitHub username.");
    return;
  }

  // Step 3: Show loading message, hide old results/errors
  showLoading(true);
  hideResult();
  hideError();

  // Step 4: Disable button while fetching to prevent double clicks
  document.getElementById("fetchBtn").disabled = true;

  try {
    // Step 5: Build the GitHub API URL
    // GitHub API returns up to 100 repos per page
    const url = `https://api.github.com/users/${username}/repos?per_page=100`;

    // Step 6: Fetch data from GitHub API using async/await
    const response = await fetch(url);

    // Step 7: Check if user was found (404 = user not found)
    if (response.status === 404) {
      showError(`❌ User "${username}" not found. Please check the username.`);
      return;
    }

    // Step 8: Check for API rate limit (403 = too many requests)
    if (response.status === 403) {
      showError("⏱️ GitHub API rate limit reached. Please wait a minute and try again.");
      return;
    }

    // Step 9: Convert the response to JSON format
    const repos = await response.json();

    // Step 10: Aggregate statistics using reduce()
    // reduce() goes through each repo and adds up the count

    // --- Calculate Total Stars ---
    const totalStars = repos.reduce((sum, repo) => {
      return sum + repo.stargazers_count; // stargazers_count = number of stars
    }, 0); // start from 0

    // --- Calculate Total Forks ---
    const totalForks = repos.reduce((sum, repo) => {
      return sum + repo.forks_count; // forks_count = number of forks
    }, 0); // start from 0

    // Step 11: Create a summary object (structured data)
    const summary = {
      username: username,
      totalRepos: repos.length,
      totalStars: totalStars,
      totalForks: totalForks
    };

    // Step 12: Display the results on the page
    displayResults(summary);

  } catch (error) {
    // Step 13: Handle network errors (no internet, etc.)
    showError("🌐 Network error. Please check your internet connection.");
    console.error("Error:", error);

  } finally {
    // Step 14: Always hide loading & re-enable button when done
    showLoading(false);
    document.getElementById("fetchBtn").disabled = false;
  }
}

// ============================================================
// Helper Functions
// ============================================================

// Show the statistics results on the page
function displayResults(summary) {
  document.getElementById("displayName").textContent = summary.username;
  document.getElementById("totalRepos").textContent = summary.totalRepos;
  document.getElementById("totalStars").textContent = summary.totalStars;
  document.getElementById("totalForks").textContent = summary.totalForks;

  // Make the result section visible
  document.getElementById("resultSection").classList.remove("hidden");
}

// Show or hide the loading message
function showLoading(isVisible) {
  const msg = document.getElementById("loadingMsg");
  if (isVisible) {
    msg.classList.remove("hidden");
  } else {
    msg.classList.add("hidden");
  }
}

// Show an error message
function showError(message) {
  const errorEl = document.getElementById("errorMsg");
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
  showLoading(false);
  document.getElementById("fetchBtn").disabled = false;
}

// Hide the error message
function hideError() {
  document.getElementById("errorMsg").classList.add("hidden");
}

// Hide the result section
function hideResult() {
  document.getElementById("resultSection").classList.add("hidden");
}

// ============================================================
// Allow pressing Enter key to trigger the fetch
// ============================================================
document.getElementById("usernameInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    fetchStats();
  }
});