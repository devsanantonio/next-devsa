export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="[&]:mt-0!">
      <style>{`
        nav, footer, [data-cart-slideout] { display: none !important; }
        body { overflow: auto !important; }
      `}</style>
      {children}
    </div>
  )
}
