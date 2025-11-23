# Mermaid Diagram Guide

Mermaid is a JavaScript-based diagramming tool that renders markdown-inspired text definitions to create diagrams dynamically. This guide covers all diagram types supported in the blog.

## Basic Usage

To create a Mermaid diagram in your blog post, use a code block with the `mermaid` language tag:

````markdown
```mermaid
graph TD
    A[Start] --> B[End]
```
````

## Flowcharts

Flowcharts are the most common diagram type, perfect for showing processes and decision flows.

### Basic Flowchart

````markdown
```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```
````

### Direction Options

- `graph TD` - Top to bottom (default)
- `graph LR` - Left to right
- `graph BT` - Bottom to top
- `graph RL` - Right to left

### Node Shapes

```mermaid
graph LR
    A[Rectangle]
    B(Rounded)
    C([Stadium])
    D[[Subroutine]]
    E[(Database)]
    F((Circle))
    G>Asymmetric]
    H{Diamond}
    I{{Hexagon}}
    J[/Parallelogram/]
    K[\Parallelogram\]
    L[/Trapezoid\]
    M[\Trapezoid/]
```

### Arrow Types

```mermaid
graph LR
    A --> B
    C --- D
    E -.-> F
    G ==> H
    I -.- J
    K -.text.- L
    M --text--> N
```

## Sequence Diagrams

Perfect for showing interactions between systems or components over time.

````markdown
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database

    User->>Frontend: Click button
    Frontend->>API: POST /api/data
    API->>Database: INSERT query
    Database-->>API: Success
    API-->>Frontend: 200 OK
    Frontend-->>User: Show success
```
````

### Advanced Features

```mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    
    Note over A,B: Initial setup
    
    A->>B: Hello Bob!
    activate B
    B->>A: Hello Alice!
    deactivate B
    
    alt Success case
        A->>B: Request data
        B->>A: Return data
    else Failure case
        A->>B: Request data
        B->>A: Error response
    end
    
    loop Every minute
        A->>B: Heartbeat
    end
    
    par Parallel execution
        A->>B: Task 1
    and
        A->>B: Task 2
    end
