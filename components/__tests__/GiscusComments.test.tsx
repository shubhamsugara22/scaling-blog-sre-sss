import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import GiscusComments from '../GiscusComments'

// Mock the @giscus/react component
vi.mock('@giscus/react', () => ({
  default: (props: any) => (
    <div data-testid="giscus-mock" data-props={JSON.stringify(props)}>
      Giscus Mock
    </div>
  ),
}))

describe('GiscusComments', () => {
  const mockConfig = {
    repo: 'test-user/test-repo' as `${string}/${string}`,
    repoId: 'R_kgDOxxxxxxx',
    category: 'General',
    categoryId: 'DIC_kwDOxxxxxxx',
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Remove dark class from document
    document.documentElement.classList.remove('dark')
  })

  it('should render without crashing', () => {
    const { container } = render(<GiscusComments {...mockConfig} />)
    expect(container).toBeTruthy()
  })

  it('should render with separator border', () => {
    const { container } = render(<GiscusComments {...mockConfig} />)
    const wrapper = container.querySelector('section')
    expect(wrapper?.className).toContain('border-t')
  })

  // Test component renders with correct props (Requirement 3.1)
  it('should pass correct required props to Giscus component', () => {
    render(<GiscusComments {...mockConfig} />)
    const giscusMock = screen.getByTestId('giscus-mock')
    const props = JSON.parse(giscusMock.getAttribute('data-props') || '{}')
    
    expect(props.repo).toBe('test-user/test-repo')
    expect(props.repoId).toBe('R_kgDOxxxxxxx')
    expect(props.category).toBe('General')
    expect(props.categoryId).toBe('DIC_kwDOxxxxxxx')
  })

  it('should use default mapping when not specified', () => {
    render(<GiscusComments {...mockConfig} />)
    const giscusMock = screen.getByTestId('giscus-mock')
    const props = JSON.parse(giscusMock.getAttribute('data-props') || '{}')
    
    expect(props.mapping).toBe('pathname')
  })

  it('should accept custom mapping prop', () => {
    render(<GiscusComments {...mockConfig} mapping="url" />)
    const giscusMock = screen.getByTestId('giscus-mock')
    const props = JSON.parse(giscusMock.getAttribute('data-props') || '{}')
    
    expect(props.mapping).toBe('url')
  })

  it('should accept custom input position', () => {
    render(<GiscusComments {...mockConfig} inputPosition="top" />)
    const giscusMock = screen.getByTestId('giscus-mock')
    const props = JSON.parse(giscusMock.getAttribute('data-props') || '{}')
    
    expect(props.inputPosition).toBe('top')
  })

  it('should accept custom language', () => {
    render(<GiscusComments {...mockConfig} lang="es" />)
    const giscusMock = screen.getByTestId('giscus-mock')
    const props = JSON.parse(giscusMock.getAttribute('data-props') || '{}')
    
    expect(props.lang).toBe('es')
  })

  it('should handle reactions enabled flag', () => {
    render(<GiscusComments {...mockConfig} reactionsEnabled={false} />)
    const giscusMock = screen.getByTestId('giscus-mock')
    const props = JSON.parse(giscusMock.getAttribute('data-props') || '{}')
    
    expect(props.reactionsEnabled).toBe('0')
  })

  it('should convert reactionsEnabled true to "1"', () => {
    render(<GiscusComments {...mockConfig} reactionsEnabled={true} />)
    const giscusMock = screen.getByTestId('giscus-mock')
    const props = JSON.parse(giscusMock.getAttribute('data-props') || '{}')
    
    expect(props.reactionsEnabled).toBe('1')
  })

  // Test theme configuration is applied (Requirement 3.4)
  it('should apply light theme by default', () => {
    render(<GiscusComments {...mockConfig} />)
    const giscusMock = screen.getByTestId('giscus-mock')
    const props = JSON.parse(giscusMock.getAttribute('data-props') || '{}')
    
    expect(props.theme).toBe('light')
  })

  it('should apply dark theme when localStorage has dark theme', () => {
    localStorage.setItem('theme', 'dark')
    render(<GiscusComments {...mockConfig} />)
    const giscusMock = screen.getByTestId('giscus-mock')
    const props = JSON.parse(giscusMock.getAttribute('data-props') || '{}')
    
    expect(props.theme).toBe('dark')
  })

  it('should apply dark theme when document has dark class', () => {
    document.documentElement.classList.add('dark')
    render(<GiscusComments {...mockConfig} />)
    const giscusMock = screen.getByTestId('giscus-mock')
    const props = JSON.parse(giscusMock.getAttribute('data-props') || '{}')
    
    expect(props.theme).toBe('dark')
  })

  it('should use default values for optional props', () => {
    render(<GiscusComments {...mockConfig} />)
    const giscusMock = screen.getByTestId('giscus-mock')
    const props = JSON.parse(giscusMock.getAttribute('data-props') || '{}')
    
    expect(props.mapping).toBe('pathname')
    expect(props.reactionsEnabled).toBe('1')
    expect(props.emitMetadata).toBe('0')
    expect(props.inputPosition).toBe('bottom')
    expect(props.lang).toBe('en')
    expect(props.loading).toBe('lazy')
  })
})
