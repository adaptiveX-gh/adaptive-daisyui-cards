# Phase 4 Architecture Diagrams

Visual representations of the LLM-powered content generation system.

---

## System Architecture

```mermaid
graph TB
    Client[Client Application]
    API[API Routes<br/>presentations.js]

    subgraph "Content Generation Modes"
        Fast[Fast Mode<br/>ContentGenerator<br/>Phase 1 Database]
        Smart[Smart Mode<br/>LLMContentGenerator<br/>Phase 4 LLM]
    end

    subgraph "LLM Pipeline - 3 Stages"
        PD[Stage 1<br/>PresentationDesigner<br/>Structure & Outline]
        VD[Stage 2<br/>VisualDesigner<br/>Layout Selection]
        CW[Stage 3<br/>Copywriter<br/>Final Copy]
    end

    subgraph "LLM Providers"
        Adapter[LLMProviderAdapter<br/>Abstract Base]
        Gemini[GeminiLLMAdapter]
        GPT[GPTAdapter<br/>Future]
        Claude[ClaudeAdapter<br/>Future]
    end

    subgraph "Prompt System"
        Loader[PromptLoader<br/>Load & Cache]
        Templates[Markdown Templates<br/>Frameworks, Layouts, Tone]
    end

    Stream[StreamingService<br/>Existing Phase 3]
    SSE[SSE to Client<br/>Progressive Assembly]

    Client -->|POST /stream| API
    API --> Fast
    API --> Smart

    Smart --> PD
    PD --> VD
    VD --> CW

    PD --> Adapter
    VD --> Adapter
    CW --> Adapter

    Adapter --> Gemini
    Adapter -.-> GPT
    Adapter -.-> Claude

    PD --> Loader
    VD --> Loader
    CW --> Loader

    Loader --> Templates

    Fast --> Stream
    CW --> Stream
    Stream --> SSE
    SSE --> Client

    style Smart fill:#e1f5ff
    style PD fill:#fff3cd
    style VD fill:#fff3cd
    style CW fill:#fff3cd
    style Gemini fill:#d1ecf1
```

---

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant LLMGen as LLMContentGenerator
    participant PD as PresentationDesigner
    participant VD as VisualDesigner
    participant CW as Copywriter
    participant LLM as LLM Provider
    participant Stream as StreamingService

    Client->>API: POST /stream (mode: smart)
    API->>LLMGen: generatePresentation(params)

    Note over LLMGen,LLM: Stage 1: Structure
    LLMGen->>PD: generateStructure()
    PD->>LLM: Prompt: "Generate outline for topic"
    LLM-->>PD: JSON structure
    PD-->>LLMGen: { sections[], flow, narrativeArc }

    Note over LLMGen,LLM: Stage 2: Layouts
    LLMGen->>VD: assignLayouts(structure)
    VD->>LLM: Prompt: "Map sections to layouts"
    LLM-->>VD: JSON layout plan
    VD-->>LLMGen: { cards: [{ layout, imagePrompt }] }

    Note over LLMGen,LLM: Stage 3: Copywriting
    LLMGen->>CW: generateCards(layoutPlan, structure)
    loop For each card
        CW->>LLM: Prompt: "Write copy for card N"
        LLM-->>CW: JSON content
    end
    CW-->>LLMGen: Array<Card>

    LLMGen-->>API: Complete cards
    API->>Stream: Stream to client

    Note over Stream,Client: Existing Phase 3 Streaming
    Stream-->>Client: SSE: skeleton
    Stream-->>Client: SSE: content
    Stream-->>Client: SSE: style
    Stream-->>Client: SSE: complete
