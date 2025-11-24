import { concepts } from './concepts'

export const courses = [
  {
    id: 'java-basics',
    title: 'Java Basics',
    summary: 'Fundamentals: syntax, OOP, collections, I/O, exceptions, generics, streams.',
    conceptIds: ['basics', 'oop', 'collections', 'exceptions', 'generics', 'io', 'streams'],
    level: 'Beginner'
  },
  {
    id: 'multithreading',
    title: 'Multithreading & Concurrency',
    summary: 'Threads, synchronization, atomics, executors, futures, thread-safe collections, deadlocks, parallel streams.',
    conceptIds: ['concurrency', 'threads-basics', 'sync-locks', 'volatile-atomic', 'executors', 'futures-completable', 'threadsafe-collections', 'deadlock', 'parallel-streams'],
    level: 'Intermediate'
  },
  {
    id: 'complete-java',
    title: 'Complete Java (Basic → Advanced)',
    summary: 'A comprehensive path through fundamentals and advanced topics.',
    conceptIds: concepts.map(c => c.id),
    level: 'Mixed'
  }
  ,
  {
    id: 'java-oop',
    title: 'Java OOP',
    summary: 'Encapsulation, inheritance, polymorphism, interfaces, and design basics.',
    level: 'Beginner',
    modules: [
      { type: 'concept', id: 'oop' },
      { type: 'mcq', id: 'oop-encapsulation' },
      { type: 'practice', id: 'oop-account' },
      { type: 'concept', id: 'oop' },
      { type: 'mcq', id: 'oop-polymorphism' },
      { type: 'practice', id: 'oop-areas' },
      { type: 'concept', id: 'oop' },
      { type: 'mcq', id: 'oop-interfaces' },
      { type: 'practice', id: 'oop-greeter-strategy' }
    ]
  }
]

export function findCourse(id) {
  return courses.find(c => c.id === id)
}