```

## Class Diagrams

Show object-oriented class structures and relationships.

````markdown
```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    
    class Dog {
        +String breed
        +bark()
    }
    
    class Cat {
        +String color
        +meow()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat
```
````

### Relationships

- `<|--` Inheritance
- `*--` Composition
- `o--` Aggregation
- `-->` Association
- `--` Link (solid)
- `..>` Dependency
- `..|>` Realization

### Visibility

- `+` Public
- `-` Private
- `#` Protected
- `~` Package/Internal

## State Diagrams

Show state machines and transitions.

````markdown
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Failed: Error
    Failed --> Idle: Retry
    Success --> [*]
    Failed --> [*]: Give up
    
    state Processing {
        [*] --> Validating
        Validating --> Executing
        Executing --> [*]
    }
```
````

## Entity Relationship Diagrams

Perfect for database schema documentation.

````markdown
```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
    
    CUSTOMER {
        string id PK
        string name
        string email UK
        datetime created_at
    }
    
    ORDER {
        string id PK
        string customer_id FK
        datetime order_date
        decimal total
    }
    
    LINE-ITEM {
        string id PK
        string order_id FK
        string product_id FK
        int quantity
        decimal price
    }
```
````

### Relationship Types

- `||--||` One to one
- `||--o{` One to many
- `}o--o{` Many to many
- `||..|{` One to many (optional)

### Attribute Keys

- `PK` Primary Key
- `FK` Foreign Key
- `UK` Unique Key

## Gantt Charts

Show project timelines and task dependencies.

````markdown
```mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    
    section Planning
    Requirements    :done, req, 2024-01-01, 2024-01-15
    Design         :done, des, 2024-01-10, 2024-01-25
    
    section Development
    Backend API    :active, dev1, 2024-01-20, 30d
    Frontend       :dev2, after dev1, 20d
    
    section Testing
    Unit Tests     :test1, after dev1, 10d
    Integration    :test2, after dev2, 15d
    
    section Deployment
    Staging        :deploy1, after test2, 5d
    Production     :deploy2, after deploy1, 3d
```
````

## Pie Charts

Simple data visualization.

````markdown
```mermaid
pie title Technology Stack Usage
    "Kubernetes" : 35
    "Docker" : 25
    "Terraform" : 20
    "Ansible" : 15
    "Other" : 5
```
````

## Git Graphs

Visualize Git branching strategies.

````markdown
```mermaid
gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    branch feature
    checkout feature
    commit
    checkout develop
    merge feature
    checkout main
    merge develop
```
````

## Journey Diagrams

Show user journeys and experiences.

````markdown
```mermaid
journey
    title User Deployment Journey
    section Planning
      Define requirements: 5: User, Team
      Review architecture: 4: User, Architect
    section Development
      Write code: 3: User
      Run tests: 4: User, CI
    section Deployment
      Deploy to staging: 5: User, CI
      Verify deployment: 4: User
      Deploy to production: 5: User, CI
```
````

## Styling and Theming

### Custom Styles

```mermaid
graph TD
    A[Start]:::startClass --> B[Process]:::processClass
    B --> C[End]:::endClass
    
    classDef startClass fill:#90EE90,stroke:#006400,stroke-width:2px
    classDef processClass fill:#87CEEB,stroke:#00008B,stroke-width:2px
    classDef endClass fill:#FFB6C1,stroke:#8B0000,stroke-width:2px
```

### Link Styles

```mermaid
graph LR
    A --> B
    B --> C
    C --> D
    
    linkStyle 0 stroke:#ff3,stroke-width:4px
    linkStyle 1 stroke:#0f0,stroke-width:2px
    linkStyle 2 stroke:#00f,stroke-width:2px,stroke-dasharray: 5 5
```

## Best Practices

### 1. Keep It Simple

- Start with simple diagrams and add complexity as needed
- Use clear, descriptive labels
- Avoid overcrowding diagrams

### 2. Use Consistent Naming

```mermaid
graph TD
    UserService[User Service] --> Database[(User DB)]
    OrderService[Order Service] --> Database
    PaymentService[Payment Service] --> Database
```

### 3. Add Context with Notes

```mermaid
sequenceDiagram
    participant Client
    participant Server
    
    Note over Client,Server: Authentication Flow
    
    Client->>Server: Login request
    Note right of Server: Validate credentials
    Server-->>Client: JWT token
```

### 4. Group Related Items

```mermaid
graph TD
    subgraph Frontend
        A[React App]
        B[Redux Store]
    end
    
    subgraph Backend
        C[API Gateway]
        D[Microservices]
    end
    
    subgraph Data
        E[(Database)]
        F[(Cache)]
    end
    
    A --> C
    C --> D
    D --> E
    D --> F
```

## Common Use Cases for DevOps

### CI/CD Pipeline

```mermaid
graph LR
    A[Code Push] --> B[Build]
    B --> C{Tests Pass?}
    C -->|Yes| D[Build Image]
    C -->|No| E[Notify Developer]
    D --> F[Push to Registry]
    F --> G[Deploy to Staging]
    G --> H{Staging OK?}
    H -->|Yes| I[Deploy to Production]
    H -->|No| E
    I --> J[Monitor]
```

### Infrastructure Architecture

```mermaid
graph TD
    subgraph Internet
        U[Users]
    end
    
    subgraph AWS Cloud
        subgraph VPC
            ALB[Application Load Balancer]
            
            subgraph Public Subnet
                NAT[NAT Gateway]
            end
            
            subgraph Private Subnet
                EKS[EKS Cluster]
                RDS[(RDS Database)]
            end
        end
    end
    
    U --> ALB
    ALB --> EKS
    EKS --> RDS
    EKS --> NAT
```

### Incident Response Flow

```mermaid
stateDiagram-v2
    [*] --> Detected: Alert triggered
    Detected --> Acknowledged: On-call responds
    Acknowledged --> Investigating: Gather information
    Investigating --> Identified: Root cause found
    Identified --> Resolving: Apply fix
    Resolving --> Monitoring: Verify fix
    Monitoring --> Resolved: Confirmed stable
    Monitoring --> Investigating: Issue persists
    Resolved --> [*]
```

## Troubleshooting

### Diagram Not Rendering

1. **Check syntax**: Use [Mermaid Live Editor](https://mermaid.live) to validate
2. **Verify language tag**: Must be exactly `mermaid`
3. **Check for special characters**: Escape quotes and brackets properly
4. **Review error messages**: Check browser console for specific errors

### Common Syntax Errors

❌ **Wrong:**
````markdown
```mermaid
graph TD
    A[Node with "quotes"] --> B
```
````

✅ **Correct:**
````markdown
```mermaid
graph TD
    A["Node with quotes"] --> B
```
````

❌ **Wrong:**
````markdown
```mermaid
graph TD
    A --> B[Node
    with newline]
```
````

✅ **Correct:**
````markdown
```mermaid
graph TD
    A --> B["Node<br/>with newline"]
```
````

## Resources

- [Official Mermaid Documentation](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live) - Test diagrams online
- [Mermaid Cheat Sheet](https://jojozhuang.github.io/tutorial/mermaid-cheat-sheet/)
- [GitHub Mermaid Support](https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/)

## Examples Repository

For more examples, see:
- `content/blog/feature-showcase.md` - Complete feature demonstration
- [Mermaid Examples](https://mermaid.js.org/ecosystem/integrations.html) - Official examples
