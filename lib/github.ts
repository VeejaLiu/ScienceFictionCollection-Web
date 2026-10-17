
export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export async function fetchRepoContents(owner: string, repo: string, path: string = ""): Promise<GitHubFile[] | GitHubFile> {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repository contents: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!Array.isArray(data)) {
    // If it's a single file, GitHub returns an object.
    return data;
  }

  // Sort: Directories first, then files
  return data.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === "dir" ? -1 : 1;
  });
}

/** Collect readable works from an author directory, including nested series. */
export async function fetchAuthorBooks(owner: string, repo: string, path: string): Promise<GitHubFile[]> {
  const contents = await fetchRepoContents(owner, repo, path);
  if (!Array.isArray(contents)) {
    throw new Error('作者路径不是目录');
  }

  const groups = await Promise.all(contents.map(async (entry) => {
    if (entry.type === 'dir') {
      return fetchAuthorBooks(owner, repo, entry.path);
    }
    return /\.(txt|md)$/i.test(entry.name) ? [entry] : [];
  }));
  return groups.flat();
}

export async function fetchFileContent(downloadUrl: string): Promise<string> {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file content: ${response.statusText}`);
  }
  return response.text();
}
