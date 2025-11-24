export const practices = {
  'oop-account': {
    id: 'oop-account',
    title: 'Account: Encapsulation & Invariants',
    goal: 'Implement deposit/withdraw with non-negative balance and valid amounts.',
    starterCode: `import java.util.*;\nclass Account {\n  private int balance = 0;\n  public int getBalance(){ return balance; }\n  public void deposit(int amt){ /* TODO: enforce amt>0 */ }\n  public boolean withdraw(int amt){ /* TODO: enforce amt>0 and balance>=amt */ return false; }\n}\npublic class Main {\n  public static void main(String[] args){\n    Scanner sc = new Scanner(System.in);\n    Account a = new Account();\n    int n = sc.nextInt();\n    for(int i=0;i<n;i++){\n      String op = sc.next(); int x = sc.nextInt();\n      if (op.equals("D")) a.deposit(x);\n      else if (op.equals("W")) a.withdraw(x);\n    }\n    System.out.println(a.getBalance());\n  }\n}`,
    stdin: '5\nD 10\nD 5\nW 3\nD 2\nW 4\n',
    expectedStdout: '10\n',
    hint: 'Validate input in methods; maintain invariants by refusing invalid operations.'
  },
  'oop-areas': {
    id: 'oop-areas',
    title: 'Polymorphic Area Calculator',
    goal: 'Use inheritance and overriding to compute areas for shapes.',
    starterCode: `import java.util.*;\nclass Shape{ double area(){ return 0; } }\nclass Circle extends Shape{ double r; Circle(double r){ this.r=r; } @Override double area(){ return Math.PI*r*r; } }\nclass Rect extends Shape{ double w,h; Rect(double w,double h){ this.w=w; this.h=h; } @Override double area(){ return w*h; } }\npublic class Main {\n  public static void main(String[] args){\n    Scanner sc = new Scanner(System.in);\n    int n = sc.nextInt();\n    List<Shape> L = new ArrayList<>();\n    for(int i=0;i<n;i++){\n      String t = sc.next();\n      if ("C".equals(t)) L.add(new Circle(sc.nextDouble()));\n      else if ("R".equals(t)) L.add(new Rect(sc.nextDouble(), sc.nextDouble()));\n    }\n    for(Shape s: L) System.out.println(String.format("%.2f", s.area()));\n  }\n}`,
    stdin: '3\nC 2\nR 3 4\nC 1\n',
    expectedStdout: '12.57\n12.00\n3.14\n',
    hint: 'Override area(); format to 2 decimals.'
  },
  'oop-greeter-strategy': {
    id: 'oop-greeter-strategy',
    title: 'Strategy Pattern via Interfaces',
    goal: 'Select greeter implementation based on input; print a greeting.',
    starterCode: `import java.util.*;\ninterface Greeter { String greet(String name); }\nclass FormalGreeter implements Greeter { public String greet(String n){ return "Hello, " + n; } }\nclass CasualGreeter implements Greeter { public String greet(String n){ return "Hi " + n; } }\npublic class Main {\n  public static void main(String[] args){\n    Scanner sc = new Scanner(System.in);\n    String type = sc.next(); String name = sc.next();\n    // TODO: select greeter by type and print greeting\n  }\n}`,
    stdin: 'casual Alice\n',
    expectedStdout: 'Hi Alice\n',
    hint: 'Use if/else or a map to select implementation.'
  }
}

export function getPractice(id){ return practices[id] }