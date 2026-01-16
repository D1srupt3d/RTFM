# Mermaid Diagrams

RTFM supports **Mermaid** diagrams for visualizing workflows, architectures, and relationships.

## Flowcharts

Perfect for documenting processes and workflows:

```mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Check logs]
    E --> F[Fix issue]
    F --> B
    C --> G[Deploy]
    G --> H[End]
```

## Sequence Diagrams

Document API interactions and communication flows:

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database
    
    User->>Browser: Navigate to /docs
    Browser->>Server: GET /api/doc/index
    Server->>Database: Query docs
    Database-->>Server: Return data
    Server-->>Browser: JSON response
    Browser-->>User: Render page
```

## Infrastructure Diagrams

Visualize your homelab or cloud infrastructure:

```mermaid
graph LR
    Internet((Internet))
    Internet --> Router[Router/Firewall]
    Router --> Switch[Network Switch]
    Switch --> Docker[Docker Host]
    Switch --> NAS[NAS Storage]
    Switch --> Pi[Raspberry Pi]
    Docker --> RTFM[RTFM Container]
    Docker --> Proxy[Reverse Proxy]
    Docker --> App1[App Container 1]
    Docker --> App2[App Container 2]
```

## Class Diagrams

Document code structure and relationships:

```mermaid
classDiagram
    class DocumentServer {
        +config: Config
        +express: Express
        +start()
        +loadDocs()
    }
    
    class MarkdownParser {
        +marked: Marked
        +render(content)
        +parseMetadata()
    }
    
    class GitSync {
        +repo: string
        +branch: string
        +pull()
        +clone()
    }
    
    DocumentServer --> MarkdownParser
    DocumentServer --> GitSync
```

## State Diagrams

Show system states and transitions:

```mermaid
stateDiagram-v2
    [*] --> Stopped
    Stopped --> Starting: docker start
    Starting --> Running: Startup complete
    Running --> Stopping: docker stop
    Stopping --> Stopped: Shutdown complete
    Running --> Crashed: Error occurred
    Crashed --> Starting: docker restart
```

## Entity Relationship Diagrams

Document database schemas:

```mermaid
erDiagram
    USER ||--o{ POST : writes
    USER ||--o{ COMMENT : writes
    POST ||--o{ COMMENT : has
    POST ||--o{ TAG : tagged_with
    
    USER {
        int id PK
        string username
        string email
        datetime created_at
    }
    
    POST {
        int id PK
        int user_id FK
        string title
        text content
        datetime published_at
    }
    
    COMMENT {
        int id PK
        int post_id FK
        int user_id FK
        text content
        datetime created_at
    }
    
    TAG {
        int id PK
        string name
    }
```

## Timeline Diagrams

Document project milestones:

```mermaid
timeline
    title RTFM Development Timeline
    section v0.1.0
        Initial Release : Basic markdown rendering
                       : Git integration
    section v0.2.0
        Syntax Highlighting : 16+ languages
                          : Language badges
                          : Theme support
    section v0.3.0
        Mermaid Support : Diagram rendering
                       : Multiple diagram types
                       : Theme integration
```

## Gantt Charts

Project planning and task tracking:

```mermaid
gantt
    title Project Roadmap
    dateFormat YYYY-MM-DD
    section Phase 1
    Research & Planning    :done,    p1, 2024-01-01, 7d
    Setup Infrastructure   :done,    p2, after p1, 5d
    section Phase 2
    Core Development       :active,  p3, after p2, 14d
    Testing & QA          :         p4, after p3, 7d
    section Phase 3
    Documentation         :         p5, after p3, 10d
    Production Deploy     :crit,    p6, after p4, 3d
```

## Git Graphs

Visualize branching strategies:

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
    commit
    checkout develop
    merge feature
    checkout main
    merge develop
```

## Usage Tips

1. **Code Block Language**: Use `mermaid` as the language identifier in your code fence
2. **Theme Aware**: Diagrams adapt to your selected theme
3. **Responsive**: Diagrams scale to fit content area
4. **Syntax**: Follow [Mermaid syntax](https://mermaid.js.org/intro/) for diagram types

## Resources

- [Mermaid Documentation](https://mermaid.js.org/)
- [Live Editor](https://mermaid.live/)
- [Syntax Reference](https://mermaid.js.org/intro/syntax-reference.html)
