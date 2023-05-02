function createGroups(num, initialValues) {
  const groups = new Array(num);

  for (let i = 0; i < num; i++) {
    groups[i] = initialValues ? [...initialValues] : [];
  }

  return groups;
}

function filterIntoGroups(arr, filter, numGroups, isLint) {
  const filtered = arr.filter(filter);
  const acceptanceTests = filtered.filter(module => module.includes('acceptance'));
  const adapters = filtered.filter(module => module.includes('adapters'));
  const initializers = filtered.filter(module => module.includes('initializers'));
  const _preIncludedTests = [...acceptanceTests, ...adapters, ...initializers, 'ember-test'];
  const preIncludedTests = new Set(_preIncludedTests);
  const groups = isLint ? createGroups(numGroups) : createGroups(numGroups, _preIncludedTests);

  for (let i = 0; i < filtered.length; i++) {
    const test = filtered[i];
    if (preIncludedTests.has(test)) {
      continue;
    }
    groups[i % numGroups].push(test);
  }

  return groups;
}

function isLintTest(name) {
  return name.match(/\.(jshint|(es|style)?lint-test)$/);
}

function isNotLintTest(name) {
  return !isLintTest(name);
}

export default function splitTestModules(modules, split, partitions) {
  if (split < 1) {
    throw new Error('You must specify a split greater than 0');
  }

  const lintTestGroups = filterIntoGroups(modules, isLintTest, split, true);
  const otherTestGroups = filterIntoGroups(modules, isNotLintTest, split);
  const tests = [];

  for (let i = 0; i < partitions.length; i++) {
    const partition = parseInt(partitions[i], 10);
    if (isNaN(partition)) {
      throw new Error('You must specify numbers for partition (you specified \'' + partitions + '\')');
    }

    if (split < partition) {
      throw new Error('You must specify partitions numbered less than or equal to your split value of ' + split);
    } else  if (partition < 1) {
      throw new Error('You must specify partitions numbered greater than 0');
    }

    const group = partition - 1;
    tests.push(...lintTestGroups[group], ...otherTestGroups[group]);
  }

  return tests;
}
