import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renderiza correctamente el estado completada con texto e icono', () => {
    render(<StatusBadge status="completada" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Completada');
    expect(badge).toHaveAttribute('data-status', 'completada');
  });

  it('renderiza correctamente el estado en-ruta', () => {
    render(<StatusBadge status="en-ruta" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('En ruta');
  });

  it('renderiza correctamente el estado pagada', () => {
    render(<StatusBadge status="pagada" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Pagada');
  });
});