```

---

## Service Dependencies

```mermaid
graph LR
    subgraph "API Layer"
        Routes[routes/presentations.js]
    end

    subgraph "Orchestration Layer"
        Orch[LLMContentGenerator]
    end

    subgraph "Service Layer"
        PD[PresentationDesigner]
        VD[VisualDesigner]
        CW[Copywriter]
        PL[PromptLoader]
    end

    subgraph "Adapter Layer"
        Base[LLMProviderAdapter]
        Impl[GeminiLLMAdapter]
    end

    subgraph "Data Layer"
        Prompts[Markdown Prompts]
        Schemas[Content Schemas]
    end

    Routes --> Orch
    Orch --> PD
    Orch --> VD
    Orch --> CW

    PD --> PL
    VD --> PL
    CW --> PL

    PD --> Base
    VD --> Base
    CW --> Base

    Base --> Impl

    PL --> Prompts
    CW --> Schemas

    style Orch fill:#e1f5ff
    style PD fill:#fff3cd
    style VD fill:#fff3cd
    style CW fill:#fff3cd
```

---

## 3-Stage Pipeline Detail

```mermaid
graph TB
    Input[User Input<br/>Topic, Type, Audience]

    subgraph "Stage 1: Structure"
        S1_Load[Load Prompts<br/>base.md + framework.md]
        S1_LLM[Call LLM]
        S1_Parse[Parse & Validate<br/>Structure JSON]
        S1_Out[Output: Outline<br/>sections, flow, arc]
    end

    subgraph "Stage 2: Visual Design"
        S2_Load[Load Prompts<br/>layout-catalog.md]
        S2_LLM[Call LLM]
        S2_Parse[Parse & Validate<br/>Layout Plan JSON]
        S2_Out[Output: Layout Plan<br/>layout per card + images]
    end

    subgraph "Stage 3: Copywriting"
        S3_Load[Load Prompts<br/>tone.md + sections.md]
        S3_Loop{For Each<br/>Card}
        S3_LLM[Call LLM]
        S3_Parse[Parse & Validate<br/>Content JSON]
        S3_Out[Output: Complete Cards<br/>ready for streaming]
    end

    Output[Stream to Client<br/>SSE Pipeline]

    Input --> S1_Load
    S1_Load --> S1_LLM
    S1_LLM --> S1_Parse
    S1_Parse --> S1_Out

    S1_Out --> S2_Load
    S2_Load --> S2_LLM
    S2_LLM --> S2_Parse
    S2_Parse --> S2_Out

    S2_Out --> S3_Load
    S3_Load --> S3_Loop
    S3_Loop -->|Card N| S3_LLM
    S3_LLM --> S3_Parse
    S3_Parse --> S3_Loop
    S3_Loop -->|Done| S3_Out

    S3_Out --> Output

    style S1_Out fill:#d4edda
    style S2_Out fill:#d4edda
    style S3_Out fill:#d4edda
