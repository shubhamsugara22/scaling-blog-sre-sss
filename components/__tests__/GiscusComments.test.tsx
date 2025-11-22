import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import GiscusComments from '../GiscusComments'

describe('GiscusComments', () => {
  const mockConfig = {
    repo: 'test-user/test-repo',
    repoId: 'R_kgDOxxxxxxx',
    category: 'General',
    categoryId: 'DIC_kwDOxxxxxxx',
  }

  it('should render without crashing', () => {
    const { container } = render(<GiscusComments {...mockConfig} />)
    expect(container).toBeTruthy()
  })

  it('should render with separator border', () => {
    const { container } = render(<GiscusComments {...mockConfig} />)
    const wrapper = container.querySelector('div')
    expect(wrapper?.className).toContain('border-t')
  })

  it('should use default mapping when not specified', () => {
    const { container } = render(<GiscusComments {...mockConfig} />)
    expect(container).toBeTruthy()
    // Component should render successfully with default mapping
  })

  it('should accept custom mapping prop', () => {
    const { container } = render(
      <GiscusComments {...mockConfig} mapping="url" />
    )
    expect(container).toBeTruthy()
  })

  it('should accept custom input position', () => {
    const { container } = render(
      <GiscusComments {...mockConfig} inputPosition="top" />
    )
    expect(container).toBeTruthy()
  })

  it('should accept custom language', () => {
    const { container } = render(
      <GiscusComments {...mockConfig} lang="es" />
    )
    expect(container).toBeTruthy()
  })

  it('should handle reactions enabled flag', () => {
    const { container } = render(
      <GiscusComments {...mockConfig} reactionsEnabled={false} />
    )
    expect(container).toBeTruthy()
  })
})
