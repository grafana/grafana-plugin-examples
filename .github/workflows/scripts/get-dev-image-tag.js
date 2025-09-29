const https = require('https');

const DOCKERHUB_API_URL = 'https://registry.hub.docker.com/v2/repositories/grafana/grafana-dev/tags?page_size=25';
const GRAFANA_DEV_TAG_REGEX = /^(\d+\.\d+\.\d+)-(\d+)$/;
const HTTP_TIMEOUT_MS = 10000;
const RETRYABLE_ERROR_CODES = ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'];

/**
 * Main entry point
 */
module.exports = async ({ core }) => {
  try {
    console.log('Getting latest Grafana dev tag from DockerHub...');

    const latestTag = await getLatestGrafanaDevTag();

    if (!latestTag) {
      core.setFailed('Could not find any Grafana dev tags on DockerHub');
      return;
    }

    core.info(`Found grafana/grafana-dev:${latestTag}`);
    return latestTag;
  } catch (error) {
    core.setFailed(error.message);
  }
};

/**
 * Fetches and returns the latest Grafana dev tag from DockerHub
 * @returns {Promise<string|null>} Latest tag name or null if not found
 */
async function getLatestGrafanaDevTag() {
  try {
    console.log('Fetching latest 25 tags from DockerHub...');
    const response = await httpGet(DOCKERHUB_API_URL);

    if (!response?.results?.length) {
      console.log('No tags found');
      return null;
    }

    console.log(`Found ${response.results.length} tags`);

    const validTags = response.results
      .map((item) => item.name)
      .map(parseGrafanaDevTag)
      .filter(Boolean)
      .sort((a, b) => b.buildNumber - a.buildNumber);

    if (validTags.length === 0) {
      console.log('No valid Grafana dev tags found');
      return null;
    }

    const latestTag = validTags[0];
    console.log(`Latest tag: ${latestTag.tag} (build ${latestTag.buildNumber}, from ${validTags.length} valid tags)`);
    return latestTag.tag;
  } catch (error) {
    console.log(`Error getting latest tag: ${error.message}`);
    return null;
  }
}

/**
 * Parses a Grafana dev tag string and extracts version and build information
 * @param {string} tagName - Tag name to parse (e.g., "12.3.0-17948569556")
 * @returns {Object|null} Parsed tag info or null if invalid
 */
function parseGrafanaDevTag(tagName) {
  const match = tagName.match(GRAFANA_DEV_TAG_REGEX);
  if (!match) {
    return null;
  }

  return {
    tag: tagName,
    version: match[1],
    buildNumber: parseInt(match[2], 10),
  };
}

/**
 * Makes an HTTP GET request with retry logic
 * @param {string} url - URL to fetch
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} retryDelay - Base delay between retries in milliseconds
 * @returns {Promise<Object>} Parsed JSON response
 */
function httpGet(url, maxRetries = 10, retryDelay = 2000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    let timeoutId = null;

    const clearRetryTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const scheduleRetry = (error) => {
      if (attempts < maxRetries && isRetryableError(error)) {
        const delay = retryDelay * attempts;
        console.warn(`Retrying ${url} (attempt ${attempts}/${maxRetries}) in ${delay}ms: ${error.message}`);
        timeoutId = setTimeout(makeRequest, delay);
      } else {
        reject(error);
      }
    };

    const makeRequest = () => {
      attempts++;

      const req = https.get(url, { timeout: HTTP_TIMEOUT_MS }, (res) => {
        const chunks = [];

        res.on('data', (chunk) => chunks.push(chunk));

        res.on('end', () => {
          clearRetryTimeout();
          const responseBody = Buffer.concat(chunks).toString();

          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseBody));
            } catch (parseError) {
              const error = new Error(`Failed to parse JSON from ${url}: ${parseError.message}`);
              error.responseBody = responseBody.substring(0, 500);
              scheduleRetry(error);
            }
          } else if (res.statusCode >= 500) {
            const error = new Error(`Server error ${res.statusCode} from ${url}`);
            error.statusCode = res.statusCode;
            scheduleRetry(error);
          } else {
            const error = new Error(`HTTP ${res.statusCode} error from ${url}`);
            error.statusCode = res.statusCode;
            error.responseBody = responseBody.substring(0, 500);
            reject(error);
          }
        });

        res.on('error', (err) => {
          clearRetryTimeout();
          scheduleRetry(err);
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const error = new Error(`Request timeout for ${url}`);
        error.code = 'ETIMEDOUT';
        scheduleRetry(error);
      });

      req.on('error', (err) => {
        clearRetryTimeout();
        scheduleRetry(err);
      });
    };

    makeRequest();
  });
}

/**
 * Determines if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is retryable
 */
function isRetryableError(error) {
  return RETRYABLE_ERROR_CODES.includes(error.code) || error.statusCode >= 500;
}
