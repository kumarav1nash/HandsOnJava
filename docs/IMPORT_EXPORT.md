# Problem Import/Export

This document explains how to export and import problems with their sample and hidden test cases.

## Endpoints

- `GET /api/problems/{id}/export` — returns a `ProblemPack` JSON containing metadata, `samples`, and `hidden` tests.
- `POST /api/problems/import` — accepts a `ProblemPack` JSON and creates/updates the problem and its tests.

## JSON Schema (informal)

```
ProblemPack {
  id: string,
  title: string,
  statement?: string,
  inputSpec?: string,
  outputSpec?: string,
  constraints?: string,
  samples?: TestCase[],
  hidden?: TestCase[]
}

TestCase {
  input: string,
  expectedOutput: string
}
```

### Example

```
{
  "id": "two-sum",
  "title": "Two Sum",
  "statement": "Given an array of integers, return indices...",
  "inputSpec": "n, array, target",
  "outputSpec": "two indices",
  "constraints": "1 <= n <= 1e5",
  "samples": [ { "input": "3\n1 2 3\n3", "expectedOutput": "0 1" } ],
  "hidden": [ { "input": "5\n2 7 11 15 9\n9", "expectedOutput": "0 4" } ]
}
```

## Storage Notes

- JPA storage supports both sample and hidden tests via the repository.
- Memory storage mode is read-only for test cases; imports require `STORAGE_TYPE=jpa`.

## Round-Trip Guarantee

- Export then import of the same `ProblemPack` preserves all fields and test cases.