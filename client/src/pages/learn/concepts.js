export const concepts = [
  {
    id: 'basics',
    title: 'Java Basics',
    summary: 'Variables, control flow, methods, and basic I/O.',
    tags: ['Basics'],
    difficulty: 'Beginner',
    starterCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Sum:" + (2 + 3));\n    }\n}`,
    steps: [
      {
        id: 'print-hello',
        description: 'Print "Hello, Java" to stdout.',
        stdin: '',
        expectedStdout: 'Hello, Java\n',
        hint: 'Use System.out.println("Hello, Java");',
      },
      {
        id: 'read-input',
        description: 'Read a word from stdin and echo it prefixed with Hi.',
        stdin: 'Alice\n',
        expectedStdout: 'Hi Alice\n',
        hint: 'Use Scanner and nextLine().',
      },
    ],
  },
  {
    id: 'oop',
    title: 'Object‑Oriented Programming',
    summary: 'Classes, objects, encapsulation, inheritance, and polymorphism.',
    tags: ['OOP'],
    difficulty: 'Beginner',
    starterCode: `class Greeter {\n    String greet(String name) { return "Hello, " + name; }\n}\npublic class Main {\n    public static void main(String[] args) {\n        Greeter g = new Greeter();\n        System.out.println(g.greet("World"));\n    }\n}`,
    steps: [
      {
        id: 'encapsulation',
        description: 'Add a private field and a getter in Greeter.',
        stdin: '',
        expectedStdout: 'Hello, World\n',
        hint: 'Add private field message and expose getMessage().',
      },
    ],
  },
  {
    id: 'collections',
    title: 'Collections',
    summary: 'Lists, sets, maps, and iteration.',
    tags: ['Collections'],
    difficulty: 'Intermediate',
    starterCode: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        List<Integer> nums = Arrays.asList(1,2,3);\n        for (int n : nums) System.out.println(n);\n    }\n}`,
    steps: [
      {
        id: 'map-count',
        description: 'Count word frequencies from stdin using a Map.',
        stdin: 'a a b\n',
        expectedStdout: 'a=2\nb=1\n',
        hint: 'Use HashMap and split by spaces.',
      },
    ],
  },
  {
    id: 'streams',
    title: 'Streams',
    summary: 'Functional operations over collections.',
    tags: ['Streams'],
    difficulty: 'Intermediate',
    starterCode: `import java.util.*;\nimport java.util.stream.*;\npublic class Main {\n    public static void main(String[] args) {\n        List<Integer> nums = Arrays.asList(1,2,3,4);\n        int sum = nums.stream().mapToInt(i->i).sum();\n        System.out.println(sum);\n    }\n}`,
    steps: [
      {
        id: 'filter-even',
        description: 'Print only even numbers from stdin.',
        stdin: '1 2 3 4\n',
        expectedStdout: '2\n4\n',
        hint: 'Use filter(i -> i % 2 == 0).',
      },
    ],
  },
  {
    id: 'exceptions',
    title: 'Exceptions',
    summary: 'Try/catch, checked vs unchecked, and custom exceptions.',
    tags: ['Exceptions'],
    difficulty: 'Intermediate',
    starterCode: `public class Main {\n    public static void main(String[] args) {\n        try {\n            int x = Integer.parseInt("42");\n            System.out.println(x);\n        } catch (NumberFormatException e) {\n            System.out.println("error");\n        }\n    }\n}`,
    steps: [
      {
        id: 'handle-parse',
        description: 'Safely parse stdin as int; print error on failure.',
        stdin: 'foo\n',
        expectedStdout: 'error\n',
        hint: 'Wrap parseInt in try/catch.',
      },
    ],
  },
  {
    id: 'generics',
    title: 'Generics',
    summary: 'Parameterize types and avoid casts.',
    tags: ['Generics'],
    difficulty: 'Intermediate',
    starterCode: `import java.util.*;\npublic class Main {\n    static <T> List<T> of(T a, T b) { return Arrays.asList(a,b); }\n    public static void main(String[] args) {\n        List<String> L = of("a","b");\n        for (String s : L) System.out.println(s);\n    }\n}`,
    steps: [
      {
        id: 'generic-box',
        description: 'Create a generic Box<T> with set/get.',
        stdin: '',
        expectedStdout: 'ok\n',
        hint: 'Define class Box<T> { T v; }',
      },
    ],
  },
  {
    id: 'concurrency',
    title: 'Concurrency',
    summary: 'Threads, executors, synchronization basics.',
    tags: ['Concurrency'],
    difficulty: 'Advanced',
    starterCode: `public class Main {\n    public static void main(String[] args) throws Exception {\n        Thread t = new Thread(() -> System.out.println("Hi"));\n        t.start();\n        t.join();\n    }\n}`,
    steps: [
      {
        id: 'executor',
        description: 'Use ExecutorService to run two tasks printing lines.',
        stdin: '',
        expectedStdout: 'Task1\nTask2\n',
        hint: 'Use Executors.newFixedThreadPool(2).',
      },
    ],
  },
  {
    id: 'io',
    title: 'I/O',
    summary: 'Files, streams, and resource management.',
    tags: ['I/O'],
    difficulty: 'Intermediate',
    starterCode: `import java.io.*;\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        System.out.println(s);\n    }\n}`,
    steps: [
      {
        id: 'read-lines',
        description: 'Read two lines and print them reversed line by line.',
        stdin: 'a\nb\n',
        expectedStdout: 'b\na\n',
        hint: 'Store both lines then print in reverse order.',
      },
    ],
  },
]

export function findConcept(id) {
  return concepts.find(c => c.id === id)
}