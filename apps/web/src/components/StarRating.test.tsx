import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('calls onChange when a star is clicked', () => {
    const onChange = vi.fn();
    render(<StarRating value={2} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('4 star'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('is read-only when readOnly', () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} readOnly />);
    fireEvent.click(screen.getByLabelText('5 star'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
