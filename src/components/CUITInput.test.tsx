import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CUITInput } from './CUITInput';

describe('CUITInput', () => {
  it('submits a valid CUIT', async () => {
    const onSubmit = vi.fn();
    render(<CUITInput onSubmit={onSubmit} loading={false} />);

    await userEvent.type(screen.getByRole('textbox'), '20184139554');
    await userEvent.click(screen.getByRole('button', { name: /consultar/i }));

    expect(onSubmit).toHaveBeenCalledWith(['20184139554']);
  });

  it('shows validation error for invalid CUIT', async () => {
    const onSubmit = vi.fn();
    render(<CUITInput onSubmit={onSubmit} loading={false} />);

    await userEvent.type(screen.getByRole('textbox'), '12345678900');
    await userEvent.click(screen.getByRole('button', { name: /consultar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/cuit inválido/i)).toBeInTheDocument();
  });

  it('disables all inputs while loading', () => {
    render(<CUITInput onSubmit={vi.fn()} loading={true} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /consultar/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /limpiar/i })).toBeDisabled();
  });

  it('disables all inputs when disabled prop is true (API en mantenimiento)', () => {
    render(<CUITInput onSubmit={vi.fn()} loading={false} disabled={true} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /consultar/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /limpiar/i })).toBeDisabled();
  });

  it('does not submit when disabled', async () => {
    const onSubmit = vi.fn();
    render(<CUITInput onSubmit={onSubmit} loading={false} disabled={true} />);

    // Buttons are disabled so form cannot be submitted via them
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('is enabled when API is ok (disabled=false)', () => {
    render(<CUITInput onSubmit={vi.fn()} loading={false} disabled={false} />);
    expect(screen.getByRole('textbox')).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /consultar/i })).not.toBeDisabled();
  });
});
