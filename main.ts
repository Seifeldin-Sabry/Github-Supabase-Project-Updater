import type {Contributor, GithubProject, GithubUser, ProjectInsert} from './types.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import {format, isAfter} from "https://cdn.skypack.dev/date-fns@^2.29.2";
import {Database} from "./types.ts";
import { load } from "https://deno.land/std@0.201.0/dotenv/mod.ts";

const env = await load();

let ANON_KEY = env["SUPABASE_ANONYMOUS_KEY"];
let PUBLIC_URL = env["SUPABASE_PUBLIC_URL"];
let githubToken = env["PRIVATE_GITHUB_ACCESS_TOKEN"];

const client = createClient<Database>(PUBLIC_URL, ANON_KEY, {
  auth: {persistSession: false}
});

const githubApiVersion = '2022-11-28'
const headers = {
  Authorization: `Bearer ${githubToken}`,
  'X-GitHub-Api-Version': githubApiVersion,
};


async function insertProjects(projects: ProjectInsert[]) {
  const {data, error} = await client.from('projects').insert(projects)
  if (error) {
    console.error(error)
  }
  console.log(data)
}

async function getUserFromGithub(): Promise<GithubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers,
  })
  return await response.json()
}

async function getUserStarredRepositoriesSortByDateDescending({login, starred_url}: GithubUser): Promise<GithubProject[]> {
  const response = await fetch(starred_url, {
    headers,
  })
  let data: GithubProject[] = await response.json();
  data = data.filter((project) => project.owner.login === login && project.visibility === 'public')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return data
}

async function getCollaborators(owner: string, repo: string): Promise<Contributor[]> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
    headers,
  })
  return await response.json()
}

async function getLastTableUpdatedAt() {
    const {data: latestDate, error} = await client.from('projects').select('table_updated_at', {
        head: true,
    }).order('table_updated_at', {ascending: false}).limit(1)
    if (error) {
        console.error(error)
        throw new Error(error.message)
    }
    return latestDate[0].table_updated_at;
}

async function main() {
  const user = await getUserFromGithub();
  if (!user) throw new Error('User not found')
  const starredProjects = await getUserStarredRepositoriesSortByDateDescending(user)
  const created_at = format(new Date(starredProjects[0].created_at), 'dd-MM-yyyy');
  if (isAfter(created_at, getLastTableUpdatedAt())) throw new Error('No new projects')
  const projects = []
  for (const project of starredProjects) {
    const {
      id,
      name: project_name,
      description: project_description,
      html_url: project_url,
      created_at: start_date,
      homepage: project_homepage,
      topics: tools,
      owner: {login},
    } = project

    const collaborators = await getCollaborators(login, project_name)
    projects.push({
      id,
      project_name,
      project_description,
      project_homepage,
      project_url,
      collaborators,
      tools,
      start_date: format(new Date(start_date), 'dd-MM-yyyy'),
      table_updated_at: format(new Date(), 'dd-MM-yyyy'),
    })
  }
  await insertProjects(projects);
}
