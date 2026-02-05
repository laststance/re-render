import { TriggerButton } from './TriggerButton'
import {
  RefreshCw,
  ArrowDownToLine,
  Users,
  Database,
  Zap,
} from 'lucide-react'

/**
 * Available trigger actions for re-render examples
 */
export interface TriggerAction {
  id: string
  label: string
  description: string
  variant: 'state' | 'props' | 'parent' | 'context' | 'force'
}

interface TriggerPanelProps {
  /** List of available trigger actions */
  triggers: TriggerAction[]
  /** Callback when a trigger button is clicked */
  onTrigger: (triggerId: string) => void
  /** Optional header text */
  title?: string
}

const triggerIcons: Record<string, React.ReactNode> = {
  state: <RefreshCw className="h-4 w-4" />,
  props: <ArrowDownToLine className="h-4 w-4" />,
  parent: <Users className="h-4 w-4" />,
  context: <Database className="h-4 w-4" />,
  force: <Zap className="h-4 w-4" />,
}

/**
 * Control panel displaying trigger buttons for causing intentional re-renders.
 * Each button triggers a specific re-render condition to observe behavior.
 */
export function TriggerPanel({
  triggers,
  onTrigger,
  title = 'Trigger Re-renders',
}: TriggerPanelProps) {
  if (triggers.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
          <Zap className="h-3.5 w-3.5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      {/* Trigger buttons */}
      <div className="space-y-2">
        {triggers.map((trigger) => (
          <TriggerButton
            key={trigger.id}
            icon={triggerIcons[trigger.variant]}
            label={trigger.label}
            description={trigger.description}
            variant={trigger.variant}
            onClick={() => onTrigger(trigger.id)}
          />
        ))}
      </div>
    </div>
  )
}
