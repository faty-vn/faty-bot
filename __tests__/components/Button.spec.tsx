import { render, screen, fireEvent } from '@testing-library/react'
import Button from 'components/Button'

describe('Button', () => {
  it('renders correctly', () => {
    const onClickMock = jest.fn()

    render(<Button onClick={onClickMock}>Button Text</Button>)

    const button = screen.getByText('Button Text')
    expect(button).toBeInTheDocument()

    expect(onClickMock).not.toBeCalled()
    fireEvent.click(button)
    expect(onClickMock).toBeCalled()
  })
})
