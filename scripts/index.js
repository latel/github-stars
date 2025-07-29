import process from 'node:process'
import fs from 'fs-extra'
import { $fetch } from 'ofetch'
import pLimit from 'p-limit'
import 'dotenv/config'

if (!process.env.GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is not set')
}

async function getReadMe(repo) {
  console.log(`Getting readme for ${repo.full_name}`)
  return $fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
    headers: {
      'authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'accept': 'application/vnd.github.raw+json',
      'user-agent': 'github-stars',
    },
    retry: 3,
    retryDelay: 100,
  })
}

async function getStaredRepos() {
  const perPage = 100
  const repos = []
  let page = 1
  while (true) {
    console.log(`Getting page ${page}`)
    const pageRepos = await $fetch(`https://api.github.com/user/starred`, {
      query: {
        page,
        per_page: perPage,
      },
      headers: {
        'authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'user-agent': 'github-stars',
      },
      retry: 3,
      retryDelay: 100,
    })
    console.log(`Got ${pageRepos.length} repos`)
    repos.push(...pageRepos)
    console.log(`Current repos: ${repos.length}`)
    if (pageRepos.length < perPage) {
      break
    }
    page++
  }
  return repos
}

function saveReadMe(repo, readme) {
  const fileContent = `---
project: ${repo.name}
stars: ${repo.stargazers_count}
description: |-
    ${repo.description}
url: ${repo.html_url}
---

${readme}
`
  fs.ensureDirSync(`stars/${repo.owner.login}`)
  fs.writeFileSync(`stars/${repo.full_name}.md`, fileContent)
}

async function main() {
  try {
    fs.removeSync('stars')
    const repos = await getStaredRepos()

    // 创建并发限制器，最多同时10个请求
    const limit = pLimit(10)

    // 使用 Promise.all 和 limit 来控制并发
    await Promise.all(repos.map(repo =>
      limit(async () => {
        try {
          const readme = await getReadMe(repo)
          saveReadMe(repo, readme)
        }
        catch (e) {
          console.error(`Error getting readme for ${repo.full_name}: ${e}`)
        }
      }),
    ))

    console.log('All repos processed successfully!')
  }
  catch (e) {
    console.error(`Error: ${e}`, e?.response, e?.response?.headers)
    process.exit(1)
  }
}

await main()
