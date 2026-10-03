## GitHub activity

The activity heatmap reads the contribution calendar for `GITHUB_USERNAME` through GitHub's GraphQL API.

Create `.env.local` with:

```env
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=n4ku7
```

The token stays server-side and is never exposed to the browser. A token with read access to the profile is sufficient for public contributions; private contribution counts require the account permissions allowed by GitHub.
