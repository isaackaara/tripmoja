import type { Group } from '@/types'

interface GroupCardProps {
  group: Group
  onOpen?: () => void
}

export function GroupCard({ group, onOpen }: GroupCardProps) {
  return (
    <div
      className="card flex gap-3 items-center cursor-pointer transition-all duration-[180ms] hover:shadow-pop hover:-translate-y-0.5"
      onClick={onOpen}
    >
      <span
        className="w-[52px] h-[52px] flex-none flex items-center justify-center text-[22px] font-bold text-white"
        style={{ borderRadius: 14, background: group.color }}
      >
        {group.emoji ?? group.name[0]}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className="text-[15px] font-semibold">{group.name}</span>
          <span className="text-[11px] text-tm-ink-500 flex-none ml-2">{group.lastActive}</span>
        </div>
        <div className="text-[13px] text-tm-ink-500 mt-1 truncate">{group.lastTrip}</div>
        <div className="text-[11px] text-tm-ink-300 mt-1">{group.members} members</div>
      </div>
    </div>
  )
}
