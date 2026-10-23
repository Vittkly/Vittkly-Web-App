export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(?:(VIT-\d+)\s+(.+)|(\w+)(?:\(([^)]+)\))?:\s+(.+))$/,
      headerCorrespondence: ['ticket', 'subject', 'type', 'scope', 'conventionalSubject'],
    },
  },
  rules: {
    'type-empty': [0],
    'subject-empty': [0],
    'header-match-format': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'header-match-format': ({ header }) => {
          const jiraPattern = /^VIT-\d+\s+.+/;
          const conventionalPattern =
            /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9_-]+\))?:\s+.+/;
          const isValid = jiraPattern.test(header) || conventionalPattern.test(header);
          return [
            isValid,
            'El mensaje de commit debe iniciar con la clave de Jira (ej. "VIT-30 <mensaje>") o seguir Conventional Commits',
          ];
        },
      },
    },
  ],
};
