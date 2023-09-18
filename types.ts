export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    github_projects: {
        Tables: {
            projects: {
                Row: {
                    collaborators: Json[] | null
                    id: number
                    project_description: string | null
                    project_homepage: string | null
                    project_name: string
                    project_url: string | null
                    start_date: string | null
                    table_updated_at: string | null
                    tools: string[] | null
                }
                Insert: {
                    collaborators?: Json[] | null
                    id: number
                    project_description?: string | null
                    project_homepage?: string | null
                    project_name: string
                    project_url?: string | null
                    start_date?: string | null
                    table_updated_at?: string | null
                    tools?: string[] | null
                }
                Update: {
                    collaborators?: Json[] | null
                    id?: number
                    project_description?: string | null
                    project_homepage?: string | null
                    project_name?: string
                    project_url?: string | null
                    start_date?: string | null
                    table_updated_at?: string | null
                    tools?: string[] | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Project = Database['github_projects']['Tables']['projects']['Row']
export type ProjectInsert = Database['github_projects']['Tables']['projects']['Insert']
export type GithubProject = {
    id: number,
    name: string,
    description?: string,
    html_url: string,
    homepage?: string,
    created_at: string,
    topics?: string[],
    owner: {
        login: string,
    }
    visibility: 'public' | 'private' | 'fork' | 'sources' | 'member' | 'all',
}
export type Contributor = {
    name: string,
    avatar_url: string,
    github_profile: string,
}

export type GithubProjectWithContributors = GithubProject & {
    contributors: Contributor[]
}

export type GithubUser = {
    login: string,
    starred_url: string,
}
