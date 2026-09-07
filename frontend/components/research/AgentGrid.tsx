/**
 * AgentGrid Component
 * Grid display of all agent status cards
 */

import type { AgentState } from '@/types/research';
import { AgentCard } from './AgentCard';

interface AgentGridProps {
  agents: AgentState[];
}

export function AgentGrid({ agents }: AgentGridProps) {
  const visible = agents.filter((a) => a.name !== 'coordinator');
  return (
    <div>
      <h2 className="text-title-lg text-ink mb-md" style={{ fontWeight: 600 }}>Research Agents</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--space-lg)',
      }}>
        {visible.map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </div>
    </div>
  );
}
