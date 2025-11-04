# Problem Import/Export

This document explains how to export and import problems with their sample and hidden test cases.

## Endpoints

- `GET /api/problems/{id}/export` — returns a `ProblemPack` JSON containing metadata, `samples`, and `hidden` tests.
- `POST /api/problems/import` — accepts a `ProblemPack` JSON and creates/updates the problem and its tests.
- `GET /api/problems/{id}/export.csv` — returns CSV rows for a single problem and all its tests.
- `GET /api/problems/export.csv` — returns CSV rows for all problems and their tests.
- `POST /api/problems/import/csv` — accepts CSV content and imports problems/tests.

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
## CSV Format

Header:

```
id,title,statement,inputSpec,outputSpec,constraints,isSample,input,expectedOutput
```

Notes:
- Each row represents one test case. Problem metadata is repeated across rows for the same `id`.
- `isSample` is `true` for visible/sample tests and `false` for hidden tests.
- Newlines in `input` and `expectedOutput` are escaped as `\n`; quotes are doubled per CSV rules.

Example row:

```
two-sum,Two Sum,"Given an array...",n,indices,"1 <= n <= 1e5",true,"3\n1 2 3\n3","0 1"
```