import Split from 'react-split'

// SplitPane: reusable wrapper around react-split for horizontal/vertical panes
// Props:
// - direction: 'horizontal' | 'vertical'
// - sizes: number[] (initial sizes percent)
// - minSize: number | number[]
// - gutterSize: number
// - className: string
// - ariaLabel: string
// - children: React.ReactNode[] (exactly two or more panes)
export default function SplitPane({
  direction = 'horizontal',
  sizes = [60, 40],
  minSize = 200,
  gutterSize = 8,
  className = '',
  ariaLabel,
  children,
}) {
  const isVertical = direction === 'vertical'
  const classes = ['split', isVertical ? 'split--vertical' : 'split--horizontal', className].filter(Boolean).join(' ')
  return (
    <Split
      sizes={sizes}
      minSize={minSize}
      gutterSize={gutterSize}
      direction={direction}
      className={classes}
      aria-label={ariaLabel}
      gutter={(index, direction) => {
        const gutter = document.createElement('div')
        gutter.className = `gutter gutter-${direction}`
        return gutter
      }}
    >
      {children}
    </Split>
  )
}