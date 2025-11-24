export const mcqSets = {
  'oop-encapsulation': {
    id: 'oop-encapsulation',
    title: 'Encapsulation Basics',
    questions: [
      {
        prompt: 'Which approach best enforces encapsulation in a class?',
        options: [
          { id: 'a', text: 'Use private fields with getters/setters', correct: true },
          { id: 'b', text: 'Expose public mutable fields', correct: false },
          { id: 'c', text: 'Use package-private fields everywhere', correct: false }
        ],
        explanation: 'Private fields prevent external mutation; getters/setters can enforce invariants.'
      },
      {
        prompt: 'A setter should…',
        options: [
          { id: 'a', text: 'Validate and enforce invariants', correct: true },
          { id: 'b', text: 'Bypass validation for performance', correct: false },
          { id: 'c', text: 'Always be public regardless of invariants', correct: false }
        ],
        explanation: 'Setters are a control point to maintain class invariants and protect state.'
      }
    ]
  },
  'oop-polymorphism': {
    id: 'oop-polymorphism',
    title: 'Polymorphism & Inheritance',
    questions: [
      {
        prompt: 'Dynamic method dispatch selects method implementation based on…',
        options: [
          { id: 'a', text: 'Runtime type of the object', correct: true },
          { id: 'b', text: 'Compile-time type of the reference', correct: false },
          { id: 'c', text: 'A compiler flag', correct: false }
        ],
        explanation: 'Java uses the runtime type to select overridden methods.'
      },
      {
        prompt: '@Override indicates…',
        options: [
          { id: 'a', text: 'Method overriding', correct: true },
          { id: 'b', text: 'Method overloading', correct: false }
        ],
        explanation: '@Override is used when subclass provides its own implementation of a superclass method.'
      }
    ]
  },
  'oop-interfaces': {
    id: 'oop-interfaces',
    title: 'Interfaces & Abstraction',
    questions: [
      {
        prompt: 'Interfaces primarily provide…',
        options: [
          { id: 'a', text: 'Abstraction contracts', correct: true },
          { id: 'b', text: 'State storage', correct: false }
        ],
        explanation: 'Interfaces define behavior contracts without state (except constants).'
      }
    ]
  }
}

export function getMcq(id) { return mcqSets[id] }