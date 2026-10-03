import { NextResponse } from "next/server";

const query = `
  query ContributionCalendar($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

type GithubResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
        };
      };
    } | null;
  };
  errors?: { message: string }[];
};

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME || "n4ku7";

  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN is not configured." },
      { status: 503 },
    );
  }

  const to = new Date();
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - 1);

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "nakul-portfolio",
      },
      body: JSON.stringify({
        query,
        variables: {
          username,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
      next: { revalidate: 3600 },
    });

    const payload = (await response.json()) as GithubResponse;
    if (!response.ok || payload.errors?.length) {
      return NextResponse.json(
        { error: payload.errors?.[0]?.message || "GitHub request failed." },
        { status: 502 },
      );
    }

    const weeks = payload.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    const contributionDays = weeks?.flatMap(week => week.contributionDays);
    if (!contributionDays) {
      return NextResponse.json({ error: `GitHub user '${username}' was not found.` }, { status: 404 });
    }

    return NextResponse.json(
      contributionDays.map(({ date, contributionCount }) => ({ date, count: contributionCount })),
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ error: "Unable to reach GitHub." }, { status: 502 });
  }
}
