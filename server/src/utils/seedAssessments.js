import { Assessment } from '../models/Assessment.js';

export const sampleAssessments = [
  {
    title: 'Quantitative Aptitude Assessment',
    category: 'aptitude',
    skillTag: 'Quantitative',
    difficulty: 'Medium',
    durationMinutes: 15,
    description: 'Evaluate essential speed math, probability, percentages, time & work, and algebra for campus placements.',
    questions: [
      {
        questionText: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
        options: ['65 seconds', '89 seconds', '100 seconds', '75 seconds'],
        correctIndex: 1,
        explanation: 'Speed = 240/24 = 10 m/s. Total distance to cross platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.',
      },
      {
        questionText: 'A can do a piece of work in 12 days and B in 15 days. They work together for 5 days. What fraction of the work is left?',
        options: ['1/4', '1/3', '3/10', '2/5'],
        correctIndex: 0,
        explanation: "A's 1 day work = 1/12, B's 1 day work = 1/15. Together in 1 day = 1/12 + 1/15 = 9/60 = 3/20. In 5 days = 15/20 = 3/4. Remaining work = 1 - 3/4 = 1/4.",
      },
      {
        questionText: 'What is the probability of getting a sum of 9 when two standard 6-sided dice are rolled together?',
        options: ['1/6', '1/8', '1/9', '1/12'],
        correctIndex: 2,
        explanation: 'Favorable outcomes for sum 9 are (3,6), (4,5), (5,4), (6,3), which is 4 pairs. Total outcomes = 36. Probability = 4/36 = 1/9.',
      },
      {
        questionText: 'If the price of sugar increases by 25%, by what percentage must a family reduce its consumption so expenditure remains unchanged?',
        options: ['20%', '25%', '15%', '18%'],
        correctIndex: 0,
        explanation: 'Reduction % = [R / (100 + R)] * 100 = [25 / 125] * 100 = 20%.',
      },
      {
        questionText: 'The average of 5 consecutive odd numbers is 27. What is the value of the largest number?',
        options: ['29', '31', '33', '35'],
        correctIndex: 1,
        explanation: 'For consecutive odd numbers, the average is the middle number. So the numbers are 23, 25, 27, 29, 31. The largest is 31.',
      },
      {
        questionText: 'In a mixture of 60 liters, the ratio of milk and water is 2:1. If this ratio is to be made 1:2, how much water must be added?',
        options: ['40 liters', '50 liters', '60 liters', '70 liters'],
        correctIndex: 2,
        explanation: 'Initial milk = 40 L, water = 20 L. For 1:2 ratio, 40 / (20 + W) = 1/2 => 20 + W = 80 => W = 60 liters.',
      },
    ],
  },
  {
    title: 'Logical Reasoning Assessment',
    category: 'aptitude',
    skillTag: 'Logical Reasoning',
    difficulty: 'Medium',
    durationMinutes: 15,
    description: 'Test analytical reasoning, syllogisms, blood relations, series completion, and coding-decoding.',
    questions: [
      {
        questionText: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
        options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'],
        correctIndex: 1,
        explanation: 'This is a geometric division series; each number is half of the previous number: (1/4) / 2 = 1/8.',
      },
      {
        questionText: 'Statements: All mangoes are golden in color. No golden-colored things are cheap. Conclusions: 1) All mangoes are cheap. 2) Golden-colored mangoes are not cheap.',
        options: ['Only conclusion 1 follows', 'Only conclusion 2 follows', 'Either 1 or 2 follows', 'Neither follows'],
        correctIndex: 1,
        explanation: 'Since no golden things are cheap and all mangoes are golden, mangoes cannot be cheap. Thus conclusion 2 follows.',
      },
      {
        questionText: 'Pointing to a photograph, Rohit said, "She is the daughter of my grandfather’s only son." How is the woman in the photo related to Rohit?',
        options: ['Mother', 'Aunt', 'Sister', 'Daughter'],
        correctIndex: 2,
        explanation: "Rohit's grandfather's only son is Rohit's father. The daughter of Rohit's father is Rohit's sister.",
      },
      {
        questionText: 'If in a certain code, TEACHER is written as VGCEJGT, how is CHILDREN written in that code?',
        options: ['EJKNFTGP', 'EJKNFGTO', 'EJKNFHTP', 'EJKNEGTP'],
        correctIndex: 0,
        explanation: 'Each letter is shifted forward by 2 positions: C(+2)->E, H(+2)->J, I(+2)->K, L(+2)->N, D(+2)->F, R(+2)->T, E(+2)->G, N(+2)->P.',
      },
      {
        questionText: 'Find the odd one out: 3, 5, 11, 14, 17, 21',
        options: ['11', '14', '17', '21'],
        correctIndex: 1,
        explanation: '14 is the only even number in the list; all others are odd.',
      },
      {
        questionText: 'A is to the West of B, C is to the South of A, and D is to the East of C. In which direction is B with respect to D?',
        options: ['North-East', 'South-West', 'North-West', 'South-East'],
        correctIndex: 0,
        explanation: 'C is south of A. D is east of C (so D is south of B). Therefore, B is directly or diagonally North-East of D.',
      },
    ],
  },
  {
    title: 'JavaScript & Web Engineering',
    category: 'technical',
    skillTag: 'JavaScript',
    difficulty: 'Medium',
    durationMinutes: 15,
    description: 'Assess event loop mechanics, closures, asynchronous promises, ES6 syntax, and web DOM fundamentals.',
    questions: [
      {
        questionText: 'What will be the output of console.log(typeof NaN)?',
        options: ['"undefined"', '"NaN"', '"number"', '"object"'],
        correctIndex: 2,
        explanation: 'In JavaScript specification, NaN (Not-a-Number) is a special numeric value, so typeof NaN returns "number".',
      },
      {
        questionText: 'Which statement accurately describes how JavaScript closures work?',
        options: [
          'A function that can only access variables declared with var',
          'A function combined with its lexical environment, allowing access to outer variables even after the outer function finishes executing',
          'A method to encrypt variable contents in the browser cache',
          'An immediately invoked function expression that destroys memory',
        ],
        correctIndex: 1,
        explanation: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment.',
      },
      {
        questionText: 'What is the order of console output: console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);?',
        options: ['1, 2, 3, 4', '1, 4, 3, 2', '1, 4, 2, 3', '1, 3, 4, 2'],
        correctIndex: 1,
        explanation: 'Synchronous code executes first (1, 4), then microtasks in the Promise queue (3), and finally macrotasks in the timer queue (2).',
      },
      {
        questionText: 'What is the main difference between "==" and "===" in JavaScript?',
        options: [
          '"==" performs type coercion before comparison, whereas "===" checks both value and type without coercion',
          '"===" is deprecated in modern ECMAScript specifications',
          '"==" checks memory address references only',
          'There is no functional difference; "===" is syntactic sugar',
        ],
        correctIndex: 0,
        explanation: '"==" is loose equality allowing implicit type conversion; "===" is strict equality requiring identical types and values.',
      },
      {
        questionText: 'What does the spread operator (...) do when applied to an object like {...obj}?',
        options: [
          'Performs a deep clone of all nested objects and prototype methods',
          'Creates a shallow copy of the object own enumerable properties',
          'Deletes all properties with null or undefined values',
          'Converts the object into an iterable JSON string',
        ],
        correctIndex: 1,
        explanation: 'The object spread operator creates a shallow copy of own enumerable properties, copying nested object references rather than cloning them.',
      },
      {
        questionText: 'What will "console.log([1, 2] + [3, 4])" evaluate to in JavaScript?',
        options: ['[1, 2, 3, 4]', '"1,23,4"', 'NaN', 'TypeError'],
        correctIndex: 1,
        explanation: 'The "+" operator with objects/arrays invokes toString() on both operands, yielding "1,2" + "3,4" = "1,23,4".',
      },
    ],
  },
  {
    title: 'Database Management & SQL',
    category: 'technical',
    skillTag: 'SQL',
    difficulty: 'Medium',
    durationMinutes: 15,
    description: 'Test relational algebra, indexing strategies, ACID guarantees, normalization, and complex JOIN queries.',
    questions: [
      {
        questionText: 'Which SQL clause is used to filter records resulting from a GROUP BY aggregation?',
        options: ['WHERE', 'ORDER BY', 'HAVING', 'FILTER'],
        correctIndex: 2,
        explanation: 'WHERE filters individual rows prior to grouping; HAVING filters aggregate groupings produced by GROUP BY.',
      },
      {
        questionText: 'What does the "I" in ACID database transactions represent, and what does it ensure?',
        options: [
          'Integrity: Ensures foreign keys cannot be orphaned',
          'Isolation: Ensures concurrent transactions do not interfere with or observe each other incomplete state',
          'Idempotency: Ensures a query can be executed multiple times with identical effect',
          'Indexing: Guarantees that query lookups operate in logarithmic time',
        ],
        correctIndex: 1,
        explanation: 'Isolation ensures that concurrent transactions execute independently without experiencing dirty reads or unintended side-effects.',
      },
      {
        questionText: 'What is the primary trade-off of adding a B-Tree index to a database column?',
        options: [
          'Faster read queries (SELECT) at the cost of additional storage and slower write operations (INSERT/UPDATE/DELETE)',
          'Lower disk usage with slower read performance',
          'Disables the ability to use foreign keys on that table',
          'Prevents null values from being stored in the column',
        ],
        correctIndex: 0,
        explanation: 'Indexes create search trees that speed up WHERE/JOIN lookups, but every write operation must update both the data and the index.',
      },
      {
        questionText: 'What type of JOIN returns all records from the left table and matched records from the right table, filling with NULL when no match exists?',
        options: ['INNER JOIN', 'LEFT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'],
        correctIndex: 1,
        explanation: 'LEFT OUTER JOIN (or LEFT JOIN) keeps all records from the left-hand table regardless of whether matching records exist on the right.',
      },
      {
        questionText: 'A relational table is in Third Normal Form (3NF) if and only if it is in 2NF and has no:',
        options: ['Primary keys', 'Partial dependencies', 'Transitive functional dependencies', 'Foreign key references'],
        correctIndex: 2,
        explanation: '3NF requires that no non-prime attribute is transitively dependent on any candidate key.',
      },
      {
        questionText: 'In MongoDB vs Relational databases, what is the primary structural difference in document data modeling?',
        options: [
          'MongoDB does not support data indexing',
          'MongoDB stores semi-structured BSON documents and supports embedding related sub-documents rather than enforcing normalized joins',
          'MongoDB transactions cannot update more than one field',
          'Relational databases cannot store numbers',
        ],
        correctIndex: 1,
        explanation: 'MongoDB stores JSON/BSON documents that allow nested objects and arrays, enabling denormalized reads without multi-table joins.',
      },
    ],
  },
  {
    title: 'Core Computer Science Fundamentals',
    category: 'technical',
    skillTag: 'Core CS',
    difficulty: 'Medium',
    durationMinutes: 15,
    description: 'Covers operating system concurrency, virtual memory, computer networks TCP/IP, and object-oriented principles.',
    questions: [
      {
        questionText: 'What is the fundamental difference between a Process and a Thread in modern operating systems?',
        options: [
          'A process has its own dedicated address space and resources; threads share the memory address space of their parent process',
          'Threads cannot run concurrently on multi-core processors',
          'Processes share stack memory, whereas threads have independent heaps',
          'Processes are managed by the hardware; threads are only software illusions',
        ],
        correctIndex: 0,
        explanation: 'A process is an executing program with isolated memory (code, data, heap). Threads are lightweight execution units within a process sharing memory.',
      },
      {
        questionText: 'In the TCP 3-way handshake used to establish a reliable connection, what packets are exchanged?',
        options: ['ACK -> SYN -> FIN', 'SYN -> SYN-ACK -> ACK', 'HELLO -> READY -> OK', 'RST -> SYN -> ACK'],
        correctIndex: 1,
        explanation: 'The client sends SYN, the server responds with SYN-ACK, and the client acknowledges with ACK to establish the connection.',
      },
      {
        questionText: 'What is Deadlock in operating systems, and which of the following is NOT one of Coffman’s four necessary conditions for it to occur?',
        options: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Preemptive Priority Scheduling'],
        correctIndex: 3,
        explanation: 'The 4 Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Preemptive priority scheduling helps prevent deadlock.',
      },
      {
        questionText: 'What is the time complexity of searching for an element in an unsorted array vs a balanced Binary Search Tree (BST)?',
        options: ['O(1) vs O(N)', 'O(N) vs O(log N)', 'O(log N) vs O(N)', 'O(N^2) vs O(log N)'],
        correctIndex: 1,
        explanation: 'Searching an unsorted array requires linear scan O(N). A balanced BST partitions choices in half at each step, taking logarithmic time O(log N).',
      },
      {
        questionText: 'What is Virtual Memory and what problem does Paging solve?',
        options: [
          'Allows an operating system to execute processes whose memory requirements exceed physical RAM by swapping pages to secondary storage',
          'Increases CPU clock frequency by caching assembly instructions',
          'Prevents malicious network packets from entering the kernel',
          'Encrypts variables in cloud environments',
        ],
        correctIndex: 0,
        explanation: 'Virtual memory provides uniform logical address spaces and utilizes disk paging to support applications larger than physical RAM.',
      },
      {
        questionText: 'In Object-Oriented Programming, Polymorphism is best defined as:',
        options: [
          'Hiding implementation details behind public method interfaces',
          'The ability of different objects to respond to the same message/method call in their own specific way',
          'Restricting a class to have only one instantiated instance',
          'Duplicating class code across multiple package namespaces',
        ],
        correctIndex: 1,
        explanation: 'Polymorphism (meaning many forms) allows an interface or method call to behave differently based on the runtime type of the object.',
      },
    ],
  },
];

/**
 * Idempotently seeds assessment tests and questions without deleting or resetting student attempts
 */
export const seedSampleAssessments = async () => {
  try {
    for (const testData of sampleAssessments) {
      await Assessment.findOneAndUpdate(
        { title: testData.title },
        {
          $set: {
            title: testData.title,
            category: testData.category,
            skillTag: testData.skillTag,
            difficulty: testData.difficulty,
            durationMinutes: testData.durationMinutes,
            description: testData.description,
            questions: testData.questions,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`Successfully verified and seeded ${sampleAssessments.length} assessment tests (25-30 MCQs).`);
    return true;
  } catch (error) {
    console.error('Error seeding sample assessments:', error.message);
    return false;
  }
};

