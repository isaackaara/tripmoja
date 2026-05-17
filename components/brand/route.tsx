interface RouteProps {
  from: string
  to: string
}

export function Route({ from, to }: RouteProps) {
  return (
    <span className="route-display">
      <span>{from}</span>
      <span className="arrow">→</span>
      <span>{to}</span>
    </span>
  )
}
