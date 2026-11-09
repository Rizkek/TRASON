import { fireEvent, render, screen } from '@testing-library/react';
import { Tabs } from '@/components/ui/Tabs';

const items = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
];

describe('Tabs', () => {
  it('shows every label and marks the active tab', () => {
    render(<Tabs label="Sections" items={items} value="b" onChange={jest.fn()} />);

    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'false');
  });

  it('keeps only the active tab in the tab order', () => {
    render(<Tabs label="Sections" items={items} value="a" onChange={jest.fn()} />);

    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('tabindex', '-1');
  });

  it('reports a click', () => {
    const onChange = jest.fn();
    render(<Tabs label="Sections" items={items} value="a" onChange={onChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Gamma' }));
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('moves with the arrow keys and wraps around', () => {
    const onChange = jest.fn();
    render(<Tabs label="Sections" items={items} value="a" onChange={onChange} />);
    const first = screen.getByRole('tab', { name: 'Alpha' });

    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('b');

    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('c');
  });

  it('ignores other keys', () => {
    const onChange = jest.fn();
    render(<Tabs label="Sections" items={items} value="a" onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Alpha' }), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