```

---

## Prompt Template System

```mermaid
graph TB
    subgraph "Prompt Structure"
        Base[base.md<br/>Core instructions<br/>for service]

        subgraph "Domain-Specific"
            Framework[frameworks/*.md<br/>Pitch, Education, etc.]
            Layouts[layouts/*.md<br/>Layout selection guides]
            Tone[tone/*.md<br/>Professional, Casual, etc.]
        end

        Examples[examples/*.json<br/>Few-shot examples]
    end

    subgraph "Composition"
        Compose[Compose Final Prompt]
        Variables[Insert Variables<br/>topic, cardCount, etc.]
    end

    LLM[LLM Provider]
    Response[Structured JSON<br/>Response]

    Base --> Compose
    Framework --> Compose
    Examples --> Compose
    Layouts --> Compose
    Tone --> Compose

    Compose --> Variables
    Variables --> LLM
    LLM --> Response

    style Base fill:#e1f5ff
    style Compose fill:#fff3cd
    style Response fill:#d4edda
```

---

## Error Handling Flow

```mermaid
graph TB
    Start[LLM Request]
    Call[Call LLM API]
    Success{Success?}
    Parse[Parse Response]
    Valid{Valid JSON?}
    Schema{Passes Schema?}
    Return[Return Result]

    Retry{Retries<br/>< 3?}
    Fallback[Fallback to<br/>Fast Mode]
    Error[Return Error]

    Start --> Call
    Call --> Success

    Success -->|Yes| Parse
    Success -->|No| Retry

    Parse --> Valid
    Valid -->|Yes| Schema
    Valid -->|No| Retry

    Schema -->|Yes| Return
    Schema -->|No| Retry

    Retry -->|Yes| Call
    Retry -->|No| Fallback

    Fallback --> Return

    style Return fill:#d4edda
    style Fallback fill:#fff3cd
    style Error fill:#f8d7da
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Client]
        CLI[CLI Tool]
        Skill[Claude Code Skill]
    end

    subgraph "API Server"
        Express[Express Server]
        Routes[Route Handlers]

        subgraph "Content Generation"
            Fast[Fast Mode<br/>Database]
            Smart[Smart Mode<br/>LLM Pipeline]
        end

        Cache[Prompt Cache<br/>In-Memory]
    end

    subgraph "External Services"
        GeminiAPI[Gemini API]
        ImageGen[Image Generation<br/>Phase 2]
    end

    subgraph "Streaming Layer"
        SSE[SSE Service<br/>Phase 3]
        Connections[Connection Store]
    end

    subgraph "Storage"
        Prompts[Prompt Templates<br/>Markdown Files]
        Env[Environment Config]
    end

    Web --> Express
    CLI --> Express
    Skill --> Express

    Express --> Routes
    Routes --> Fast
    Routes --> Smart

    Smart --> Cache
    Cache --> Prompts

    Smart --> GeminiAPI
    Fast --> ImageGen
    Smart --> ImageGen

    Routes --> SSE
    SSE --> Connections

    Smart --> Env

    SSE --> Web
    SSE --> CLI
    SSE --> Skill
```

---

## Request Flow Timeline

```mermaid
gantt
    title Smart Mode Request Timeline (6-card presentation)
    dateFormat X
    axisFormat %Ss

    section API
    Receive Request           :0, 100ms
    Route to Smart Mode       :100ms, 50ms

    section Stage 1
    Load Prompts             :150ms, 200ms
    Call LLM (Structure)     :350ms, 3s
    Parse Structure          :3350ms, 150ms

    section Stage 2
    Load Layout Prompts      :3500ms, 100ms
    Call LLM (Layouts)       :3600ms, 2s
    Parse Layouts            :5600ms, 100ms

    section Stage 3
    Load Copy Prompts        :5700ms, 100ms
    Generate Card 1          :5800ms, 2s
    Generate Card 2          :7800ms, 2s
    Generate Card 3          :9800ms, 2s
    Generate Card 4          :11800ms, 2s
    Generate Card 5          :13800ms, 2s
    Generate Card 6          :15800ms, 2s

    section Streaming
    Start SSE Stream         :17800ms, 100ms
    Send Skeleton            :17900ms, 100ms
    Send Content             :18000ms, 500ms
    Send Styles              :18500ms, 200ms
    Complete                 :18700ms, 100ms
```

---

## Comparison: Fast vs Smart Mode

```mermaid
graph LR
    subgraph "Fast Mode (Phase 1)"
        F_Input[Topic Input]
        F_DB[Content Database<br/>Lookup]
        F_Match[Match Topic<br/>to Template]
        F_Cards[Generate Cards<br/><1s]
        F_Stream[Stream to Client]

        F_Input --> F_DB
        F_DB --> F_Match
        F_Match --> F_Cards
        F_Cards --> F_Stream
    end

    subgraph "Smart Mode (Phase 4)"
        S_Input[Topic + Type +<br/>Audience Input]
        S_Stage1[Stage 1: Structure<br/>~3s]
        S_Stage2[Stage 2: Layouts<br/>~2s]
        S_Stage3[Stage 3: Copy<br/>~12s]
        S_Stream[Stream to Client]

        S_Input --> S_Stage1
        S_Stage1 --> S_Stage2
        S_Stage2 --> S_Stage3
        S_Stage3 --> S_Stream
    end

    style F_Cards fill:#d4edda
    style S_Stage3 fill:#e1f5ff
```

---

## Technology Stack

```mermaid
graph TB
    subgraph "Frontend"
        HTML[HTML/CSS/JS]
        SSE_Client[SSE Client]
    end

    subgraph "Backend - Node.js"
        Express[Express Server]
        ES6[ES6 Modules]
    end

    subgraph "Phase 4 Services"
        Services[Content Generation<br/>Services]
        Adapters[LLM Adapters]
    end

    subgraph "External APIs"
        Gemini[Google Gemini AI]
        Future[GPT / Claude<br/>Future]
    end

    subgraph "Storage"
        FS[File System<br/>Markdown Prompts]
        Mem[In-Memory Cache]
    end

    subgraph "Existing Features"
        Phase1[Phase 1: Core API]
        Phase2[Phase 2: Images]
        Phase3[Phase 3: Streaming]
    end

    HTML --> SSE_Client
    SSE_Client --> Express
    Express --> Services
    Services --> Adapters
    Adapters --> Gemini
    Adapters -.-> Future
    Services --> FS
    Services --> Mem

    Express --> Phase1
    Express --> Phase2
    Express --> Phase3
    Phase3 --> SSE_Client
```

---

## Key Architectural Patterns

### 1. Strategy Pattern (LLM Providers)
```mermaid
classDiagram
    class LLMProviderAdapter {
        <<interface>>
        +generate(params)
        +generateStream(params)
        +getName()
        +isAvailable()
    }

    class GeminiLLMAdapter {
        -apiKey
        -client
        +generate(params)
        +getName()
    }

    class GPTAdapter {
        -apiKey
        -client
        +generate(params)
        +getName()
    }

    LLMProviderAdapter <|-- GeminiLLMAdapter
    LLMProviderAdapter <|-- GPTAdapter
```

### 2. Pipeline Pattern (3 Stages)
```mermaid
classDiagram
    class LLMContentGenerator {
        -presentationDesigner
        -visualDesigner
        -copywriter
        +generatePresentation()
    }

    class PresentationDesigner {
        +generateStructure()
    }

    class VisualDesigner {
        +assignLayouts()
    }

    class Copywriter {
        +generateCards()
    }

    LLMContentGenerator --> PresentationDesigner
    LLMContentGenerator --> VisualDesigner
    LLMContentGenerator --> Copywriter
```

### 3. Template Method Pattern (Prompts)
```mermaid
classDiagram
    class PromptLoader {
        -cache
        -promptsDir
        +load(path)
        +loadExamples(path)
        +clearCache()
    }

    class PresentationDesigner {
        -promptLoader
        +composePrompt()
    }

    class VisualDesigner {
        -promptLoader
        +composePrompt()
    }

    PresentationDesigner --> PromptLoader
    VisualDesigner --> PromptLoader
```

---

## Cost Analysis

```mermaid
pie title Cost Breakdown per 1000 Presentations
    "Stage 1 (Structure)" : 20
    "Stage 2 (Layouts)" : 15
    "Stage 3 (Copywriting)" : 60
    "Other (Image Gen)" : 5
```

**Total Cost**: ~$1.00 per 1000 presentations with Gemini Flash

---

## Performance Optimization Strategies

```mermaid
graph TB
    subgraph "Optimization Techniques"
        Cache[Prompt Caching<br/>Save ~200ms per request]
        Parallel[Parallel Card Generation<br/>Save ~8s for 6 cards]
        Model[Use Flash Model<br/>2x faster than Pro]
        Stream[LLM Streaming<br/>Faster TTFB]
    end

    subgraph "Results"
        Before[Before: ~35s]
        After[After: ~15s]
    end

    Cache --> After
    Parallel --> After
    Model --> After
    Stream -.-> After

    style After fill:#d4edda
```

---

These diagrams provide visual representation of the Phase 4 architecture from multiple perspectives:

1. **System Architecture**: High-level component relationships
2. **Data Flow**: Step-by-step request processing
3. **Service Dependencies**: How services interact
4. **3-Stage Pipeline**: Detailed pipeline breakdown
5. **Prompt System**: Template composition
6. **Error Handling**: Resilience strategies
7. **Deployment**: Production architecture
8. **Timeline**: Performance characteristics
9. **Comparison**: Fast vs Smart modes
10. **Tech Stack**: Technologies used
11. **Patterns**: Design patterns applied
12. **Cost/Performance**: Optimization strategies

Use these diagrams in documentation, presentations, and architecture discussions!
