module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // nueva funcionalidad → bumpa MINOR (1.0.0 → 1.1.0)
        'fix',      // corrección de bug  → bumpa PATCH (1.0.0 → 1.0.1)
        'docs',     // solo documentación  → no bumpa versión
        'style',    // formato, whitespace → no bumpa versión
        'refactor', // refactoring         → no bumpa versión
        'perf',     // mejora performance  → bumpa PATCH
        'test',     // tests               → no bumpa versión
        'build',    // build system        → no bumpa versión
        'ci',       // CI configuration    → no bumpa versión
        'chore',    // tareas generales    → no bumpa versión
        'revert',   // revertir commit     → bumpa PATCH
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
