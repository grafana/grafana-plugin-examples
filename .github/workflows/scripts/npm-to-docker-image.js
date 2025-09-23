const https = require('https');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const baseUrl = 'https://registry.hub.docker.com/v2/repositories/grafana/grafana-dev/tags';

module.exports = async ({ core }) => {
  const { stdout } = await exec('npm view @grafana/ui dist-tags.canary');
  const tag = stdout.trim();

  const exists = await checkIfTagExists(tag);
  if (exists) {
    core.info(`Found grafana/grafana-dev:${tag}`);
    return tag;
  }

  const nextTag = await findNextTag(tag);

  if (nextTag) {
    core.info(`Missing grafana/grafana-dev:${tag}`);
    core.info(`Using grafana/grafana-dev:${nextTag} instead`);
    return nextTag;
  }

  core.setFailed(`Could not find any docker image matching ${tag}`);
};

async function checkIfTagExists(tag) {
  try {
    const response = await httpGet(`${baseUrl}/${tag}`);
    return response.name === tag;
  } catch (error) {
    return false;
  }
}

async function findNextTag(tag) {
  try {
    const { build, version } = parseBuildInfo(tag);
    const name = convertToNameSearchParam(build);
    const response = await httpGet(`${baseUrl}?name=${version}-${name}`);

    let match;

    for (const image of response.results) {
      const info = parseBuildInfo(image.name);

      if (image.name == tag) {
        match = info;
        break;
      }

      if (!match) {
        if (info.build > build) {
          match = info;
        }
        continue;
      }

      if (info.build > build) {
        if (info.build < match.build) {
          match = info;
        }
        continue;
      }
    }

    if (!match) {
      return;
    }

    return match.tag;
  } catch (error) {
    return;
  }
}

function parseBuildInfo(tag) {
  const hypenIndex = tag.lastIndexOf('-');
  const preIndex = tag.lastIndexOf('pre');
  const version = tag.slice(0, hypenIndex);
  const build = parseInt(tag.slice(hypenIndex + 1, preIndex), 10);

  return { version, build, tag };
}

function convertToNameSearchParam(build) {
  if (build % 10 == 9) {
    const target = String(build + 1);
    return target.slice(0, target.length - 1);
  }

  const target = String(build);
  return target.slice(0, target.length - 1);
}

function httpGet(url, maxRetries = 3, retryDelay = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    let timeoutId = null;

    const makeRequest = () => {
      attempts++;

      const req = https.get(url, { timeout: 10000 }, (res) => {
        let data = [];

        res.on('data', (chunk) => {
          data.push(chunk);
        });

        res.on('end', () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          const buffer = Buffer.concat(data).toString();

          // Check if response is successful
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const jsonData = JSON.parse(buffer);
              resolve(jsonData);
            } catch (parseError) {
              const error = new Error(`Failed to parse JSON response from ${url}: ${parseError.message}`);
              error.responseBody = buffer.substring(0, 500); // Include first 500 chars for debugging

              if (attempts < maxRetries) {
                console.warn(
                  `JSON parse error on attempt ${attempts}/${maxRetries} for ${url}. Retrying in ${
                    retryDelay * attempts
                  }ms...`
                );
                timeoutId = setTimeout(makeRequest, retryDelay * attempts); // Exponential backoff
              } else {
                reject(error);
              }
            }
          } else if (res.statusCode >= 500 && attempts < maxRetries) {
            // Retry on server errors (5xx)
            console.warn(
              `Server error ${res.statusCode} on attempt ${attempts}/${maxRetries} for ${url}. Retrying in ${
                retryDelay * attempts
              }ms...`
            );
            timeoutId = setTimeout(makeRequest, retryDelay * attempts); // Exponential backoff
          } else {
            // Non-retryable error or max retries exceeded
            const error = new Error(`HTTP ${res.statusCode} error from ${url}`);
            error.statusCode = res.statusCode;
            error.responseBody = buffer.substring(0, 500); // Include first 500 chars for debugging
            reject(error);
          }
        });

        res.on('error', (err) => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          handleRequestError(err);
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const err = new Error(`Request timeout for ${url}`);
        err.code = 'ETIMEDOUT';
        handleRequestError(err);
      });

      req.on('error', (err) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        handleRequestError(err);
      });

      const handleRequestError = (err) => {
        if (attempts < maxRetries && isRetryableNetworkError(err)) {
          console.warn(
            `Network error on attempt ${attempts}/${maxRetries} for ${url}: ${err.message}. Retrying in ${
              retryDelay * attempts
            }ms...`
          );
          timeoutId = setTimeout(makeRequest, retryDelay * attempts); // Exponential backoff
        } else {
          reject(err);
        }
      };
    };

    makeRequest();
  });
}

function isRetryableNetworkError(error) {
  // Retry on common transient network errors
  const retryableCodes = ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'];
  return retryableCodes.includes(error.code);
}
