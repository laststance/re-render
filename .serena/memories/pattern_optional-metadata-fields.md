# Pattern: Optional Metadata Fields for Enriching UI

**Context**: When existing data structures need UI enhancements (badges, subtitles, labels) without breaking backward compatibility.

**Solution**: Add optional fields to the type interface (e.g., `tag?: string`, `subtitle?: string`) and conditionally render them in the UI. No migrations needed — existing data just doesn't set them.

**Example**:
```typescript
// Type: add optional field
interface Example {
  title: string
  tag?: string      // "Pattern" badge
  subtitle?: string // "useReducer" hook name
}

// Data: set only where needed
{ title: 'Compound Component', tag: 'Pattern' }
{ title: 'Reducer Dispatch', subtitle: 'useReducer' }

// UI: conditionally render
{example.tag && <Badge>{example.tag}</Badge>}
{example.subtitle && <span className="text-xs">{example.subtitle}</span>}
```

**When to Use**: Enriching navigation items, list displays, or cards with contextual metadata without restructuring data or changing URLs.
