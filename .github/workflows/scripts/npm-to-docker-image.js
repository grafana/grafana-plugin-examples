const https = require("https");

const npmTag = "npm-tag";
const baseUrl =
  "https://registry.hub.docker.com/v2/repositories/grafana/grafana-dev/tags";

module.exports = async ({ core }) => {
  const tag = core.getInput(npmTag);
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
  const hypenIndex = tag.lastIndexOf("-");
  const preIndex = tag.lastIndexOf("pre");
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

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = [];

        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("end", () => {
          const buffer = Buffer.concat(data).toString();
          resolve(JSON.parse(buffer));
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
