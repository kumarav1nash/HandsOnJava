import React from 'react'
import Split from 'react-split'
import './SplitPane.css' // We'll need some basic CSS for the gutter

const SplitPane = ({
    direction = 'horizontal',
    sizes = [50, 50],
    minSize = 100,
    gutterSize = 8,
    className = '',
    children,
}) => {
    return (
        <Split
            sizes={sizes}
            minSize={minSize}
            gutterSize={gutterSize}
            direction={direction}
            className={`flex ${direction === 'vertical' ? 'flex-col' : 'flex-row'} ${className}`}
            gutter={(index, direction) => {
                const gutter = document.createElement('div')
                gutter.className = `gutter gutter-${direction} bg-gray-200 hover:bg-blue-400 transition-colors`
                return gutter
            }}
        >
            {children}
        </Split>
    )
}

export default SplitPane
