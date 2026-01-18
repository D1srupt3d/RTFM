module.exports = {
  site: {
    title: 'RTFM',
    tagline: 'Read The F***ing Manual',
    logo: 'RTFM'
  },
  links: {
    github: '',
    custom: []
  },
  git: {
    // Repository URL for "Edit this page" links
    // Example: 'https://github.com/username/docs'
    repoUrl: process.env.GIT_REPO_URL || '',
    // Branch to edit on (usually 'main' or 'master')
    editBranch: process.env.GIT_EDIT_BRANCH || 'main'
  }
};
